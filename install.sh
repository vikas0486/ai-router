#!/bin/bash

# AI Router - Forge CLI Installer
# This script installs the 'forge' command globally

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔨 Installing Forge CLI..."
echo "Project root: $PROJECT_ROOT"

# Install dependencies if not already installed
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$PROJECT_ROOT"
    npm install
fi

# Install globally using npm
echo "🌍 Installing forge command globally..."
cd "$PROJECT_ROOT"
npm install -g .

echo ""
echo "✅ Installation complete!"
echo ""
echo "You can now use the following commands:"
echo "  forge <prompt>              - Run AI router with prompt"
echo "  forge --model groq <prompt> - Use specific model"
echo "  forge --health              - Check provider health"
echo "  ai-chat                     - Interactive chat mode"
echo "  ai-router <prompt>          - Direct alias"
echo ""
echo "Example: forge 'What is Node.js?'"
