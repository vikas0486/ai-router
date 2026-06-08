import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "..", "config", "providers.json");
const providersList = JSON.parse(fs.readFileSync(configPath, "utf8"));

export const providers = providersList.map((name, index) => ({
  name,
  enabled: true,
  priority: index + 1
}));
