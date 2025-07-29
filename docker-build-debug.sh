#!/bin/bash

# Debug script for Docker build issues
# This script helps identify build problems with verbose output

echo "🔍 Docker Build Debug Script"
echo "================================"

# Check Docker status
echo "📊 Checking Docker status..."
docker --version
docker info | grep -E "(CPUs|Total Memory|Operating System)"

# Check available resources
echo ""
echo "💾 System Resources:"
echo "Available disk space: $(df -h / | awk 'NR==2 {print $4}')"
echo "Available memory: $(free -h | awk 'NR==2{print $7}')"
echo "CPU cores: $(nproc)"

# Check if we're in the right directory
echo ""
echo "📁 Current directory: $(pwd)"
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this from the leadity directory."
    exit 1
fi

echo "✅ Found package.json"

# Show package.json and dependencies
echo ""
echo "📦 Package info:"
echo "Name: $(grep '"name"' package.json | cut -d'"' -f4)"
echo "Version: $(grep '"version"' package.json | cut -d'"' -f4)"

# Check if node_modules exists locally
if [ -d "node_modules" ]; then
    echo "📂 Local node_modules exists ($(du -sh node_modules | cut -f1))"
else
    echo "📂 No local node_modules"
fi

# Try to build Docker image with verbose output
echo ""
echo "🐳 Starting Docker build with detailed logging..."
echo "This may take 5-10 minutes..."

# Build with progress and detailed output
docker build --progress=plain --no-cache -t leadity-banking-debug . 2>&1 | tee docker-build.log

BUILD_RESULT=$?

echo ""
if [ $BUILD_RESULT -eq 0 ]; then
    echo "✅ Docker build successful!"
    echo "🚀 You can now run: docker run -p 3000:3000 leadity-banking-debug"
else
    echo "❌ Docker build failed!"
    echo ""
    echo "🔍 Analyzing build log..."
    
    # Check for common issues
    if grep -q "npm ERR!" docker-build.log; then
        echo "🔴 NPM errors found:"
        grep "npm ERR!" docker-build.log | tail -5
    fi
    
    if grep -q "Error:" docker-build.log; then
        echo "🔴 Build errors found:"
        grep "Error:" docker-build.log | tail -5
    fi
    
    if grep -q "ENOSPC" docker-build.log; then
        echo "🔴 Out of disk space!"
        df -h
    fi
    
    if grep -q "ENOMEM" docker-build.log; then
        echo "🔴 Out of memory!"
        free -h
    fi
    
    echo ""
    echo "📄 Full build log saved to: docker-build.log"
    echo "📧 Share the last 50 lines for debugging:"
    echo "tail -50 docker-build.log"
fi

echo ""
echo "🧹 Cleanup completed images:"
docker images | grep leadity 