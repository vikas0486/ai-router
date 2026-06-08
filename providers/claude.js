import { execFileSync } from "child_process";

export async function claude(prompt, image = null) {
  try {
    if (image) {
      console.log("⚠️  Claude Code doesn't support images via CLI yet. Processing text only.");
    }

    // Claude Code doesn't have a direct -p flag like gemini, 
    // it usually runs as an interactive shell or via `claude-code` command
    // However, for routing purpose, we might want to use Bedrock or Anthropic API if available
    // But Task 9 says "Claude Code provider" and "Read from .env"
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY or CLAUDE_API_KEY");
    }

    // Assuming we use Anthropic SDK or Fetch to Anthropic API
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Claude API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const content = data.content[0].text;

    if (!content) {
      throw new Error("Empty response from Claude");
    }

    return {
      provider: "claude",
      content
    };
  } catch (err) {
    throw new Error(`Claude failed: ${err.message}`);
  }
}

export function checkClaudeHealth() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
    return { ok: false, reason: "Missing ANTHROPIC_API_KEY or CLAUDE_API_KEY" };
  }
  return { ok: true };
}
