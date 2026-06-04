import { providers } from "./providers.config.js";
import { providerRegistry } from "./provider.registry.js";

export async function routeRequest(prompt, preferred = null) {

  // 1. Forced model
  if (preferred) {
    return runProvider(preferred, prompt);
  }

  // 2. Sort enabled providers
  const active = providers
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  // 3. fallback chain
  for (const p of active) {
    const fn = providerRegistry[p.name];

    if (!fn) {
      console.log(`[Router] Missing provider: ${p.name}`);
      continue;
    }

    try {
      console.log(`[Router] Trying ${p.name}`);
      return await fn(prompt);
    } catch (err) {
      console.log(`[Router] ${p.name} failed → fallback`);
    }
  }

  throw new Error("All providers failed");
}

// helper
async function runProvider(name, prompt) {
  const fn = providerRegistry[name];
  if (!fn) throw new Error("Unknown provider: " + name);

  return fn(prompt);
}