import "dotenv/config";
import chalk from "chalk";
import { routeRequest } from "../router/engine.js";
import { providers } from "../router/providers.config.js";

async function runSmokeTest() {
  console.log(chalk.bold.cyan("\n🚀 Starting Router Smoke Test\n"));

  for (const provider of providers) {
    if (!provider.enabled) continue;

    console.log(chalk.white(`Testing Provider: ${chalk.bold(provider.name)}`));
    
    try {
      // Force each provider one by one
      const response = await routeRequest("Say hello!", provider.name);
      console.log(chalk.green(`✓ ${provider.name} Success`));
      console.log(chalk.gray(`  Response: ${response.substring(0, 50)}...`));
    } catch (err) {
      console.log(chalk.red(`✗ ${provider.name} Failed: ${err.message}`));
    }
    console.log();
  }
}

runSmokeTest();
