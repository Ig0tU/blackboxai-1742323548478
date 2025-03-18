#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${GREEN}✓ Port 8000 is active${NC}"
        return 0
    else
        echo -e "${RED}✗ Port 8000 is not active${NC}"
        return 1
    fi
}

# Function to check Docker container status
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker is not installed${NC}"
        return 1
    fi

    if [ "$(docker ps -q -f name=code-generator)" ]; then
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' code-generator)
        echo -e "${GREEN}✓ Docker container is running${NC}"
        echo -e "${BLUE}Health Status: ${YELLOW}$HEALTH_STATUS${NC}"
        return 0
    else
        echo -e "${RED}✗ Docker container is not running${NC}"
        return 1
    fi
}

# Function to check API keys
check_api_keys() {
    if [ ! -f ".env" ]; then
        echo -e "${RED}✗ .env file not found${NC}"
        return 1
    fi

    local all_keys_set=true
    
    if grep -q "RAPIDAPI_KEY=your_key_here" .env; then
        echo -e "${RED}✗ RAPIDAPI_KEY not set${NC}"
        all_keys_set=false
    else
        echo -e "${GREEN}✓ RAPIDAPI_KEY is set${NC}"
    fi

    if grep -q "GEMINI_API_KEY=your_key_here" .env; then
        echo -e "${RED}✗ GEMINI_API_KEY not set${NC}"
        all_keys_set=false
    else
        echo -e "${GREEN}✓ GEMINI_API_KEY is set${NC}"
    fi

    if grep -q "HF_API_KEY=your_key_here" .env; then
        echo -e "${RED}✗ HF_API_KEY not set${NC}"
        all_keys_set=false
    else
        echo -e "${GREEN}✓ HF_API_KEY is set${NC}"
    fi

    if [ "$all_keys_set" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to check code cache directory
check_cache() {
    if [ -d "code_cache" ]; then
        echo -e "${GREEN}✓ Code cache directory exists${NC}"
        cache_files=$(ls code_cache | wc -l)
        echo -e "${BLUE}Cache files: ${YELLOW}$cache_files${NC}"
        return 0
    else
        echo -e "${RED}✗ Code cache directory not found${NC}"
        return 1
    fi
}

# Function to check Python virtual environment
check_venv() {
    if [ -d "venv" ]; then
        echo -e "${GREEN}✓ Virtual environment exists${NC}"
        return 0
    else
        echo -e "${RED}✗ Virtual environment not found${NC}"
        return 1
    fi
}

# Function to check application response
check_response() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Application is responding${NC}"
        return 0
    else
        echo -e "${RED}✗ Application is not responding (HTTP $response)${NC}"
        return 1
    fi
}

# Main status check
echo -e "${BLUE}Checking Code Generator Status...${NC}\n"

echo -e "${YELLOW}Environment:${NC}"
check_venv
check_api_keys
echo ""

echo -e "${YELLOW}Application:${NC}"
check_port
check_response
echo ""

echo -e "${YELLOW}Docker:${NC}"
check_docker
echo ""

echo -e "${YELLOW}Storage:${NC}"
check_cache
echo ""

# Summary
echo -e "\n${BLUE}Status Summary:${NC}"
failures=0

check_venv || ((failures++))
check_api_keys || ((failures++))
check_port || ((failures++))
check_response || ((failures++))
check_docker || ((failures++))
check_cache || ((failures++))

if [ $failures -eq 0 ]; then
    echo -e "${GREEN}✓ All systems operational${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $failures issue(s)${NC}"
    exit 1
fi