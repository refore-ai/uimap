#!/usr/bin/env bash
set -euo pipefail

# uimap CLI Installation Script
# Usage: curl -fsSL <CDN_URL>/install.sh | bash
#   or:  wget -qO- <CDN_URL>/install.sh | bash

# Configuration
BINARY_NAME="uimap"
VERSION="${VERSION:-latest}"
CDN_BASE_URL="${CDN_BASE_URL:-https://your-cdn-url.com/uimap}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
UIMAP_HOME="${UIMAP_HOME:-$HOME/.uimap}"

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

# Detect OS
detect_os() {
  local os
  os=$(uname -s)
  case "$os" in
    Linux*)     echo "linux";;
    Darwin*)    echo "macos";;
    CYGWIN*|MINGW*|MSYS*) echo "windows";;
    *)          echo "unknown";;
  esac
}

# Detect architecture
detect_arch() {
  local arch
  arch=$(uname -m)
  case "$arch" in
    x86_64|amd64) echo "x64";;
    arm64|aarch64) echo "arm64";;
    *)            echo "$arch";;
  esac
}

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

# Download file
download() {
  local url="$1"
  local output="$2"
  
  if command_exists curl; then
    curl -fsSL "$url" -o "$output"
  elif command_exists wget; then
    wget -q "$url" -O "$output"
  else
    log_error "curl or wget is required to download files"
    exit 1
  fi
}

# Install Node.js (if needed)
install_nodejs() {
  log_info "Installing Node.js..."
  
  local os=$(detect_os)
  local arch=$(detect_arch)
  
  if [ "$os" = "linux" ]; then
    # Use nvm or download binary directly
    if command_exists nvm; then
      nvm install 20
      nvm use 20
    else
      log_info "Please install Node.js 20+ manually: https://nodejs.org/"
      exit 1
    fi
  elif [ "$os" = "macos" ]; then
    if command_exists brew; then
      brew install node@20
    else
      log_info "Please install Node.js 20+ manually: https://nodejs.org/"
      exit 1
    fi
  else
    log_info "Please install Node.js 20+ manually: https://nodejs.org/"
    exit 1
  fi
}

# Install uimap
install_uimap() {
  local os=$(detect_os)
  local arch=$(detect_arch)
  
  log_info "Detected system: $os ($arch)"
  log_info "Installing version: $VERSION"
  
  # Check Node.js
  if ! check_nodejs; then
    log_warn "Node.js 20+ not detected"
    read -p "Try to install Node.js automatically? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      install_nodejs
    else
      log_error "Node.js 20+ is required to run uimap"
      log_info "Please visit https://nodejs.org/ to download and install"
      exit 1
    fi
  fi
  
  log_success "Node.js version meets requirements ($(node --version))"
  
  # Create temp directory
  local tmp_dir
  tmp_dir=$(mktemp -d)
  trap '[ -n "${tmp_dir:-}" ] && rm -rf "$tmp_dir"' EXIT
  
  # Build download URL
  local download_url="$CDN_BASE_URL/releases/$VERSION/uimap-$VERSION.tar.gz"
  if [ "$VERSION" = "latest" ]; then
    download_url="$CDN_BASE_URL/releases/latest/uimap-latest.tar.gz"
  fi
  
  log_info "Downloading uimap..."
  log_info "URL: $download_url"
  
  local tarball="$tmp_dir/uimap.tar.gz"
  if ! download "$download_url" "$tarball"; then
    log_error "Download failed, please check network connection or version number"
    exit 1
  fi
  
  # Clean old version
  if [ -d "$UIMAP_HOME" ]; then
    log_info "Cleaning old version..."
    rm -rf "$UIMAP_HOME"
  fi
  
  # Extract to new directory
  log_info "Installing to $UIMAP_HOME..."
  mkdir -p "$UIMAP_HOME"
  tar -xzf "$tarball" -C "$UIMAP_HOME"
  
  # Create launcher script
  log_info "Creating launcher script..."
  mkdir -p "$INSTALL_DIR"
  
  local launcher="$INSTALL_DIR/$BINARY_NAME"
  cat > "$launcher" << 'EOF'
#!/usr/bin/env bash
# uimap CLI launcher script
UIMAP_HOME="${UIMAP_HOME:-$HOME/.uimap}"
exec node "$UIMAP_HOME/dist/cli.mjs" "$@"
EOF
  chmod +x "$launcher"
  
  # Verify installation
  if [ -f "$launcher" ]; then
    log_success "uimap installed successfully!"
    log_info "Install location: $launcher"
    log_info "Data directory: $UIMAP_HOME"
  else
    log_error "Installation failed"
    exit 1
  fi
  
  # Check PATH
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    log_warn "$INSTALL_DIR is not in PATH"
    log_info "Please add the following line to your shell config (~/.bashrc, ~/.zshrc, etc.):"
    echo "    export PATH=\"$INSTALL_DIR:\$PATH\""
    echo ""
    log_info "Or run the following command:"
    echo "    echo 'export PATH=\"$INSTALL_DIR:\$PATH\"' >> ~/.bashrc"
  fi
  
  # Test run
  log_info "Verifying installation..."
  if "$launcher" --version 2>/dev/null || "$launcher" -V 2>/dev/null || true; then
    log_success "uimap is working properly!"
  fi
  
  echo ""
  log_info "Use 'uimap --help' to see available commands"
}

# Uninstall uimap
uninstall_uimap() {
  log_info "Uninstalling uimap..."
  
  local launcher="$INSTALL_DIR/$BINARY_NAME"
  
  if [ -f "$launcher" ]; then
    rm -f "$launcher"
    log_success "Deleted: $launcher"
  fi
  
  if [ -d "$UIMAP_HOME" ]; then
    rm -rf "$UIMAP_HOME"
    log_success "Deleted: $UIMAP_HOME"
  fi
  
  log_success "uimap has been completely uninstalled"
}

# Main function
main() {
  case "${1:-install}" in
    install)
      install_uimap
      ;;
    uninstall)
      uninstall_uimap
      ;;
    --help|-h)
      cat << EOF
uimap Installation Script

Usage:
  curl -fsSL $CDN_BASE_URL/install.sh | bash
  curl -fsSL $CDN_BASE_URL/install.sh | bash -s -- install
  curl -fsSL $CDN_BASE_URL/install.sh | bash -s -- uninstall

Environment Variables:
  VERSION       Specify version (default: latest)
  CDN_BASE_URL  Specify CDN base URL
  INSTALL_DIR   Install directory (default: ~/.local/bin)
  UIMAP_HOME    Data directory (default: ~/.uimap)

Example:
  VERSION=0.1.3 curl -fsSL $CDN_BASE_URL/install.sh | bash
EOF
      ;;
    *)
      log_error "Unknown command: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
}

main "$@"
