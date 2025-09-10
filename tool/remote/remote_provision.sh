#!/bin/bash
# Aukrug LXC Container Provisioning Script
# Provisions a complete LAMP + Node.js environment for WordPress + Next.js dashboard

set -euo pipefail

# Color output functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
VILLAGE=${VILLAGE:-"appmin"}
DOMAIN=${DOMAIN:-"appmin.miocitynet.com"}
WP_DB_NAME="wp_${VILLAGE}"
WP_DB_USER="wp_${VILLAGE}"
WP_DB_PASS=$(openssl rand -base64 16)
WP_ADMIN_USER="admin"
WP_ADMIN_PASS=$(openssl rand -base64 12)
WP_ADMIN_EMAIL="admin@${DOMAIN}"

log_info "Starting LXC container provisioning for ${VILLAGE} (${DOMAIN})"

# Update system packages
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt install -y curl wget unzip git software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install nginx
log_info "Installing nginx..."
apt install -y nginx
systemctl enable nginx

# Install MariaDB
log_info "Installing MariaDB..."
apt install -y mariadb-server mariadb-client
systemctl enable mariadb

# Secure MariaDB installation (basic)
log_info "Securing MariaDB installation..."
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

# Install PHP 8.2
log_info "Installing PHP 8.2..."
add-apt-repository -y ppa:ondrej/php || {
    log_warn "PHP repository not available, trying with existing packages"
    apt install -y php-fpm php-mysql php-curl php-gd php-mbstring php-xml php-zip php-json php-opcache
}
if ! command -v php8.2 &> /dev/null; then
    apt install -y php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd php8.2-mbstring php8.2-xml php8.2-zip php8.2-opcache || {
        log_warn "PHP 8.2 not available, installing default PHP version"
        apt install -y php-fpm php-mysql php-curl php-gd php-mbstring php-xml php-zip php-opcache
    }
fi

systemctl enable php8.2-fpm || systemctl enable php-fpm

# Install Node.js 20 LTS
log_info "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
log_info "Installing pnpm..."
npm install -g pnpm

# Install PM2
log_info "Installing PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root

# Create directory structure
log_info "Creating directory structure..."
mkdir -p /opt/aukrug/{wordpress,dashboard,logs,backups}
mkdir -p /var/www/html
chown -R www-data:www-data /var/www/html
chown -R root:root /opt/aukrug

# Setup MariaDB database and user
log_info "Setting up WordPress database..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${WP_DB_NAME};"
mysql -e "CREATE USER IF NOT EXISTS '${WP_DB_USER}'@'localhost' IDENTIFIED BY '${WP_DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${WP_DB_NAME}.* TO '${WP_DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Download and setup WordPress
log_info "Downloading and setting up WordPress..."
cd /opt/aukrug/wordpress
wget -q https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz --strip-components=1
rm latest.tar.gz

# Configure WordPress
log_info "Configuring WordPress..."
cp wp-config-sample.php wp-config.php
sed -i "s/database_name_here/${WP_DB_NAME}/g" wp-config.php
sed -i "s/username_here/${WP_DB_USER}/g" wp-config.php
sed -i "s/password_here/${WP_DB_PASS}/g" wp-config.php

