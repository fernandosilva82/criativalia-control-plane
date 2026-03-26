#!/usr/bin/env bash
#
# Criativalia Control Plane - Deploy Script
# Created by: DEPLOY_ENGINEER
# Standards: safe bash, colored output, verification at each step
#

set -euo pipefail
IFS=$'\n\t'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_step() { echo -e "\n${CYAN}▶ $*${NC}"; }
log_verification() { echo -e "  ${GREEN}✓${NC} $*"; }

# Configuration
REPO_NAME="criativalia-control-plane"
GITHUB_PAGES_URL="https://${GH_USER:-fernandosilva82}.github.io/${REPO_NAME}/"

# Track verification
VERIFICATION_PASSED=0
VERIFICATION_FAILED=0

# Verify a check
verify() {
    local description="$1"
    local command="$2"
    
    if eval "$command" > /dev/null 2>&1; then
        log_verification "$description"
        ((VERIFICATION_PASSED++))
        return 0
    else
        echo -e "  ${RED}✗${NC} $description"
        ((VERIFICATION_FAILED++))
        return 1
    fi
}

# Main deploy function
main() {
    log_step "Criativalia Control Plane - Deploy"
    log_info "Target: GitHub Pages"
    log_info "URL: $GITHUB_PAGES_URL"
    
    # Pre-flight checks
    log_step "Pre-flight Checks"
    
    verify "Git is installed" "command -v git"
    verify "GitHub token is set" "[ -n \"${GH_TOKEN:-}\" ]"
    verify "Repository exists" "curl -s -o /dev/null -w '%{http_code}' 'https://api.github.com/repos/${GH_USER:-fernandosilva82}/${REPO_NAME}' | grep -q '200'"
    
    if [ $VERIFICATION_FAILED -gt 0 ]; then
        log_error "Pre-flight checks failed. Fix issues before deploying."
        exit 1
    fi
    
    # Build validation
    log_step "Build Validation"
    
    verify "index.html exists" "[ -f index.html ]"
    verify "index.html not empty" "[ -s index.html ]"
    verify "HTML is valid" "grep -q '</html>' index.html"
    
    if [ $VERIFICATION_FAILED -gt 0 ]; then
        log_error "Build validation failed."
        exit 1
    fi
    
    # Deploy to GitHub
    log_step "Deploying to GitHub Pages"
    
    log_info "Uploading files..."
    
    # Get file content
    CONTENT=$(base64 -w 0 index.html)
    
    # Get current SHA
    SHA=$(curl -s "https://api.github.com/repos/${GH_USER:-fernandosilva82}/${REPO_NAME}/contents/v2/index.html" \
        -H "Authorization: Bearer ${GH_TOKEN}" | grep '"sha"' | head -1 | cut -d'"' -f4)
    
    # Upload
    RESPONSE=$(curl -s -X PUT "https://api.github.com/repos/${GH_USER:-fernandosilva82}/${REPO_NAME}/contents/v2/index.html" \
        -H "Authorization: Bearer ${GH_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"Deploy v$(date +%Y%m%d-%H%M%S)\",\"content\":\"${CONTENT}\",\"sha\":\"${SHA}\"}")
    
    if echo "$RESPONSE" | grep -q '"commit"'; then
        log_success "Files uploaded successfully"
    else
        log_error "Upload failed"
        log_info "Response: $(echo "$RESPONSE" | head -c 200)"
        exit 1
    fi
    
    # Wait for propagation
    log_step "Waiting for GitHub Pages Propagation"
    log_info "This may take 30-60 seconds..."
    
    local attempts=0
    local max_attempts=10
    
    while [ $attempts -lt $max_attempts ]; do
        sleep 3
        attempts=$((attempts + 1))
        
        if curl -s -o /dev/null -w "%{http_code}" "$GITHUB_PAGES_URL" | grep -q "200"; then
            log_success "Site is live!"
            break
        fi
        
        echo -n "."
    done
    
    echo ""
    
    # Post-deploy verification
    log_step "Post-deploy Verification"
    
    verify "Site is accessible" "curl -s -o /dev/null -w '%{http_code}' '$GITHUB_PAGES_URL' | grep -q '200'"
    verify "HTML loads correctly" "curl -s '$GITHUB_PAGES_URL' | grep -q 'Criativalia Control Plane'"
    verify "No 404 errors" "! curl -s '$GITHUB_PAGES_URL' | grep -qi 'not found'"
    
    # Summary
    log_step "Deploy Summary"
    log_success "Passed: $VERIFICATION_PASSED"
    
    if [ $VERIFICATION_FAILED -gt 0 ]; then
        log_warn "Warnings: $VERIFICATION_FAILED"
    fi
    
    echo ""
    log_success "✅ Deploy Complete!"
    echo ""
    log_info "URL: $GITHUB_PAGES_URL"
    log_info "Time: $(date '+%Y-%m-%d %H:%M:%S')"
}

# Rollback function
rollback() {
    log_warn "Rollback requested"
    log_info "To rollback, restore from backup or revert Git commit"
    log_info "Manual rollback steps:"
    log_info "  1. git log --oneline -5"
    log_info "  2. git revert HEAD"
    log_info "  3. Push to trigger redeploy"
}

# Help
if [ "${1:-}" == "--help" ] || [ "${1:-}" == "-h" ]; then
    echo "Criativalia Control Plane - Deploy Script"
    echo ""
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --rollback     Show rollback instructions"
    echo ""
    echo "Environment Variables:"
    echo "  GH_TOKEN       GitHub Personal Access Token (required)"
    echo "  GH_USER        GitHub username (default: fernandosilva82)"
    echo ""
    exit 0
fi

if [ "${1:-}" == "--rollback" ]; then
    rollback
    exit 0
fi

# Run main
main "$@"
