export async function openai(prompt, image = null) {
  return `[OpenAI placeholder] ${prompt}${image ? " (with image)" : ""}`;
}

export function checkOpenaiHealth() {
  if (!process.env.OPENAI_API_KEY) return { ok: false, reason: "Missing OPENAI_API_KEY" };
  return { ok: true };
}
