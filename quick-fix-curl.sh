#!/bin/bash

# Quick fix for curl-minimal conflict on Amazon Linux 2023
# Run this first if you're getting curl package conflicts

echo "🔧 Fixing curl-minimal conflict on Amazon Linux 2023..."

# Check if curl-minimal is causing the problem
if rpm -q curl-minimal >/dev/null 2>&1; then
    echo "✅ Found curl-minimal package, replacing with full curl..."
    sudo dnf swap -y curl-minimal curl
    echo "✅ curl-minimal replaced successfully"
else
    echo "ℹ️  curl-minimal not found, installing full curl..."
    sudo dnf install -y curl
fi

# Verify curl is working
if command -v curl >/dev/null 2>&1; then
    echo "✅ curl is now available: $(curl --version | head -1)"
    echo ""
    echo "🚀 Now you can run the main deployment script:"
    echo "bash ec2-deploy-leadity.sh"
else
    echo "❌ curl installation failed. Please install manually:"
    echo "sudo dnf remove curl-minimal"
    echo "sudo dnf install curl"
fi 