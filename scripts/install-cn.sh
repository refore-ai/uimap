#!/usr/bin/env bash
# uimap CLI Installation Script for China region
# Usage: curl -fsSL https://s.dwimg.top/uimap/install-cn.sh | bash

set -euo pipefail

# China CDN URL
CDN_URL="https://s.dwimg.top/uimap"

# Download and run the main install script with China region
# Pass through any additional arguments
curl -fsSL "${CDN_URL}/install.sh" | bash -s -- --region China "$@"
