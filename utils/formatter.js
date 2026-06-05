import chalk from "chalk";

export const formatters = {
  header: (title) => {
    console.log("\n" + chalk.bold.cyan(title));
    console.log(chalk.gray("─".repeat(60)) + "\n");
  },

  success: (message) => chalk.green(`✓ ${message}`),
  error: (message) => chalk.red(`✗ ${message}`),
  warning: (message) => chalk.yellow(`⚠ ${message}`),
  info: (message) => chalk.blue(`ℹ ${message}`),

  table: (data) => {
    const rows = Array.isArray(data) ? data : Object.entries(data);
    const formatted = rows.map((row) => {
      if (Array.isArray(row)) {
        return `  ${chalk.cyan(row[0]?.toString().padEnd(15))} ${chalk.gray(row[1]?.toString() || "")}`;
      }
      return row;
    });
    return formatted.join("\n");
  },

  badge: (text, type = "info") => {
    const colors = {
      success: chalk.bgGreen.black,
      error: chalk.bgRed.white,
      warning: chalk.bgYellow.black,
      info: chalk.bgBlue.white,
    };
    const color = colors[type] || colors.info;
    return color(` ${text} `);
  },

  code: (text) => chalk.gray(`\`${text}\``),

  separator: () => console.log(chalk.gray("─".repeat(60))),

  box: (content) => {
    const lines = content.split("\n");
    const maxLen = Math.max(...lines.map((l) => l.length));
    console.log(chalk.gray("┌" + "─".repeat(maxLen + 2) + "┐"));
    lines.forEach((line) => {
      console.log(chalk.gray("│") + " " + line.padEnd(maxLen) + " " + chalk.gray("│"));
    });
    console.log(chalk.gray("└" + "─".repeat(maxLen + 2) + "┘"));
  },
};

export const timing = {
  start: () => Date.now(),
  elapsed: (startTime) => {
    const ms = Date.now() - startTime;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  },
};
