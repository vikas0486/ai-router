import { execSync } from "child_process";

export function gemini(prompt, image = null) {
  if (process.env.MOCK === "true") {
    return `[mock-gemini] ${prompt}`;
  }
  if (image) {
    console.log("⚠️  Gemini CLI doesn't support images yet. Processing text only.");
  }
  return execSync(`gemini -p "${prompt}"`).toString();
}

export function checkGeminiHealth() {
  try {
    if (!process.env.GEMINI_API_KEY) return { ok: false, reason: "Missing GEMINI_API_KEY" };
    // Basic check if the command exists
    execSync("gemini --version", { stdio: "ignore" });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "Gemini CLI not found or failing" };
  }
}