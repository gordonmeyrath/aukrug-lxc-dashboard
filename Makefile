# Aukrug Dashboard Makefile
# Usage: make <target> HOST=<ip-address>

HOST ?= 10.0.1.12
VILLAGE ?= appmin
DOMAIN ?= appmin.miocitynet.com

.PHONY: help build dev install clean provision-remote deploy-remote setup-complete test

help: ## Show this help
	@echo "Aukrug LXC Dashboard Makefile"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Build the dashboard for production
	npm run build

dev: ## Start development server
	npm run dev

clean: ## Clean build artifacts
	rm -rf .next node_modules

test: ## Run tests
	npm test

provision-remote: ## Provision remote LXC container
	@echo "=== Remote LXC provisioning ==="
	ssh root@$(HOST) "bash -s" < tool/remote/remote_provision.sh

deploy-remote: ## Deploy dashboard to remote server
	@echo "=== Remote dashboard deployment ==="
	npm run build
	rsync -avz --delete .next/standalone/ root@$(HOST):/opt/aukrug/dashboard/
	rsync -avz .next/static/ root@$(HOST):/opt/aukrug/dashboard/.next/static/
	ssh root@$(HOST) "cd /opt/aukrug/dashboard && pm2 reload ecosystem.config.js"

setup-complete: provision-remote deploy-remote ## Complete LXC setup (provision + deploy)
	@echo "=== Complete LXC setup finished ==="
	@echo "✅ WordPress CMS: http://$(HOST)/cms/"
	@echo "✅ Next.js Dashboard: http://$(HOST)/dashboard/"
	@echo "✅ PM2 Status: ssh root@$(HOST) pm2 status"
	@echo ""
	@echo "🔧 Management Commands:"
	@echo "   PM2 logs: ssh root@$(HOST) 'pm2 logs'"
	@echo "   PM2 restart: ssh root@$(HOST) 'pm2 restart aukrug-dashboard'"
	@echo "   Nginx config: ssh root@$(HOST) 'nginx -t && systemctl reload nginx'"
	@echo ""
	@echo "📊 System Status:"
	@ssh root@$(HOST) "pm2 status && echo '' && systemctl status nginx --no-pager -l"

status: ## Check remote services status
	@echo "=== Remote Services Status ==="
	@ssh root@$(HOST) "pm2 status && echo '' && systemctl status nginx --no-pager -l && echo '' && systemctl status php8.2-fpm --no-pager -l"

logs: ## Show remote application logs
	@echo "=== Application Logs ==="
	@ssh root@$(HOST) "pm2 logs aukrug-dashboard --lines 50"

restart: ## Restart remote services
	@echo "=== Restarting Services ==="
	@ssh root@$(HOST) "pm2 restart aukrug-dashboard && systemctl reload nginx"