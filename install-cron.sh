#!/bin/bash

# Quick install script for cron/crontab on Amazon Linux
# For SSL certificate auto-renewal

echo "🔧 Installing cron for SSL certificate auto-renewal..."

# Detect package manager
if command -v dnf >/dev/null 2>&1; then
    echo "✅ Using dnf (Amazon Linux 2023)"
    sudo dnf install -y cronie
    CRON_SERVICE="crond"
elif command -v yum >/dev/null 2>&1; then
    echo "✅ Using yum (Amazon Linux 2)"
    sudo yum install -y cronie
    CRON_SERVICE="crond"
else
    echo "❌ Package manager not found"
    exit 1
fi

# Start and enable cron service
echo "🚀 Starting cron service..."
sudo systemctl enable $CRON_SERVICE
sudo systemctl start $CRON_SERVICE

# Verify installation
if command -v crontab >/dev/null 2>&1; then
    echo "✅ crontab is now available"
    echo "📊 Cron service status:"
    sudo systemctl status $CRON_SERVICE --no-pager -l
    echo ""
    echo "🔄 You can now re-run the deployment script or manually setup SSL renewal"
else
    echo "❌ crontab installation failed"
    exit 1
fi 