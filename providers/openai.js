export async function openai(prompt, image = null) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const content = `[OpenAI placeholder] ${prompt}${image ? " (with image)" : ""}`;

  return {
    provider: "openai",
    content
  };
}

export function checkOpenaiHealth() {
  if (!process.env.OPENAI_API_KEY) return { ok: false, reason: "Missing OPENAI_API_KEY" };
  return { ok: true };
}
