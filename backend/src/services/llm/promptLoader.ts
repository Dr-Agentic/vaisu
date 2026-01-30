import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Loads a prompt from a markdown file in the backend/src/prompts directory.
 * @param promptName The name of the prompt (without .md extension)
 * @returns The content of the prompt file
 */
export function loadPrompt(promptName: string): string {
    try {
        // Navigate from backend/src/services/llm to backend/src/prompts
        const promptPath = path.resolve(__dirname, '../../prompts', `${promptName}.md`);

        if (!fs.existsSync(promptPath)) {
            console.warn(`⚠️ Prompt file not found: ${promptPath}. Falling back to empty string.`);
            return '';
        }

        return fs.readFileSync(promptPath, 'utf8').trim();
    } catch (error: any) {
        console.error(`Error loading prompt ${promptName}:`, error.message);
        return '';
    }
}
