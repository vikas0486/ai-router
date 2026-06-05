# 🚀 AI Router v1.1 — Multi-LLM Intelligent Routing System

A production-style **Multi-LLM routing engine** built in Node.js that dynamically selects and fails over between multiple AI providers like Gemini, Groq, Ollama, GitHub Copilot, and OpenAI.

This project demonstrates how modern AI applications can be designed as **resilient, cost-aware, and provider-agnostic systems** instead of relying on a single LLM.

---

## 🧠 Problem Statement

Most AI applications today depend on a single LLM provider:

- ❌ API rate limits break applications
- ❌ Model downtime causes failures
- ❌ Cost is not optimized
- ❌ No fallback mechanism exists

This project solves these issues using a **routing-based AI architecture**.

---

## 🏗️ Architecture

```mermaid
graph TD
    User([User]) --> CLI[CLI Layer]
    CLI --> Router{AI Router Engine}
    
    subgraph Providers
    Router --> Gemini[Gemini CLI]
    Router --> Groq[Groq API]
    Router --> Ollama[Ollama Local]
    Router --> Copilot[Copilot CLI]
    Router --> OpenAI[OpenAI API]
    end
    
    Gemini -.-> Fallback[Automatic Fallback]
    Groq -.-> Fallback
    Ollama -.-> Fallback
    Copilot -.-> Fallback
    
    Fallback --> Response([Response Returned])
```

---

## 🔥 Key Features

✔ **Multi-LLM Support:** Gemini, Groq, Ollama, GitHub Copilot, and OpenAI-ready.  
✔ **Automatic Fallback:** Intelligent retry and failover across providers in priority order.  
✔ **Health Check System:** Comprehensive diagnostic tool to verify provider status and credentials.  
✔ **Dynamic Model Detection:** Automatically discovers installed Ollama models.  
✔ **Centralized Credentials:** Secure and unified management of API keys and tokens via `.env`.  
✔ **Diagnostic Logging:** Persistent logs for tracking router decisions and provider performance.  

---

## 📦 Supported Providers

| Provider | Status | Role | Priority |
|----------|--------|------|----------|
| Gemini   | Active | Primary (High-quality reasoning) | 1 |
| Groq     | Active | Fast inference | 2 |
| Ollama   | Active | Local execution (Offline) | 3 |
| Copilot  | Active | Development & Coding | 4 |
| OpenAI   | Ready  | Optional / Future use | 5 |

---

## 💻 Installation

```bash
git clone https://github.com/vikas0486/ai-router.git
cd ai-router
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
GITHUB_TOKEN=your_github_token
OLLAMA_MODEL=deepseek-r1:8b # Optional: defaults to first available
```

---

## ▶️ Usage

### 1. Run a health check

Verify all providers are correctly configured and reachable:

```bash
node cli.js --health
```

### 2. Run a prompt

```bash
node cli.js "write a python factorial function"
```

### 3. Force a specific model

```bash
node cli.js --model ollama "What is the capital of France?"
```

### 4. 🎯 Interactive Chat Mode

Launch an interactive chat session with seamless multi-LLM routing:

```bash
node chat.js
```

**Features:**
- 💬 **Stateful Conversations** - Chat history is automatically saved
- 🔄 **Seamless Routing** - Switch between providers without friction
- 🎮 **Interactive Commands** - Use `/model`, `/history`, `/clear`, `/exit`
- 🎨 **Beautiful UI** - Color-coded output with loading spinners
- 💾 **Persistent Memory** - Last 50 messages survive restarts

**Example Session:**
```
[auto] You: What is machine learning?
Thinking...
✔ Response received

┌─ AI Response
│
│ Machine learning is a subset of artificial intelligence...
└

[auto] You: /model groq
✓ Model set to: groq

[groq] You: Explain neural networks
Thinking...
✔ Response received

┌─ AI Response
│
│ Neural networks are computational systems inspired by...
└

[groq] You: /history
[groq] You: /exit
Goodbye! 👋
```

For detailed documentation, see [CHAT_GUIDE.md](./CHAT_GUIDE.md) and [CHAT_ARCHITECTURE.md](./CHAT_ARCHITECTURE.md)

---

## 🧱 Project Structure

```
ai-router/
├── cli.js                  # CLI Entry point (single prompt)
├── chat.js                 # Interactive Chat CLI ✨ NEW
├── CHAT_GUIDE.md           # Chat user guide
├── CHAT_ARCHITECTURE.md    # Chat design documentation
├── config/
│   ├── credentials.js      # Credential loader & validator
│   └── models.json         # Model configurations
├── logs/                   # Diagnostic logs
├── providers/              # Provider implementations
│   ├── gemini.js
│   ├── groq.js
│   ├── ollama.js
│   ├── copilot.js
│   └── openai.js
├── router/                 # Core routing logic
│   ├── engine.js           # Fallback & routing engine
│   ├── logger.js           # Diagnostic logger
│   ├── provider.registry.js
│   └── providers.config.js
└── README.md
```

---

## 📄 License

MIT License — feel free to use and extend.

---

## ⭐ Author

Built as part of an AI Engineering learning journey focused on building **AI infrastructure, not just AI apps**.
