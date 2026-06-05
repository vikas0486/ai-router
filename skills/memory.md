# AI Router - Project Memory & Architecture

## Project Overview
**Name:** AI Router v1.1  
**Type:** Multi-LLM Intelligent Routing System  
**Language:** Node.js (ES modules)  
**Repository:** https://github.com/vikas0486/ai-router  
**Purpose:** Build resilient AI applications by dynamically routing queries across multiple providers with automatic failover, health checks, and unified credential management

## Problem Statement
Most AI applications depend on a single LLM provider, creating several risks:
- **Rate Limiting:** API limits can break production systems
- **Provider Downtime:** Service outages cause complete failures
- **Cost Inefficiency:** No optimization across providers
- **Vendor Lock-in:** Switching providers requires code rewrite
- **No Fallback:** No resilience mechanism exists

**AI Router Solution:**
- ✅ Multi-provider support with unified interface
- ✅ Automatic intelligent failover on provider failure
- ✅ Cost-aware routing with provider prioritization
- ✅ Provider-agnostic architecture (easy to swap/add providers)
- ✅ Health checks & diagnostic logging

## Project Structure
```
ai-router/
├── cli.js                    # CLI Entry point (single queries)
├── chat.js                   # Interactive Chat CLI with persistence
├── config/
│   ├── credentials.js        # Credential loader & validator
│   └── models.json           # Model configurations
├── providers/                # LLM provider implementations
│   ├── gemini.js             # Google Gemini API
│   ├── groq.js               # Groq API (fast inference)
│   ├── ollama.js             # Ollama local execution
│   ├── copilot.js            # GitHub Copilot CLI integration
│   └── openai.js             # OpenAI API
├── router/                   # Core routing & failover engine
│   ├── engine.js             # Main routing logic, failover, provider selection
│   ├── logger.js             # Structured logging & diagnostics
│   ├── provider.registry.js  # Dynamic provider registration
│   └── providers.config.js   # Provider priority, timeouts, retry settings
├── memory/                   # Session management & persistence
│   ├── memory.js             # Conversation history manager
│   └── session.json          # Persisted session state
├── skills/                   # Documentation & technique reference
│   ├── memory.md             # This file (architecture & patterns)
│   ├── SKILL.md              # Skill reference for developers
│   └── loader.js             # Skill loading utilities
├── logs/                     # Application logs & diagnostics
├── tests/                    # Test suite
├── .env                      # Environment variables (not in git)
├── package.json              # Dependencies & scripts
├── README.md                 # User documentation
├── CHAT_GUIDE.md             # Interactive chat usage guide
├── CHAT_ARCHITECTURE.md      # Chat system design
└── SETUP.md                  # Development environment setup
```

## Key Dependencies
- **axios** (1.17.0) - HTTP client for API calls and communication
- **chalk** (5.6.2) - Terminal styling & colored output
- **commander** (15.0.0) - CLI argument parsing & command structure
- **dotenv** (16.6.1) - Environment variable loading from .env
- **groq-sdk** (1.2.1) - Groq official SDK for API integration
- **ora** (9.4.0) - Animated loading spinners for UX
- **readline-sync** (1.4.10) - Synchronous CLI input for interactive mode
- **nodemon** (3.1.14) - Dev-only auto-reload for development

## Core Architecture

### Router Engine (router/engine.js)
The heart of the system:
- **Provider Selection:** Intelligently picks next provider based on priority & health
- **Automatic Failover:** Retries with next provider on failure, with exponential backoff
- **Health Tracking:** Monitors provider health/availability status
- **Timeout Management:** Enforces per-provider timeout limits
- **Error Recovery:** Graceful error handling with fallback strategy
- **Logging:** Comprehensive event logging for diagnostics

**Key Methods:**
- `executeWithFallback(query)` - Main entry point, handles full retry logic
- `selectProvider()` - Chooses next provider to attempt
- `handleProviderFailure()` - Processes failures, selects next provider

### CLI Layer (cli.js & chat.js)
User-facing interfaces:
- **cli.js:** Single query execution with optional model specification
- **chat.js:** Interactive multi-turn conversations with session persistence
- Command parsing via Commander.js
- Beautiful formatted output with chalk & ora spinners

