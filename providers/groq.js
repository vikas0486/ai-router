import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function groq(prompt, image = null) {
  const messageContent = [];
  
  // Add text content
  messageContent.push({
    type: "text",
    text: prompt
  });

  // Add image content if provided
  if (image) {
    messageContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.mimeType,
        data: image.data
      }
    });
  }

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: messageContent }
    ],
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

export async function checkGroqHealth() {
  if (!process.env.GROQ_API_KEY) return { ok: false, reason: "Missing GROQ_API_KEY" };
  try {
    // Basic check for API key presence
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}