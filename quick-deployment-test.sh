#!/bin/bash

# Quick deployment test script to verify styling and forms work
# Run this after deployment to check if the fixes are working

set -e

echo "🧪 Testing Leadity deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test 1: Check if containers are running
log_info "Checking Docker containers..."
if docker ps | grep -q "leadity"; then
    log_success "Docker containers are running"
else
    log_error "Docker containers not found"
    exit 1
fi

# Test 2: Check health endpoint
log_info "Testing health endpoint..."
if curl -f -s "http://localhost/api/health" > /dev/null; then
    log_success "Health endpoint responding"
else
    log_error "Health endpoint not responding"
    exit 1
fi

# Test 3: Check if main page loads
log_info "Testing main page response..."
if curl -f -s "http://localhost/" > /dev/null; then
    log_success "Main page loads successfully"
else
    log_error "Main page not loading"
    exit 1
fi

# Test 4: Check for CSS in page source
log_info "Checking for CSS in page source..."
page_content=$(curl -s "http://localhost/")
if echo "$page_content" | grep -q "_next/static" || echo "$page_content" | grep -q "styles"; then
    log_success "CSS references found in page"
else
    log_error "No CSS references found - styling may be broken"
fi

# Test 5: Check for forms in page source
log_info "Checking for forms in page source..."
if echo "$page_content" | grep -q "<form\|<input\|<button"; then
    log_success "Form elements found in page"
else
    log_error "No form elements found"
fi

# Test 6: Check Content-Security-Policy header
log_info "Checking Content-Security-Policy header..."
csp_header=$(curl -I -s "http://localhost/" | grep -i "content-security-policy" || echo "")
if echo "$csp_header" | grep -q "fonts.googleapis.com"; then
    log_success "CSP allows Google Fonts"
else
    log_error "CSP may be blocking Google Fonts"
fi

echo ""
log_success "🎉 Deployment test completed!"
echo ""
echo "If all tests passed, your styling and forms should work correctly."
echo "If any tests failed, check the Docker logs:"
echo "  docker-compose logs leadity-app"
echo "  docker-compose logs nginx" 