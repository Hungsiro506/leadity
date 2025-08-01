#!/bin/bash

# Leadity Banking Platform - Complete EC2 Amazon Linux Deployment Script
# For domain: cdp.leadity.ai
# Run this script on your EC2 instance: bash ec2-deploy-leadity.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="cdp.leadity.ai"
REPO_URL="https://github.com/Hungsiro506/leadity.git"
APP_DIR="leadity"
EMAIL="admin@leadity.ai"  # Change this to your email for Let's Encrypt

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

# Check if running as root
check_user() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
    log_success "Running as non-root user: $(whoami)"
}

# Update system and install dependencies
install_dependencies() {
    log_info "Updating system and installing dependencies..."
    
    # Detect package manager and update system with conflict resolution
    if command -v dnf >/dev/null 2>&1; then
        log_info "Using dnf package manager (Amazon Linux 2023)"
        sudo dnf update -y --allowerasing --skip-broken
        PKG_MGR="dnf"
    else
        log_info "Using yum package manager (Amazon Linux 2)"
        sudo yum update -y --allowerasing --skip-broken
        PKG_MGR="yum"
    fi
    
    # Install basic dependencies
    # Handle curl-minimal conflict on Amazon Linux 2023
    if rpm -q curl-minimal >/dev/null 2>&1; then
        log_info "Detected curl-minimal, replacing with full curl package..."
        sudo $PKG_MGR swap -y curl-minimal curl
    elif ! command -v curl >/dev/null 2>&1; then
        sudo $PKG_MGR install -y --allowerasing --skip-broken curl
    else
        log_info "curl is already available"
    fi
    
    # Install git if not present
    if ! command -v git >/dev/null 2>&1; then
        sudo $PKG_MGR install -y --allowerasing --skip-broken git
    else
        log_info "git is already installed"
    fi
    
    # Install cron for SSL auto-renewal
    if ! command -v crontab >/dev/null 2>&1; then
        log_info "Installing cron for SSL certificate auto-renewal..."
        sudo $PKG_MGR install -y --allowerasing --skip-broken cronie
        sudo systemctl enable crond
        sudo systemctl start crond
    else
        log_info "cron is already installed"
    fi
    
    # Install Docker with multiple fallback methods
    if command -v docker >/dev/null 2>&1; then
        log_info "Docker is already installed"
    elif ! sudo $PKG_MGR install -y --allowerasing docker; then
        log_warning "Standard Docker installation failed, trying amazon-linux-extras..."
        if command -v amazon-linux-extras >/dev/null 2>&1; then
            sudo amazon-linux-extras install -y docker
        else
            log_error "Failed to install Docker. Please install manually and re-run the script."
            exit 1
        fi
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_info "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Verify installations
    if command -v docker >/dev/null 2>&1 && command -v git >/dev/null 2>&1; then
        log_success "Dependencies installed successfully"
    else
        log_error "Some dependencies failed to install. Please check manually."
        exit 1
    fi
}

# Install Certbot for SSL certificates
install_certbot() {
    log_info "Installing Certbot for SSL certificates..."
    
    # Check if certbot is already installed
    if command -v certbot >/dev/null 2>&1; then
        log_info "Certbot is already installed"
        return 0
    fi
    
    # Try different methods for different Amazon Linux versions
    if command -v amazon-linux-extras >/dev/null 2>&1; then
        # Amazon Linux 2
        log_info "Detected Amazon Linux 2, installing certbot via amazon-linux-extras..."
        sudo amazon-linux-extras install -y epel
        sudo yum install -y --allowerasing certbot
    elif command -v dnf >/dev/null 2>&1; then
        # Amazon Linux 2023
        log_info "Detected Amazon Linux 2023, installing certbot via dnf..."
        sudo dnf install -y --allowerasing certbot
    else
        # Fallback method
        log_info "Using fallback method for certbot installation..."
        sudo yum install -y --allowerasing epel-release
        sudo yum install -y --allowerasing certbot
    fi
    
    # Verify certbot installation
    if command -v certbot >/dev/null 2>&1; then
        log_success "Certbot installed successfully"
    else
        log_error "Failed to install certbot. Please install manually."
        exit 1
    fi
}

