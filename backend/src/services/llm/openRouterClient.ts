import axios, { AxiosInstance } from 'axios';

import { getModelForTask } from '../../config/modelConfig.js';

import type { LLMCallConfig, LLMResponse, TaskType } from '../../../../shared/src/types.js';

export class OpenRouterClient {
  private client: AxiosInstance;
  private apiKey: string;
  private appUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.appUrl = process.env.APP_URL || 'http://localhost:5173';

    if (!this.apiKey || this.apiKey.includes('REPLACE') || this.apiKey.length < 20) {
      console.warn('⚠️  OPENROUTER_API_KEY not configured. Add your key to backend/.env to enable AI features.');
      console.warn('⚠️  Server will start but analysis will fail until key is added.');
    } else {
      console.log('✅ OpenRouter API key configured');
    }

    this.client = axios.create({
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': this.appUrl,
        'X-Title': 'Vaisu',
      },
      timeout: 60000,
    });
  }

  async call(config: LLMCallConfig): Promise<LLMResponse> {
    try {
      console.log(`Calling OpenRouter with model: ${config.model}`);

      const response = await this.client.post('/chat/completions', {
        model: config.model,
        messages: config.messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const choice = response.data.choices[0];
      const usage = response.data.usage;

      console.log(`✓ Success with ${config.model}, tokens: ${usage.total_tokens}`);

      return {
        content: choice.message.content,
        tokensUsed: usage.total_tokens,
        model: config.model,
      };
    } catch (error: any) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      console.error('Request headers:', this.client.defaults.headers);
      throw new Error(`LLM call failed: ${error.message}`);
    }
  }

  async callWithFallback(task: TaskType, prompt: string, retries = 2): Promise<LLMResponse> {
    const modelConfig = getModelForTask(task);

    try {
      // Try primary model
      return await this.call({
        model: modelConfig.primary,
        messages: [
          { role: 'system', content: modelConfig.systemPrompt },
          { role: 'user', content: prompt },
        ],
        maxTokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      });
    } catch (error) {
      if (retries > 0) {
        console.warn(`Primary model failed for ${task}, trying fallback: ${modelConfig.fallback}`);

        try {
          // Try fallback model
          return await this.call({
            model: modelConfig.fallback,
            messages: [
              { role: 'system', content: modelConfig.systemPrompt },
              { role: 'user', content: prompt },
            ],
            maxTokens: modelConfig.maxTokens,
            temperature: modelConfig.temperature,
          });
        } catch (fallbackError) {
          if (retries > 1) {
            // Retry once more
            return this.callWithFallback(task, prompt, retries - 1);
          }
          throw fallbackError;
        }
      }
      throw error;
    }
  }

  async batchCall(requests: LLMCallConfig[]): Promise<LLMResponse[]> {
    // Process in batches of 5 to respect rate limits
    const batchSize = 5;
    const results: LLMResponse[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(config => this.call(config)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  parseJSONResponse<T>(response: LLMResponse): T {
    try {
      let content = response.content.trim();

      // 1. Try to extract from markdown code blocks
      // Match ```json ... ``` or just ``` ... ```
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) {
        content = codeBlockMatch[1];
      }

      // 2. Find the JSON object/array boundaries
      // This handles cases where there's text outside the code block or no code block at all
      const firstCurly = content.indexOf('{');
      const firstSquare = content.indexOf('[');
      let startIndex = -1;
      let endIndex = -1;

      // Determine if it's likely an object or an array
      if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
        startIndex = firstCurly;
        endIndex = content.lastIndexOf('}') + 1;
      } else if (firstSquare !== -1) {
        startIndex = firstSquare;
        endIndex = content.lastIndexOf(']') + 1;
      }

      if (startIndex !== -1 && endIndex > startIndex) {
        content = content.substring(startIndex, endIndex);
      }

      return JSON.parse(content) as T;
    } catch (error) {
      console.error('Failed to parse JSON response:', response.content.substring(0, 200));
      throw new Error('Invalid JSON response from LLM');
    }
  }
}

// Create instance after env is loaded (imported after dotenv.config() in server.ts)
let clientInstance: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = new OpenRouterClient();
  }
  return clientInstance;
}
