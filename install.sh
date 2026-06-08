#!/bin/bash

# Forge CLI Installer
# This script installs the 'forge' command globally

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "⚒️  Installing Forge CLI..."
echo "Project path: $PROJECT_ROOT"

# Install dependencies if not already installed
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$PROJECT_ROOT"
    npm install
fi

# Link globally using npm
echo "🌍 Linking forge command globally..."
cd "$PROJECT_ROOT"
npm link

echo ""
echo "✅ Forge has been successfully installed!"
echo ""
echo "You can now use the following commands from anywhere:"
echo "  forge [prompt]    - Send a quick query to the best available LLM"
echo "  forge code        - Launch the interactive professional chat (Forge Code)"
echo "  forge health      - Check the status of your AI hammers"
echo "  forge list        - View all configured providers"
echo ""
echo "Example: forge 'Why is Rust so fast?'"
echo "Example: forge code"