# Clone repository
clone_repository() {
    log_info "Cloning Leadity repository..."
    
    if [ -d "$APP_DIR" ]; then
        log_warning "Directory $APP_DIR already exists. Removing it..."
        rm -rf "$APP_DIR"
    fi
    
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    
    log_success "Repository cloned successfully"
}

# Configure environment
configure_environment() {
    log_info "Configuring environment for domain: $DOMAIN"
    
    # Copy environment template
    cp env.production.template .env
    
    # Update environment file
    cat > .env << EOF
# Production Environment Variables for Leadity Banking Platform
# Domain Configuration
DOMAIN_NAME=$DOMAIN

# Application Configuration
NODE_ENV=production
PORT=3000

# PostHog Analytics Configuration
NEXT_PUBLIC_POSTHOG_KEY=HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Security Configuration
NGINX_RATE_LIMIT_BANKING=10r/m
NGINX_RATE_LIMIT_API=30r/m

# Logging Configuration
LOG_LEVEL=info
ACCESS_LOG_FORMAT=banking_logs

# Performance Configuration
NGINX_WORKER_PROCESSES=auto
NGINX_WORKER_CONNECTIONS=2048

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30s
HEALTH_CHECK_TIMEOUT=10s
HEALTH_CHECK_RETRIES=3
EOF
    
    log_success "Environment configured for $DOMAIN"
}

# Update Nginx configuration for domain
configure_nginx() {
    log_info "Configuring Nginx for domain: $DOMAIN"
    
    # The nginx/default.conf already includes proper HTTPS and www redirect configuration
    # No additional configuration needed - SSL certificates will be handled by setup_ssl()
    
    log_success "Nginx configured for $DOMAIN"
}

# Generate SSL certificate with Let's Encrypt
setup_ssl() {
    log_info "Setting up SSL certificate for $DOMAIN..."
    
    # Stop any existing web services
    sudo systemctl stop httpd nginx 2>/dev/null || true
    
    # Generate Let's Encrypt certificate
    sudo certbot certonly --standalone --non-interactive --agree-tos --email "$EMAIL" -d "$DOMAIN"
    
    # Create ssl directory
    mkdir -p ssl
    
    # Copy certificates
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/cert.pem
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/key.pem
    
    # Change ownership
    sudo chown $USER:$USER ssl/*.pem
    
    # Set up auto-renewal
    setup_ssl_renewal
    
    log_success "SSL certificate configured for $DOMAIN"
}

# Set up SSL certificate auto-renewal
setup_ssl_renewal() {
    log_info "Setting up SSL certificate auto-renewal..."
    
    # Check if crontab is available
    if ! command -v crontab >/dev/null 2>&1; then
        log_warning "crontab not available, skipping auto-renewal setup"
        log_info "You can manually renew SSL certificates with: sudo certbot renew"
        return 0
    fi
    
    # Create renewal script
    cat > ssl-renew.sh << 'EOF'
#!/bin/bash
sudo certbot renew --quiet
if [ $? -eq 0 ]; then
    sudo cp /etc/letsencrypt/live/cdp.leadity.ai/fullchain.pem /home/$USER/leadity/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/cdp.leadity.ai/privkey.pem /home/$USER/leadity/ssl/key.pem
    sudo chown $USER:$USER /home/$USER/leadity/ssl/*.pem
    cd /home/$USER/leadity && ./deploy.sh restart
fi
EOF
    
    chmod +x ssl-renew.sh
    
    # Ensure cron service is running
    sudo systemctl enable crond 2>/dev/null || sudo systemctl enable cron 2>/dev/null || true
    sudo systemctl start crond 2>/dev/null || sudo systemctl start cron 2>/dev/null || true
    
    # Add to crontab (runs twice daily)
    if (crontab -l 2>/dev/null; echo "0 */12 * * * /home/$USER/leadity/ssl-renew.sh") | crontab -; then
        log_success "SSL auto-renewal configured (runs twice daily)"
    else
        log_warning "Failed to setup auto-renewal. SSL certificates will need manual renewal."
        log_info "Manual renewal command: sudo certbot renew"
    fi
}

