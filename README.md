# 🚀 AI Router v1 — Multi-LLM Intelligent Routing System

A production-style **Multi-LLM routing engine** built in Node.js that dynamically selects and fails over between multiple AI providers like Gemini, Groq, Ollama, and OpenAI.

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

## ⚙️ Solution — AI Router

Instead of calling one model directly:

```

User → Single LLM (fragile ❌)

```

We introduce a routing layer:

```

User → AI Router → Best Available LLM → Response

```

---

## 🏗️ Architecture

```

```
        CLI / API Layer
               │
               ▼
    ┌─────────────────────┐
    │   AI Router Engine  │
    └─────────────────────┘
      │        │        │
      ▼        ▼        ▼
  Gemini     Groq     Ollama
    │        │          │
    └────────┴──────────┘
             ▼
      Response Returned
```

````

---

## 🔥 Key Features

✔ Multi-LLM support (Gemini, Groq, Ollama, OpenAI-ready)  
✔ Automatic fallback system  
✔ CLI-based execution  
✔ Provider abstraction layer  
✔ Fault-tolerant architecture  
✔ Real-world quota handling (Gemini limit tested)  

---

## 📦 Supported Providers

| Provider | Status | Role |
|----------|--------|------|
| Gemini   | Primary (rate-limited) | High-quality reasoning |
| Groq     | Active fallback | Fast inference |
| Ollama   | Local fallback | Offline execution |
| OpenAI   | Optional | Placeholder / future use |

---

## 🚀 How It Works

1. User sends a prompt via CLI
2. Router selects preferred model (or default chain)
3. If failure occurs → automatically fallback
4. First successful model response is returned

---

## 💻 Installation

```bash
git clone https://github.com/<your-username>/ai-router.git
cd ai-router
npm install
````

---

## ▶️ Usage

### Run a prompt

```bash
node cli.js "write a python factorial function"
```

### Expected output

```
[Router] Trying gemini
[Router] gemini failed → fallback
[Router] Trying groq

=== RESPONSE ===
<AI generated output>
```

---

## 🔁 Routing Logic (Core Concept)

```js
for (const provider of providers) {
  try {
    return await provider.fn(prompt);
  } catch (err) {
    console.log(`[Router] ${provider.name} failed → fallback`);
  }
}
```

---

## 🧪 Real-World Scenario Tested

* Gemini quota exhausted ❌
* Automatic fallback triggered
* Groq responded successfully ✅
* System continued without failure

This proves **resilient AI architecture works in practice**.

---

## 🧱 Project Structure

```
ai-router/
│
├── cli.js
├── router/
│   ├── engine.js
│   ├── providers.config.js
│
├── providers/
│   ├── gemini.js
│   ├── groq.js
│   ├── ollama.js
│   ├── openai.js
│
├── tests/
└── README.md
```

---

## 🔮 Future Roadmap (v2 → v3)

### v2 — Smart Routing

* Cost-aware model selection
* Prompt complexity classification
* Latency-based routing
* Response normalization

### v3 — Enterprise AI Gateway

* API gateway layer
* Redis caching
* Usage tracking
* Multi-tenant support
* Kubernetes deployment

---

## 🧠 Key Insight

> “Modern AI systems should not depend on a single model — they should depend on a routing layer.”

This project is a step toward building **AI infrastructure, not just AI apps**.

---

## 📄 License

MIT License — feel free to use and extend.

---

## ⭐ Author

Built as part of an AI Engineering learning journey focused on:

* Multi-LLM systems
* AI infrastructure design
* Production-grade routing patterns

````