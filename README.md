# Aukrug LXC Dashboard Template 🏘️

Complete reusable LXC template for hosting **WordPress CMS** and **Next.js Dashboard** in a single container, designed for German municipalities using the **Aukrug Community Platform**.

## 🎯 Features

- **Dual Application Hosting**: WordPress CMS + Next.js Dashboard in one container
- **Domain-Based Routing**: `/cms/` for WordPress, `/dashboard/` for administrative interface  
- **Production-Ready**: nginx reverse proxy, PM2 process management, systemd integration
- **Velzon UI**: Professional admin dashboard using Bootstrap 5 + Velzon theme components
- **Full LAMP+Node Stack**: MariaDB, PHP 8.2-FPM, Node.js 20 LTS, nginx
- **Security Hardened**: SSL-ready, security headers, file access restrictions
- **Template-Based**: Easy replication for multiple villages/municipalities

## 🚀 Quick Start

### Prerequisites

- LXC container with Debian 12 (bookworm)
- Root SSH access to target container  
- Domain pointed to container IP

### One-Command Deployment

```bash
git clone https://github.com/gordonmeyrath/aukrug-lxc-dashboard.git
cd aukrug-lxc-dashboard
make setup-complete HOST=10.0.1.12
```

This will:

1. ✅ Install complete LAMP+Node.js stack
2. ✅ Configure nginx with dual routing
3. ✅ Deploy and start Next.js dashboard
4. ✅ Set up WordPress with database  
5. ✅ Configure PM2 with systemd integration

## 🏗️ Architecture

```
https://village.example.com/
├── / → 302 redirect to /cms/
├── /cms/ → WordPress CMS (PHP 8.2-FPM)
└── /dashboard/ → Next.js Dashboard (Node.js + PM2)
```

### Infrastructure Stack
- **Web Server**: nginx (reverse proxy + static files)
- **PHP**: PHP 8.2-FPM with required extensions
- **Database**: MariaDB 10.11+ with security hardening
- **Node.js**: v20 LTS with pnpm package manager
- **Process Manager**: PM2 with cluster mode + systemd
- **SSL**: Let's Encrypt ready (certbot installed)

### Application Stack  
- **Frontend**: Next.js 14 with TypeScript + Standalone output
- **UI Framework**: Bootstrap 5 + Velzon admin theme
- **WordPress**: Latest with Aukrug plugin integration
- **API Communication**: REST endpoints for data exchange

## 🎨 Dashboard Features

Professional admin interface using Bootstrap 5 + Velzon theme:

- **Community Management**: Verwaltung von Mitgliedern und Gruppen
- **Mängelmelder**: Reports-System mit Status-Management
- **Dashboard Overview**: Statistics cards and quick actions
- **Responsive Design**: Mobile-first with sidebar navigation
- **Data Tables**: Advanced filtering and sorting
- **Form Validation**: Real-time validation with TypeScript

## 📁 Project Structure

```
├── src/                          # Next.js application source
│   ├── app/                      # App Router pages
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── community/           # Community management
│   │   └── reports/             # Mängelmelder reports
│   ├── components/              # Reusable UI components
│   │   ├── Sidebar.tsx          # Main navigation (Velzon)
│   │   ├── Header.tsx           # Top header with user menu
│   │   └── BootstrapInit.tsx    # Bootstrap JS initialization
│   └── lib/                     # Utilities and API clients
│       └── api-client.ts        # WordPress REST API client
├── tool/remote/                 # Remote deployment automation
│   ├── remote_provision.sh      # Complete LXC provisioning
│   └── remote_deploy.sh         # Dashboard deployment
├── package.json                 # Dependencies and scripts
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── Makefile                    # Build and deployment automation
```

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

### Environment Configuration
Create `.env.local`:
```bash
WP_BASE_URL=http://localhost/cms
DOMAIN=village.example.com
TENANT_NAME=village
VILLAGE_NAME=Village Name
```

## 🚀 Deployment

### Remote Provisioning
```bash
# Full infrastructure setup
make provision-remote HOST=<target-ip>

# Deploy dashboard only
make deploy-remote HOST=<target-ip>

# Complete setup (provision + deploy)
make setup-complete HOST=<target-ip>
```

## 🌍 Template Customization

### For New Villages/Municipalities
1. **Update Configuration**:
   ```bash
   # Environment variables
   TENANT_NAME=newvillage
   VILLAGE_NAME="New Village Name"  
   DOMAIN=newvillage.example.com
   ```

2. **Deploy New Instance**:
   ```bash
   make setup-complete HOST=<new-container-ip>
   ```

### Multi-Tenant Support
- Each village gets dedicated container/domain
- Shared codebase with environment-based configuration
- Independent databases and file storage

## 🔒 Security Features

### Nginx Security
- **Security Headers**: XSS, CSRF, content type protection
- **File Access Restrictions**: Hidden files, config files blocked
- **Static Asset Caching**: Performance optimization with security

### MariaDB Security  
- **User Isolation**: Dedicated database user with minimal privileges
- **Access Control**: localhost-only database access
- **Password Policy**: Strong random passwords

### Application Security
- **Input Validation**: TypeScript + form validation
- **API Security**: WordPress REST API integration with proper authentication
- **CSRF Protection**: Built-in Next.js CSRF protection

## 📚 API Documentation

### WordPress REST API Integration
```typescript
// API Client usage
import { useApi } from '@/lib/api-client';

const api = useApi();

// Fetch community data
const users = await api.get('/wp-json/aukrug/v1/users');
const reports = await api.get('/wp-json/aukrug/v1/reports');

// Update report status
await api.post('/wp-json/aukrug/v1/reports/123/status', { status: 'resolved' });
```

### Available Endpoints
- `GET /wp-json/aukrug/v1/users` - Community users
- `GET /wp-json/aukrug/v1/groups` - User groups
- `GET /wp-json/aukrug/v1/reports` - Mängelmelder reports
- `POST /wp-json/aukrug/v1/reports/{id}/status` - Update report
- `GET /wp-json/aukrug/v1/events` - Community events
- `GET /wp-json/aukrug/v1/places` - Places and locations

## 🔧 System Management

### Service Management
```bash
# Check status
make status HOST=<target-ip>

# View logs
make logs HOST=<target-ip>

# Restart services
make restart HOST=<target-ip>
```

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/village-customization`
3. Make changes following TypeScript + Velzon patterns
4. Test deployment: `make setup-complete HOST=test-container`
5. Submit pull request with documentation

### Code Standards
- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Styling**: Bootstrap 5 classes only (no custom CSS)
- **API**: RESTful endpoints with proper error handling
- **Documentation**: JSDoc comments for complex functions

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For technical support:
- **Issues**: GitHub Issues for bugs and feature requests
- **Documentation**: This README and inline code comments

---

**Aukrug LXC Dashboard Template** - Production-ready municipality platform hosting solution 🏘️