#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}Virtual environment not found!${NC}"
    echo -e "${BLUE}Please run setup.sh first:${NC}"
    echo -e "${GREEN}./setup.sh${NC}"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env file exists and has valid keys
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    exit 1
fi

# Check if any API keys are still set to default value
if grep -q "your_key_here" .env; then
    echo -e "${RED}Warning: Some API keys in .env are still set to default values${NC}"
    echo -e "${BLUE}Please edit .env file with your actual API keys${NC}"
    exit 1
fi

echo -e "${BLUE}Starting Code Generator...${NC}"
echo -e "${BLUE}Once started, visit: ${GREEN}http://localhost:8000${NC}"

# Kill any existing process on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${BLUE}Port 8000 is in use. Stopping existing process...${NC}"
    lsof -ti:8000 | xargs kill -9
fi

# Start the application
python code_generator.py