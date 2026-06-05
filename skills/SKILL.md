# AI Router - Skills Reference & Developer Guide

Use these patterns and techniques when working on ai-router. Each skill is self-contained and covers a specific aspect of the system.

---

## SKILL: Adding a New LLM Provider

**When:** You need to integrate a new AI model/service (e.g., Claude, PaLM, Anthropic, local LLaMA)

**Duration:** ~30 minutes for a new API provider

**Steps:**

1. **Create Provider Module**
   ```bash
   touch providers/newprovider.js
   ```

2. **Implement Standard Interface**
   ```javascript
   export async function query(userPrompt, options = {}) {
     try {
       // 1. Get credentials from environment
       const apiKey = process.env.NEWPROVIDER_API_KEY;
       
       // 2. Make API call or CLI call
       const response = await makeApiCall(userPrompt, apiKey);
       
       // 3. Return success format
       return {
         success: true,
         response: response.text,
         provider: 'newprovider',
         metadata: { tokensUsed: response.tokens }
       };
     } catch (error) {
       // 4. Return error format
       return {
         success: false,
         error: error.message,
         provider: 'newprovider'
       };
     }
   }
   ```

3. **Register in Provider Registry**
   - File: `router/provider.registry.js`
   - Add: `import * as newprovider from '../providers/newprovider.js';`
   - Register: `registry.set('newprovider', newprovider);`

4. **Add Configuration**
   - File: `router/providers.config.js`
   - Add provider config with: priority, timeout, retries, enabled flag

5. **Add Credentials**
   - Update `.env`: `NEWPROVIDER_API_KEY=your_key`
   - Never commit `.env` to git

6. **Test Integration**
   ```bash
   node cli.js "test prompt" --model newprovider
   node cli.js "test prompt"  # Should auto-fallback if newprovider fails
   ```

**Key Pattern:** All providers are async functions handling errors gracefully with consistent response format.

**Common Pitfalls:**
- ❌ Not handling API errors properly
- ❌ Inconsistent response format
- ❌ Missing timeout handling
- ✅ Always return `{ success: bool, response/error: string }`

---

## SKILL: Modifying Routing & Failover Logic

**When:** Need to change how router selects providers, handles failures, or implements retry strategy

**Location:** `router/engine.js`

**Key Functions:**

1. **`selectProvider(lastProvider, failedProviders)`**
   - Returns next provider to attempt
   - Respects priority order from config
   - Avoids already-failed providers
   - Current strategy: Priority-based with health tracking

2. **`executeWithFallback(userPrompt, maxRetries)`**
   - Main entry point for routing logic
   - Handles full retry/fallover cycle
   - Manages exponential backoff between attempts
   - Logs each attempt for diagnostics

3. **`handleProviderFailure(provider, error, attempt)`**
   - Processes failure, decides on retry
   - Updates provider health status
   - Logs failure details
   - Selects next provider

**Important Patterns:**
- ✅ Always maintain provider priority order from config
- ✅ Implement exponential backoff: `delay = baseDelay * (backoffMultiplier ^ attempt)`
- ✅ Log each fallover event with timestamp, provider, reason
- ✅ Respect timeout settings per provider
- ✅ Track provider health/failures for intelligent routing

**Example Modification: Add Cost-Aware Routing**
```javascript
// Instead of priority-only selection:
selectProvider() {
  // Combine priority with cost and success rate
  // Prefer fast+cheap providers if they're healthy
  // Only fall back to expensive providers if needed
}
```

---

## SKILL: Interactive Chat Implementation

**When:** Building conversational multi-turn experiences

**Current Implementation:** `chat.js` + `memory/memory.js`

**Pattern:**
1. Create session via `sessionManager.createSession()`
2. Accept user message
3. Send to router with optional session context
4. Display response with provider info
5. Save response to session memory
6. Persist session to `memory/session.json`
7. Loop for next user message

**Key Functions in chat.js:**
- `initializeChat()` - Load or create session
- `handleUserInput()` - Parse commands and prompts
- `processQuery(prompt)` - Route through engine
- `saveSession()` - Persist to disk

**Session Commands:**
- `/model <name>` - Switch provider
- `/history` - Show last 10 messages
- `/clear` - Clear session
- `/exit` - Save and exit

**Session Persistence:**
- Stored in: `memory/session.json`
- Format: Array of messages with provider info
- Survives app restarts
- Limited to last 50 messages

---

## SKILL: CLI Command Development

**When:** Adding new user-facing CLI commands or options

**Tool:** Commander.js (commander@15.0.0)

**Standard Pattern:**
```javascript
program
  .command('new-command <required-param>')
  .option('-f, --flag', 'Flag description')
  .option('-v, --verbose', 'Verbose output')
  .description('What this command does')
  .action(async (requiredParam, options) => {
    // Implementation
    if (options.verbose) console.log('Debug info');
    // Main logic
    // Result handling
  });
```

**Location:** `cli.js` for CLI or root-level commands

**Current Commands:**
- Default: Send prompt to router (auto/fallback mode)
- `--model <name>`: Force specific provider
- `--health`: Run health checks on all providers
- `--help`: Show help text

