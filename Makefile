.PHONY: setup test run clean help docker-build docker-run docker-stop docker-clean launch status

# Colors for output
BLUE = \033[0;34m
GREEN = \033[0;32m
RED = \033[0;31m
NC = \033[0m

help:
	@echo "$(BLUE)Available commands:$(NC)"
	@echo "$(BLUE)Local Development:$(NC)"
	@echo "  $(GREEN)make setup$(NC)        - Set up the development environment"
	@echo "  $(GREEN)make test$(NC)         - Run setup tests"
	@echo "  $(GREEN)make run$(NC)          - Run the application locally"
	@echo "  $(GREEN)make launch$(NC)       - Launch with full monitoring"
	@echo "  $(GREEN)make status$(NC)       - Check application status"
	@echo "  $(GREEN)make clean$(NC)        - Clean up generated files"
	@echo "$(BLUE)Docker Commands:$(NC)"
	@echo "  $(GREEN)make docker-build$(NC) - Build Docker image"
	@echo "  $(GREEN)make docker-run$(NC)   - Run application in Docker"
	@echo "  $(GREEN)make docker-stop$(NC)  - Stop Docker containers"
	@echo "  $(GREEN)make docker-clean$(NC) - Clean Docker resources"
	@echo "$(BLUE)Development Tools:$(NC)"
	@echo "  $(GREEN)make install-deps$(NC) - Install dependencies"
	@echo "  $(GREEN)make update-deps$(NC)  - Update dependencies"
	@echo "  $(GREEN)make lint$(NC)         - Run linter"
	@echo "  $(GREEN)make format$(NC)       - Format code"

setup:
	@echo "$(BLUE)Setting up development environment...$(NC)"
	chmod +x setup.sh
	./setup.sh

test:
	@echo "$(BLUE)Running tests...$(NC)"
	source venv/bin/activate && python test_setup.py

run:
	@echo "$(BLUE)Starting the application...$(NC)"
	chmod +x run.sh
	./run.sh

launch:
	@echo "$(BLUE)Launching application with monitoring...$(NC)"
	chmod +x launch-local.sh
	./launch-local.sh

status:
	@echo "$(BLUE)Checking application status...$(NC)"
	chmod +x check-status.sh
	./check-status.sh

clean:
	@echo "$(BLUE)Cleaning up...$(NC)"
	rm -rf __pycache__
	rm -rf code_cache
	rm -rf venv
	rm -rf *.pyc
	rm -f .app.pid
	@echo "$(GREEN)Cleanup complete!$(NC)"

# Docker commands
docker-build:
	@echo "$(BLUE)Building Docker image...$(NC)"
	docker-compose build

docker-run:
	@echo "$(BLUE)Starting application in Docker...$(NC)"
	chmod +x deploy-docker.sh
	./deploy-docker.sh

docker-stop:
	@echo "$(BLUE)Stopping Docker containers...$(NC)"
	docker-compose down

docker-clean: docker-stop
	@echo "$(BLUE)Cleaning Docker resources...$(NC)"
	docker-compose down -v --rmi all
	@echo "$(GREEN)Docker cleanup complete!$(NC)"

# Development tools
install-deps:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	pip install -r requirements.txt

update-deps:
	@echo "$(BLUE)Updating dependencies...$(NC)"
	pip install --upgrade -r requirements.txt

lint:
	@echo "$(BLUE)Linting Python files...$(NC)"
	pip install pylint
	pylint *.py

format:
	@echo "$(BLUE)Formatting Python files...$(NC)"
	pip install black
	black *.py

# Docker development commands
docker-logs:
	@echo "$(BLUE)Showing container logs...$(NC)"
	docker-compose logs -f

docker-shell:
	@echo "$(BLUE)Opening shell in container...$(NC)"
	docker-compose exec code-generator /bin/bash

docker-test:
	@echo "$(BLUE)Running tests in Docker...$(NC)"
	docker-compose run --rm code-generator python test_setup.py