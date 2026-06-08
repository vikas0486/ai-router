import { gemini } from "./gemini.js";
import { openai } from "./openai.js";
import { ollama } from "./ollama.js";
import { groq } from "./groq.js";
import { copilot } from "./copilot.js";
import { codex } from "./codex.js";
import { claude } from "./claude.js";

export const providerRegistry = {
  gemini,
  codex,
  openai,
  ollama,
  groq,
  copilot,
  claude
};

export async function checkProviderHealth(name) {
  const healthChecks = {
    gemini: (await import("./gemini.js")).checkGeminiHealth,
    codex: (await import("./codex.js")).checkCodexHealth,
    openai: (await import("./openai.js")).checkOpenaiHealth,
    ollama: (await import("./ollama.js")).checkOllamaHealth,
    groq: (await import("./groq.js")).checkGroqHealth,
    copilot: (await import("./copilot.js")).checkCopilotHealth,
    claude: (await import("./claude.js")).checkClaudeHealth
  };

  const fn = healthChecks[name];
  if (!fn) return { ok: false, reason: "No health check implemented" };
  
  try {
    return await fn();
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}
