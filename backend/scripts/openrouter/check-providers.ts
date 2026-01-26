import fs from 'fs';

const filterArg = process.argv[2];

async function main() {
  try {
    console.log("Fetching providers from OpenRouter...");
    const response = await fetch("https://openrouter.ai/api/v1/providers", {
        headers: {
            "User-Agent": "Vaisu/1.0 (Development Experiment)",
            "Content-Type": "application/json"
        }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.status} ${response.statusText}`);
    }

    const json = await response.json() as { data: any[] };
    // The structure might be { data: [...] } or just [...] depending on the API. 
    // The previous /models endpoint returned { data: [...] }.
    // Let's assume similar wrapping, but handle if it's a direct array.
    const providers = Array.isArray(json) ? json : (json.data || []);

    if (filterArg) {
        const filtered = providers.filter((p: any) => 
            (p.name && p.name.toLowerCase().includes(filterArg.toLowerCase())) ||
            (p.slug && p.slug.toLowerCase().includes(filterArg.toLowerCase()))
        );
        
        if (filtered.length > 0) {
            console.log(`\nProviders matching '${filterArg}':`);
            console.log(JSON.stringify(filtered, null, 2));
        } else {
            console.log(`\nNo providers found matching '${filterArg}'.`);
        }
    } else {
        console.log(`\nFound ${providers.length} providers. Showing full metadata for all:`);
        console.log(JSON.stringify(providers, null, 2));
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
