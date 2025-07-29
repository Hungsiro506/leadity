#!/bin/bash

# Docker Build Debug Script
# Use this when normal builds fail

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Docker Compose command (V2)
COMPOSE_CMD="docker compose"

log_info() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "Starting Docker build debugging..."

# Step 1: Show current Docker state
log_info "Current Docker disk usage:"
docker system df

# Step 2: Clean everything
log_warning "Cleaning all Docker data (containers, images, volumes, cache)..."
$COMPOSE_CMD down --volumes --remove-orphans 2>/dev/null || true
docker container prune -f
docker image prune -af
docker volume prune -f
docker builder prune -af
docker system prune -af

log_success "Docker cleanup completed"

# Step 3: Show package files
log_info "Checking package files..."
ls -la package*

# Check if Node.js is available locally
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    echo "Node.js version: $(node --version)"
    echo "NPM version: $(npm --version)"
    
    # Step 4: Test npm install locally (only if Node.js is available)
    log_info "Testing npm install locally..."
    if npm ci --silent 2>/dev/null; then
        log_success "Local npm ci works"
    else
        log_warning "Local npm ci failed, trying npm install..."
        rm -rf node_modules package-lock.json
        npm install --silent
        log_success "Generated new package-lock.json"
    fi
else
    log_warning "Node.js/npm not installed locally - skipping local tests"
    log_info "This is normal for production servers - Docker will handle npm"
fi

# Step 5: Build with verbose output
log_info "Building Docker image with verbose output..."
DOCKER_BUILDKIT=0 $COMPOSE_CMD build --progress=plain --no-cache

if [ $? -eq 0 ]; then
    log_success "Docker build successful!"
    log_info "Starting containers..."
    $COMPOSE_CMD up -d
    
    log_info "Checking container status:"
    $COMPOSE_CMD ps
    
    log_info "Testing health endpoint:"
    sleep 5
    curl -f http://localhost/api/health || log_warning "Health endpoint not responding yet"
else
    log_error "Docker build still failing. Check the verbose output above."
    exit 1
fi 