### Provider System
All providers implement a **consistent async interface:**
```javascript
export async function query(userPrompt, options = {}) {
  // Implementation specific to provider
  // Returns: { success: true/false, response: "...", error?: "..." }
}
```

**Currently Supported Providers:**
- **Gemini:** High-quality reasoning, best for complex tasks
- **Groq:** Fastest inference, best for speed-critical applications
- **Ollama:** Local execution, completely offline capability
- **Copilot:** GitHub Copilot CLI integration, coding-focused
- **OpenAI:** Premium API, ready for integration

**Design Principles:**
- Providers are independent (no inter-provider dependencies)
- Providers handle their own API calls and error cases
- Consistent response format across all providers
- Graceful degradation on provider failure

### Memory System (memory/memory.js)
Manages conversation state and history:
- **Session Creation:** Unique sessions for each conversation
- **Message History:** Stores full conversation tree
- **Persistence:** Saves/loads from `memory/session.json`
- **Multi-turn Support:** Enables context-aware conversations
- **State Tracking:** Tracks active session and message count

## Configuration System

**Primary Config File:** `router/providers.config.js`

Configurable settings per provider:
- **priority:** Order of failover attempts (1 = highest)
- **timeout:** Max milliseconds to wait for response
- **enabled:** Whether provider is active
- **maxRetries:** Max retry attempts for this provider
- **backoffMultiplier:** Exponential backoff factor (2 = double each time)
- **costEstimate:** Relative cost for cost-aware routing

**Environment Variables (.env):**
```bash
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
GITHUB_TOKEN=your_github_token_for_copilot
OLLAMA_MODEL=deepseek-r1:8b  # Local model preference
LOG_LEVEL=info              # Log verbosity: debug/info/warn/error
```

**Note:** GitHub Copilot uses local `gh` CLI (no API key). Ollama requires local server (`ollama serve`).

## Common Development Tasks

### Adding a New Provider
1. Create `providers/newprovider.js` with async query function
2. Implement standard interface: `export async function query(prompt, options) {}`
3. Register in `router/provider.registry.js`
4. Add config entry to `router/providers.config.js` (priority, timeout)
5. Add credentials to `.env` if API-based
6. Test: `node cli.js "test prompt" --model newprovider`

### Modifying Routing Logic
- Location: `router/engine.js`
- Key functions: `selectProvider()`, `executeWithFallback()`, `handleProviderFailure()`
- Always maintain provider priority order
- Implement exponential backoff for retries
- Log all fallover events

### Changing Provider Priority
- Edit `router/providers.config.js`
- Adjust `priority` field (lower number = higher priority)
- Changes take effect on next query
- Example: Set Groq priority to 1 for speed-first routing

### Adding CLI Commands
- Location: `cli.js` using Commander.js
- Pattern: `program.command().option().action()`
- See existing commands for examples

### Debugging Provider Failures
1. Check `.env` has required credentials
2. Verify provider service running (Ollama, gh CLI)
3. Review logs in `logs/` directory
4. Enable debug logging: `LOG_LEVEL=debug`
5. Temporarily disable provider to test failover
6. Check network connectivity & rate limits

## Recent Project Evolution
- ✅ v1.1 added interactive chat mode with session persistence
- ✅ Multi-turn conversations fully supported with memory system
- ✅ Health check system for provider diagnostics
- ✅ Copilot provider integration for coding tasks
- ✅ Comprehensive error handling & logging
- ✅ Dynamic provider discovery (especially for Ollama)
- ✅ Beautiful CLI UI with spinners and colors

## Known Limitations & Future Improvements
- **Testing:** Comprehensive test suite under development
- **Rate Limiting:** Advanced rate limiting could be enhanced
- **Provider Monitoring:** Health dashboard would aid diagnostics
- **Cost Tracking:** Detailed cost analytics for provider usage
- **Caching:** Response caching layer for identical queries
- **Load Balancing:** Round-robin or least-used provider selection
- **API Versioning:** Support for multiple provider API versions
