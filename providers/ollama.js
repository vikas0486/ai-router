import { credentials } from "../config/credentials.js";

async function getAvailableModels() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (!res.ok) return [];
    const data = await res.json();
    return data.models ? data.models.map(m => m.name) : [];
  } catch (err) {
    console.error("[Ollama] Failed to fetch models:", err.message);
    return [];
  }
}

export async function ollama(prompt, image = null) {
  const availableModels = await getAvailableModels();
  
  // Priority: 1. ENV, 2. First available model, 3. fallback to llama3
  let model = process.env.OLLAMA_MODEL;
  
  if (!model && availableModels.length > 0) {
    model = availableModels[0];
  }
  
  if (!model) {
    model = "llama3"; // Last resort fallback
  }

  console.log(`[Ollama] Using model: ${model}`);
  
  if (image) {
    console.log("⚠️  Ollama doesn't support images yet. Processing text only.");
  }

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt,
        stream: false
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ollama API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    
    if (!data.response) {
      console.error("[Ollama] Unexpected response structure:", data);
      return "Error: Empty response from Ollama";
    }

    return data.response;
  } catch (err) {
    console.error("[Ollama] Request failed:", err.message);
    throw err;
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
