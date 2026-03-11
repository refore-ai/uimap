#!/usr/bin/env bash
set -euo pipefail

# uimap CDN Release Script
# Usage: ./scripts/release-cdn.sh [version]
# Example: ./scripts/release-cdn.sh 0.1.4

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$PROJECT_ROOT/dist"
SKILLS_DIR="$PROJECT_ROOT/skills"
UIMAP_SKILL_DIR="$SKILLS_DIR/uimap"
RELEASES_DIR="$PROJECT_ROOT/releases"
CDN_CONFIG_FILE="$PROJECT_ROOT/.cdn-config"

# Default CDN config (overridden by .cdn-config file)
CDN_BASE_URL="${CDN_BASE_URL:-https://your-cdn-url.com/uimap}"
CDN_UPLOAD_URL="${CDN_UPLOAD_URL:-}"  # Upload URL, e.g., "cos://static/uimap/"
CDN_UPLOAD_CMD="${CDN_UPLOAD_CMD:-}"  # e.g., "coscli cp -r"

# Load local config
if [ -f "$CDN_CONFIG_FILE" ]; then
  # shellcheck source=/dev/null
  source "$CDN_CONFIG_FILE"
fi

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get version
get_version() {
  local version="${1:-}"
  if [ -z "$version" ]; then
    # Read from package.json
    version=$(node -p "require('$PROJECT_ROOT/package.json').version" 2>/dev/null || echo "")
  fi
  echo "$version"
}

# Check dependencies
check_dependencies() {
  if ! command -v node >/dev/null 2>&1; then
    log_error "Node.js is required"
    exit 1
  fi
  
  if ! command -v pnpm >/dev/null 2>&1 && ! command -v npm >/dev/null 2>&1; then
    log_error "pnpm or npm is required"
    exit 1
  fi
}

# Build project
build_project() {
  log_info "Building project..."
  cd "$PROJECT_ROOT"
  
  # Clean old build
  rm -rf "$DIST_DIR"
  
  # Run build
  if command -v pnpm >/dev/null 2>&1; then
    pnpm run build
  else
    npm run build
  fi
  
  if [ ! -f "$DIST_DIR/cli.mjs" ]; then
    log_error "Build failed: dist/cli.mjs does not exist"
    exit 1
  fi
  
  log_success "Build completed"
}

# Create uimap skill zip
create_skill_zip() {
  log_info "Creating uimap skill zip..."
  
  local skill_zip="$RELEASES_DIR/uimap.zip"
  
  # Create zip from skills/uimap directory
  cd "$SKILLS_DIR"
  zip -r "$skill_zip" uimap/
  
  log_success "Skill zip created: $skill_zip"
}

# Create release package
create_package() {
  local version="$1"
  local release_dir="$RELEASES_DIR/$version"
  local tarball="$RELEASES_DIR/uimap-$version.tar.gz"
  
  log_info "Creating release package v$version..."
  
  # Create release directory
  rm -rf "$release_dir"
  mkdir -p "$release_dir"
  
  # Copy required files
  cp -r "$DIST_DIR" "$release_dir/"
  cp -r "$SKILLS_DIR" "$release_dir/"
  
  # Copy metadata
  cp "$PROJECT_ROOT/package.json" "$release_dir/"
  cp "$PROJECT_ROOT/README.md" "$release_dir/" 2>/dev/null || true
  cp "$PROJECT_ROOT/LICENSE" "$release_dir/" 2>/dev/null || true
  
  # Create version file
  echo "{\"version\": \"$version\", \"date\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > "$release_dir/version.json"
  
  # Package
  cd "$RELEASES_DIR"
  tar -czf "uimap-$version.tar.gz" -C "$release_dir" .
  
  # Also create latest version
  cp "uimap-$version.tar.gz" "uimap-latest.tar.gz"
  
  log_success "Release package created: $tarball"
}

# Generate install script
generate_install_script() {
  local install_script="$RELEASES_DIR/install.sh"
  
  log_info "Generating install script..."
  
  # Copy and update CDN URL in install script
  sed "s|CDN_BASE_URL=.*|CDN_BASE_URL=\"$CDN_BASE_URL\"|" "$SCRIPT_DIR/install.sh" > "$install_script"
  chmod +x "$install_script"
  
  log_success "Install script generated: $install_script"
}

# Generate install-cn script
generate_install_cn_script() {
  local install_cn_script="$RELEASES_DIR/install-cn.sh"
  
  log_info "Generating install-cn script..."
  
  # Copy install-cn.sh and update CDN URL
  sed "s|CDN_URL=.*|CDN_URL=\"$CDN_BASE_URL\"|" "$SCRIPT_DIR/install-cn.sh" > "$install_cn_script"
  chmod +x "$install_cn_script"
  
  log_success "Install-cn script generated: $install_cn_script"
}

