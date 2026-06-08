export async function codex(prompt, image = null) {
  const apiKey = process.env.CODEX_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing CODEX_API_KEY or OPENAI_API_KEY");
  }

  if (image) {
    console.log("⚠️  Codex provider doesn't support images yet. Processing text only.");
  }

  const endpoint = process.env.CODEX_API_URL || "https://api.openai.com/v1/responses";
  const model = process.env.CODEX_MODEL || "gpt-5-codex";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input: prompt
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Codex API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const content = data.output_text ||
      data.output?.flatMap(item => item.content || [])
        .find(content => content.type === "output_text")?.text;

    if (!content) {
      throw new Error("Empty response from Codex");
    }

    return {
      provider: "codex",
      content
    };
  } catch (err) {
    throw new Error(`Codex failed: ${err.message}`);
  }
}

export function checkCodexHealth() {
  if (!process.env.CODEX_API_KEY && !process.env.OPENAI_API_KEY) {
    return { ok: false, reason: "Missing CODEX_API_KEY or OPENAI_API_KEY" };
  }

  return { ok: true };
}
