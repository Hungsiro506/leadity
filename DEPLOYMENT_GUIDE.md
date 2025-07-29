# 🚀 Leadity Banking Platform - Docker Deployment Guide

This guide will help you deploy the Leadity Banking Platform using Docker on any server, including Azure instances.

## 📋 Prerequisites

### Required Software
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **OpenSSL** (for SSL certificate generation)
- **Git** (for code updates)

### Server Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **Operating System**: Ubuntu 20.04+, CentOS 8+, or any Docker-compatible OS

## 🔧 Quick Start

### 1. Prepare Environment
```bash
# Clone or copy your project files to the server
cd /path/to/your/project

# Copy environment template and configure
cp env.production.template .env
nano .env  # Edit with your domain and settings
```

### 2. Configure Environment Variables
Edit `.env` file with your specific values:
```bash
# Domain Configuration
DOMAIN_NAME=yourdomain.com

# PostHog Configuration (already set)
NEXT_PUBLIC_POSTHOG_KEY=HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 3. Deploy Application
```bash
# One-command deployment
./deploy.sh deploy
```

That's it! Your banking platform will be available at:
- **HTTP**: `http://your-domain-or-ip`
- **HTTPS**: `https://your-domain-or-ip` (with self-signed cert)

## 📊 Docker Architecture

```
┌─────────────────────────────────────────┐
│            Internet Traffic            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Nginx Reverse Proxy             │
│         (Port 80/443)                   │
│         - SSL Termination               │
│         - Rate Limiting                 │
│         - Security Headers              │
│         - Static File Serving           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Next.js Banking Application       │
│       (Port 3000 - Internal)           │
│       - Enhanced Banking Forms         │
│       - PostHog Analytics             │
│       - Health Monitoring             │
└─────────────────────────────────────────┘
```

## 🛠️ Deployment Commands

### Basic Operations
```bash
# Deploy application (build + start)
./deploy.sh deploy

# Check application status
./deploy.sh status

# View application logs
./deploy.sh logs

# View specific service logs
./deploy.sh logs leadity-app
./deploy.sh logs nginx

# Stop application
./deploy.sh stop

# Restart application
./deploy.sh restart
```

### Maintenance Operations
```bash
# Create backup
./deploy.sh backup

# Update application
./deploy.sh update

# Clean up old containers/images
./deploy.sh cleanup

# Generate new SSL certificate
./deploy.sh ssl
```

## 🔒 SSL/HTTPS Configuration

### Option 1: Self-Signed Certificate (Development/Testing)
The deployment script automatically generates a self-signed certificate:
```bash
./deploy.sh ssl
```

### Option 2: Let's Encrypt (Production - Free)
For production domains, use Let's Encrypt:
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate (replace yourdomain.com)
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem

# Restart application
./deploy.sh restart
```

### Option 3: Commercial SSL Certificate
1. Purchase SSL certificate from provider
2. Save certificate as `ssl/cert.pem`
3. Save private key as `ssl/key.pem`
4. Restart application: `./deploy.sh restart`

## 🌐 Azure Deployment

### Azure Virtual Machine Setup
1. **Create VM**:
   - Size: Standard_B2s (2 cores, 4GB RAM) minimum
   - OS: Ubuntu 20.04 LTS
   - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Install Docker**:
```bash
# Update system
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

3. **Deploy Application**:
```bash
# Clone/upload your project
git clone <your-repo> leadity-banking
cd leadity-banking

# Configure environment
cp env.production.template .env
nano .env  # Update DOMAIN_NAME with your Azure domain

# Deploy
./deploy.sh deploy
```

### Azure Container Instance (Alternative)
For managed container deployment:
```bash
# Build and push to Azure Container Registry
az acr build --registry myregistry --image leadity-banking .

# Deploy to Container Instance
az container create \
  --resource-group myResourceGroup \
  --name leadity-banking \
  --image myregistry.azurecr.io/leadity-banking \
  --dns-name-label leadity-banking \
  --ports 80 443
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
The application includes a built-in health check:
```bash
# Check application health
curl http://localhost/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 12345,
  "environment": "production",
  "memory": {
    "used": 45.2,
    "total": 67.8
  }
}
```

### Container Health
```bash
# Check Docker container health
docker-compose ps

