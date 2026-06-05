# 🤖 Interactive Chat CLI Guide

Welcome to the **AI Router Interactive Chat**! A seamless multi-LLM chat interface where you can chat with multiple AI providers without even knowing which one you're using.

## 🚀 Quick Start

```bash
node chat.js
```

That's it! You're now in the interactive chat session.

## 💬 Features

### 1. **Seamless Multi-LLM Routing**
   - No need to specify which LLM to use
   - The router automatically selects the best available provider
   - Automatic failover if one provider is unavailable
   - User experience remains consistent throughout

### 2. **Interactive Commands**
   - **`/clear`** - Clear all chat history
   - **`/history`** - View all previous messages in this session
   - **`/model <name>`** - Switch to a specific model (e.g., `/model groq`)
   - **`/image <path>`** - Attach an image file to your next message (supports PNG, JPG, GIF, WebP)
   - **`/exit`** - Exit the chat

### 3. **Image Support** 🖼️
   - Attach images to your messages using `/image <path>`
   - Supported formats: PNG, JPG, JPEG, GIF, WebP
   - Image is automatically converted to base64 and sent with your next message
   - Only works with providers that support vision (currently Groq supports images)
   - Image is automatically cleared after sending

### 4. **Persistent Chat History**
   - Conversations are automatically saved to `chat-history.json`
   - Last 50 messages are retained
   - View history anytime with `/history`
   - History survives across sessions
   - Image attachments are tracked in history

### 5. **Visual Feedback**
   - **Spinner animation** while waiting for responses
   - **Color-coded output** for easy reading
   - **Model indicator** showing if auto-routing or using specific model
   - **Image indicator** (🖼️) showing when an image is attached
   - **Formatted responses** with clear visual boundaries

## 📋 Usage Examples

### Basic Chat
```
[auto] You: What is machine learning?
Thinking...
✔ Response received

┌─ AI Response
│
│ Machine learning is a branch of artificial intelligence...
└

[auto] You:
```

### Attach and Send Image
```
[auto] You: /image /path/to/screenshot.png
✓ Image attached: screenshot.png (image/png)

[auto] 🖼️ You: What's in this image?
Thinking...
✔ Response received

┌─ AI Response
│
│ This appears to be a screenshot showing...
└

[auto] You:
```

### Switch to Specific Model
```
[auto] You: /model groq
✓ Model set to: groq

[groq] You: Explain quantum computing briefly
Thinking...
✔ Response received

┌─ AI Response
│
│ Quantum computing harnesses quantum mechanics...
└

[groq] You:
```

### View Chat History
```
[auto] You: /history

📜 Chat History:
────────────────────────────────────────────────────────
[1] You: What is machine learning?
AI: Machine learning is a branch of artificial intelligence...
────────────────────────────────────────────────────────
[2] You: What's in this image?
AI: This appears to be a screenshot showing...
────────────────────────────────────────────────────────

[auto] You:
```

### Clear History
```
[auto] You: /clear
✓ Chat history cleared

[auto] You:
```

## 🔧 Architecture

### How Multi-LLM Routing Works

The chat app uses the **AI Router Engine** to:

1. **Receive your message** - You type normally
2. **Route intelligently** - Router picks best provider based on:
   - Provider availability (health checks)
   - Configured priorities
   - Fallback preferences
3. **Get response** - Single unified response from any provider
4. **Display seamlessly** - You never know (or care) which provider responded

```
User Input
    ↓
[Interactive Chat CLI]
    ↓
[AI Router Engine]
    ├─ Gemini ✓ (available)
    ├─ Groq ✓ (available)
    ├─ OpenAI ✗ (unavailable)
    └─ Ollama ? (fallback)
    ↓
[Selected Provider]
    ↓
[Unified Response Display]
```

## 📁 Files

- **`chat.js`** - Main interactive chat application
- **`chat-history.json`** - Auto-saved chat history (created on first run)
- **`router/engine.js`** - Core routing logic
- **`config/credentials.js`** - Provider credential management

## ⚙️ Configuration

The chat uses the same configuration as the main AI Router:

- Credentials are read from `.env` file
- Provider priorities are configured in `router/providers.config.js`
- Models are defined in `config/models.json`

No additional configuration needed for the chat!

## 🎨 Color Scheme

- 🔵 **Blue** - Your messages
- 🟢 **Green** - AI responses and success messages
- 🟡 **Yellow** - Model indicators and commands
- 🔴 **Red** - Errors
- 🔷 **Cyan** - Status messages and welcome screen

## 📊 Chat History Structure

```json
[
  {
    "user": "What is AI?",
    "ai": "Artificial Intelligence is...",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "model": "auto",
    "hasImage": false
  },
  {
    "user": "What's in this screenshot?",
    "ai": "This screenshot shows...",
    "timestamp": "2024-01-15T10:31:00.000Z",
    "model": "groq",
    "hasImage": true
  }
]
```

## 🛠️ Troubleshooting

### Issue: "No providers available"
**Solution:** Check your `.env` file and ensure at least one provider is configured with valid credentials.

### Issue: Response takes too long
**Solution:** The router is trying multiple providers. Check provider health with:
```bash
node cli.js --health
```

### Issue: Chat history not saving
**Solution:** Ensure the directory has write permissions and disk space is available.

## 🚀 Advanced Usage

### Using with npm
If installed globally:
```bash
ai-chat
```

### Programmatic Access
You can also use the chat in your own code:

```javascript
import { InteractiveChatApp } from "./chat.js";
const app = new InteractiveChatApp();
app.start();
```

## 🎯 Perfect For

- ✅ Exploring different AI models interactively
- ✅ Testing multi-LLM failover in real-time
- ✅ Prototyping conversational AI features
- ✅ Learning about prompt engineering
- ✅ Comparing AI provider responses seamlessly

---

**Happy chatting! 🚀**
