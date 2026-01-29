import fs from 'fs';

const modelId = process.argv[2];

if (!modelId) {
  console.error('Please provide a model ID as an argument.');
  console.log('Usage: npx tsx experiments/openrouter/check-model.ts <model-id>');
  process.exit(1);
}

async function main() {
  try {
    console.log('Fetching models from OpenRouter...');
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'User-Agent': 'Vaisu/1.0 (Development Experiment)',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const json = await response.json() as { data: any[] };
    const models = json.data;

    const foundModel = models.find((m: any) => m.id === modelId);

    if (foundModel) {
      console.log(`\nMetadata for '${modelId}':`);
      console.log(JSON.stringify(foundModel, null, 2));
    } else {
      console.error(`\nModel '${modelId}' not found.`);

      const partials = models.filter((m: any) => m.id.toLowerCase().includes(modelId.toLowerCase()));
      if (partials.length > 0) {
        console.log('\nDid you mean one of these?');
        partials.slice(0, 10).forEach((m: any) => console.log(`- ${m.id}`));
        if (partials.length > 10) console.log(`...and ${partials.length - 10} more.`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
