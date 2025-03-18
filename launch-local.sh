#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check Python version
check_python() {
    echo -e "${BLUE}Checking Python version...${NC}"
    if command -v python3 &>/dev/null; then
        python_version=$(python3 --version)
        echo -e "${GREEN}✓ $python_version found${NC}"
        return 0
    else
        echo -e "${RED}✗ Python 3 not found. Please install Python 3.8 or higher.${NC}"
        return 1
    fi
}

# Function to check and create virtual environment
setup_venv() {
    echo -e "\n${BLUE}Setting up virtual environment...${NC}"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${YELLOW}! Virtual environment already exists${NC}"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
}

# Function to install dependencies
install_deps() {
    echo -e "\n${BLUE}Installing dependencies...${NC}"
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to install dependencies${NC}"
        return 1
    fi
}

# Function to check API keys
check_api_keys() {
    echo -e "\n${BLUE}Checking API keys...${NC}"
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}! .env file not found. Creating template...${NC}"
        cat > .env << EOL
# API Keys for Code Generator
RAPIDAPI_KEY=your_key_here
GEMINI_API_KEY=your_key_here
HF_API_KEY=your_key_here
EOL
        echo -e "${RED}⚠️  Please edit .env file with your API keys${NC}"
        return 1
    fi

    # Check if keys are set
    if grep -q "your_key_here" .env; then
        echo -e "${RED}⚠️  Some API keys are not set in .env file${NC}"
        return 1
    else
        echo -e "${GREEN}✓ API keys are configured${NC}"
        return 0
    fi
}

# Function to check if port 8000 is available
check_port() {
    echo -e "\n${BLUE}Checking port 8000...${NC}"
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}! Port 8000 is in use. Attempting to free port...${NC}"
        lsof -ti:8000 | xargs kill -9
        echo -e "${GREEN}✓ Port 8000 freed${NC}"
    else
        echo -e "${GREEN}✓ Port 8000 is available${NC}"
    fi
}

# Function to create code cache directory
setup_cache() {
    echo -e "\n${BLUE}Setting up code cache...${NC}"
    mkdir -p code_cache
    echo -e "${GREEN}✓ Code cache directory ready${NC}"
}

# Function to run tests
run_tests() {
    echo -e "\n${BLUE}Running tests...${NC}"
    python test_setup.py
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Tests passed${NC}"
        return 0
    else
        echo -e "${RED}✗ Tests failed${NC}"
        return 1
    fi
}

# Function to launch application
launch_app() {
    echo -e "\n${BLUE}Launching application...${NC}"
    python code_generator.py &
    APP_PID=$!
    
    # Wait for application to start
    echo -e "${YELLOW}Waiting for application to start...${NC}"
    sleep 5
    
    # Check if application is running
    if ps -p $APP_PID > /dev/null; then
        echo -e "${GREEN}✓ Application started successfully${NC}"
        echo -e "${BLUE}Access the application at: ${GREEN}http://localhost:8000${NC}"
        
        # Save PID for later
        echo $APP_PID > .app.pid
        
        # Monitor logs
        echo -e "\n${BLUE}Application logs:${NC}"
        tail -f code_generator.log 2>/dev/null &
        TAIL_PID=$!
        
        # Handle script termination
        trap cleanup SIGINT SIGTERM
    else
        echo -e "${RED}✗ Failed to start application${NC}"
        return 1
    fi
}

# Function to clean up processes
cleanup() {
    echo -e "\n${BLUE}Cleaning up...${NC}"
    if [ -f .app.pid ]; then
        kill $(cat .app.pid) 2>/dev/null
        rm .app.pid
    fi
    kill $TAIL_PID 2>/dev/null
    echo -e "${GREEN}✓ Application stopped${NC}"
    exit 0
}

# Main execution
echo -e "${BLUE}Starting local launch process...${NC}"

# Run all setup steps
check_python || exit 1
setup_venv || exit 1
install_deps || exit 1
check_api_keys || echo -e "${YELLOW}! Continuing without API keys...${NC}"
check_port
setup_cache
run_tests || echo -e "${YELLOW}! Continuing despite test failures...${NC}"

# Launch the application
launch_app

# Keep script running
wait $APP_PID