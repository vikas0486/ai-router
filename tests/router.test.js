import fs from "fs";
import os from "os";
import path from "path";
import { routeRequest } from "../router/engine.js";
import { providers } from "../router/providers.config.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log("✔", message);
}

function writeExecutable(filePath, contents) {
  fs.writeFileSync(filePath, contents, { mode: 0o755 });
}

async function withFakeProviderPath(testFn) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-router-test-"));
  const originalPath = process.env.PATH;
  const originalOpenaiKey = process.env.OPENAI_API_KEY;
  const originalCodexUrl = process.env.CODEX_API_URL;
  const originalCodexKey = process.env.CODEX_API_KEY;
  const originalGroqKey = process.env.GROQ_API_KEY;
  const logFile = path.join(process.cwd(), "logs", "router.log");
  const originalLog = fs.existsSync(logFile)
    ? fs.readFileSync(logFile, "utf8")
    : null;

  writeExecutable(
    path.join(tempDir, "copilot"),
    `#!/usr/bin/env node
if (process.argv.includes("--version")) {
  console.log("fake-copilot");
  process.exit(0);
}
console.error("fake copilot failure");
process.exit(42);
`
  );

  writeExecutable(
    path.join(tempDir, "gemini"),
    `#!/usr/bin/env node
if (process.argv.includes("--version")) {
  console.log("fake-gemini");
  process.exit(0);
}
const promptIndex = process.argv.indexOf("-p") + 1;
console.log("gemini received: " + process.argv[promptIndex]);
`
  );

  process.env.PATH = `${tempDir}${path.delimiter}${originalPath}`;

  try {
    await testFn();
  } finally {
    process.env.PATH = originalPath;
    restoreEnv("OPENAI_API_KEY", originalOpenaiKey);
    restoreEnv("CODEX_API_URL", originalCodexUrl);
    restoreEnv("CODEX_API_KEY", originalCodexKey);
    restoreEnv("GROQ_API_KEY", originalGroqKey);
    if (originalLog === null) {
      fs.rmSync(logFile, { force: true });
    } else {
      fs.writeFileSync(logFile, originalLog);
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

async function testRouter() {
  console.log("\n=== AI ROUTER TEST SUITE ===\n");

  const order = [...providers]
    .filter(provider => provider.enabled)
    .sort((a, b) => a.priority - b.priority)
    .map(provider => provider.name);

  assert(
    order.join(" → ") === "gemini → codex → copilot → groq → openai → ollama",
    "Provider order is gemini → codex → copilot → groq → openai → ollama"
  );

  await withFakeProviderPath(async () => {
    const prompt = `fallback prompt with "quotes" and $SHELL`;
    const response = await routeRequest(prompt);

    assert(
      response.trim() === `gemini received: ${prompt}`,
      "Gemini provider preserves shell-sensitive prompt text"
    );
  });

  await withFakeProviderPath(async () => {
    writeExecutable(
      path.join(process.env.PATH.split(path.delimiter)[0], "gemini"),
      `#!/usr/bin/env node
if (process.argv.includes("--version")) {
  console.log("fake-gemini");
  process.exit(0);
}
process.exit(0);
`
    );

    writeExecutable(
      path.join(process.env.PATH.split(path.delimiter)[0], "copilot"),
      `#!/usr/bin/env node
if (process.argv.includes("--version")) {
  console.log("fake-copilot");
  process.exit(0);
}
console.log('402 {"error":{"message":"You have exceeded your monthly quota","code":"quota_exceeded"}}');
process.exit(0);
`
    );

    process.env.CODEX_API_KEY = "test-codex-key";
    process.env.CODEX_API_URL = "http://127.0.0.1:9/v1/responses";
    delete process.env.GROQ_API_KEY;
    process.env.OPENAI_API_KEY = "test-openai-key";

    const response = await routeRequest("hello");

    assert(
      response === "[OpenAI placeholder] hello",
      "Quota-like Copilot output is failure and the chain continues"
    );
  });

  console.log("\n=== ALL TESTS PASSED ===\n");
}

testRouter().catch(err => {
  console.error("\n✗ TEST FAILED:", err.message);
  process.exit(1);
});
