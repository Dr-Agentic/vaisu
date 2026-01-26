
import fs from 'fs';

const modelId = process.argv[2];

if (!modelId) {
  console.error("Please provide a model ID as an argument.");
  console.log("Usage: npx tsx experiments/openrouter/check-endpoints.ts <model-id>");
  process.exit(1);
}

async function main() {
  try {
    const url = `https://openrouter.ai/api/v1/models/${modelId}/endpoints`;
    console.log(`Fetching endpoints for '${modelId}' from: ${url}`);
    
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Vaisu/1.0 (Development Experiment)",
            "Content-Type": "application/json"
        }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch endpoints: ${response.status} ${response.statusText}`);
    }

    const json = await response.json() as { data: any[] };
    // Assuming the structure is { data: [...] } like others
    const endpoints = Array.isArray(json) ? json : (json.data || json);

    console.log(`\nFound ${Array.isArray(endpoints) ? endpoints.length : 'unknown'} endpoints/providers:`)
    console.log(JSON.stringify(endpoints, null, 2));

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