# Show upload instructions
show_upload_instructions() {
  local version="$1"
  
  echo ""
  log_info "=== Release files are ready ==="
  echo ""
  echo "Files location: $RELEASES_DIR/"
  echo ""
  echo "Files to upload to CDN:"
  echo "  1. $RELEASES_DIR/install.sh -> $CDN_BASE_URL/install.sh"
  echo "  2. $RELEASES_DIR/install-cn.sh -> $CDN_BASE_URL/install-cn.sh"
  echo "  3. $RELEASES_DIR/uimap-$version.tar.gz -> $CDN_BASE_URL/releases/$version/uimap-$version.tar.gz"
  echo "  4. $RELEASES_DIR/uimap-latest.tar.gz -> $CDN_BASE_URL/releases/latest/uimap-latest.tar.gz"
  echo "  5. $RELEASES_DIR/uimap.zip -> $CDN_BASE_URL/skills/uimap.zip"
  echo ""
  
  # Show upload commands if configured
  if [ -n "$CDN_UPLOAD_CMD" ]; then
    log_info "Using configured upload command:"
    echo ""
    echo "# Upload install script"
    echo "$CDN_UPLOAD_CMD \"$RELEASES_DIR/install.sh\" \"${CDN_UPLOAD_URL%/}/install.sh\""
    echo ""
    echo "# Upload install-cn script"
    echo "$CDN_UPLOAD_CMD \"$RELEASES_DIR/install-cn.sh\" \"${CDN_UPLOAD_URL%/}/install-cn.sh\""
    echo ""
    echo "# Upload version package"
    echo "$CDN_UPLOAD_CMD \"$RELEASES_DIR/uimap-$version.tar.gz\" \"${CDN_UPLOAD_URL%/}/releases/$version/uimap-$version.tar.gz\""
    echo ""
    echo "# Upload latest package"
    echo "$CDN_UPLOAD_CMD \"$RELEASES_DIR/uimap-latest.tar.gz\" \"${CDN_UPLOAD_URL%/}/releases/latest/uimap-latest.tar.gz\""
    echo ""
    echo "# Upload skill zip"
    echo "$CDN_UPLOAD_CMD \"$RELEASES_DIR/uimap.zip\" \"${CDN_UPLOAD_URL%/}/skills/uimap.zip\""
  else
    log_warn "CDN_UPLOAD_CMD not configured, please upload manually"
    echo ""
    echo "You can create a .cdn-config file to automate uploads:"
    echo ""
    echo "cat > .cdn-config << 'EOF'"
    echo "CDN_BASE_URL=\"https://your-cdn-url.com/uimap\""
    echo "CDN_UPLOAD_CMD=\"coscli cp -r\"  # or your upload command"
    echo "EOF"
  fi
  
  echo ""
  log_info "User installation command:"
  echo "  curl -fsSL $CDN_BASE_URL/install.sh | bash"
  echo ""
  log_info "China region installation command:"
  echo "  curl -fsSL $CDN_BASE_URL/install-cn.sh | bash"
  echo ""
  echo "Or specify version:"
  echo "  VERSION=$version curl -fsSL $CDN_BASE_URL/install.sh | bash"
  echo ""
}

# Upload to CDN (if configured)
upload_to_cdn() {
  local version="$1"
  local upload_base="${CDN_UPLOAD_URL:-$CDN_BASE_URL}"
  
  if [ -z "$CDN_UPLOAD_CMD" ]; then
    return 0
  fi
  
  log_info "Uploading to CDN..."
  log_info "Upload URL: $upload_base"
  
  # Upload install script
  local install_target="${upload_base%/}/install.sh"
  log_info "Uploading install.sh -> $install_target"
  if $CDN_UPLOAD_CMD "$RELEASES_DIR/install.sh" "$install_target"; then
    log_success "install.sh uploaded successfully"
  else
    log_error "install.sh upload failed"
    return 1
  fi
  
  # Upload install-cn script
  local install_cn_target="${upload_base%/}/install-cn.sh"
  log_info "Uploading install-cn.sh -> $install_cn_target"
  if $CDN_UPLOAD_CMD "$RELEASES_DIR/install-cn.sh" "$install_cn_target"; then
    log_success "install-cn.sh uploaded successfully"
  else
    log_error "install-cn.sh upload failed"
    return 1
  fi
  
  # Upload version package
  local version_target="${upload_base%/}/releases/$version/uimap-$version.tar.gz"
  log_info "Uploading uimap-$version.tar.gz -> $version_target"
  if $CDN_UPLOAD_CMD "$RELEASES_DIR/uimap-$version.tar.gz" "$version_target"; then
    log_success "Version package uploaded successfully"
  else
    log_error "Version package upload failed"
    return 1
  fi
  
  # Upload latest package
  local latest_target="${upload_base%/}/releases/latest/uimap-latest.tar.gz"
  log_info "Uploading uimap-latest.tar.gz -> $latest_target"
  if $CDN_UPLOAD_CMD "$RELEASES_DIR/uimap-latest.tar.gz" "$latest_target"; then
    log_success "Latest package uploaded successfully"
  else
    log_error "Latest package upload failed"
    return 1
  fi
  
  # Upload skill zip
  local skill_target="${upload_base%/}/skills/uimap.zip"
  log_info "Uploading uimap.zip -> $skill_target"
  if $CDN_UPLOAD_CMD "$RELEASES_DIR/uimap.zip" "$skill_target"; then
    log_success "Skill zip uploaded successfully"
  else
    log_error "Skill zip upload failed"
    return 1
  fi
  
  log_success "All files uploaded successfully!"
}

