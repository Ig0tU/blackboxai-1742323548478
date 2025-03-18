#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
show_usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo -e "  ./quickstart.sh [option]"
    echo -e "\n${BLUE}Options:${NC}"
    echo -e "  ${GREEN}local${NC}    Start application locally"
    echo -e "  ${GREEN}docker${NC}   Start application in Docker"
    echo -e "  ${GREEN}help${NC}     Show this help message"
}

# Function to check if make is installed
check_make() {
    if ! command -v make &> /dev/null; then
        echo -e "${RED}Error: 'make' is not installed.${NC}"
        echo -e "Please install 'make' to continue."
        exit 1
    fi
}

# Function to start locally
start_local() {
    echo -e "${BLUE}Starting local setup...${NC}"
    
    # Run setup
    make setup
    
    # Check status
    make status
    
    # Launch application
    make launch
}

# Function to start with Docker
start_docker() {
    echo -e "${BLUE}Starting Docker setup...${NC}"
    
    # Check Docker installation
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed.${NC}"
        echo -e "Please install Docker to continue."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not installed.${NC}"
        echo -e "Please install Docker Compose to continue."
        exit 1
    fi
    
    # Build and run with Docker
    make docker-build
    make docker-run
}

# Main script
case "$1" in
    "local")
        check_make
        start_local
        ;;
    "docker")
        check_make
        start_docker
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        echo -e "${YELLOW}Please specify how you want to start the application:${NC}"
        echo -e "For local setup: ${GREEN}./quickstart.sh local${NC}"
        echo -e "For Docker setup: ${GREEN}./quickstart.sh docker${NC}"
        echo -e "For help: ${GREEN}./quickstart.sh help${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Quickstart complete!${NC}"
echo -e "${BLUE}Access the application at: ${GREEN}http://localhost:8000${NC}"
echo -e "${BLUE}Use ${GREEN}make status${NC} ${BLUE}to check application status${NC}"
echo -e "${BLUE}Use ${GREEN}make help${NC} ${BLUE}to see all available commands${NC}"