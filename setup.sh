#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Advanced Multi-Provider Code Generator...${NC}\n"

# Check Python version
echo -e "${BLUE}Checking Python version...${NC}"
if command -v python3 &>/dev/null; then
    python3 --version
else
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

# Create virtual environment
echo -e "\n${BLUE}Creating virtual environment...${NC}"
if [ -d "venv" ]; then
    echo "Virtual environment already exists"
else
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "\n${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Install requirements
echo -e "\n${BLUE}Installing dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check for .env file
echo -e "\n${BLUE}Checking for .env file...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${RED}⚠️  .env file not found${NC}"
    echo -e "Creating template .env file..."
    cat > .env << EOL
# API Keys for Code Generator
RAPIDAPI_KEY=your_key_here
GEMINI_API_KEY=your_key_here
HF_API_KEY=your_key_here
EOL
    echo -e "${GREEN}✅ Template .env file created${NC}"
    echo -e "${RED}⚠️  Please edit .env file with your API keys${NC}"
fi

# Create code cache directory
echo -e "\n${BLUE}Setting up code cache directory...${NC}"
mkdir -p code_cache
echo -e "${GREEN}✅ Code cache directory created${NC}"

# Run test script
echo -e "\n${BLUE}Running setup tests...${NC}"
python test_setup.py

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${BLUE}To run the application:${NC}"
echo -e "1. Make sure your API keys are set in .env file"
echo -e "2. Run: ${GREEN}./run.sh${NC}"
echo -e "3. Open http://localhost:8000 in your browser"

# Create a run script
echo -e "\n${BLUE}Creating run script...${NC}"
cat > run.sh << EOL
#!/bin/bash
source venv/bin/activate
python code_generator.py
EOL
chmod +x run.sh
echo -e "${GREEN}✅ Run script created${NC}"

echo -e "\n${BLUE}You can now run the application with: ${GREEN}./run.sh${NC}"