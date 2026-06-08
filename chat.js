#!/usr/bin/env node

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import readline from "readline";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { routeRequest } from "./router/engine.js";
import { validateCredentials } from "./config/credentials.js";
import { providers } from "./router/providers.config.js";

const CHAT_HISTORY_FILE = path.join(__dirname, "chat-history.json");
const MAX_HISTORY_LENGTH = 100;
const SUPPORTED_IMAGE_FORMATS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

class ForgeChatApp {
  constructor() {
    this.history = [];
    this.rl = null;
    this.preferredModel = null;
    this.isRunning = true;
    this.attachedImage = null;
    this.commandHistory = [];
    this.abortController = null;
    this.currentSpinner = null;
    this.loadHistory();
  }

  loadHistory() {
    try {
      if (fs.existsSync(CHAT_HISTORY_FILE)) {
        const data = fs.readFileSync(CHAT_HISTORY_FILE, "utf-8");
        const parsed = JSON.parse(data);
        this.history = parsed.messages || [];
        this.commandHistory = parsed.commandHistory || [];
      }
    } catch (err) {
      this.history = [];
      this.commandHistory = [];
    }
  }

  saveHistory() {
    try {
      const data = {
        messages: this.history.slice(-MAX_HISTORY_LENGTH),
        commandHistory: this.commandHistory.slice(-MAX_HISTORY_LENGTH)
      };
      fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      // Silently fail history save
    }
  }

  async init() {
    validateCredentials();
    this.setupReadline();
    this.displayWelcome();
  }

