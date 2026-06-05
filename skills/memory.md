# AI Router - Project Memory

## Project Overview
**Name:** AI Router v1.1  
**Type:** Multi-LLM Intelligent Routing System  
**Language:** Node.js (JavaScript ES modules)  
**Purpose:** Dynamic selection and failover between multiple AI providers (Gemini, Groq, Ollama, GitHub Copilot, OpenAI)

## Problem Solved
Traditional AI apps depend on single LLM provider → risk of rate limits, downtime, high costs. AI Router solves this with:
- Multi-provider support
- Automatic failover mechanism
- Cost optimization
- Provider-agnostic architecture

## Project Structure
```
ai-router/
├── cli.js                  # Main CLI entry point
├── chat.js                 # Chat interface
├── router/                 # Routing engine
│   ├── engine.js           # Core routing logic & failover
│   ├── logger.js           # Logging utilities
│   ├── provider.registry.js # Provider registration
│   └── providers.config.js  # Provider configuration
├── providers/              # LLM provider implementations
│   ├── copilot.js          # GitHub Copilot CLI integration
│   ├── gemini.js           # Google Gemini
│   ├── groq.js             # Groq API
│   ├── ollama.js           # Ollama (local)
│   └── openai.js           # OpenAI API
├── skills/                 # Skills documentation
│   ├── loader.js           # Skill loader
│   ├── memory.md           # This file
│   └── SKILL.md            # Skills reference
├── tests/                  # Test suite
├── config/                 # Configuration files
├── memory/                 # Session memory
│   ├── memory.js           # Memory management
│   └── session.json        # Session state
├── logs/                   # Application logs
├── .env                    # Environment variables
├── package.json            # Dependencies
└── README.md               # Full documentation
```

## Key Dependencies
- **axios** (1.17.0) - HTTP client for API calls
- **chalk** (5.6.2) - CLI styling & colors
- **commander** (15.0.0) - CLI argument parsing
- **dotenv** (16.6.1) - Environment variables
- **groq-sdk** (1.2.1) - Groq API SDK
- **ora** (9.4.0) - Loading spinners
- **readline-sync** (1.4.10) - Synchronous CLI input

## Core Components

### Router Engine (router/engine.js)
- Manages provider selection logic
- Handles automatic failover on provider failure
- Tracks provider health/availability
- Returns responses with fallback support

### CLI Layer (cli.js)
- Command-line interface for users
- Entry point: `ai-router`
- Chat entry point: `ai-chat`

### Provider System
All providers implement same interface:
- Accept user query/prompt
- Return formatted response
- Handle errors gracefully
- Support timeout/retry logic

**Currently Supported:**
- Copilot (GitHub CLI)
- Gemini (Google)
- Groq (API)
- Ollama (Local model)
- OpenAI (API)

### Memory System (memory/)
- `memory.js` - Manages conversation history
- `session.json` - Persists session state
- Enables multi-turn conversations

## Configuration
Located in `router/providers.config.js`:
- Provider order/priority
- API credentials from `.env`
- Timeout settings
- Retry logic parameters

## Environment Setup
Required `.env` variables (depends on providers used):
- `GROQ_API_KEY` - Groq API
- `OPENAI_API_KEY` - OpenAI
- `GEMINI_API_KEY` - Google Gemini
- GitHub Copilot uses local `gh` CLI
- Ollama uses local endpoint

## Common Tasks
1. **Adding new provider:** Create file in `providers/`, implement interface, register in `provider.registry.js`
2. **Modifying routing logic:** Edit `router/engine.js`
3. **Changing provider priority:** Update `router/providers.config.js`
4. **Adding CLI commands:** Extend `cli.js` using Commander.js
5. **Testing:** Run tests in `tests/` directory

## Recent Insights
- Copilot provider recently added (copilot.js)
- Session memory integration working
- Multi-turn conversations supported
- Error handling and logging in place

## Known Issues / Todos
- Test suite needs expansion
- Documentation for provider development needed
- Rate limiting logic could be enhanced
- Provider health monitoring dashboard would be useful