# Expected output:
NAME                   COMMAND                  SERVICE             STATUS                    PORTS
leadity-banking-app    "docker-entrypoint.s…"   leadity-app         Up (healthy)             
leadity-nginx          "/docker-entrypoint.…"   nginx               Up                        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Log Monitoring
```bash
# Real-time logs
./deploy.sh logs

# Application-specific logs
./deploy.sh logs leadity-app

# Nginx access logs
./deploy.sh logs nginx | grep "GET\|POST"
```

## 🛡️ Security Features

### Built-in Security
- **HTTPS Enforcement**: All HTTP traffic redirected to HTTPS
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Rate Limiting**: 10 requests/minute for banking operations
- **Input Validation**: Banking form validation and sanitization
- **Non-root User**: Application runs as non-privileged user

### Rate Limiting Configuration
Edit `nginx/nginx.conf` to adjust rate limits:
```nginx
# Banking operations (more restrictive)
limit_req_zone $binary_remote_addr zone=banking:10m rate=10r/m;

# API operations
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check Docker status
docker info

# Check logs for errors
./deploy.sh logs

# Verify environment file
cat .env
```

#### SSL Certificate Issues
```bash
# Regenerate self-signed certificate
./deploy.sh ssl

# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout
```

#### Port Already in Use
```bash
# Find process using port 80/443
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Stop conflicting services
sudo systemctl stop apache2  # If Apache is running
sudo systemctl stop nginx    # If system Nginx is running
```

#### Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Restart with memory cleanup
./deploy.sh stop
./deploy.sh cleanup
./deploy.sh deploy
```

### Performance Optimization

#### For High Traffic
Edit `docker-compose.yml`:
```yaml
services:
  leadity-app:
    deploy:
      replicas: 3  # Scale to 3 instances
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

#### For Better Caching
Edit `nginx/default.conf`:
```nginx
# Increase cache duration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;  # Increase from 1y to 30d for development
    add_header Cache-Control "public, immutable";
}
```

## 📈 Scaling & Production Tips

### Load Balancing
For multiple instances, use Azure Load Balancer:
```bash
# Scale application
docker-compose up --scale leadity-app=3 -d
```

### Database Integration
If adding a database:
```yaml
# Add to docker-compose.yml
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: leadity
      POSTGRES_USER: leadity
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Backup Strategy
```bash
# Automated daily backups
echo "0 2 * * * cd /path/to/leadity && ./deploy.sh backup" | crontab -
```

## 🎯 Domain & DNS Configuration

### DNS Records
Point your domain to your Azure instance:
```
Type: A
Name: @ (or www)
Value: YOUR_AZURE_PUBLIC_IP
TTL: 300
```

### Multiple Domains
Edit `nginx/default.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    # ... rest of configuration
}
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
```bash
# Weekly tasks
./deploy.sh backup    # Create backup
./deploy.sh cleanup   # Clean old images
./deploy.sh status    # Check health

# Monthly tasks
./deploy.sh update    # Update application
# Review and rotate SSL certificates
# Check and update dependencies
```

### Getting Help
- **Logs**: Always check `./deploy.sh logs` first
- **Status**: Use `./deploy.sh status` for overview
- **Health**: Check `/api/health` endpoint
- **Documentation**: This guide covers most scenarios

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Server has Docker installed
- [ ] Ports 80/443 are open
- [ ] Domain DNS is configured
- [ ] Environment file is configured
- [ ] SSL certificates are ready

### Post-Deployment
- [ ] Application responds on HTTP/HTTPS
- [ ] Health check returns "healthy"
- [ ] Banking forms work correctly
- [ ] PostHog analytics tracking works
- [ ] SSL certificate is valid
- [ ] Rate limiting is working
- [ ] Logs are being generated
- [ ] Backup system is configured

**Your Leadity Banking Platform is now ready for production! 🎉** 