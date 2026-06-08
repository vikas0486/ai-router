import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "..", "logs", "router.log");

export function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  
  console.log(`[Router] ${message}`);
  
  // Ensure logs directory exists
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  try {
    fs.appendFileSync(LOG_FILE, entry);
  } catch (err) {
    console.error("[Logger] Failed to write to log file:", err.message);
  }
}
