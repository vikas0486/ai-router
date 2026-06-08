import "dotenv/config";
import chalk from "chalk";
import { routeRequest } from "../router/engine.js";
import { providerRegistry } from "../providers/index.js";
import * as providersConfig from "../router/providers.config.js";

async function testFallback() {
  console.log(chalk.bold.cyan("\n🚀 Testing Automatic Fallback\n"));

  // 1. Mock providers order: copilot first, then gemini
  const originalProviders = [...providersConfig.providers];
  providersConfig.providers.length = 0;
  providersConfig.providers.push(
    { name: "copilot", enabled: true, priority: 1 },
    { name: "gemini", enabled: true, priority: 2 }
  );

  // 2. Mock Copilot to simulate quota exceeded
  const originalCopilot = providerRegistry.copilot;
  providerRegistry.copilot = async (prompt) => {
    console.log(chalk.yellow("[Mock] Simulating Copilot Quota Exceeded"));
    return {
      provider: "copilot",
      content: "402 quota_exceeded"
    };
  };

  // 3. Mock Gemini to succeed
  const originalGemini = providerRegistry.gemini;
  providerRegistry.gemini = async (prompt) => {
    console.log(chalk.green("[Mock] Gemini Success"));
    return {
      provider: "gemini",
      content: "This is a response from Gemini after fallback."
    };
  };

  try {
    console.log(chalk.white("Case: Copilot fails with quota_exceeded, should fallback to Gemini."));
    
    const response = await routeRequest("Test fallback");
    console.log(chalk.green("\nResult:"), response);
    
    if (response === "This is a response from Gemini after fallback.") {
      console.log(chalk.bold.green("\n✅ FALLBACK SUCCESSFUL\n"));
    } else {
      console.log(chalk.bold.red("\n❌ FALLBACK FAILED\n"));
    }
    
  } catch (err) {
    console.error(chalk.red("\nFallback test failed:"), err.message);
  } finally {
    // Restore originals
    providerRegistry.copilot = originalCopilot;
    providerRegistry.gemini = originalGemini;
    providersConfig.providers.length = 0;
    providersConfig.providers.push(...originalProviders);
  }
}

testFallback();
