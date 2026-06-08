import { providers } from "./providers.config.js";
import { providerRegistry } from "./provider.registry.js";
import { checkProviderHealth } from "../providers/index.js";
import { log } from "./logger.js";

export async function performHealthCheck() {
  const results = {};
  for (const p of providers) {
    try {
      results[p.name] = await checkProviderHealth(p.name);
    } catch (err) {
      results[p.name] = { ok: false, reason: err.message };
    }
  }
  return results;
}

export async function routeRequest(prompt, preferred = null, image = null, signal = null) {
  // 1. Forced model
  if (preferred) {
    log(`Forced model: ${preferred}`);
    if (signal?.aborted) throw new Error("AbortError");
    const response = await runProvider(preferred, prompt, image, signal);
    return validateAndNormalize(response);
  }

  // 2. Sort enabled providers
  const active = providers
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  // 3. fallback chain
  for (const p of active) {
    if (signal?.aborted) throw new Error("AbortError");
    
    const fn = providerRegistry[p.name];

    if (!fn) {
      log(`Missing provider implementation: ${p.name}`);
      continue;
    }

    try {
      log(`Trying ${p.name}`);
      const res = await fn(prompt, image, signal);
      const content = validateAndNormalize(res);
      log(`${p.name} Success`);
      return content;
    } catch (err) {
      if (err.name === "AbortError" || err.message === "AbortError") {
        throw err;
      }
      log(`${p.name} failed: ${err.message} → fallback`);
    }
  }

  log("All providers failed");
  throw new Error("All providers failed");
}

// helper
async function runProvider(name, prompt, image, signal) {
  const fn = providerRegistry[name];
  if (!fn) throw new Error("Unknown provider: " + name);

  return fn(prompt, image, signal);
}

function validateAndNormalize(response) {
  if (!response) {
    throw new Error("Empty provider response object");
  }

  const { provider, content } = response;

  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new Error(`Empty content from provider: ${provider || 'unknown'}`);
  }

  const trimmed = content.trim();

  // Status code patterns (if provider leaked it into content)
  const statusMatch = trimmed.match(/^(?:HTTP\/\d(?:\.\d)?\s*)?([45]\d\d)\b/);
  if (statusMatch) {
    throw new Error(`Provider returned HTTP ${statusMatch[1]}`);
  }

  // Common error keywords
  if (/(quota[_\s-]?exceeded|monthly quota|unauthorized|forbidden|auth(?:entication)? failure|timed?\s*out|timeout|rate limit)/i.test(trimmed)) {
    throw new Error(`Provider returned error response: ${trimmed.split('\n')[0]}`);
  }

  // JSON error patterns
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error) {
        throw new Error(parsed.error.message || parsed.error.code || "Provider returned error");
      }
    } catch (err) {
      // Not JSON; ignore
    }
  }

  return trimmed;
}
