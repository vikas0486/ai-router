# Forge CLI - Quick Setup Guide

## Installation Options

### Option 1: Automatic Installer (Recommended)
```bash
cd /path/to/ai-router
./install.sh
```

### Option 2: Manual Installation
```bash
cd /path/to/ai-router
npm install -g .
```

### Option 3: Add to PATH (without global install)
Add this to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
# Add ai-router to PATH
export PATH="/Users/vikash/Documents/Projects/ai-router:$PATH"

# Create aliases
alias forge='node /Users/vikash/Documents/Projects/ai-router/cli.js'
alias ai-chat='node /Users/vikash/Documents/Projects/ai-router/chat.js'
```

Then reload: `source ~/.bashrc` (or `source ~/.zshrc` for macOS with zsh)

---

## Usage

### Basic Commands
```bash
forge "Your question here"              # Ask AI Router
forge --model groq "Your question"      # Use specific model
forge --health                          # Check provider health
ai-chat                                 # Interactive chat
```

### Examples
```bash
forge "What is Node.js?"
forge --model gemini "Explain REST APIs"
forge --health
ai-chat
```

---

## Environment Variables (Optional)

Set these in `.env` file in the project root or in your shell:

```bash
# Gemini
GEMINI_API_KEY=your_key_here

# OpenAI
OPENAI_API_KEY=your_key_here

# Groq
GROQ_API_KEY=your_key_here

# Ollama (local, usually no key needed)
OLLAMA_API_URL=http://localhost:11434
```

---

## Verify Installation

```bash
# Check if installed
which forge

# Show location
which ai-chat

# Test command
forge --health
```

---

## Troubleshooting

If `forge` command not found:
1. Verify installation: `npm list -g ai-router`
2. Reinstall: `npm install -g /path/to/ai-router`
3. Or use manual alias approach above
