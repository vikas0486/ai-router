import { execSync } from "child_process";
import { credentials } from "../config/credentials.js";

export async function copilot(prompt, image = null) {
  try {
    const cmd = `copilot -p "${prompt.replace(/"/g, '\\"')}" --allow-all -s`;
    const env = { ...process.env };
    
    // Only inject GITHUB_TOKEN if it looks like a valid token (starts with 'gh' or 'github_')
    // This allows the system's native 'gh' auth to take precedence if .env is missing/invalid
    if (credentials.github && credentials.github.startsWith("gh")) {
      env.GITHUB_TOKEN = credentials.github;
    } else {
      // Delete it from env if it's invalid to prevent it from overriding system auth
      delete env.GITHUB_TOKEN;
    }

    if (image) {
      console.log("⚠️  Copilot CLI doesn't support images yet. Processing text only.");
    }

    const response = execSync(cmd, { env, encoding: "utf8" });
    return response.trim();
  } catch (err) {
    console.error("[Copilot] Error:", err.message);
    throw new Error(`Copilot CLI failed: ${err.message}`);
  }
}

export function checkCopilotHealth() {
  try {
    // A better health check actually tries to verify auth
    execSync("copilot --version", { stdio: "ignore" });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "Copilot CLI not found" };
  }
}
