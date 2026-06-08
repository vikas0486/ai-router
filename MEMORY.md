# Forge Project Memory

This file serves as the persistent memory and project index for Forge.

## Project Vision
Forge is a product-ready AI routing CLI designed to be fast, reliable, and aesthetically pleasing. It transforms simple LLM API calls into a "forging" experience.

## Environment & Configuration
- **Root Directory**: Managed via Git.
- **API Keys**: Stored in `.env` (not committed).
- **Log Files**: Located in `logs/router.log` (monitors routing decisions and failures).
- **History**: `chat-history.json` stores recent messages and command history for the interactive session.

## System Components
- **Router Engine**: `router/engine.js` (The core logic for provider selection and fallback).
- **Provider Adapters**: `providers/` (Standardized interfaces for Gemini, Groq, OpenAI, Ollama, etc.).
- **Interactive Session**: `chat.js` (The "Forge Code" interactive environment).
- **CLI Entrypoint**: `cli.js` (The main `forge` command handler).

## Recent Transformations (June 2026)
- Renamed project from `ai-router` to `Forge`.
- Implemented global path resolution to allow running `forge` from any directory.
- Upgraded the chat interface with animated forging hammers and native command history.
- Added `forge code` command for direct interactive access.
- Consolidated documentation into `SKILL.md` and `MEMORY.md`.
