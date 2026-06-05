#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import { routeRequest, performHealthCheck } from "./router/engine.js";
import { validateCredentials } from "./config/credentials.js";

const args = process.argv.slice(2);

if (args.includes("--health")) {
  console.log("Starting Health Check...\n");
  const results = await performHealthCheck();
  
  for (const [name, status] of Object.entries(results)) {
    const dotCount = 15 - name.length;
    const dots = ".".repeat(dotCount > 0 ? dotCount : 1);
    const statusText = status.ok ? "OK" : "FAIL";
    const reason = status.reason ? ` (Reason: ${status.reason})` : "";
    console.log(`${name.charAt(0).toUpperCase() + name.slice(1)} ${dots} ${statusText}${reason}`);
  }
  process.exit(0);
}

// Initialize and validate credentials on startup
validateCredentials();

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

let prompt = promptParts.join(" ");

// If argument is a file, load file contents
if (prompt && fs.existsSync(prompt)) {
  prompt = fs.readFileSync(prompt, "utf8");
}

if (!prompt) {
  console.log(
    "Usage: node cli.js [--model groq] [--health] <prompt | prompt.md>"
  );
  process.exit(1);
}

try {
  const response = await routeRequest(prompt, preferred);

  console.log("\n=== RESPONSE ===\n");
  console.log(response);
} catch (err) {
  console.error("\n[Router Error]", err.message);
}
