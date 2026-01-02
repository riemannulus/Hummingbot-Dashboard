# Hummingbot Dashboard - Operations Makefile
# ==========================================

.PHONY: help
.DEFAULT_GOAL := help

# Variables
COMPOSE := docker compose
CONTAINER_NAME := hummingbot-dashboard
IMAGE := ghcr.io/riemannulus/hummingbot-dashboard:latest
VOLUME_NAME := hummingbot-dashboard_dashboard-data
BACKUP_DIR := ./backups

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# ==========================================
# Docker Operations
# ==========================================

## Deploy: Pull latest image and start containers
deploy: pull up
	@echo "$(GREEN)✓ Deployment complete$(RESET)"

## Pull latest Docker image
pull:
	@echo "$(CYAN)→ Pulling latest image...$(RESET)"
	$(COMPOSE) pull

## Start containers in detached mode
up:
	@echo "$(CYAN)→ Starting containers...$(RESET)"
	$(COMPOSE) up -d
	@echo "$(GREEN)✓ Dashboard running at http://localhost:3000$(RESET)"

## Stop and remove containers
down:
	@echo "$(CYAN)→ Stopping containers...$(RESET)"
	$(COMPOSE) down

## Restart containers
restart: down up

## Restart containers with latest image
upgrade: pull restart
	@echo "$(GREEN)✓ Upgrade complete$(RESET)"

## View container logs (follow mode)
logs:
	$(COMPOSE) logs -f

## View last 100 lines of logs
logs-tail:
	$(COMPOSE) logs --tail=100

## Show container status
status:
	@echo "$(CYAN)Container Status:$(RESET)"
	@docker ps -a --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(CYAN)Health Check:$(RESET)"
	@docker inspect --format='{{.State.Health.Status}}' $(CONTAINER_NAME) 2>/dev/null || echo "Container not running"

## Show resource usage
stats:
	docker stats $(CONTAINER_NAME) --no-stream

## Execute shell in container
shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh

## Execute command in container (usage: make exec CMD="ls -la")
exec:
	docker exec -it $(CONTAINER_NAME) $(CMD)

# ==========================================
# Development
# ==========================================

## Start development server
dev:
	bun run dev

## Build for production
build:
	bun run build

## Build Docker image locally
docker-build:
	@echo "$(CYAN)→ Building Docker image...$(RESET)"
	docker build -t $(IMAGE) .

## Run type checking
typecheck:
	bun tsc --noEmit

## Install dependencies
install:
	bun install

## Clean build artifacts
clean:
	rm -rf dist
	rm -rf node_modules/.cache

# ==========================================
# Database / Storage Operations
# ==========================================

## Create backup of database volume
backup:
	@mkdir -p $(BACKUP_DIR)
	@BACKUP_FILE=$(BACKUP_DIR)/dashboard-data-$$(date +%Y%m%d-%H%M%S).tar.gz; \
	echo "$(CYAN)→ Creating backup: $$BACKUP_FILE$(RESET)"; \
	docker run --rm \
		-v $(VOLUME_NAME):/data \
		-v $$(pwd)/$(BACKUP_DIR):/backup \
		alpine tar czf /backup/$$(basename $$BACKUP_FILE) -C /data .; \
	echo "$(GREEN)✓ Backup created: $$BACKUP_FILE$(RESET)"

## Restore database from backup (usage: make restore FILE=backups/dashboard-data-xxx.tar.gz)
restore:
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE parameter required$(RESET)"; \
		echo "Usage: make restore FILE=backups/dashboard-data-xxx.tar.gz"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠ This will replace all data in the volume!$(RESET)"
	@read -p "Continue? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(CYAN)→ Stopping container...$(RESET)"
	@$(COMPOSE) down
	@echo "$(CYAN)→ Restoring from $(FILE)...$(RESET)"
	@docker run --rm \
		-v $(VOLUME_NAME):/data \
		-v $$(pwd):/backup \
		alpine sh -c "rm -rf /data/* && tar xzf /backup/$(FILE) -C /data"
	@echo "$(CYAN)→ Starting container...$(RESET)"
	@$(COMPOSE) up -d
	@echo "$(GREEN)✓ Restore complete$(RESET)"

