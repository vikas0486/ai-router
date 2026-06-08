import "dotenv/config";
import chalk from "chalk";
import { performHealthCheck } from "../router/engine.js";

async function runHealthCheck() {
  console.log(chalk.bold.cyan("\n🚀 Starting Provider Health Validation\n"));
  
  try {
    const results = await performHealthCheck();
    
    let allPassed = true;
    
    console.log(chalk.gray("".padEnd(50, "-")));
    console.log(
      chalk.white("PROVIDER".padEnd(15)) + 
      chalk.white("STATUS".padEnd(10)) + 
      chalk.white("REASON/DETAILS")
    );
    console.log(chalk.gray("".padEnd(50, "-")));

    for (const [name, result] of Object.entries(results)) {
      const status = result.ok ? chalk.green("PASS") : chalk.red("FAIL");
      const details = result.ok 
        ? chalk.gray(result.details || "Ready") 
        : chalk.yellow(result.reason || "Unknown error");
      
      console.log(
        chalk.cyan(name.padEnd(15)) + 
        status.padEnd(19) + // accounting for chalk codes
        details
      );
      
      if (!result.ok) allPassed = false;
    }
    
    console.log(chalk.gray("".padEnd(50, "-")));
    
    if (allPassed) {
      console.log(chalk.bold.green("\n✅ ALL PROVIDERS READY\n"));
    } else {
      console.log(chalk.bold.yellow("\n⚠️ SOME PROVIDERS FAILED\n"));
    }
    
  } catch (err) {
    console.error(chalk.red("\n❌ Health check failed to run:"), err.message);
    process.exit(1);
  }
}

runHealthCheck();