**Tips:**
- ✅ Always add descriptive help text
- ✅ Use async/await for API calls
- ✅ Handle errors gracefully
- ✅ Provide clear user feedback
- ✅ Test with various inputs

---

## SKILL: Session Memory Management

**When:** Implementing multi-turn conversations or maintaining application state

**System:**
- `memory/memory.js` - Session manager
- `memory/session.json` - Persistent storage

**Basic Usage:**
```javascript
import { sessionManager } from './memory/memory.js';

// Create new session
const session = sessionManager.createSession();

// Add messages
session.addMessage('user', userQuery);
session.addMessage('assistant', response, { provider: 'groq' });

// Save session
sessionManager.saveSession(session);

// Load session
const savedSession = sessionManager.loadSession(sessionId);

// Get conversation history
const history = session.getMessages();
```

**Session Data Structure:**
```javascript
{
  id: 'session-uuid',
  createdAt: '2024-01-01T00:00:00Z',
  messages: [
    { role: 'user', content: 'Hello', timestamp: '...' },
    { role: 'assistant', content: 'Hi!', timestamp: '...', metadata: { provider: 'groq' } }
  ],
  metadata: { totalTokens: 1234, lastProvider: 'groq' }
}
```

---

## SKILL: Provider Configuration & Tuning

**When:** Adjusting provider settings, priorities, or behavior without code changes

**File:** `router/providers.config.js`

**Configurable Settings:**
```javascript
providers: {
  groq: {
    priority: 1,           // Try first (lower = higher priority)
    timeout: 10000,        // Max wait time in ms
    maxRetries: 2,         // Retry attempts
    enabled: true,         // Active/inactive flag
    backoffMultiplier: 2,  // Exponential backoff factor
    costEstimate: 1        // Relative cost (1-10)
  },
  ollama: {
    priority: 3,
    timeout: 30000,        // Longer timeout for local
    maxRetries: 1,
    enabled: true,
    costEstimate: 0        // Free (local)
  }
}
```

**Common Tuning Scenarios:**

1. **Prioritize Speed**
   - Set Groq priority: 1
   - Set Ollama priority: 2
   - Set others priority: 3+

2. **Prioritize Cost**
   - Enable only Ollama (free, local)
   - Set high timeout for slower local models
   - Use Groq as fallback for when Ollama fails

3. **Balance Speed vs Cost**
   - Groq first (fast, cheap)
   - Ollama second (free, slower)
   - Gemini as backup (best quality)

4. **Increase Reliability**
   - Lower timeout, more retries
   - Add more providers
   - Disable unreliable providers

---

## SKILL: Error Handling & Logging

**When:** Debugging issues, adding robust error handling, or diagnosing failures

**Logger Location:** `router/logger.js`

**Basic Logging Pattern:**
```javascript
import logger from './router/logger.js';

try {
  // Code that might fail
  const response = await provider.query(prompt);
} catch (error) {
  logger.error(`Query failed for provider ${name}: ${error.message}`);
  // Fallback logic
}
```

**Log Levels:**
- `debug` - Detailed diagnostic info
- `info` - General information
- `warn` - Warning conditions
- `error` - Error conditions

**Setting Log Level:**
```bash
LOG_LEVEL=debug node cli.js "your prompt"
```

**Best Practices:**
- ✅ Log provider selection decision
- ✅ Log all provider failures with error details
- ✅ Include context in error messages
- ✅ Log response time/performance metrics
- ✅ Use structured logging for debugging
- ✅ Track which provider succeeded
- ✅ Log retry attempts and backoff delays

**Common Log Patterns:**
```javascript
logger.info(`Attempting provider: ${providerName}`);
logger.warn(`Provider ${name} timed out after ${timeout}ms`);
logger.error(`Provider ${name} failed: ${error.message}`);
logger.debug(`Response received in ${responseTime}ms`);
```

---

## SKILL: Health Checks & Diagnostics

**When:** Verifying provider status, debugging configuration, or monitoring system health

**Command:**
```bash
node cli.js --health
```

**What It Checks:**
- ✅ All provider credentials are loaded
- ✅ Each provider is reachable/responsive
- ✅ Configuration is valid
- ✅ Dependencies are available
- ✅ Environment variables are set correctly

**Output Example:**
```
✓ Gemini: Healthy (response time: 345ms)
✓ Groq: Healthy (response time: 128ms)
✓ Ollama: Healthy (model: deepseek-r1:8b, 2.4GB)
✓ Copilot: Healthy (gh CLI found)
✗ OpenAI: Missing API key
```

**Usage:**
- Run before deploying to verify setup
- Run to identify which providers are broken
- Check response times for performance issues
- Validate .env configuration

---

## SKILL: Testing & Validation

**When:** Verifying a new provider works, validating changes don't break things, or setting up tests

**Testing Levels:**

1. **Quick Manual Test**
   ```bash
   node cli.js "test prompt"
   ```

2. **Provider-Specific Test**
   ```bash
   node cli.js "test prompt" --model groq
   ```

