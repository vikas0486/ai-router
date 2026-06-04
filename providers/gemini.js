import { execSync } from "child_process";

export function gemini(prompt) {
  if (process.env.MOCK === "true") {
    return `[mock-gemini] ${prompt}`;
  }
  return execSync(`gemini -p "${prompt}"`).toString();
}