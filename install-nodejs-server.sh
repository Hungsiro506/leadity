#!/bin/bash

# Optional: Install Node.js on EC2 server for local testing
# This is not required - Docker will handle npm, but useful for debugging

echo "Installing Node.js on EC2 server..."

# Detect the OS and install Node.js accordingly
if command -v dnf >/dev/null 2>&1; then
    # Amazon Linux 2023
    echo "Detected Amazon Linux 2023, installing Node.js via dnf..."
    sudo dnf install -y nodejs npm
elif command -v yum >/dev/null 2>&1; then
    # Amazon Linux 2
    echo "Detected Amazon Linux 2, installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
else
    echo "Unsupported OS. Please install Node.js manually if needed."
    exit 1
fi

# Verify installation
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    echo "✅ Node.js installed successfully!"
    echo "Node.js version: $(node --version)"
    echo "NPM version: $(npm --version)"
else
    echo "❌ Node.js installation failed"
    exit 1
fi

echo ""
echo "Note: Node.js is optional on the server - Docker handles all npm operations"
echo "This is only useful for local testing and debugging" 