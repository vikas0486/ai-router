import { providers } from "./providers.config.js";
import { providerRegistry } from "./provider.registry.js";
import { checkGeminiHealth } from "../providers/gemini.js";
import { checkGroqHealth } from "../providers/groq.js";
import { checkOllamaHealth } from "../providers/ollama.js";
import { checkCopilotHealth } from "../providers/copilot.js";
import { checkOpenaiHealth } from "../providers/openai.js";
import { log } from "./logger.js";

const healthChecks = {
  gemini: checkGeminiHealth,
  groq: checkGroqHealth,
  ollama: checkOllamaHealth,
  copilot: checkCopilotHealth,
  openai: checkOpenaiHealth
};

export async function performHealthCheck() {
  const results = {};
  for (const p of providers) {
    if (healthChecks[p.name]) {
      try {
        results[p.name] = await healthChecks[p.name]();
      } catch (err) {
        results[p.name] = { ok: false, reason: err.message };
      }
    } else {
      results[p.name] = { ok: false, reason: "No health check implemented" };
    }
  }
  return results;
}

export async function routeRequest(prompt, preferred = null, image = null) {

  // 1. Forced model
  if (preferred) {
    log(`Forced model: ${preferred}`);
    return runProvider(preferred, prompt, image);
  }

  // 2. Sort enabled providers
  const active = providers
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  // 3. fallback chain
  for (const p of active) {
    const fn = providerRegistry[p.name];

    if (!fn) {
      log(`Missing provider implementation: ${p.name}`);
      continue;
    }

    try {
      log(`Trying ${p.name}`);
      const res = await fn(prompt, image);
      log(`${p.name} Success`);
      return res;
    } catch (err) {
      log(`${p.name} Failed: ${err.message}`);
    }
  }

  log("All providers failed");
  throw new Error("All providers failed");
}

// helper
async function runProvider(name, prompt, image) {
  const fn = providerRegistry[name];
  if (!fn) throw new Error("Unknown provider: " + name);

  return fn(prompt, image);
}