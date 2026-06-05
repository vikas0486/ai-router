#!/usr/bin/env node

#!/usr/bin/env node
import "dotenv/config";
import readline from "readline";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { routeRequest } from "./router/engine.js";
import { validateCredentials } from "./config/credentials.js";

const CHAT_HISTORY_FILE = path.join(".", "chat-history.json");
const MAX_HISTORY_LENGTH = 50;
const SUPPORTED_IMAGE_FORMATS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

class InteractiveChatApp {
  constructor() {
    this.history = [];
    this.rl = null;
    this.preferredModel = null;
    this.isRunning = true;
    this.attachedImage = null;
    this.loadHistory();
  }

  loadHistory() {
    try {
      if (fs.existsSync(CHAT_HISTORY_FILE)) {
        const data = fs.readFileSync(CHAT_HISTORY_FILE, "utf-8");
        this.history = JSON.parse(data);
      }
    } catch (err) {
      // Start with empty history if file is corrupted
      this.history = [];
    }
  }

  saveHistory() {
    try {
      const recentHistory = this.history.slice(-MAX_HISTORY_LENGTH);
      fs.writeFileSync(
        CHAT_HISTORY_FILE,
        JSON.stringify(recentHistory, null, 2)
      );
    } catch (err) {
      console.error(chalk.red("⚠️  Failed to save history:", err.message));
    }
  }

  async init() {
    validateCredentials();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.displayWelcome();
  }

  displayWelcome() {
    console.clear();
    console.log(
      chalk.cyan.bold(
        "╔════════════════════════════════════════════════════════╗"
      )
    );
    console.log(
      chalk.cyan.bold(
        "║          🤖  AI Router - Interactive Chat CLI  🤖       ║"
      )
    );
    console.log(
      chalk.cyan.bold(
        "╚════════════════════════════════════════════════════════╝"
      )
    );
    console.log();
    console.log(
      chalk.gray(
        "Type your message and press Enter. Commands available:"
      )
    );
    console.log(chalk.yellow("  /clear") + chalk.gray(" - Clear chat history"));
    console.log(
      chalk.yellow("  /history") + chalk.gray(" - Show previous messages")
    );
    console.log(
      chalk.yellow("  /model") + chalk.gray(
        " <name> - Switch to specific model (optional)"
      )
    );
    console.log(chalk.yellow("  /image") + chalk.gray(" <path> - Attach an image file"));
    console.log(chalk.yellow("  /exit") + chalk.gray(" - Exit the chat"));
    console.log();
  }

  async processInput(userInput) {
    const trimmedInput = userInput.trim();

    if (!trimmedInput) {
      return;
    }

    // Handle commands
    if (trimmedInput.startsWith("/")) {
      await this.handleCommand(trimmedInput);
      return;
    }

    // Regular message - send to LLM
    await this.sendMessage(userInput);
  }

