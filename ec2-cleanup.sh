#!/bin/bash

# EC2 Disk Space Cleanup Script
# This script helps free up disk space on your EC2 instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 EC2 Disk Space Cleanup Script${NC}"
echo "======================================="

# Function to show disk usage
show_disk_usage() {
    echo -e "\n${YELLOW}📊 Current Disk Usage:${NC}"
    df -h / | head -2
    echo ""
}

# Function to show space freed
show_space_freed() {
    local before=$1
    local after=$(df / | tail -1 | awk '{print $4}')
    local freed=$((after - before))
    echo -e "${GREEN}💾 Space freed: ${freed}KB${NC}"
}

# Get initial disk usage
initial_space=$(df / | tail -1 | awk '{print $4}')
show_disk_usage

echo -e "${BLUE}Starting cleanup process...${NC}\n"

# 1. DOCKER CLEANUP (Most Important)
echo -e "${YELLOW}🐳 Docker Cleanup${NC}"
echo "-------------------"

if command -v docker >/dev/null 2>&1; then
    echo "• Removing stopped containers..."
    docker container prune -f
    
    echo "• Removing unused images..."
    docker image prune -f
    
    echo "• Removing unused networks..."
    docker network prune -f
    
    echo "• Removing unused volumes..."
    docker volume prune -f
    
    echo "• Removing build cache..."
    docker builder prune -f
    
    echo "• Removing ALL unused data (aggressive)..."
    docker system prune -a -f
    
    echo -e "${GREEN}✅ Docker cleanup completed${NC}\n"
else
    echo -e "${RED}❌ Docker not found or not running${NC}\n"
fi

# 2. SYSTEM PACKAGE CLEANUP
echo -e "${YELLOW}📦 Package Manager Cleanup${NC}"
echo "-----------------------------"

if command -v apt >/dev/null 2>&1; then
    echo "• Cleaning apt cache..."
    sudo apt clean
    sudo apt autoclean
    sudo apt autoremove -y
    echo -e "${GREEN}✅ APT cleanup completed${NC}\n"
elif command -v yum >/dev/null 2>&1; then
    echo "• Cleaning yum cache..."
    sudo yum clean all
    sudo package-cleanup --oldkernels --count=1 -y 2>/dev/null || true
    echo -e "${GREEN}✅ YUM cleanup completed${NC}\n"
elif command -v dnf >/dev/null 2>&1; then
    echo "• Cleaning dnf cache..."
    sudo dnf clean all
    sudo dnf autoremove -y
    echo -e "${GREEN}✅ DNF cleanup completed${NC}\n"
fi

# 3. LOG FILES CLEANUP
echo -e "${YELLOW}📋 Log Files Cleanup${NC}"
echo "---------------------"

echo "• Cleaning system logs..."
sudo find /var/log -type f -name "*.log" -size +100M -delete 2>/dev/null || true
sudo find /var/log -type f -name "*.log.*" -mtime +7 -delete 2>/dev/null || true

echo "• Cleaning journal logs..."
sudo journalctl --vacuum-time=3d 2>/dev/null || true
sudo journalctl --vacuum-size=100M 2>/dev/null || true

echo "• Cleaning rotated logs..."
sudo find /var/log -name "*.gz" -mtime +7 -delete 2>/dev/null || true
sudo find /var/log -name "*.1" -mtime +7 -delete 2>/dev/null || true

echo -e "${GREEN}✅ Log cleanup completed${NC}\n"

# 4. TEMPORARY FILES CLEANUP
echo -e "${YELLOW}🗑️  Temporary Files Cleanup${NC}"
echo "---------------------------"

echo "• Cleaning /tmp directory..."
sudo find /tmp -type f -mtime +7 -delete 2>/dev/null || true

echo "• Cleaning user temp files..."
find ~/.cache -type f -mtime +30 -delete 2>/dev/null || true
find ~/.tmp -type f -mtime +7 -delete 2>/dev/null || true

echo "• Cleaning system temp files..."
sudo find /var/tmp -type f -mtime +7 -delete 2>/dev/null || true

echo -e "${GREEN}✅ Temporary files cleanup completed${NC}\n"

# 5. NODE.JS / NPM CLEANUP (if applicable)
echo -e "${YELLOW}📦 Node.js/NPM Cleanup${NC}"
echo "------------------------"

if command -v npm >/dev/null 2>&1; then
    echo "• Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || true
    echo -e "${GREEN}✅ NPM cleanup completed${NC}\n"
else
    echo -e "${YELLOW}⚠️  NPM not found, skipping${NC}\n"
fi

# 6. CORE DUMPS AND CRASH REPORTS
echo -e "${YELLOW}💥 Core Dumps & Crash Reports${NC}"
echo "--------------------------------"

echo "• Removing core dumps..."
sudo find /var/crash -type f -delete 2>/dev/null || true
sudo find / -name "core.*" -type f -delete 2>/dev/null || true

echo -e "${GREEN}✅ Core dumps cleanup completed${NC}\n"

# 7. OLD KERNELS (Ubuntu/Debian)
if command -v apt >/dev/null 2>&1; then
    echo -e "${YELLOW}🔧 Old Kernels Cleanup${NC}"
    echo "------------------------"
    
    echo "• Removing old kernel versions..."
    sudo apt autoremove --purge -y 2>/dev/null || true
    
    echo -e "${GREEN}✅ Kernel cleanup completed${NC}\n"
fi

# 8. LARGE FILES ANALYSIS
echo -e "${YELLOW}🔍 Large Files Analysis${NC}"
echo "-------------------------"

echo "• Finding largest files (>100MB):"
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | head -10 || true

echo -e "\n• Largest directories in /var:"
sudo du -h /var 2>/dev/null | sort -hr | head -5 || true

echo -e "\n• Largest directories in /home:"
du -h /home 2>/dev/null | sort -hr | head -5 || true

# Final disk usage
echo -e "\n${BLUE}🏁 Cleanup Complete!${NC}"
echo "===================="
show_disk_usage
show_space_freed $initial_space

echo -e "${GREEN}✨ Cleanup process finished successfully!${NC}"
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Run this script regularly to maintain disk space"
echo "  • Monitor Docker images and containers growth"
echo "  • Consider setting up log rotation"
echo "  • Use 'ncdu /' to analyze disk usage interactively" 