#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Extract version from SKILL.md
SKILL_FILE="$PROJECT_ROOT/skills/uimap/SKILL.md"
VERSION=$(grep -E "^version:" "$SKILL_FILE" | sed 's/^version:[[:space:]]*//' | tr -d '"')

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from $SKILL_FILE"
    exit 1
fi

echo "Version to publish: $VERSION"
echo ""
read -p "Do you want to proceed? (y/N): " confirm
case "$confirm" in
    [yY]|[yY][eE][sS])
        echo "Publishing..."
        clawhub publish "$PROJECT_ROOT/skills/uimap/" --version "$VERSION"
        ;;
    *)
        echo "Cancelled."
        exit 0
        ;;
esac
