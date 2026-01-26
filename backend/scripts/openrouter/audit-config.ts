import fs from 'fs';
import path from 'path';

// Minimal parser for the modelConfig.ts file
function extractModels() {
  // Path relative to where the script is run (project root)
  const configPath = 'backend/src/config/modelConfig.ts';
  if (!fs.existsSync(configPath)) {
    // Try resolving relative to the script location if running from within the folder
    const relativePath = path.resolve(__dirname, '../../src/config/modelConfig.ts');
    if (fs.existsSync(relativePath)) {
        return parseFile(relativePath);
    }
    console.error(`Could not find modelConfig.ts at ${configPath}`);
    return [];
  }
  return parseFile(configPath);
}

function parseFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match lines like: GROK_FAST: 'x-ai/grok-4.1-fast',
  const matches = content.matchAll(/[A-Z0-9_]+:\s*'([^']+)'/g);
  const models = new Set<string>();
  for (const match of matches) {
    models.add(match[1]);
  }
  return Array.from(models);
}

async function main() {
  const configModels = extractModels();
  
  if (configModels.length === 0) {
    console.log("No models found in config.");
    return;
  }

  try {
    console.log(`Auditing ${configModels.length} models from config...`);
    const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
            "User-Agent": "Vaisu/1.0 (Audit Script)",
            "Content-Type": "application/json"
        }
    });
    
    if (!response.ok) throw new Error("Failed to fetch models");

    const json = await response.json() as { data: any[] };
    const allModels = json.data;

    console.log("\n" + "".padEnd(100, "-"));
    console.log(
      "Model".padEnd(45) + 
      "Context".padEnd(12) + 
      "Prompt $".padEnd(12) + 
      "Compl. $".padEnd(12) + 
      "Moderated"
    );
    console.log("".padEnd(100, "-"));

    configModels.forEach(modelId => {
      const meta = allModels.find(m => m.id === modelId);
      if (meta) {
        const pricing = meta.pricing || {};
        const context = meta.context_length?.toLocaleString() || "N/A";
        const pPrice = (parseFloat(pricing.prompt) * 1000000).toFixed(2);
        const cPrice = (parseFloat(pricing.completion) * 1000000).toFixed(2);
        const moderated = meta.top_provider?.is_moderated ? "Yes" : "No";

        console.log(
          modelId.padEnd(45) + 
          context.padEnd(12) + 
          (`$${pPrice}/M`).padEnd(12) + 
          (`$${cPrice}/M`).padEnd(12) + 
          moderated
        );
      } else {
        console.log(modelId.padEnd(45) + "MISSING FROM API");
      }
    });
    console.log("".padEnd(100, "-"));

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
