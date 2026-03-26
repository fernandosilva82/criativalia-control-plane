#!/usr/bin/env bash
#
# Criativalia Control Plane - Setup Script
# Created by: BASH_ARCHITECT
# Standards: safe bash, colored output, dependency checks
#

set -euo pipefail
IFS=$'\n\t'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_step() { echo -e "\n${CYAN}▶ $*${NC}"; }

# Check if command exists
check_command() {
    command -v "$1" > /dev/null 2>&1
}

# Main setup function
main() {
    log_step "Criativalia Control Plane - Setup"
    log_info "Version: 2.0.0"
    log_info "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Check dependencies
    log_step "Checking Dependencies"
    
    local deps=("git" "curl" "node")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if check_command "$dep"; then
            log_success "$dep found"
        else
            log_error "$dep not found"
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install: ${missing_deps[*]}"
        exit 1
    fi
    
    # Check Node version
    log_step "Checking Node.js Version"
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        log_success "Node.js $(node --version)"
    else
        log_warn "Node.js $(node --version) - recommend v18+"
    fi
    
    # Setup directories
    log_step "Setting up Directories"
    
    mkdir -p "{project_dir}/logs"
    mkdir -p "{project_dir}/backups"
    log_success "Directories created"
    
    # Check GitHub access
    log_step "Checking GitHub Access"
    
    if [ -z "${GH_TOKEN:-}" ]; then
        log_warn "GH_TOKEN not set - some features will be limited"
        log_info "Set with: export GH_TOKEN='your_token'"
    else
        log_success "GH_TOKEN configured"
    fi
    
    # Check Vercel access
    log_step "Checking Vercel Access"
    
    if [ -z "${VERCEL_TOKEN:-}" ]; then
        log_warn "VERCEL_TOKEN not set - deploy features disabled"
        log_info "Set with: export VERCEL_TOKEN='your_token'"
    else
        log_success "VERCEL_TOKEN configured"
    fi
    
    # Create env template
    log_step "Creating Environment Template"
    
    cat > "{project_dir}/.env.example" << 'EOF'
# Criativalia Control Plane - Environment Variables

# GitHub
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Vercel
VERCEL_TOKEN=vcp_xxxxxxxxxxxxxxxx

# Shopify
SHOPIFY_SHOP=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxx

# Optional: Notifications
TELEGRAM_BOT_TOKEN=xxxxxxxx:xxxxxxxx
TELEGRAM_CHAT_ID=xxxxxxxx
EOF
    
    log_success ".env.example created"
    
    # Summary
    log_step "Setup Complete"
    log_info "Project directory: {project_dir}"
    log_info "Logs directory: {project_dir}/logs"
    log_info "Backups directory: {project_dir}/backups"
    
    echo ""
    log_success "✅ Control Plane ready!"
    echo ""
    log_info "Next steps:"
    log_info "  1. Copy .env.example to .env and fill in your tokens"
    log_info "  2. Run: ./scripts/deploy.sh"
    log_info "  3. Access: https://yourusername.github.io/criativalia-control-plane/"
}

# Help
if [ "${1:-}" == "--help" ] || [ "${1:-}" == "-h" ]; then
    echo "Criativalia Control Plane - Setup Script"
    echo ""
    echo "Usage: ./setup.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GH_TOKEN      GitHub Personal Access Token"
    echo "  VERCEL_TOKEN  Vercel API Token"
    echo ""
    exit 0
fi

# Run main
main "$@"
