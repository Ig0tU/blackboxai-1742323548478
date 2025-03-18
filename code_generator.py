import gradio as gr
import requests
import json
import os
import google.generativeai as genai
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import time
from pathlib import Path
import re

# Load environment variables
load_dotenv()

# Constants for provider selection
PROVIDER_BLACKBOX = "BlackboxAI"
PROVIDER_GEMINI = "Google Gemini"
PROVIDER_HUGGINGFACE = "Hugging Face"

# Enhanced language configurations with syntax highlighting and common use cases
LANGUAGES = {
    "Python": {
        "extension": ".py",
        "common_uses": ["Data Science", "Web Development", "Automation", "AI/ML"],
        "frameworks": ["Django", "Flask", "FastAPI", "TensorFlow", "PyTorch"]
    },
    "JavaScript": {
        "extension": ".js",
        "common_uses": ["Web Frontend", "Backend (Node.js)", "Mobile Apps", "Browser Extensions"],
        "frameworks": ["React", "Vue.js", "Angular", "Express.js", "Next.js"]
    },
    "TypeScript": {
        "extension": ".ts",
        "common_uses": ["Enterprise Apps", "Large-scale Web Apps", "Type-safe JavaScript"],
        "frameworks": ["Angular", "Next.js", "NestJS", "Deno"]
    },
    "Java": {
        "extension": ".java",
        "common_uses": ["Enterprise Software", "Android Apps", "Web Services"],
        "frameworks": ["Spring Boot", "Jakarta EE", "Android SDK"]
    },
    "Go": {
        "extension": ".go",
        "common_uses": ["Cloud Services", "System Tools", "Web Services"],
        "frameworks": ["Gin", "Echo", "Fiber"]
    },
    "Rust": {
        "extension": ".rs",
        "common_uses": ["Systems Programming", "WebAssembly", "CLI Tools"],
        "frameworks": ["Rocket", "Actix", "Yew"]
    }
}

class CodeGenerationCache:
    def __init__(self):
        self.cache = {}
        self.cache_dir = Path("code_cache")
        self.cache_dir.mkdir(exist_ok=True)
    
    def get_cache_key(self, provider, prompt, language, model):
        return f"{provider}_{language}_{model}_{hash(prompt)}"
    
    def get_from_cache(self, provider, prompt, language, model):
        cache_key = self.get_cache_key(provider, prompt, language, model)
        return self.cache.get(cache_key)
    
    def save_to_cache(self, provider, prompt, language, model, code):
        cache_key = self.get_cache_key(provider, prompt, language, model)
        self.cache[cache_key] = code
        
        # Save to file system
        cache_file = self.cache_dir / f"{cache_key}.code"
        cache_file.write_text(code)

# Initialize cache
code_cache = CodeGenerationCache()

def format_code(code, language):
    """
    Format code with proper indentation and syntax.
    """
    # Remove extra blank lines
    code = re.sub(r'\n\s*\n', '\n\n', code)
    
    # Ensure proper indentation
    lines = code.split('\n')
    formatted_lines = []
    indent_level = 0
    
    for line in lines:
        # Adjust indent level based on brackets/braces
        if re.search(r'[{([]', line):
            formatted_lines.append('    ' * indent_level + line)
            indent_level += 1
        elif re.search(r'[})\]]', line):
            indent_level = max(0, indent_level - 1)
            formatted_lines.append('    ' * indent_level + line)
        else:
            formatted_lines.append('    ' * indent_level + line)
    
    return '\n'.join(formatted_lines)

def generate_code_with_retry(provider_func, prompt, language, model, max_retries=3):
    """
    Attempt to generate code with retries and error handling.
    """
    for attempt in range(max_retries):
        try:
            code = provider_func(prompt, language, model)
            if not code.startswith("Error"):
                return format_code(code, language)
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
        except Exception as e:
            if attempt == max_retries - 1:
                return f"Error after {max_retries} attempts: {str(e)}"
            time.sleep(2 ** attempt)
    return "Failed to generate code after multiple attempts."