## List available backups
list-backups:
	@echo "$(CYAN)Available backups:$(RESET)"
	@ls -lh $(BACKUP_DIR)/*.tar.gz 2>/dev/null || echo "No backups found in $(BACKUP_DIR)"

## Show database file info
db-info:
	@docker exec $(CONTAINER_NAME) ls -lh /app/data/ 2>/dev/null || echo "Container not running"

## Reset database (WARNING: deletes all data)
db-reset:
	@echo "$(RED)⚠ WARNING: This will DELETE ALL DATA!$(RESET)"
	@read -p "Type 'DELETE' to confirm: " confirm && [ "$$confirm" = "DELETE" ] || exit 1
	@echo "$(CYAN)→ Stopping container...$(RESET)"
	@$(COMPOSE) down
	@echo "$(CYAN)→ Removing volume...$(RESET)"
	@docker volume rm $(VOLUME_NAME) 2>/dev/null || true
	@echo "$(CYAN)→ Starting fresh container...$(RESET)"
	@$(COMPOSE) up -d
	@echo "$(GREEN)✓ Database reset complete$(RESET)"

# ==========================================
# Environment & Configuration
# ==========================================

## Check environment configuration
env-check:
	@echo "$(CYAN)Environment Configuration:$(RESET)"
	@echo "─────────────────────────────────────"
	@if [ -f .env ]; then \
		echo "$(GREEN)✓$(RESET) .env file exists"; \
		echo ""; \
		echo "Variables defined:"; \
		grep -v '^#' .env | grep -v '^$$' | cut -d'=' -f1 | sed 's/^/  - /'; \
	else \
		echo "$(RED)✗$(RESET) .env file not found"; \
		echo ""; \
		echo "Create .env file with:"; \
		echo "  cp env.example .env"; \
	fi
	@echo ""
	@echo "$(CYAN)Docker Environment:$(RESET)"
	@echo "─────────────────────────────────────"
	@docker --version
	@docker compose version

## Create .env from example
env-init:
	@if [ -f .env ]; then \
		echo "$(YELLOW)⚠ .env already exists$(RESET)"; \
	else \
		if [ -f env.example ]; then \
			cp env.example .env; \
			echo "$(GREEN)✓ Created .env from env.example$(RESET)"; \
			echo "$(YELLOW)→ Edit .env to configure your settings$(RESET)"; \
		else \
			echo "$(RED)✗ env.example not found$(RESET)"; \
		fi \
	fi

## Show environment variables in running container
env-show:
	@docker exec $(CONTAINER_NAME) env | grep -E '^(API_|HB_|GEMINI_|NODE_)' | sort

# ==========================================
# Health & Monitoring
# ==========================================

## Check if service is healthy
health:
	@echo "$(CYAN)Health Check:$(RESET)"
	@curl -sf http://localhost:3000/ > /dev/null && \
		echo "$(GREEN)✓ Service is healthy$(RESET)" || \
		echo "$(RED)✗ Service is not responding$(RESET)"

## Wait for service to be healthy (useful in scripts)
wait-healthy:
	@echo "$(CYAN)→ Waiting for service to be healthy...$(RESET)"
	@for i in $$(seq 1 30); do \
		if curl -sf http://localhost:3000/ > /dev/null 2>&1; then \
			echo "$(GREEN)✓ Service is healthy$(RESET)"; \
			exit 0; \
		fi; \
		echo "  Attempt $$i/30..."; \
		sleep 2; \
	done; \
	echo "$(RED)✗ Timeout waiting for service$(RESET)"; \
	exit 1

## Show container health history
health-history:
	@docker inspect --format='{{range .State.Health.Log}}{{.Start}}: {{.ExitCode}} - {{.Output}}{{end}}' $(CONTAINER_NAME)

# ==========================================
# Cleanup
# ==========================================

## Remove stopped containers and dangling images
prune:
	@echo "$(CYAN)→ Cleaning up Docker resources...$(RESET)"
	docker container prune -f
	docker image prune -f
	@echo "$(GREEN)✓ Cleanup complete$(RESET)"

## Full cleanup (removes volumes too - WARNING: data loss)
prune-all:
	@echo "$(RED)⚠ WARNING: This will remove ALL unused Docker resources including volumes!$(RESET)"
	@read -p "Continue? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker system prune -af --volumes
	@echo "$(GREEN)✓ Full cleanup complete$(RESET)"

# ==========================================
# Git Operations
# ==========================================

## Push to origin
push:
	git push origin

## Pull from origin
pull-git:
	git pull origin

# ==========================================
# Help
# ==========================================

## Show this help message
help:
	@echo ""
	@echo "$(CYAN)Hummingbot Dashboard - Operations$(RESET)"
	@echo "════════════════════════════════════════════════════════════════"
	@echo ""
	@echo "$(GREEN)Quick Start:$(RESET)"
	@echo "  make deploy        Pull latest image and start containers"
	@echo "  make logs          View container logs"
	@echo "  make status        Show container status"
	@echo ""
	@echo "$(GREEN)Available Commands:$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Examples:$(RESET)"
	@echo "  make deploy                    # Deploy/update to latest version"
	@echo "  make upgrade                   # Pull new image and restart"
	@echo "  make backup                    # Create database backup"
	@echo "  make restore FILE=backup.tar.gz  # Restore from backup"
	@echo "  make exec CMD='ls -la'         # Run command in container"
	@echo ""