# Deploy application
deploy_application() {
    log_info "Deploying Leadity Banking Platform..."
    
    # Make deploy script executable
    chmod +x deploy.sh
    
    # Try to build with better error handling
    log_info "Building Docker image (this may take 5-10 minutes)..."
    
    # Apply docker group without logout (for current session)
    if newgrp docker << 'EOF'
# Build and deploy the application
if ./deploy.sh deploy; then
    echo "Deployment successful"
    exit 0
else
    echo "Deployment failed, checking Docker logs..."
    docker logs leadity-banking-app 2>/dev/null || echo "No app logs available"
    docker logs leadity-nginx 2>/dev/null || echo "No nginx logs available"
    exit 1
fi
EOF
    then
        log_success "Application deployed successfully"
    else
        log_error "Deployment failed. Checking for common issues..."
        
        # Check Docker status
        if ! docker ps >/dev/null 2>&1; then
            log_error "Docker is not running or accessible"
            return 1
        fi
        
        # Check disk space
        local available_space=$(df / | awk 'NR==2 {print $4}')
        if [ "$available_space" -lt 2000000 ]; then
            log_warning "Low disk space: ${available_space}KB available"
        fi
        
        # Check memory
        local available_memory=$(free -m | awk 'NR==2{printf "%.1f", $7/1024}')
        log_info "Available memory: ${available_memory}GB"
        
        log_error "Deployment failed. Please check the error messages above."
        return 1
    fi
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait a moment for containers to start
    sleep 10
    
    # Check if containers are running
    if docker ps | grep -q "leadity"; then
        log_success "Docker containers are running"
    else
        log_error "Docker containers are not running"
        return 1
    fi
    
    # Test health endpoint
    if curl -f -s "http://localhost/api/health" > /dev/null; then
        log_success "Health check endpoint is responding"
    else
        log_warning "Health check endpoint not responding yet (may need more time)"
    fi
    
    # Test domain access (if DNS has propagated)
    if curl -f -s -k "https://$DOMAIN/api/health" > /dev/null; then
        log_success "Domain $DOMAIN is accessible"
    else
        log_warning "Domain $DOMAIN not accessible yet (DNS may still be propagating)"
    fi
}

# Show final information
show_completion_info() {
    log_success "🎉 Leadity Banking Platform deployment completed!"
    echo ""
    echo -e "${GREEN}🌐 Your banking platform is now live at:${NC}"
    echo -e "   ${BLUE}https://$DOMAIN${NC}"
    echo ""
    echo -e "${GREEN}🔧 Management commands:${NC}"
    echo -e "   ${BLUE}cd $APP_DIR${NC}"
    echo -e "   ${BLUE}./deploy.sh status${NC}      # Check status"
    echo -e "   ${BLUE}./deploy.sh logs${NC}        # View logs"
    echo -e "   ${BLUE}./deploy.sh restart${NC}     # Restart application"
    echo -e "   ${BLUE}./deploy.sh backup${NC}      # Create backup"
    echo ""
    echo -e "${GREEN}🔒 SSL Certificate:${NC}"
    echo -e "   ${BLUE}Auto-renewal configured${NC} (runs twice daily)"
    echo -e "   ${BLUE}Certificate expires:${NC} $(sudo certbot certificates 2>/dev/null | grep "Expiry Date" | head -1 || echo "Check with: sudo certbot certificates")"
    echo ""
    echo -e "${GREEN}📊 Features Available:${NC}"
    echo -e "   ✅ Vietnamese banking loan comparison"
    echo -e "   ✅ Two loan flows (existing & new mortgage)"
    echo -e "   ✅ PostHog analytics tracking"
    echo -e "   ✅ SSL/HTTPS with real certificate"
    echo -e "   ✅ Production security headers"
    echo -e "   ✅ Health monitoring"
    echo ""
    echo -e "${YELLOW}⚠️  DNS Propagation:${NC}"
    echo -e "   If the domain doesn't work immediately, wait 5-10 minutes"
    echo -e "   for DNS changes to propagate globally."
    echo ""
    log_success "Deployment completed successfully! 🚀"
}

# Main execution
main() {
    echo -e "${BLUE}🏦 Leadity Banking Platform - EC2 Deployment${NC}"
    echo -e "${BLUE}Domain: $DOMAIN${NC}"
    echo -e "${BLUE}Starting deployment...${NC}"
    echo ""
    
    check_user
    install_dependencies
    install_certbot
    clone_repository
    configure_environment
    configure_nginx
    setup_ssl
    deploy_application
    verify_deployment
    show_completion_info
}

# Run main function
main "$@" 