def generate_code_interface(provider, prompt, language, model, temperature=0.7):
    """
    Enhanced interface for code generation with caching and formatting.
    """
    # Check cache first
    cached_code = code_cache.get_from_cache(provider, prompt, language, model)
    if cached_code:
        return cached_code
    
    # Prepare the prompt with language-specific context
    lang_info = LANGUAGES.get(language, {})
    enhanced_prompt = f"""
Generate {language} code for the following task.
Context:
- Language: {language}
- Common uses: {', '.join(lang_info.get('common_uses', []))}
- Popular frameworks: {', '.join(lang_info.get('frameworks', []))}

Task: {prompt}

Please provide production-ready code with:
- Proper error handling
- Input validation
- Clear variable names
- Necessary comments
- Best practices for {language}
"""

    # Generate code using the selected provider
    if provider == PROVIDER_BLACKBOX:
        code = generate_code_with_retry(generate_blackbox_code, enhanced_prompt, language, model)
    elif provider == PROVIDER_GEMINI:
        code = generate_code_with_retry(generate_gemini_code, enhanced_prompt, language, model)
    elif provider == PROVIDER_HUGGINGFACE:
        code = generate_code_with_retry(generate_huggingface_code, enhanced_prompt, language, model)
    else:
        return f"Error: Unknown provider {provider}"

    # Cache the result
    if not code.startswith("Error"):
        code_cache.save_to_cache(provider, prompt, language, model, code)

    return code

def create_interface():
    """
    Create an enhanced Gradio interface with additional features.
    """
    with gr.Blocks(title="Advanced Multi-Provider Code Generator") as app:
        gr.Markdown("# 🚀 Advanced Multi-Provider Code Generator")
        gr.Markdown("Generate production-ready code using state-of-the-art AI models from multiple providers.")
        
        with gr.Row():
            with gr.Column(scale=1):
                # Provider selection with icons
                provider = gr.Radio(
                    choices=[PROVIDER_BLACKBOX, PROVIDER_GEMINI, PROVIDER_HUGGINGFACE],
                    value=PROVIDER_BLACKBOX,
                    label="🤖 AI Provider"
                )
                
                # Model selection
                models = gr.Dropdown(
                    choices=get_blackbox_models(),
                    label="📚 Model"
                )
                
                # Language selection with metadata
                language = gr.Dropdown(
                    choices=list(LANGUAGES.keys()),
                    value="Python",
                    label="💻 Programming Language"
                )
                
                # Temperature slider for creativity control
                temperature = gr.Slider(
                    minimum=0.1,
                    maximum=1.0,
                    value=0.7,
                    label="🌡️ Temperature (Creativity)",
                    info="Higher values = more creative, lower values = more focused"
                )
                
            with gr.Column(scale=2):
                # Enhanced prompt input
                prompt = gr.Textbox(
                    lines=5,
                    placeholder="Describe the code you want to generate...",
                    label="✨ Prompt"
                )
                
                # Example prompts
                gr.Examples(
                    examples=[
                        ["Create a REST API endpoint for user authentication"],
                        ["Implement a binary search tree with insertion and deletion"],
                        ["Build a responsive navigation menu with dark mode support"],
                    ],
                    inputs=prompt,
                    label="📝 Example Prompts"
                )
                
                generate_button = gr.Button("🔮 Generate Code", variant="primary")
                
                # Code output with syntax highlighting
                output = gr.Code(
                    language="python",
                    label="📄 Generated Code",
                    interactive=True
                )
                
                # Copy button for generated code
                copy_button = gr.Button("📋 Copy Code")
                
        # Add language info display
        with gr.Row():
            language_info = gr.JSON(
                label="ℹ️ Language Information",
                value=LANGUAGES["Python"]
            )
            
        # Update language info when language changes
        language.change(
            fn=lambda l: LANGUAGES.get(l, {}),
            inputs=[language],
            outputs=[language_info]
        )
        
        # Update models when provider changes
        provider.change(
            fn=update_models,
            inputs=[provider],
            outputs=[models]
        )
        
        # Generate code when button is clicked
        generate_button.click(
            fn=generate_code_interface,
            inputs=[provider, prompt, language, models, temperature],
            outputs=[output]
        )
        
        # Copy button functionality
        copy_button.click(
            fn=lambda x: gr.update(value=x),
            inputs=[output],
            outputs=[gr.Textbox(visible=False)]
        )
        
        gr.Markdown("""
        ## 🔑 Setup Instructions
        
        To use this application, you need to set up API keys in your environment:
        
        1. 🔐 BlackboxAI: `RAPIDAPI_KEY` from [RapidAPI](https://rapidapi.com/blackbox-blackbox-default/api/blackboxai)
        2. 🔐 Google Gemini: `GEMINI_API_KEY` from [Google AI Studio](https://makersuite.google.com/)
        3. 🔐 Hugging Face: `HF_API_KEY` from [Hugging Face](https://huggingface.co/settings/tokens)
        
        Create a `.env` file in the project root with your API keys:
        ```bash
        RAPIDAPI_KEY=your_key_here
        GEMINI_API_KEY=your_key_here
        HF_API_KEY=your_key_here
        ```
        """)

    return app

if __name__ == "__main__":
    # Create and launch the interface
    app = create_interface()
    app.launch(
        share=True,
        enable_queue=True,
        show_error=True,
        server_name="0.0.0.0",
        server_port=8000
    )