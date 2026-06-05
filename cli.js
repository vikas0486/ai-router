#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { routeRequest, performHealthCheck } from "./router/engine.js";
import { validateCredentials } from "./config/credentials.js";
import { providers } from "./router/providers.config.js";
import { formatters, timing } from "./utils/formatter.js";

const program = new Command();

program
  .name("forge-cli")
  .description("🚀 AI Router - Multi-LLM intelligent routing system")
  .version("1.1.0");

// Main query command
program
  .command("query [prompt]", { isDefault: true })
  .alias("q")
  .description("Send a prompt to the AI router")
  .option("-m, --model <name>", "Force specific model (gemini, groq, ollama, copilot, openai)")
  .option("-f, --file <path>", "Read prompt from file")
  .option("--json", "Output as JSON")
  .option("--time", "Show response time")
  .action(async (prompt, options) => {
    try {
      let finalPrompt = prompt;

      if (options.file) {
        if (!fs.existsSync(options.file)) {
          console.error(chalk.red(`✗ File not found: ${options.file}`));
          process.exit(1);
        }
        finalPrompt = fs.readFileSync(options.file, "utf8");
      }

      if (!finalPrompt || finalPrompt.trim() === "") {
        console.error(chalk.red("✗ No prompt provided"));
        program.help();
        process.exit(1);
      }

      const startTime = timing.start();
      const spinner = ora({
        text: chalk.cyan("Routing to AI provider..."),
        spinner: "dots"
      }).start();

      try {
        const response = await routeRequest(finalPrompt, options.model || null);
        spinner.succeed(chalk.green("Response received"));

        if (options.json) {
          console.log(JSON.stringify({ response, time: timing.elapsed(startTime) }, null, 2));
        } else {
          console.log("\n" + chalk.gray("─".repeat(60)));
          console.log(response);
          console.log(chalk.gray("─".repeat(60)));
          if (options.time) {
            console.log(chalk.gray(`\nResponse time: ${timing.elapsed(startTime)}`));
          }
          console.log("");
        }
      } catch (error) {
        spinner.fail(chalk.red("Request failed"));
        throw error;
      }
    } catch (err) {
      console.error(chalk.red(`\n✗ Error: ${err.message}`));
      process.exit(1);
    }
  });

// Health check command
program
  .command("health")
  .alias("h")
  .description("Check health status of all configured providers")
  .option("--json", "Output as JSON")
  .option("--strict", "Exit with error if any provider fails")
  .action(async (options) => {
    const spinner = ora({
      text: chalk.cyan("Running health checks..."),
      spinner: "dots"
    }).start();

    try {
      const results = await performHealthCheck();
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        process.exit(Object.values(results).every(r => r.ok) ? 0 : 1);
      }

      formatters.header("Provider Health Status");
      
      let allHealthy = true;
      for (const [name, status] of Object.entries(results)) {
        const icon = status.ok ? chalk.green("✓") : chalk.red("✗");
        const statusText = status.ok ? chalk.green("OK") : chalk.red("FAIL");
        const reason = status.reason ? chalk.gray(` (${status.reason})`) : "";
        const displayName = chalk.cyan(name.padEnd(10));
        console.log(`${icon} ${displayName} ${statusText}${reason}`);
        if (!status.ok) allHealthy = false;
      }
      console.log("");

      if (options.strict && !allHealthy) {
        console.error(chalk.yellow("⚠ Some providers are not healthy"));
        process.exit(1);
      }
    } catch (err) {
      spinner.fail(chalk.red("Health check failed"));
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// List providers command
program
  .command("list")
  .alias("ls")
  .description("List all configured AI providers")
  .option("--enabled", "Show only enabled providers")
  .option("--disabled", "Show only disabled providers")
  .option("--json", "Output as JSON")
  .action((options) => {
    let filtered = [...providers];
    
    if (options.enabled) filtered = filtered.filter(p => p.enabled);
    if (options.disabled) filtered = filtered.filter(p => !p.enabled);

    if (options.json) {
      console.log(JSON.stringify(filtered, null, 2));
      return;
    }

    formatters.header("Available Providers");
    filtered.forEach((provider) => {
      const status = provider.enabled ? chalk.green("enabled") : chalk.gray("disabled");
      const icon = provider.enabled ? "✓" : "○";
      console.log(
        `${chalk.cyan(icon)} ${chalk.white(provider.name.padEnd(12))} ` +
        `Priority: ${chalk.yellow(provider.priority)} [${status}]`
      );
    });
    console.log("");
  });

// Validate credentials command
program
  .command("validate")
  .alias("v")
  .description("Validate configured API credentials")
  .option("--json", "Output as JSON")
  .action((options) => {
    if (options.json) {
      const status = validateCredentials();
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    formatters.header("Validating Credentials");
    const status = validateCredentials();
    
    let allValid = true;
    for (const [label, credStatus] of Object.entries(status)) {
      const icon = credStatus.ok ? chalk.green("✓") : chalk.red("✗");
      const statusText = credStatus.ok 
        ? chalk.green("Present") 
        : chalk.red("Missing");
      console.log(`${icon} ${label.padEnd(12)} ${statusText}`);
      if (!credStatus.ok) allValid = false;
    }
    console.log("");
    
    if (!allValid) {
      console.log(chalk.yellow("⚠ Some credentials are missing. Set them in .env file.\n"));
      process.exit(1);
    }
  });

// Debug command
program
  .command("debug")
  .description("Show detailed system and configuration information")
  .action(() => {
    formatters.header("Debug Information");
    
    console.log(chalk.bold("Environment:"));
    console.log(`  Node: ${process.version}`);
    console.log(`  Platform: ${process.platform}`);
    console.log(`  CWD: ${process.cwd()}\n`);

    console.log(chalk.bold("Configuration:"));
    const credStatus = validateCredentials();
    Object.entries(credStatus).forEach(([name, status]) => {
      const indicator = status.ok ? "✓" : "✗";
      console.log(`  ${indicator} ${name}: ${status.ok ? "configured" : "missing"}`);
    });

    console.log("\n" + chalk.bold("Providers:"));
    providers.forEach((p) => {
      const icon = p.enabled ? "✓" : "○";
      console.log(`  ${icon} ${p.name.padEnd(10)} (priority: ${p.priority})`);
    });

    console.log("");
  });

// Help text improvements
program.on("--help", () => {
  console.log("\n" + chalk.bold("Examples:") + "\n");
  console.log(chalk.gray("  Query AI (auto-route):"));
  console.log("    forge-cli 'What is machine learning?'\n");
  console.log(chalk.gray("  Force specific provider with timing:"));
  console.log("    forge-cli --model groq --time 'Explain neural networks'\n");
  console.log(chalk.gray("  Check provider status:"));
  console.log("    forge-cli health --strict\n");
  console.log(chalk.gray("  Read from file:"));
  console.log("    forge-cli --file prompt.md\n");
  console.log(chalk.gray("  View system info:"));
  console.log("    forge-cli debug\n");
});

program.parse(process.argv);
