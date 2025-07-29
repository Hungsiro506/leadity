#!/bin/bash

# Nginx Debug Script - Fix 400 errors and configuration issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[NGINX-DEBUG]${NC} $1"
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

log_info "Debugging nginx 400 errors..."

# Check current nginx config
log_info "Current nginx configuration:"
if [ -f "nginx/default.conf" ]; then
    echo "--- nginx/default.conf (first 20 lines) ---"
    head -20 nginx/default.conf
    echo "--- end ---"
else
    log_error "nginx/default.conf not found!"
fi

# Check if this is a domain access issue
log_info "Checking server access method..."
if [ -f ".env" ] && grep -q "cdp.leadity.ai" .env; then
    log_info "Production environment detected (cdp.leadity.ai)"
    
    # Check if SSL certificates exist
    if [ ! -f "ssl/cert.pem" ]; then
        log_warning "SSL certificates missing - creating temporary HTTP config"
        
        # Create temporary HTTP-only config for the domain
        cat > nginx/default.conf << 'EOF'
# Temporary HTTP configuration for cdp.leadity.ai (no SSL)
server {
    listen 80;
    server_name cdp.leadity.ai www.cdp.leadity.ai _;
    
    # Security headers (HTTP only)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.i.posthog.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://us.i.posthog.com; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com;" always;
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://leadity_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Next.js static files
    location /_next/static/ {
        proxy_pass http://leadity_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://leadity_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://leadity_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Main application routes
    location / {
        proxy_pass http://leadity_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
EOF
        log_success "Created temporary HTTP configuration"
    fi
else
    log_info "Development/local environment detected"
    # Use development config
    if [ -f "nginx/default.dev.conf" ]; then
        cp nginx/default.dev.conf nginx/default.conf
        log_success "Using development configuration"
    fi
fi

# Restart nginx container
log_info "Restarting nginx with new configuration..."
docker compose restart nginx

# Wait a moment for nginx to start
sleep 3

# Test the endpoints
log_info "Testing endpoints..."

# Test health endpoint
if curl -f -s http://localhost/api/health > /dev/null; then
    log_success "Health endpoint working"
else
    log_warning "Health endpoint not responding"
fi

# Test main page
if curl -f -s http://localhost/ > /dev/null; then
    log_success "Main page working"
else
    log_warning "Main page not responding"
fi

# Show current status
log_info "Current container status:"
docker compose ps

log_info "If still getting 400 errors, the issue might be:"
echo "1. Domain DNS not pointing to this server"
echo "2. Firewall blocking port 80"
echo "3. Accessing via IP instead of domain name"
echo ""
echo "Try accessing via: http://cdp.leadity.ai"
echo "Or check nginx logs: docker compose logs nginx" 