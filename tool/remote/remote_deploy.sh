#!/bin/bash
# Aukrug Dashboard Remote Deployment Script
# Deploys the Next.js dashboard to the provisioned LXC container

set -euo pipefail

# Color output functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
REMOTE_HOST=${1:-"10.0.1.12"}
REMOTE_USER=${2:-"root"}
DASHBOARD_DIR="/opt/aukrug/dashboard"
LOCAL_BUILD_DIR=".next/standalone"
LOCAL_STATIC_DIR=".next/static"

log_info "Starting dashboard deployment to ${REMOTE_USER}@${REMOTE_HOST}"

# Check if build exists
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    log_error "Build directory not found. Run 'npm run build' first."
    exit 1
fi

# Check if static assets exist
if [ ! -d "$LOCAL_STATIC_DIR" ]; then
    log_error "Static assets directory not found. Run 'npm run build' first."
    exit 1
fi

# Stop existing PM2 processes
log_info "Stopping existing dashboard processes..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${DASHBOARD_DIR} && pm2 stop ecosystem.config.js || true"

# Create deployment directory if it doesn't exist
log_info "Preparing deployment directory..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${DASHBOARD_DIR}"

# Deploy built application
log_info "Deploying built application..."
rsync -avz --delete "$LOCAL_BUILD_DIR/" "${REMOTE_USER}@${REMOTE_HOST}:${DASHBOARD_DIR}/"

# Deploy static assets
log_info "Deploying static assets..."
rsync -avz "$LOCAL_STATIC_DIR/" "${REMOTE_USER}@${REMOTE_HOST}:${DASHBOARD_DIR}/.next/static/"

# Ensure PM2 ecosystem file is present
log_info "Ensuring PM2 configuration is present..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
if [ ! -f /opt/aukrug/dashboard/ecosystem.config.js ]; then
    cat > /opt/aukrug/dashboard/ecosystem.config.js << 'EOFINNER'
module.exports = {
  apps: [{
    name: 'aukrug-dashboard',
    script: 'server.js',
    cwd: '/opt/aukrug/dashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/opt/aukrug/logs/dashboard-error.log',
    out_file: '/opt/aukrug/logs/dashboard-out.log',
    log_file: '/opt/aukrug/logs/dashboard-combined.log'
  }]
};
EOFINNER
fi
EOF

# Set proper permissions
log_info "Setting proper permissions..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "chown -R root:root ${DASHBOARD_DIR}"

# Start PM2 processes
log_info "Starting dashboard with PM2..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" << EOF
cd ${DASHBOARD_DIR}
pm2 start ecosystem.config.js
pm2 save
EOF

# Restart nginx to ensure proxy is working
log_info "Restarting nginx..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "systemctl reload nginx"

# Health check
log_info "Performing health check..."
sleep 5

# Check PM2 status
log_info "Checking PM2 status..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "pm2 status"

# Test HTTP endpoints
log_info "Testing HTTP endpoints..."
HTTP_STATUS=$(ssh "${REMOTE_USER}@${REMOTE_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://localhost/dashboard/ || echo '000'")

if [ "$HTTP_STATUS" = "200" ]; then
    log_success "Dashboard is responding correctly (HTTP $HTTP_STATUS)"
else
    log_warn "Dashboard returned HTTP $HTTP_STATUS - may need additional configuration"
fi

# Show recent logs
log_info "Recent dashboard logs:"
ssh "${REMOTE_USER}@${REMOTE_HOST}" "pm2 logs aukrug-dashboard --lines 10 --nostream || tail -n 10 /opt/aukrug/logs/dashboard-*.log"

log_success "Dashboard deployment completed!"
echo ""
echo "=== Deployment Summary ==="
echo "📊 Dashboard URL: http://${REMOTE_HOST}/dashboard/"
echo "🔧 PM2 Management: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 status'"
echo "📝 View Logs: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs aukrug-dashboard'"
echo "🔄 Restart: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 restart aukrug-dashboard'"
echo ""
echo "✅ Deployment complete! Dashboard is now live."