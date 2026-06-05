# 🎯 Interactive Chat CLI - Architecture & Design

## Overview

The Interactive Chat CLI is a seamless, production-ready chatbot interface built on top of the AI Router engine. It provides users with a Gemini-like experience while leveraging multiple LLM providers in the background—completely transparent to the user.

## Key Design Principles

### 1. **Transparency Over Complexity**
- Users type naturally without concern for which LLM responds
- No visible model switching or provider indirection
- Automatic failover is silent and seamless
- One unified, consistent experience

### 2. **Stateful Conversations**
- Full chat history is maintained across sessions
- Each message tracks timestamp and which model answered
- Users can review past conversations anytime
- Automatic persistence without user intervention

### 3. **Responsive Feedback**
- Real-time spinner/loading animation
- Color-coded output for visual hierarchy
- Clear command feedback
- Formatted responses with visual boundaries

### 4. **Developer-First Design**
- Clean, modular code structure
- Reusable architecture for other chat applications
- Easy to extend with new commands
- Well-documented for customization

## System Architecture

```
┌─────────────────────────────────────────────────┐
│       Interactive Chat CLI (chat.js)            │
│  ┌──────────────────────────────────────────┐  │
│  │  UI/Input Processing Layer               │  │
│  │  • Readline interface                     │  │
│  │  • Command parsing                        │  │
│  │  • Visual formatting                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│     AI Router Engine (router/engine.js)         │
│  ┌──────────────────────────────────────────┐  │
│  │  Routing Intelligence                     │  │
│  │  • Provider selection                     │  │
│  │  • Load balancing                         │  │
│  │  • Failover logic                         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   ┌─────────┐    ┌─────────┐    ┌──────────┐
   │ Gemini  │    │ Groq    │    │ OpenAI   │
   │ Provider│    │Provider │    │ Provider │
   └─────────┘    └─────────┘    └──────────┘
        ↓               ↓               ↓
   ┌──────────────────────────────────────────┐
   │    LLM API Responses                      │
   └──────────────────────────────────────────┘
                        ↑
   [Response flows back through router to UI]
```

## Core Components

### 1. **InteractiveChatApp Class**

The main application class manages:

```javascript
class InteractiveChatApp {
  // Properties
  history          // Chat history array
  rl               // Readline interface
  preferredModel   // User's selected model
  isRunning        // Session state

  // Key Methods
  init()           // Initialize app and validate credentials
  start()          // Start the interactive loop
  prompt()         // Display prompt and wait for input
  processInput()   // Parse user input/commands
  handleCommand()  // Execute slash commands
  sendMessage()    // Route to AI and display response
  loadHistory()    // Load from chat-history.json
  saveHistory()    // Save to chat-history.json
}
```

### 2. **Command System**

Extensible command architecture:

```javascript
// Commands
/clear    → history = []
/history  → displayHistory()
/model X  → preferredModel = X
/exit     → isRunning = false
```

Easy to add new commands:

```javascript
case "/stats":
  // Count tokens, providers used, response times
  displayStats();
  break;
```

### 3. **History Management**

Persistent JSON-based history:

```json
[
  {
    "user": "string",           // User's message
    "ai": "string",             // AI's response
    "timestamp": "ISO string",  // When it happened
    "model": "string"           // Which model answered
  }
]
```

Features:
- Auto-save after each message
- Respects MAX_HISTORY_LENGTH (50 messages)
- Survives app crashes (persisted to disk)
- Queryable and analyzable

### 4. **UI/UX Layer**

Built with modern CLI libraries:

- **chalk** - Color-coded terminal output
- **ora** - Elegant loading spinners
- **readline** - Native Node.js input handling

Visual elements:
- Welcome screen with feature list
- Model indicator showing current routing mode
- Colored output for different message types
- Response formatting with borders

## Data Flow

### Single Message Flow

```
1. User Types → "What is AI?"
2. Prompt reads input
3. processInput() validates
4. sendMessage() called with text
5. routeRequest() in router/engine.js
   ├─ Checks provider health
   ├─ Selects best provider
   └─ Executes API call
6. Response returned
7. Spinner updated to ✔ Success
8. Response displayed in green
9. History saved to file
10. Ready for next message
```

