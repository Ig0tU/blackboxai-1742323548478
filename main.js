// Initialize GooseAI
const gooseAI = new GooseAI();

// App Categories and Templates
const appTemplates = {
    games: [
        {
            name: 'Tic Tac Toe',
            description: 'Classic two-player game with AI opponent',
            template: window.appTemplates.createTicTacToeGame
        }
    ],
    productivity: [
        {
            name: 'Todo List',
            description: 'Task management with categories and priorities',
            template: window.appTemplates.createTodoApp
        },
        {
            name: 'Pomodoro Timer',
            description: 'Focus timer with work/break intervals',
            template: window.appTemplates.createPomodoroTimer
        },
        {
            name: 'Calculator',
            description: 'Basic arithmetic calculator',
            template: window.appTemplates.createCalculator
        }
    ],
    dashboard: [
        {
            name: 'Analytics Dashboard',
            description: 'Data visualization with charts',
            template: window.appTemplates.createAnalyticsDashboard
        }
    ],
    social: [
        {
            name: 'Comment Section',
            description: 'Interactive comment thread with replies',
            template: window.appTemplates.createCommentSection
        }
    ],
    ecommerce: [
        {
            name: 'Product Card',
            description: 'Interactive product display with cart functionality',
            template: window.appTemplates.createProductCard
        }
    ],
    multimedia: [
        {
            name: 'Image Gallery',
            description: 'Responsive image grid with lightbox',
            template: window.appTemplates.createImageGallery
        }
    ]
};

// DOM Elements
const appIdea = document.getElementById('appIdea');
const categorySelect = document.getElementById('categorySelect');
const randomDemoBtn = document.getElementById('randomDemo');
const generateAppBtn = document.getElementById('generateApp');
const previewSection = document.getElementById('previewSection');
const appContainer = document.getElementById('appContainer');
const codeSection = document.getElementById('codeSection');
const generatedCode = document.getElementById('generatedCode');

// Event Listeners
randomDemoBtn.addEventListener('click', generateRandomApp);
generateAppBtn.addEventListener('click', handleGenerateApp);
categorySelect.addEventListener('change', handleCategoryChange);

// Main Functions
async function handleGenerateApp() {
    const idea = appIdea.value.trim();
    const category = categorySelect.value;

    if (idea) {
        // Process through GooseAI
        const result = await gooseAI.processUserInput(idea);
        console.log('GooseAI Response:', result);
        
        if (result.command === 'createApp') {
            const params = {
                category: category || 'general',
                description: idea
            };
            const response = await gooseAI.executeCommand(result.command, params);
            if (response.success) {
                generateFromIdea(idea);
            }
        } else {
            generateFromIdea(idea);
        }
    } else if (category) {
        generateFromCategory(category);
    } else {
        alert('Please enter an app idea or select a category');
    }
}

async function generateFromIdea(idea) {
    const keywords = idea.toLowerCase();
    let selectedTemplate = null;

    // Check for calculator keywords first
    if (keywords.includes('calculator') || keywords.includes('calc') || keywords.includes('compute')) {
        selectedTemplate = appTemplates.productivity[2]; // Calculator template
    } else if (keywords.includes('game') || keywords.includes('play')) {
        selectedTemplate = appTemplates.games[0];
    } else if (keywords.includes('todo') || keywords.includes('task')) {
        selectedTemplate = appTemplates.productivity[0];
    } else if (keywords.includes('dashboard') || keywords.includes('analytics')) {
        selectedTemplate = appTemplates.dashboard[0];
    } else if (keywords.includes('comment') || keywords.includes('social')) {
        selectedTemplate = appTemplates.social[0];
    } else if (keywords.includes('product') || keywords.includes('shop')) {
        selectedTemplate = appTemplates.ecommerce[0];
    } else if (keywords.includes('image') || keywords.includes('gallery')) {
        selectedTemplate = appTemplates.multimedia[0];
    } else {
        // Default to a random template
        generateRandomApp();
        return;
    }

    generateFromTemplate(selectedTemplate);
}

function generateFromCategory(category) {
    const templates = appTemplates[category];
    if (templates && templates.length > 0) {
        const randomIndex = Math.floor(Math.random() * templates.length);
        generateFromTemplate(templates[randomIndex]);
    }
}

function generateRandomApp() {
    const categories = Object.keys(appTemplates);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    generateFromCategory(randomCategory);
}

function handleCategoryChange() {
    const category = categorySelect.value;
    if (category) {
        generateFromCategory(category);
    }
}

function generateFromTemplate(template) {
    if (!template) return;

    // Clear previous content
    appContainer.innerHTML = '';
    
    // Show preview section
    previewSection.classList.remove('hidden');
    codeSection.classList.remove('hidden');

    // Generate the app
    const { html, css, js } = template.template();
    
    // Insert the app
    appContainer.innerHTML = html;
    
    // Add styles
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
    
    // Execute JS
    const scriptElement = document.createElement('script');
    scriptElement.textContent = js;
    document.body.appendChild(scriptElement);

    // Show generated code
    generatedCode.textContent = `// HTML\n${html}\n\n// CSS\n${css}\n\n// JavaScript\n${js}`;
}