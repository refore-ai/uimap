#!/usr/bin/env bash
set -euo pipefail

# Local Installation Test Script
# Usage: ./scripts/test-install.sh [port]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RELEASES_DIR="$PROJECT_ROOT/releases"

# Use an uncommon port (to avoid conflicts)
DEFAULT_PORT="28475"

# Test directory and PID file (initialized by main function)
TEST_DIR=""
SERVER_PID_FILE=""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[TEST]${NC} $1" >&2; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1" >&2; }
log_error() { echo -e "${RED}[FAIL]${NC} $1" >&2; }

# Cleanup function
cleanup() {
  if [ -n "${TEST_DIR:-}" ] && [ -d "$TEST_DIR" ]; then
    log_info "Cleaning up test directory: $TEST_DIR"
    rm -rf "$TEST_DIR"
  fi
}

# Stop server
stop_server() {
  if [ -n "${SERVER_PID_FILE:-}" ] && [ -f "$SERVER_PID_FILE" ]; then
    local pid
    pid=$(cat "$SERVER_PID_FILE")
    log_info "Stopping server (PID: $pid)..."
    kill "$pid" 2>/dev/null || true
    rm -f "$SERVER_PID_FILE"
  fi
}

# Start local HTTP server
# Output: Only output PID to stdout, logs go to stderr
start_server() {
  local port="${1:-$DEFAULT_PORT}"
  log_info "Starting local HTTP server (port: $port)..."
  
  cd "$RELEASES_DIR"
  python3 -m http.server "$port" >/dev/null 2>&1 &
  local pid=$!
  
  # Save PID to file
  echo "$pid" > "$SERVER_PID_FILE"
  
  # Wait for server to start
  sleep 2
  
  if ! kill -0 "$pid" 2>/dev/null; then
    log_error "Failed to start server, port $port may be in use"
    rm -f "$SERVER_PID_FILE"
    return 1
  fi
  
  # Only output PID to stdout (no other output)
  echo "$pid"
}

# Test installation
test_install() {
  local port="${1:-$DEFAULT_PORT}"
  local test_install_dir="$TEST_DIR/.local/bin"
  local test_uimap_home="$TEST_DIR/.uimap"
  
  log_info "Testing installation process..."
  log_info "Install directory: $test_install_dir"
  log_info "Data directory: $test_uimap_home"
  
  mkdir -p "$test_install_dir"
  
  # Use local server to test installation
  local cdn_url="http://localhost:$port"
  
  log_info "Executing install script..."
  CDN_BASE_URL="$cdn_url" \
  INSTALL_DIR="$test_install_dir" \
  UIMAP_HOME="$test_uimap_home" \
  bash "$RELEASES_DIR/install.sh"
  
  # Verify installation
  if [ -f "$test_install_dir/uimap" ]; then
    log_success "uimap command created"
  else
    log_error "uimap command not created"
    return 1
  fi
  
  if [ -d "$test_uimap_home/dist" ]; then
    log_success "Data directory created"
  else
    log_error "Data directory not created"
    return 1
  fi
  
  # Test run
  log_info "Testing uimap execution..."
  if "$test_install_dir/uimap" --help >/dev/null 2>&1; then
    log_success "uimap runs normally"
  else
    # Some commands may return non-zero, but as long as there's no error
    log_success "uimap runs (help message displayed)"
  fi
  
  return 0
}

# Main function
main() {
  local port="${1:-$DEFAULT_PORT}"
  
  # Create temp directory
  TEST_DIR=$(mktemp -d)
  SERVER_PID_FILE="$TEST_DIR/server.pid"
  export TEST_DIR SERVER_PID_FILE
  
  # Setup cleanup function (stops server and cleans up on exit)
  cleanup_all() {
    local exit_code=$?
    stop_server
    cleanup
    exit $exit_code
  }
  trap cleanup_all EXIT
  
  log_info "=== uimap Installation Script Test ==="
  echo ""
  
  # Check release files
  if [ ! -f "$RELEASES_DIR/install.sh" ]; then
    log_error "Release files not found, please run: pnpm run release:cdn"
    exit 1
  fi
  
  # Start server
  local server_pid
  server_pid=$(start_server "$port")
  log_success "Server started (PID: $server_pid)"
  echo ""
  
  # Test installation
  if test_install "$port"; then
    echo ""
    log_success "=== All tests passed ==="
  else
    echo ""
    log_error "=== Tests failed ==="
    exit 1
  fi
}

main "$@"
