import Groq from "groq-sdk";

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY");
    }
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return client;
}

export async function groq(prompt, image = null, signal = null) {
  try {
    const groqClient = getClient();
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

    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: messageContent }
      ],
      temperature: 0.7
    }, { signal });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    return {
      provider: "groq",
      content
    };
  } catch (err) {
    if (err.name === "AbortError" || err.message === "AbortError") {
      throw err;
    }
    throw new Error(`Groq failed: ${err.message}`);
  }
}

export async function checkGroqHealth() {
  if (!process.env.GROQ_API_KEY) return { ok: false, reason: "Missing GROQ_API_KEY" };
  try {
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}
