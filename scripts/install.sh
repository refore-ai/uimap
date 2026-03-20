#!/usr/bin/env bash
set -euo pipefail

# uimap CLI Installation Script (China users only)
# Usage: curl -fsSL <CDN_URL>/install.sh | bash
#   or:  wget -qO- <CDN_URL>/install.sh | bash

# Configuration
VERSION="${VERSION:-latest}"
UIMAP_HOME="${UIMAP_HOME:-$HOME/.uimap}"
NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmmirror.com}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check Node.js version (requires >= 20)
check_nodejs() {
  if ! command_exists node; then
    return 1
  fi
  
  local node_version
  node_version=$(node --version | sed 's/v//')
  local major_version
  major_version=$(echo "$node_version" | cut -d. -f1)
  
  if [ "$major_version" -ge 20 ]; then
    return 0
  else
    log_warn "Node.js version $node_version is too old, requires >= 20.0.0"
    return 1
  fi
}

# Save region config (always China)
save_region_config() {
  log_info "Setting default region: China"
  mkdir -p "$UIMAP_HOME"
  echo "China" > "$UIMAP_HOME/.region"
}

# Install uimap via npm
install_uimap() {
  log_info "Installing uimap..."
  log_info "Version: $VERSION"
  log_info "NPM registry: $NPM_REGISTRY"
  
  # Check Node.js
  if ! check_nodejs; then
    log_error "Node.js 20+ is required to run uimap"
    log_info "Please visit https://nodejs.org/ to download and install"
    exit 1
  fi
  
  log_success "Node.js version meets requirements ($(node --version))"
  
  # Check npm
  if ! command_exists npm; then
    log_error "npm is required but not found"
    exit 1
  fi
  
  # Install uimap globally with specified registry
  local npm_package="@refore-ai/uimap"
  if [ "$VERSION" != "latest" ]; then
    npm_package="@refore-ai/uimap@$VERSION"
  fi
  
  log_info "Running: npm install -g $npm_package"
  if ! NPM_CONFIG_REGISTRY="$NPM_REGISTRY" npm install -g "$npm_package"; then
    log_error "Failed to install uimap via npm"
    exit 1
  fi
  
  log_success "uimap installed successfully!"
  
  # Verify installation
  if ! command_exists uimap; then
    log_warn "uimap command not found in PATH"
    log_info "You may need to add npm global bin directory to your PATH"
    log_info "Run: export PATH=\"$(npm prefix -g)/bin:\$PATH\""
  else
    log_info "Verifying installation..."
    uimap --version 2>/dev/null || uimap -V 2>/dev/null || true
    log_success "uimap is working properly!"
  fi
  
  # Save default region (China)
  save_region_config
  
  echo ""
  log_info "Use 'uimap --help' to see available commands"
  
  # Add skill to agent
  log_info "Adding uimap skill to agent..."
  if uimap add-skill; then
    # Verify skill was actually added
    if [ -d "$HOME/.agents/skills/uimap" ]; then
      log_success "uimap skill added successfully to ~/.agents/skills/uimap"
    else
      log_warn "Skill command succeeded but directory not found at ~/.agents/skills/uimap"
    fi
  else
    log_warn "Failed to add skill automatically, run 'uimap add-skill' manually"
  fi
}

# Main function
main() {
  # Parse arguments
  if [[ $# -gt 0 ]]; then
    case $1 in
      --help|-h)
        cat << EOF
uimap Installation Script (China)

Usage:
  curl -fsSL <CDN_URL>/install.sh | bash

Environment Variables:
  VERSION       Specify version (default: latest)
  UIMAP_HOME    Data directory (default: ~/.uimap)
  NPM_REGISTRY  npm registry URL (default: https://registry.npmmirror.com)

Examples:
  NPM_REGISTRY=https://registry.npmjs.org curl -fsSL <CDN_URL>/install.sh | bash
EOF
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
  fi
  
  install_uimap
}

main "$@"
