import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "logs", "router.log");

export function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  
  console.log(`[Router] ${message}`);
  
  try {
    fs.appendFileSync(LOG_FILE, entry);
  } catch (err) {
    console.error("[Logger] Failed to write to log file:", err.message);
  }
}
