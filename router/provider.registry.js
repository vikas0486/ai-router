import { gemini } from "../providers/gemini.js";
import { openai } from "../providers/openai.js";
import { ollama } from "../providers/ollama.js";
import { groq } from "../providers/groq.js";

export const providerRegistry = {
  gemini,
  openai,
  ollama,
  groq
};