### History Persistence

```
User Message
    ↓
routeRequest() → AI Response
    ↓
this.history.push({...})
    ↓
saveHistory() → chat-history.json
    ↓
Survives restart ✓
```

## Command Extensions

### Adding New Commands

Example: Adding `/stats` command

```javascript
// In InteractiveChatApp.handleCommand()
case "/stats":
  console.log(`Total messages: ${this.history.length}`);
  
  // Count by model
  const byModel = {};
  this.history.forEach(entry => {
    byModel[entry.model] = (byModel[entry.model] || 0) + 1;
  });
  
  console.log("Messages by model:", byModel);
  break;
```

Example: Adding `/export` command

```javascript
case "/export":
  const markdown = this.history
    .map((h, i) => `### Message ${i+1}\n\n**You:** ${h.user}\n\n**AI:** ${h.ai}`)
    .join("\n\n---\n\n");
  fs.writeFileSync("chat-export.md", markdown);
  console.log("Exported to chat-export.md");
  break;
```

## Error Handling

Three levels of error handling:

### 1. Provider Level
- Handled by router/engine.js
- Automatic failover to next provider
- Silent to user unless all fail

### 2. App Level
- sendMessage() catches router errors
- Displays friendly error message
- Continues session running

### 3. System Level
- History saving errors logged but don't crash app
- Readline errors handled gracefully
- Process exits cleanly on fatal errors

## Performance Characteristics

- **Startup time:** ~100ms (credential validation)
- **First message latency:** ~5-15s (depends on provider API)
- **Subsequent messages:** ~1-10s (cached provider health)
- **History save time:** ~10-50ms (50 message limit)
- **Memory usage:** ~10-20MB (small history, light dependencies)

## Extensibility Points

### 1. Custom Prompt Formatting
```javascript
const modelIndicator = this.preferredModel
  ? chalk.yellow(`[${this.preferredModel}]`)
  : chalk.cyan("[auto]");
```

### 2. Response Processing
```javascript
// Before displaying, could:
// - Extract code blocks
// - Format tables
// - Add syntax highlighting
const response = await routeRequest(userMessage, this.preferredModel);
const processed = processResponse(response);
```

### 3. History Filtering
```javascript
// Get only messages from specific model
const groqHistory = this.history.filter(h => h.model === "groq");
```

### 4. Integration Hooks
```javascript
// Could emit events for integrations
this.emit('message-sent', { user: userMessage, model });
this.emit('response-received', { ai: response, model });
```

## Security Considerations

- ✅ Credentials loaded from .env (not hardcoded)
- ✅ History stored locally (not sent to third parties)
- ✅ Input validation (basic sanitization)
- ✅ No authentication (local-only tool)
- ⚠️ Chat history is plaintext (consider encryption if sensitive)

## Testing Strategy

### Manual Testing
```bash
# Basic chat flow
node chat.js
> Hello

# Command testing
> /model groq
> /history
> /clear

# Integration testing
> Multi-turn conversation
> Verify history persistence
> Check failover behavior
```

### Automated Testing
Could add:
```javascript
// test/chat.test.js
describe("InteractiveChatApp", () => {
  test("saves history on message", () => {...});
  test("clears history on /clear", () => {...});
  test("routes to model on /model", () => {...});
});
```

## Future Enhancements

1. **Multi-turn Context**
   - Send previous messages to model for better context
   - Implement conversation memory

2. **Advanced Commands**
   - `/export` - Export chat as Markdown/PDF
   - `/stats` - Show conversation statistics
   - `/search` - Search chat history
   - `/import` - Import previous chats

3. **UI Improvements**
   - Syntax highlighting for code blocks
   - Table formatting
   - Streaming responses (real-time token output)
   - Rich formatting (bold, italic, links)

4. **Performance**
   - Lazy-load history
   - Implement local caching
   - Add request debouncing

5. **Analytics**
   - Track response times per provider
   - Cost tracking
   - Usage patterns
   - Model performance metrics

6. **Persistence**
   - SQLite backend instead of JSON
   - Compression for large histories
   - Tagging/categorization of conversations

---

**Built with ❤️ for seamless multi-LLM experiences**
