# AI Router - Skills Reference

Use these patterns and techniques when working on ai-router. Each skill is self-contained and can be recalled with `/skill [name]`.

---

## SKILL: Adding a New LLM Provider

**When:** You need to integrate a new AI model/provider (e.g., Claude, PaLM, Anthropic)

**Steps:**
1. Create new file in `providers/newprovider.js`
2. Implement standard provider interface:
   ```javascript
   export async function query(userPrompt, options = {}) {
     // Make API call or CLI call
     // Return { success: true, response: "..." }
     // Return { success: false, error: "..." } on failure
   }
   ```
3. Register in `router/provider.registry.js`
4. Add credentials to `.env` if API-based
5. Add configuration to `router/providers.config.js` (priority, timeout, etc.)
6. Test with `cli.js` before merging

**Key Pattern:** All providers are async functions that handle errors gracefully and return consistent response format.

---

## SKILL: Modifying Routing/Failover Logic

**When:** Need to change how the router selects providers or handles failures

**Location:** `router/engine.js`

**Key Functions:**
- `selectProvider()` - Chooses next provider to try
- `executeWithFallback()` - Handles retry logic across providers
- Provider health tracking and timeout handling

**Important:** 
- Maintain provider priority order
- Always implement exponential backoff for retries
- Log each fallover event for debugging
- Consider rate limiting between retries

---

## SKILL: CLI Command Development

**When:** Adding new user-facing CLI commands

**Tool:** Commander.js (commander@15.0.0)

**Pattern:**
```javascript
program
  .command('new-command <param>')
  .description('What it does')
  .option('-f, --flag', 'Flag description')
  .action(async (param, options) => {
    // Implementation
  });
```

**Location:** `cli.js`

**Current Commands:**
- Root: General query to router
- `chat` mode: Multi-turn conversation

---

## SKILL: Session Management

**When:** Implementing multi-turn conversations or maintaining state

**System:**
- `memory/memory.js` - Session memory manager
- `memory/session.json` - Persisted state file

**Pattern:**
```javascript
import { sessionManager } from './memory/memory.js';

const session = sessionManager.createSession();
session.addMessage('user', userQuery);
session.addMessage('assistant', response);
sessionManager.saveSession(session);
```

---

## SKILL: Error Handling & Logging

**When:** Debugging issues or adding robust error handling

**Logger Location:** `router/logger.js`

**Pattern:**
```javascript
import logger from './router/logger.js';

try {
  // code
} catch (error) {
  logger.error(`Context: ${error.message}`);
  // fallback logic
}
```

**Best Practices:**
- Always log provider failures
- Include context in error messages
- Use structured logging for debugging
- Track which provider was used in successful responses

---

## SKILL: Provider Configuration

**When:** Adjusting provider settings without code changes

**File:** `router/providers.config.js`

**Configurable Settings:**
- `priority` - Order of provider fallback
- `timeout` - Max wait time per provider
- `retries` - Number of retry attempts
- `backoffMultiplier` - Exponential backoff factor
- `enabled` - Enable/disable provider

**Pattern:** Update config, changes take effect on next query

---

## SKILL: Testing Provider Integration

**When:** Validating a new or modified provider works correctly

**Quick Test:**
```bash
node cli.js "test prompt"
```

**Better Test:**
```bash
node chat.js  # Start interactive chat mode
```

**Full Flow Testing:**
1. Test direct provider call (comment out others in engine.js temporarily)
2. Test failover by disabling primary provider
3. Test with various input types (short/long prompts, special chars)
4. Verify session memory saves conversation
5. Check logs for errors

---

## SKILL: Environment & API Keys Setup

**When:** Setting up development or deployment environment

**Required Files:**
- Create `.env` file in project root
- Never commit `.env` to git

**Key Variables:**
```bash
GROQ_API_KEY=xxx        # For Groq
OPENAI_API_KEY=xxx      # For OpenAI
GEMINI_API_KEY=xxx      # For Gemini
# GitHub Copilot uses system 'gh' CLI (no key needed)
# Ollama uses localhost:11434 (local service)
```

**Local Development:**
- Install `gh` CLI for Copilot support
- Run `ollama serve` in separate terminal for Ollama provider
- Others use cloud APIs via keys

---

## SKILL: Debugging Provider Failures

**When:** A provider is not responding or returning errors

**Steps:**
1. Check `.env` file has required API keys
2. Check provider service is running (esp. Ollama, gh CLI)
3. Review logs in `logs/` directory
4. Temporarily disable in config to test failover
5. Add console logs in `providers/failing-provider.js`
6. Check network connectivity and rate limits

**Common Issues:**
- Missing/expired API keys → add to `.env`
- Service not running → start Ollama/gh CLI
- Rate limit hit → add backoff delay
- Network timeout → increase timeout in config

---

## SKILL: Multi-turn Chat Implementation

**When:** Building conversational experiences beyond single queries

**Current State:** `chat.js` and `memory/` already support this

**Pattern:**
1. Create session via sessionManager
2. Send user message to router with session context
3. Save response to session
4. Display to user
5. Save session for next turn

**File:** `chat.js` shows full implementation

---

## SKILL: Code Organization Best Practices

**Structure Convention:**
- `providers/` - External service integrations
- `router/` - Core business logic (routing, failover)
- `memory/` - State & persistence
- `skills/` - Documentation & skill reference
- Root `.js` files - CLI entry points only

**Keep:**
- Providers independent (no cross-provider dependencies)
- Engine generic (can add providers without engine changes)
- CLI layer thin (logic in router/providers)

---

## Quick Commands Reference

```bash
# Run CLI query
node cli.js "Your prompt here"

# Interactive chat mode
node chat.js

# Check available commands
node cli.js --help

# Start with npm if alias set up
ai-router "prompt"
ai-chat
```

---

## Common Patterns to Remember

1. **Consistency:** All providers use same async interface
2. **Failures:** Always have fallback provider ready
3. **Logging:** Log provider selection and failures for debugging
4. **Config:** Use centralized config file for provider settings
5. **Sessions:** Store conversation history for multi-turn support
6. **CLI:** Use Commander.js for argument parsing
7. **Errors:** Catch and log errors, return to user gracefully
