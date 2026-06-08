import { execFileSync } from "child_process";

export async function copilot(prompt, image = null) {
  try {
    const env = { ...process.env };
    
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.startsWith("gh")) {
      env.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    } else {
      delete env.GITHUB_TOKEN;
    }

    if (image) {
      console.log("⚠️  Copilot CLI doesn't support images yet. Processing text only.");
    }

    const stdout = execFileSync(
      "copilot",
      ["-p", prompt, "--allow-all", "-s"],
      { env, encoding: "utf8" }
    ).trim();

    if (!stdout) {
      throw new Error("Empty response from Copilot");
    }

    // Critical: check for errors in stdout if copilot exits with 0
    validateCopilotResponse(stdout);

    return {
      provider: "copilot",
      content: stdout
    };
  } catch (err) {
    // If it's already an error from validateCopilotResponse, just rethrow
    if (err.message.includes("Copilot returned") || err.message.includes("quota")) {
      throw err;
    }
    throw new Error(`Copilot CLI failed: ${err.message}`);
  }
}

function validateCopilotResponse(response) {
  const trimmed = response.trim();
  
  // Status code patterns
  const statusMatch = trimmed.match(/^(?:HTTP\/\d(?:\.\d)?\s*)?([45]\d\d)\b/);
  if (statusMatch) {
    throw new Error(`Copilot returned HTTP ${statusMatch[1]}`);
  }

  // Common error keywords
  if (/(quota[_\s-]?exceeded|monthly quota|unauthorized|forbidden|auth(?:entication)? failure|timed?\s*out|timeout|rate limit)/i.test(trimmed)) {
    throw new Error(`Copilot returned error: ${trimmed.split('\n')[0]}`);
  }

  // JSON error patterns
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error) {
        throw new Error(parsed.error.message || parsed.error.code || "Copilot returned error");
      }
    } catch (err) {
      // Not JSON or parse error; ignore and treat as text
    }
  }
}

export function checkCopilotHealth() {
  try {
    execFileSync("copilot", ["--version"], { stdio: "ignore" });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "Copilot CLI not found" };
  }
}