  async handleCommand(command) {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case "/clear":
        this.history = [];
        this.saveHistory();
        console.log(chalk.green("✓ Chat history cleared"));
        break;

      case "/history":
        this.displayHistory();
        break;

      case "/model":
        if (parts.length > 1) {
          const modelName = parts[1].toLowerCase();
          if (modelName === "auto") {
            this.preferredModel = null;
            console.log(
              chalk.green(`✓ Model set to: ${chalk.bold("auto-routing")}`)
            );
          } else {
            this.preferredModel = modelName;
            console.log(
              chalk.green(`✓ Model set to: ${chalk.bold(this.preferredModel)}`)
            );
          }
        } else {
          console.log(
            chalk.yellow(
              `Current model: ${this.preferredModel || "auto-routing"}`
            )
          );
        }
        break;

      case "/image":
        if (parts.length > 1) {
          const imagePath = parts.slice(1).join(" ");
          await this.attachImage(imagePath);
        } else {
          console.log(chalk.red("✗ Please provide an image path. Usage: /image <path>"));
        }
        break;

      case "/exit":
        this.isRunning = false;
        console.log(chalk.cyan("Goodbye! 👋"));
        break;

      default:
        console.log(
          chalk.red(`Unknown command: ${cmd}. Try /help or /exit.`)
        );
    }
  }

  async attachImage(imagePath) {
    try {
      const resolvedPath = path.resolve(imagePath);
      
      if (!fs.existsSync(resolvedPath)) {
        console.log(chalk.red(`✗ Image file not found: ${imagePath}`));
        return;
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      if (!SUPPORTED_IMAGE_FORMATS.includes(ext)) {
        console.log(
          chalk.red(
            `✗ Unsupported image format. Supported: ${SUPPORTED_IMAGE_FORMATS.join(", ")}`
          )
        );
        return;
      }

      const imageBuffer = fs.readFileSync(resolvedPath);
      const base64Data = imageBuffer.toString("base64");
      const mimeType = this.getMimeType(ext);

      this.attachedImage = {
        data: base64Data,
        mimeType: mimeType,
        path: imagePath,
      };

      console.log(
        chalk.green(
          `✓ Image attached: ${path.basename(imagePath)} (${mimeType})`
        )
      );
    } catch (err) {
      console.log(chalk.red(`✗ Error attaching image: ${err.message}`));
    }
  }

  getMimeType(extension) {
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    return mimeTypes[extension] || "image/jpeg";
  }

  displayHistory() {
    if (this.history.length === 0) {
      console.log(chalk.gray("No chat history yet."));
      return;
    }

    console.log(chalk.cyan("\n📜 Chat History:"));
    console.log(chalk.gray("─".repeat(60)));

    this.history.forEach((entry, index) => {
      console.log(
        chalk.blue(`[${index + 1}] You: `) + chalk.gray(entry.user.substring(0, 80))
      );
      if (entry.ai.length > 80) {
        console.log(
          chalk.green("AI: ") +
            chalk.gray(entry.ai.substring(0, 80) + "...")
        );
      } else {
        console.log(chalk.green("AI: ") + chalk.gray(entry.ai));
      }
      console.log(chalk.gray("─".repeat(60)));
    });
    console.log();
  }

  async sendMessage(userMessage) {
    const spinner = ora({
      text: chalk.cyan("Thinking..."),
      color: "cyan",
    }).start();

    try {
      const response = await routeRequest(
        userMessage,
        this.preferredModel,
        this.attachedImage
      );

      spinner.succeed(chalk.green("Response received"));

      // Display response
      console.log();
      console.log(chalk.green("┌─ AI Response"));
      console.log(chalk.green("│"));
      const lines = response.split("\n");
      lines.forEach((line) => {
        console.log(chalk.green("│ ") + chalk.white(line));
      });
      console.log(chalk.green("└"));
      console.log();

      // Save to history
      this.history.push({
        user: userMessage,
        ai: response,
        timestamp: new Date().toISOString(),
        model: this.preferredModel || "auto",
        hasImage: !!this.attachedImage,
      });
      this.saveHistory();

      // Clear attached image after sending
      if (this.attachedImage) {
        this.attachedImage = null;
      }
    } catch (error) {
      spinner.fail(chalk.red("Error getting response"));
      console.error(
        chalk.red(`\n✗ Error: ${error.message}\n`)
      );
    }
  }

  prompt() {
    if (!this.isRunning) {
      this.rl.close();
      process.exit(0);
    }

    const modelIndicator = this.preferredModel
      ? chalk.yellow(`[${this.preferredModel}]`)
      : chalk.cyan("[auto]");

    const imageIndicator = this.attachedImage
      ? chalk.magenta(" 🖼️")
      : "";

    this.rl.question(
      `${modelIndicator}${imageIndicator} ${chalk.blue("You")}: `,
      async (input) => {
        await this.processInput(input);
        if (this.isRunning) {
          this.prompt();
        } else {
          this.rl.close();
          process.exit(0);
        }
      }
    );
  }

  async start() {
    await this.init();
    this.prompt();
  }
}

// Start the chat application
const app = new InteractiveChatApp();
app.start().catch((err) => {
  console.error(chalk.red("Fatal Error:"), err.message);
  process.exit(1);
});