  setupReadline() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      historySize: MAX_HISTORY_LENGTH,
      prompt: ""
    });

    this.rl.on("SIGINT", () => {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
        if (this.currentSpinner) {
          this.currentSpinner.fail(chalk.yellow("Forging interrupted by user."));
          this.currentSpinner = null;
        }
        console.log();
        this.prompt();
      } else {
        console.log(chalk.cyan("\nGoodbye! 👋"));
        process.exit(0);
      }
    });
  }

  displayWelcome() {
    console.clear();
    const width = process.stdout.columns || 80;
    const border = "═".repeat(Math.min(width - 2, 70));
    
    console.log(chalk.cyan.bold(`╔${border}╗`));
    console.log(chalk.cyan.bold(`║${" ".repeat(Math.floor((border.length - 26) / 2))}⚒️  FORGE INTERACTIVE CODE  ⚒️${" ".repeat(Math.ceil((border.length - 26) / 2))}║`));
    console.log(chalk.cyan.bold(`╚${border}╝`));
    
    console.log(chalk.gray("\nWelcome to the Forge. High-performance multi-LLM routing.\n"));
    
    const commands = [
      ["/help", "Show available commands"],
      ["/model list", "Show available models"],
      ["/model <name>", "Switch to specific model"],
      ["/image <path>", "Attach an image file"],
      ["/clear", "Clear chat history"],
      ["/exit", "Exit the chat"]
    ];

    commands.forEach(([cmd, desc]) => {
      console.log(`${chalk.yellow(cmd.padEnd(15))} ${chalk.gray(desc)}`);
    });
    console.log();
  }

  async handleCommand(command) {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case "/help":
        this.displayWelcome();
        break;
      case "/clear":
        this.history = [];
        this.commandHistory = [];
        this.saveHistory();
        console.log(chalk.green("✓ Forge memory cleared."));
        break;
      case "/exit":
        this.isRunning = false;
        console.log(chalk.cyan("Exiting Forge. Goodbye! 👋"));
        process.exit(0);
        break;
      case "/model":
        this.handleModelCommand(parts);
        break;
      case "/image":
        if (parts.length > 1) {
          await this.attachImage(parts.slice(1).join(" "));
        } else {
          console.log(chalk.red("✗ Provide an image path."));
        }
        break;
      default:
        console.log(chalk.red(`✗ Unknown command: ${cmd}`));
    }
  }

  handleModelCommand(parts) {
    if (parts.length > 1) {
      const modelName = parts[1].toLowerCase();
      if (modelName === "list") {
        console.log(chalk.cyan("\nAvailable Forge Hammers:"));
        providers.sort((a, b) => a.priority - b.priority).forEach(p => {
          console.log(`  ${p.enabled ? chalk.green("✓") : chalk.red("✗")} ${chalk.yellow(p.name.padEnd(10))} (Priority: ${p.priority})`);
        });
        console.log();
      } else if (modelName === "auto") {
        this.preferredModel = null;
        console.log(chalk.green("✓ Model set to auto-routing."));
      } else {
        this.preferredModel = modelName;
        console.log(chalk.green(`✓ Model set to: ${chalk.bold(modelName)}`));
      }
    } else {
      console.log(chalk.yellow(`Current model: ${this.preferredModel || "auto-routing"}`));
    }
  }

  async attachImage(imagePath) {
    try {
      const resolvedPath = path.resolve(imagePath);
      if (!fs.existsSync(resolvedPath)) {
        console.log(chalk.red(`✗ File not found: ${imagePath}`));
        return;
      }
      const ext = path.extname(resolvedPath).toLowerCase();
      if (!SUPPORTED_IMAGE_FORMATS.includes(ext)) {
        console.log(chalk.red(`✗ Unsupported format: ${ext}`));
        return;
      }
      const base64 = fs.readFileSync(resolvedPath).toString("base64");
      this.attachedImage = { data: base64, mimeType: `image/${ext.slice(1)}`, path: imagePath };
      console.log(chalk.green(`✓ Image attached: ${path.basename(imagePath)}`));
    } catch (err) {
      console.log(chalk.red(`✗ Error: ${err.message}`));
    }
  }

  async sendMessage(userMessage) {
    const hammerFrames = ["  ⚒️ ", " ⚒️  ", "⚒️   ", " ⚒️  "];
    this.abortController = new AbortController();
    
    this.currentSpinner = ora({
      text: chalk.cyan("Forging response..."),
      spinner: {
        interval: 200,
        frames: hammerFrames
      }
    }).start();

    try {
      const response = await routeRequest(userMessage, this.preferredModel, this.attachedImage, this.abortController.signal);
      this.currentSpinner.succeed(chalk.green("Response forged"));
      this.currentSpinner = null;
      this.abortController = null;

      console.log();
      const width = process.stdout.columns || 80;
      const wrapWidth = Math.min(width - 6, 100);
      
      console.log(chalk.cyan("  ┌" + "─".repeat(wrapWidth + 2) + "┐"));
      response.split("\n").forEach(line => {
        let remaining = line;
        if (remaining.trim() === "") {
          console.log(chalk.cyan("  │ ") + " ".repeat(wrapWidth) + chalk.cyan(" │"));
        }
        while (remaining.length > 0) {
          const chunk = remaining.substring(0, wrapWidth);
          console.log(chalk.cyan("  │ ") + chalk.white(chunk.padEnd(wrapWidth)) + chalk.cyan(" │"));
          remaining = remaining.substring(wrapWidth);
        }
      });
      console.log(chalk.cyan("  └" + "─".repeat(wrapWidth + 2) + "┘"));
      console.log();

      this.history.push({ user: userMessage, ai: response, model: this.preferredModel || "auto" });
      this.commandHistory.push(userMessage);
      this.saveHistory();
      this.attachedImage = null;
    } catch (error) {
      if (this.currentSpinner) {
        this.currentSpinner.fail(chalk.red("Forging failed"));
        this.currentSpinner = null;
      }
      this.abortController = null;
      if (error.name === "AbortError" || error.message === "AbortError") {
        return;
      }
      console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    }
  }

  prompt() {
    const modelLabel = this.preferredModel ? chalk.yellow(`[${this.preferredModel}]`) : chalk.cyan("[auto]");
    const imgLabel = this.attachedImage ? chalk.magenta(" 🖼️") : "";
    
    const width = process.stdout.columns || 80;
    const boxWidth = Math.min(width - 4, 70);
    const border = "─".repeat(boxWidth);
    
    console.log(chalk.gray("  ┌" + border + "┐"));
    const promptPrefix = chalk.cyan("  │ ") + chalk.bold.blue("Forge") + " " + modelLabel + imgLabel + chalk.gray(" ❯ ");
    
    // We use setPrompt and prompt() to allow native history handling
    this.rl.setPrompt(promptPrefix);
    this.rl.prompt();

    const lineHandler = async (input) => {
      this.rl.removeListener("line", lineHandler);
      const trimmed = input.trim();
      
      // Close the box visually after input
      // This is tricky with readline, so we just print a closing border
      console.log(chalk.gray("  └" + border + "┘"));

      if (trimmed) {
        if (trimmed.startsWith("/")) {
          await this.handleCommand(trimmed);
        } else {
          await this.sendMessage(trimmed);
        }
      }
      
      if (this.isRunning) {
        this.prompt();
      }
    };

    this.rl.on("line", lineHandler);
  }

  async start() {
    await this.init();
    this.prompt();
  }
}

const app = new ForgeChatApp();
app.start().catch(err => {
  console.error(chalk.red("Fatal Forge Error:"), err.message);
  process.exit(1);
});
