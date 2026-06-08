# Forge CLI Skills

This file defines the specialized knowledge and workflows for the Forge CLI.

## Core Capabilities
- **Intelligent Routing**: Automatically selects the best LLM provider based on availability and priority.
- **Failover Logic**: Seamlessly switches to the next available provider if the primary one fails (e.g., quota exceeded).
- **Interactive Forge**: A professional-grade chat interface with command history and "forging" animations.
- **Multimodal Support**: Ability to attach and analyze images across supported providers.

## Usage Workflows

### Command Line Interface
```bash
# General query
forge "Explain quantum computing"

# Force specific provider
forge --model groq "Explain quantum computing"

# Launch interactive session
forge code
```

### Interactive Commands
- `/model list`: View all available providers and their status.
- `/model <name>`: Switch to a specific LLM (e.g., `/model gemini`).
- `/model auto`: Return to automatic routing.
- `/image <path>`: Attach an image for multimodal analysis.
- `/clear`: Wipe session history.
- `/exit`: Close the forge.

## Maintenance
- **Health Checks**: Run `forge health` to verify provider connectivity.
- **Credential Management**: Update `.env` in the root directory to manage API keys.
