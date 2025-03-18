#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    }
}

# Function to check environment variables
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${RED}Error: .env file not found!${NC}"
        echo -e "${BLUE}Creating template .env file...${NC}"
        cat > .env << EOL
# API Keys for Code Generator
RAPIDAPI_KEY=your_key_here
GEMINI_API_KEY=your_key_here
HF_API_KEY=your_key_here
EOL
        echo -e "${RED}Please edit .env file with your API keys before continuing.${NC}"
        exit 1
    fi
}

# Function to build and run Docker container
deploy() {
    echo -e "${BLUE}Building Docker image...${NC}"
    docker-compose build --no-cache

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Docker image built successfully!${NC}"
        echo -e "${BLUE}Starting container...${NC}"
        docker-compose up -d

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Container started successfully!${NC}"
            echo -e "${BLUE}Application is running at: ${GREEN}http://localhost:8000${NC}"
            
            # Wait for health check
            echo -e "${BLUE}Waiting for application to be ready...${NC}"
            sleep 10
            
            # Check if container is healthy
            HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' code-generator)
            if [ "$HEALTH_STATUS" = "healthy" ]; then
                echo -e "${GREEN}Application is healthy and ready to use!${NC}"
            else
                echo -e "${RED}Warning: Application might not be fully ready. Please check logs:${NC}"
                docker-compose logs
            fi
        else
            echo -e "${RED}Failed to start container.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Failed to build Docker image.${NC}"
        exit 1
    fi
}

# Main script
echo -e "${BLUE}Starting deployment process...${NC}"

# Check prerequisites
check_docker
check_env

# Clean up existing containers
echo -e "${BLUE}Cleaning up existing containers...${NC}"
docker-compose down

# Deploy
deploy

echo -e "\n${GREEN}Deployment complete!${NC}"
echo -e "${BLUE}To view logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "${BLUE}To stop the application: ${GREEN}docker-compose down${NC}"