3. **Health Check**
   ```bash
   node cli.js --health
   ```

4. **Interactive Test**
   ```bash
   node chat.js
   # Test: /model groq, /history, /clear, /exit
   ```

5. **Full Flow Testing**
   - Test direct provider: `--model provider`
   - Test failover: Disable primary, verify fallback works
   - Test varied inputs: Short/long prompts, special chars
   - Test session memory: Multi-turn conversations
   - Check logs for errors and warnings

**Test Cases to Cover:**
- Single query with default routing
- Force specific provider
- Provider failure and fallback
- Multi-turn conversation
- Session persistence
- Health check diagnostics
- All providers with various timeouts

---

## SKILL: Environment Setup & Deployment

**When:** Setting up development or production environment

**Local Development:**

1. **Clone and Install**
   ```bash
   git clone https://github.com/vikas0486/ai-router.git
   cd ai-router
   npm install
   ```

2. **Create .env**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Services**
   ```bash
   # Terminal 1: Ollama (if using local models)
   ollama serve
   
   # Terminal 2: Your CLI
   node cli.js "your prompt"
   ```

4. **Development Mode (auto-reload)**
   ```bash
   npm run dev
   ```

**Environment Variables:**
```bash
GROQ_API_KEY=xxx              # From console.groq.com
GEMINI_API_KEY=xxx            # From Google AI Studio
OPENAI_API_KEY=xxx            # From OpenAI dashboard
GITHUB_TOKEN=xxx              # From GitHub settings
OLLAMA_MODEL=deepseek-r1:8b   # Local model name
LOG_LEVEL=info                # Log verbosity
```

**Verification:**
```bash
# Should show all providers healthy
node cli.js --health

# Should work for all enabled providers
node cli.js "test"
node chat.js
```

---

## SKILL: Debugging Provider Failures

**When:** A provider is not responding, returning errors, or not working as expected

**Diagnostic Steps:**

1. **Check Configuration**
   ```bash
   # Verify .env file exists and has required keys
   cat .env | grep PROVIDER_NAME
   ```

2. **Check Logs**
   ```bash
   # Review diagnostic logs
   tail -f logs/app.log
   
   # With debug logging
   LOG_LEVEL=debug node cli.js "test"
   ```

3. **Test Provider Directly**
   ```bash
   # Force use of failing provider
   node cli.js "test" --model failing-provider
   
   # Should show specific error
   ```

4. **Verify Service Running**
   ```bash
   # For Ollama
   curl http://localhost:11434/api/tags
   
   # For GitHub Copilot
   gh auth status
   ```

5. **Check Network & Rate Limits**
   - Verify internet connection
   - Check API rate limits in provider dashboard
   - Look for rate limit error messages in logs

**Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| Missing API key | Add to `.env` |
| Service not running | Start Ollama with `ollama serve` |
| Rate limit hit | Wait or reduce request frequency |
| Network timeout | Increase timeout in config |
| Auth failed | Regenerate/verify API key |
| Model not found (Ollama) | Run `ollama pull modelname` |
| gh CLI not found | Install GitHub CLI |

---

## SKILL: Code Organization & Architecture

**When:** Understanding or maintaining the codebase structure

**Directory Structure Rationale:**

```
providers/     - Each provider is independent, self-contained
router/        - Core business logic, agnostic to specific providers
memory/        - State management, completely separate concern
config/        - Configuration and credentials
skills/        - Documentation and knowledge base
tests/         - Test suite isolated from main code
logs/          - Generated output, not source
```

**Design Principles:**

1. **Separation of Concerns**
   - Providers: Only know how to call their API
   - Router: Only knows how to sequence providers
   - Memory: Only knows how to persist state
   - CLI: Only knows how to format for user

2. **Provider Independence**
   - No provider calls another provider
   - Each provider works standalone
   - Easy to remove/add providers

3. **Generic Engine**
   - Router doesn't depend on specific providers
   - Adding new provider doesn't require engine changes
   - Just implement interface and register

4. **Configuration-Driven**
   - Priority/timeout in config, not hardcoded
   - Easy to tune without code changes
   - Environment-specific settings via .env

**Code Quality Standards:**
- ✅ Async/await for all async operations
- ✅ Consistent error handling
- ✅ Meaningful variable names
- ✅ Comments only for complex logic
- ✅ Structured logging
- ✅ No console.log (use logger)

---

## Quick Command Reference

```bash
# Run a single query
node cli.js "Your prompt here"

# Force specific provider
node cli.js "Your prompt" --model groq

# Interactive chat mode
node chat.js

# Check provider health
node cli.js --health

# Development with auto-reload
npm run dev

# View help
node cli.js --help
```

---

## Essential Patterns to Remember

1. **Consistency:** All providers implement same async interface
2. **Failures:** Always have fallback provider ready
3. **Logging:** Log provider selection, failures, and timing
4. **Config:** Use centralized config for all tuning
5. **Sessions:** Store conversation history for multi-turn
6. **CLI:** Use Commander.js for argument parsing
7. **Errors:** Catch, log, and return gracefully
8. **Independence:** Keep providers completely independent
