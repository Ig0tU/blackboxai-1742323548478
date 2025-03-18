import os
import sys
import requests
import google.generativeai as genai
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import colorama
from colorama import Fore, Style

# Initialize colorama for cross-platform colored output
colorama.init()

def print_success(message):
    print(f"{Fore.GREEN}✓ {message}{Style.RESET_ALL}")

def print_error(message):
    print(f"{Fore.RED}✗ {message}{Style.RESET_ALL}")

def print_info(message):
    print(f"{Fore.BLUE}ℹ {message}{Style.RESET_ALL}")

def test_environment():
    print_info("Testing environment setup...")
    
    # Load environment variables
    load_dotenv()
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major >= 3 and python_version.minor >= 8:
        print_success(f"Python version: {sys.version.split()[0]}")
    else:
        print_error(f"Python version {sys.version.split()[0]} is not supported. Please use Python 3.8 or higher.")
        return False

    return True

def test_api_keys():
    print_info("\nTesting API keys...")
    
    # Test BlackboxAI (RapidAPI)
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    if rapidapi_key and rapidapi_key != "your_key_here":
        try:
            response = requests.get(
                "https://blackboxai.p.rapidapi.com/models",
                headers={
                    "X-RapidAPI-Key": rapidapi_key,
                    "X-RapidAPI-Host": "blackboxai.p.rapidapi.com"
                }
            )
            if response.status_code == 200:
                print_success("BlackboxAI API key is valid")
            else:
                print_error(f"BlackboxAI API key is invalid (Status code: {response.status_code})")
        except Exception as e:
            print_error(f"Error testing BlackboxAI API key: {str(e)}")
    else:
        print_error("BlackboxAI API key not found or not set")

    # Test Google Gemini
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and gemini_key != "your_key_here":
        try:
            genai.configure(api_key=gemini_key)
            models = genai.list_models()
            if any("gemini" in model.name.lower() for model in models):
                print_success("Google Gemini API key is valid")
            else:
                print_error("No Gemini models found with provided API key")
        except Exception as e:
            print_error(f"Error testing Gemini API key: {str(e)}")
    else:
        print_error("Google Gemini API key not found or not set")

    # Test Hugging Face
    hf_key = os.getenv("HF_API_KEY")
    if hf_key and hf_key != "your_key_here":
        try:
            client = InferenceClient(token=hf_key)
            # Just test if we can initialize the client
            print_success("Hugging Face API key is valid")
        except Exception as e:
            print_error(f"Error testing Hugging Face API key: {str(e)}")
    else:
        print_error("Hugging Face API key not found or not set")

def test_dependencies():
    print_info("\nTesting required dependencies...")
    
    required_packages = [
        "gradio",
        "requests",
        "google-generativeai",
        "huggingface-hub",
        "python-dotenv",
        "colorama"
    ]
    
    all_installed = True
    for package in required_packages:
        try:
            __import__(package)
            print_success(f"Package '{package}' is installed")
        except ImportError:
            print_error(f"Package '{package}' is not installed")
            all_installed = False
    
    return all_installed

def main():
    print_info("Starting setup test...\n")
    
    # Test environment
    if not test_environment():
        return
    
    # Test dependencies
    if not test_dependencies():
        print_error("\nSome dependencies are missing. Please run: pip install -r requirements.txt")
        return
    
    # Test API keys
    test_api_keys()
    
    print_info("\nTest complete!")

if __name__ == "__main__":
    main()