# Refresh CDN
refresh_cdn() {
  local version="$1"
  
  log_info "Refreshing CDN..."
  
  # Build list of URLs to refresh
  local urls_json="[\"${CDN_BASE_URL%/}/releases/$version/uimap-$version.tar.gz\",\"${CDN_BASE_URL%/}/releases/latest/uimap-latest.tar.gz\",\"${CDN_BASE_URL%/}/install.sh\",\"${CDN_BASE_URL%/}/install-cn.sh\",\"${CDN_BASE_URL%/}/skills/uimap.zip\"]"
  
  log_info "URLs to refresh (5 total):"
  echo "${CDN_BASE_URL%/}/releases/$version/uimap-$version.tar.gz"
  echo "${CDN_BASE_URL%/}/releases/latest/uimap-latest.tar.gz"
  echo "${CDN_BASE_URL%/}/install.sh"
  echo "${CDN_BASE_URL%/}/install-cn.sh"
  echo "${CDN_BASE_URL%/}/skills/uimap.zip"
  
  # Use tccli to refresh CDN URLs
  if command -v tccli >/dev/null 2>&1; then
    if tccli cdn PurgeUrlsCache --Urls "$urls_json"; then
      log_success "CDN refresh successful"
    else
      log_warn "CDN refresh failed, please refresh manually"
      log_warn "If tccli token is invalid, run: tccli auth login"
    fi
  else
    log_warn "tccli command not found, skipping CDN refresh"
    log_warn "To refresh, install Tencent Cloud CLI: https://cloud.tencent.com/document/product/440/34074"
  fi
}

# Prefetch CDN
prefetch_cdn() {
  local version="$1"
  
  log_info "Preparing CDN prefetch..."
  
  if ! command -v tccli >/dev/null 2>&1; then
    log_warn "tccli command not found, skipping CDN prefetch"
    return 0
  fi
  
  # Build list of URLs to prefetch
  local urls_need_prefetch="${CDN_BASE_URL%/}/releases/$version/uimap-$version.tar.gz
${CDN_BASE_URL%/}/releases/latest/uimap-latest.tar.gz
${CDN_BASE_URL%/}/install.sh
${CDN_BASE_URL%/}/install-cn.sh
${CDN_BASE_URL%/}/skills/uimap.zip"
  
  log_info "URLs to prefetch (5 total):"
  echo "$urls_need_prefetch"
  
  # Convert URL list to JSON array format
  local urls_json="[\"${CDN_BASE_URL%/}/releases/$version/uimap-$version.tar.gz\",\"${CDN_BASE_URL%/}/releases/latest/uimap-latest.tar.gz\",\"${CDN_BASE_URL%/}/install.sh\",\"${CDN_BASE_URL%/}/install-cn.sh\",\"${CDN_BASE_URL%/}/skills/uimap.zip\"]"
  
  log_info "Prefetching CDN..."
  if tccli cdn PushUrlsCache --Area global --Urls "$urls_json"; then
    log_success "CDN prefetch task submitted successfully"
  else
    log_warn "CDN prefetch failed"
    log_warn "If tccli token is invalid, run: tccli auth login"
  fi
}

# Main function
main() {
  local version=$(get_version "${1:-}")
  
  if [ -z "$version" ]; then
    log_error "Cannot get version number"
    log_info "Usage: $0 [version]"
    exit 1
  fi
  
  log_info "Preparing release uimap v$version"
  
  check_dependencies
  build_project
  create_package "$version"
  create_skill_zip
  generate_install_script
  generate_install_cn_script
  
  # Try auto-upload
  if upload_to_cdn "$version"; then
    # Refresh CDN after successful upload
    refresh_cdn "$version"
  else
    log_warn "Upload failed, skipping CDN refresh and prefetch"
  fi
  
  # Show upload instructions
  show_upload_instructions "$version"
  
  log_success "Release completed!"

  # Prefetch CDN
  # Wait for refresh to take effect
  log_info "Waiting 200 seconds for refresh to take effect, then prefetching CDN..."
  sleep 200
  prefetch_cdn "$version"
}

main "$@"
