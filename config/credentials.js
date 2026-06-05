import "dotenv/config";

const REQUIRED_KEYS = {
  GEMINI_API_KEY: "Gemini",
  GROQ_API_KEY: "Groq",
  GITHUB_TOKEN: "Copilot",
  OPENAI_API_KEY: "OpenAI",
};

export function validateCredentials() {
  const missing = [];
  const status = {};

  for (const [key, label] of Object.entries(REQUIRED_KEYS)) {
    if (!process.env[key]) {
      missing.push(`${label} (${key})`);
      status[label] = { ok: false, reason: "Missing API Key" };
    } else {
      status[label] = { ok: true };
    }
  }

  if (missing.length > 0) {
    console.warn("\n[Warning] Missing credentials for:");
    missing.forEach(m => console.warn(` - ${m}`));
  }

  return status;
}

export const credentials = {
  gemini: process.env.GEMINI_API_KEY,
  groq: process.env.GROQ_API_KEY,
  github: process.env.GITHUB_TOKEN,
  openai: process.env.OPENAI_API_KEY,
  ollamaModel: process.env.OLLAMA_MODEL || "llama3", // Default if not set
};
