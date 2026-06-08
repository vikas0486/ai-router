import { credentials } from "../config/credentials.js";

async function getAvailableModels() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (!res.ok) return [];
    const data = await res.json();
    return data.models ? data.models.map(m => m.name) : [];
  } catch (err) {
    return [];
  }
}

export async function ollama(prompt, image = null, signal = null) {
  try {
    const availableModels = await getAvailableModels();
    let model = process.env.OLLAMA_MODEL;
    
    if (!model && availableModels.length > 0) {
      model = availableModels[0];
    }
    
    if (!model) {
      model = "llama3";
    }

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt,
        stream: false
      }),
      signal
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ollama API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    
    if (!data.response) {
      throw new Error("Empty response from Ollama API");
    }

    return {
      provider: "ollama",
      model: model,
      content: data.response
    };
  } catch (err) {
    if (err.name === "AbortError" || err.message === "AbortError") {
      throw err;
    }
    throw new Error(`Ollama failed: ${err.message}`);
  }
}

export async function checkOllamaHealth() {
  try {
    const models = await getAvailableModels();
    if (models.length > 0) {
      return { ok: true, details: `Models: ${models.join(", ")}` };
    }
    return { ok: false, reason: "No models found" };
  } catch (err) {
    return { ok: false, reason: "Connection failed" };
  }
}
