export function decideModel(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes("code") || p.includes("api")) return "openai";

  if (p.includes("local") || p.includes("offline")) return "ollama";

  if (p.includes("fast")) return "gemini";

  return "gemini";
}