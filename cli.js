import "dotenv/config";
import { routeRequest } from "./router/engine.js";

const args = process.argv.slice(2);

// optional: support flags like --model groq
let preferred = null;
let promptParts = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--model") {
    preferred = args[i + 1];
    i++;
  } else {
    promptParts.push(args[i]);
  }
}

const prompt = promptParts.join(" ");

if (!prompt) {
  console.log("Usage: node cli.js [--model groq] <prompt>");
  process.exit(1);
}

try {
  const response = await routeRequest(prompt, preferred);
  console.log("\n=== RESPONSE ===\n");
  console.log(response);
} catch (err) {
  console.error("\n[Router Error]", err.message);
}