import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function gemini(prompt, image = null, signal = null) {
  if (process.env.MOCK === "true") {
    return {
      provider: "gemini",
      content: `[mock-gemini] ${prompt}`
    };
  }
  
  if (image) {
    // console.log("⚠️ Gemini CLI doesn't support images yet. Processing text only.");
  }

  return new Promise((resolve, reject) => {
    const child = execFile("gemini", ["-p", prompt], (error, stdout, stderr) => {
      if (error) {
        if (signal?.aborted) {
          return reject(new Error("AbortError"));
        }
        return reject(new Error(`Gemini failed: ${error.message}`));
      }
      
      const content = stdout.trim();
      if (!content) {
        return reject(new Error("Empty response from Gemini"));
      }

      resolve({
        provider: "gemini",
        content
      });
    });

    if (signal) {
      signal.addEventListener("abort", () => {
        child.kill();
        reject(new Error("AbortError"));
      });
    }
  });
}

export function checkGeminiHealth() {
  try {
    if (!process.env.GEMINI_API_KEY) return { ok: false, reason: "Missing GEMINI_API_KEY" };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "Gemini CLI not found or failing" };
  }
}
