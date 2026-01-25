import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Config {
  openRouterApiKey: string;
  openRouterBaseUrl: string;
  projectRoot: string;
}

export function loadConfig(): Config {
  // agents/modules -> agents -> root
  const projectRoot = path.resolve(__dirname, "../..");
  const envPath = path.join(projectRoot, "backend", ".env");

  let openRouterApiKey = process.env.OPENROUTER_API_KEY;
  let openRouterBaseUrl =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key === "OPENROUTER_API_KEY" && !openRouterApiKey) {
          openRouterApiKey = value;
        }
        if (key === "OPENROUTER_BASE_URL" && !openRouterBaseUrl) {
          openRouterBaseUrl = value;
        }
      }
    }
  }

  if (!openRouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY not found in backend/.env or environment variables",
    );
  }

  return {
    openRouterApiKey,
    openRouterBaseUrl,
    projectRoot,
  };
}