# Generate WordPress salts
SALTS=$(curl -s https://api.wordpress.org/secret-key/1.1/salt/)
echo "$SALTS" >> wp-config.php

# Set proper permissions
chown -R www-data:www-data /opt/aukrug/wordpress
find /opt/aukrug/wordpress -type d -exec chmod 755 {} \;
find /opt/aukrug/wordpress -type f -exec chmod 644 {} \;

# Create nginx configuration
log_info "Creating nginx configuration..."
cat > /etc/nginx/sites-available/aukrug << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # WordPress CMS location
    location /cms/ {
        alias /opt/aukrug/wordpress/;
        try_files $uri $uri/ /cms/index.php?$args;
        
        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            fastcgi_param PATH_INFO $fastcgi_path_info;
        }
    }

    # Next.js Dashboard location
    location /dashboard/ {
        proxy_pass http://localhost:3000/dashboard/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Default location
    location / {
        try_files $uri $uri/ =404;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/aukrug /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
log_info "Testing nginx configuration..."
nginx -t

# Create PHP-FPM pool configuration for better performance
log_info "Optimizing PHP-FPM configuration..."
cat > /etc/php/8.2/fpm/pool.d/aukrug.conf << 'EOF' || cat > /etc/php/*/fpm/pool.d/aukrug.conf << 'EOF'
[aukrug]
user = www-data
group = www-data
listen = /run/php/php8.2-fpm-aukrug.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
pm = dynamic
pm.max_children = 20
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
EOF

# Create dashboard directory and basic files
log_info "Setting up dashboard directory..."
mkdir -p /opt/aukrug/dashboard

# Create PM2 ecosystem file
log_info "Creating PM2 ecosystem configuration..."
cat > /opt/aukrug/dashboard/ecosystem.config.js << 'EOF'
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
EOF

# Create basic welcome page
log_info "Creating welcome page..."
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aukrug Municipality Platform</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 40px; }
        .logo h1 { color: #2c5aa0; margin: 0; }
        .services { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; }
        .service { padding: 30px; background: #f8f9fa; border-radius: 8px; text-align: center; }
        .service h3 { color: #333; margin-top: 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .btn:hover { background: #0056b3; }
        .status { margin-top: 30px; padding: 15px; background: #d4edda; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🌿 Aukrug Municipality</h1>
            <p>Willkommen auf der offiziellen Plattform der Gemeinde ${VILLAGE}</p>
        </div>
        
        <div class="services">
            <div class="service">
                <h3>📝 Content Management</h3>
                <p>WordPress CMS für die Verwaltung von Inhalten, Bekanntmachungen und Events.</p>
                <a href="/cms/" class="btn">Zum CMS</a>
            </div>
            
            <div class="service">
                <h3>📊 Admin Dashboard</h3>
                <p>Next.js Dashboard für erweiterte Verwaltungsfunktionen und Berichte.</p>
                <a href="/dashboard/" class="btn">Zum Dashboard</a>
            </div>
        </div>
        
        <div class="status">
            <strong>✅ System Status:</strong> Alle Services sind betriebsbereit<br>
            <small>Provisioned on $(date)</small>
        </div>
    </div>
</body>
</html>
EOF

# Save configuration for later use
log_info "Saving configuration..."
cat > /opt/aukrug/config.env << EOF
VILLAGE=${VILLAGE}
DOMAIN=${DOMAIN}
WP_DB_NAME=${WP_DB_NAME}
WP_DB_USER=${WP_DB_USER}
WP_DB_PASS=${WP_DB_PASS}
WP_ADMIN_USER=${WP_ADMIN_USER}
WP_ADMIN_PASS=${WP_ADMIN_PASS}
WP_ADMIN_EMAIL=${WP_ADMIN_EMAIL}
EOF

chmod 600 /opt/aukrug/config.env

# Start and enable all services
log_info "Starting all services..."
systemctl restart mariadb
systemctl restart php8.2-fpm || systemctl restart php-fpm
systemctl restart nginx

# Install WordPress CLI for easier management
log_info "Installing WordPress CLI..."
curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/v2.9.0/bin/wp
chmod +x wp
mv wp /usr/local/bin/

# Complete WordPress installation via CLI
log_info "Completing WordPress installation..."
cd /opt/aukrug/wordpress
sudo -u www-data wp core install \
    --url="http://${DOMAIN}/cms" \
    --title="${VILLAGE} Municipality" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASS}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email || log_warn "WordPress installation may need manual completion"

# Create basic systemd service for PM2
log_info "Setting up PM2 systemd service..."
systemctl enable pm2-root

# Final status check
log_info "Performing final status check..."
echo "=== Service Status ==="
systemctl is-active nginx mariadb php8.2-fpm || systemctl is-active nginx mariadb php-fpm

echo "=== Nginx Test ==="
nginx -t

echo "=== Port Check ==="
netstat -tlnp | grep -E ':(80|3306|3000)\s'

log_success "LXC provisioning completed successfully!"
echo ""
echo "=== Access Information ==="
echo "🌐 Website: http://${DOMAIN}/"
echo "📝 WordPress: http://${DOMAIN}/cms/"
echo "📊 Dashboard: http://${DOMAIN}/dashboard/ (after deployment)"
echo ""
echo "=== WordPress Admin ==="
echo "👤 Username: ${WP_ADMIN_USER}"
echo "🔑 Password: ${WP_ADMIN_PASS}"
echo "📧 Email: ${WP_ADMIN_EMAIL}"
echo ""
echo "=== Next Steps ==="
echo "1. Deploy the dashboard: make deploy-remote HOST=${DOMAIN}"
echo "2. Configure domain DNS to point to this server"
echo "3. Setup SSL certificates if needed"
echo "4. Install required WordPress plugins"
echo ""
echo "✅ Provisioning complete! System ready for deployment."