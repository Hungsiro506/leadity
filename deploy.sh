#!/bin/bash

# Leadity Banking Platform Deployment Script
# This script helps deploy the banking application to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
APP_NAME="leadity-banking"
BACKUP_DIR="./backups"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check if required files exist
check_requirements() {
    local missing_files=()
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        missing_files+=("$COMPOSE_FILE")
    fi
    
    if [[ ! -f "Dockerfile" ]]; then
        missing_files+=("Dockerfile")
    fi
    
    if [[ ! -f ".env" ]]; then
        log_warning ".env file not found. Please copy env.production.template to .env and configure it."
        missing_files+=(".env")
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Missing required files: ${missing_files[*]}"
        exit 1
    fi
    
    log_success "All required files found"
}

# Generate self-signed SSL certificate if not exists
generate_ssl_cert() {
    if [[ ! -f "ssl/cert.pem" ]] || [[ ! -f "ssl/key.pem" ]]; then
        log_info "Generating self-signed SSL certificate..."
        mkdir -p ssl
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=VN/ST=Ho Chi Minh/L=Ho Chi Minh City/O=Leadity/CN=localhost" \
            2>/dev/null
        
        if [[ $? -eq 0 ]]; then
            log_success "SSL certificate generated successfully"
            log_warning "Note: This is a self-signed certificate. For production, use a proper SSL certificate."
        else
            log_error "Failed to generate SSL certificate"
            exit 1
        fi
    else
        log_success "SSL certificate already exists"
    fi
}

# Build the application
build() {
    log_info "Building Leadity Banking application..."
    
    # Try building with cache first
    if docker-compose -f $COMPOSE_FILE build; then
        log_success "Build completed successfully"
        return 0
    fi
    
    log_warning "Build failed, trying with no-cache..."
    
    # Clean up Docker cache and try again
    docker system prune -f
    docker builder prune -f
    
    # Try building without cache
    if docker-compose -f $COMPOSE_FILE build --no-cache; then
        log_success "Build completed successfully (no-cache)"
        return 0
    fi
    
    log_error "Build failed even with no-cache. Checking for common issues..."
    
    # Check Docker disk space
    docker system df
    
    log_error "Build failed. Please check Docker logs above for details."
    exit 1
}

# Deploy the application
deploy() {
    log_info "Deploying Leadity Banking application..."
    
    # Choose the correct nginx configuration
    if [[ -f ".env" ]] && grep -q "DOMAIN_NAME=cdp.leadity.ai" .env; then
        log_info "Using production HTTPS configuration"
        # Production config is already in default.conf
    else
        log_info "Using development HTTP configuration"
        cp nginx/default.dev.conf nginx/default.conf
    fi
    
    # Stop existing containers
    docker-compose -f $COMPOSE_FILE down
    
    # Start new containers
    docker-compose -f $COMPOSE_FILE up -d
    
    # Wait for health check
    log_info "Waiting for application to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; then
            log_success "Application is healthy and running"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts - waiting for health check..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Application failed to become healthy within expected time"
    log_info "Checking logs..."
    docker-compose -f $COMPOSE_FILE logs --tail=50
    exit 1
}

# Show application status
status() {
    log_info "Checking application status..."
    docker-compose -f $COMPOSE_FILE ps
    
    log_info "Application logs (last 20 lines):"
    docker-compose -f $COMPOSE_FILE logs --tail=20
}

# Stop the application
stop() {
    log_info "Stopping Leadity Banking application..."
    docker-compose -f $COMPOSE_FILE down
    log_success "Application stopped"
}

# Restart the application
restart() {
    log_info "Restarting Leadity Banking application..."
    stop
    deploy
}

# Show application logs
logs() {
    local service=${1:-}
    if [[ -n "$service" ]]; then
        docker-compose -f $COMPOSE_FILE logs -f "$service"
    else
        docker-compose -f $COMPOSE_FILE logs -f
    fi
}

# Backup application data
backup() {
    log_info "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    local backup_file="$BACKUP_DIR/leadity-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Create backup of volumes and configurations
    tar -czf "$backup_file" \
        docker-compose.yml \
        nginx/ \
        ssl/ \
        env.production.template \
        2>/dev/null
    
    log_success "Backup created: $backup_file"
}

# Clean up old images and containers
cleanup() {
    log_info "Cleaning up old Docker images and containers..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_success "Cleanup completed"
}

# Update application
update() {
    log_info "Updating Leadity Banking application..."
    
    # Create backup first
    backup
    
    # Pull latest code (if in git repo)
    if [[ -d ".git" ]]; then
        log_info "Pulling latest code from git..."
        git pull
    fi
    
    # Rebuild and deploy
    build
    deploy
    
    log_success "Update completed successfully"
}

# Show help
show_help() {
    echo "Leadity Banking Platform Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build      Build the Docker image"
    echo "  deploy     Deploy the application (build + start)"
    echo "  start      Start the application containers"
    echo "  stop       Stop the application containers"
    echo "  restart    Restart the application"
    echo "  status     Show application status"
    echo "  logs       Show application logs (optional: specify service)"
    echo "  backup     Create a backup of application data"
    echo "  cleanup    Clean up old Docker images and containers"
    echo "  update     Update application (backup + pull + build + deploy)"
    echo "  ssl        Generate self-signed SSL certificate"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy              # Deploy the application"
    echo "  $0 logs leadity-app    # Show logs for the main app"
    echo "  $0 status              # Check application status"
}

# Main script logic
main() {
    local command=${1:-help}
    
    case $command in
        "build")
            check_docker
            check_requirements
            build
            ;;
        "deploy")
            check_docker
            check_requirements
            generate_ssl_cert
            build
            deploy
            ;;
        "start")
            check_docker
            check_requirements
            log_info "Starting application..."
            docker-compose -f $COMPOSE_FILE up -d
            ;;
        "stop")
            stop
            ;;
        "restart")
            restart
            ;;
        "status")
            status
            ;;
        "logs")
            logs $2
            ;;
        "backup")
            backup
            ;;
        "cleanup")
            cleanup
            ;;
        "update")
            check_docker
            check_requirements
            update
            ;;
        "ssl")
            generate_ssl_cert
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run the script
main "$@" 