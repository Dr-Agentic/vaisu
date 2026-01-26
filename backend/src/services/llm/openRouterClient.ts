import fs from 'node:fs';
import path from 'node:path';
import axios, { AxiosInstance } from 'axios';

import { env } from '../../config/env.js';
import { getModelForTask } from '../../config/modelConfig.js';

import type { LLMCallConfig, LLMResponse, TaskType } from '../../../../shared/src/types.js';

export class OpenRouterClient {
  private client: AxiosInstance;
  private appUrl: string;
  private modelsMetadata: Map<string, any> = new Map();
  private metadataPromise: Promise<void> | null = null;

  constructor(apiKey?: string) {
    const token = apiKey || env.OPENROUTER_API_KEY;
    this.appUrl = env.APP_URL;

    this.client = axios.create({
      baseURL: env.OPENROUTER_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'HTTP-Referer': this.appUrl,
        'X-Title': 'Vaisu',
        'Content-Type': 'application/json',
      },
    });
  }

  private async ensureMetadata(): Promise<void> {
    if (this.modelsMetadata.size > 0) return;
    if (this.metadataPromise) return this.metadataPromise;

    this.metadataPromise = (async () => {
      try {
        console.log('Fetching OpenRouter model metadata...');
        const response = await this.client.get('/models');
        const models = response.data?.data || [];
        for (const model of models) {
          this.modelsMetadata.set(model.id, model);
        }
        console.log(`✓ Loaded metadata for ${this.modelsMetadata.size} models`);
      } catch (error: any) {
        console.warn('Failed to fetch OpenRouter model metadata:', error.message);
        // Don't throw, we'll fall back to hardcoded defaults
      } finally {
        this.metadataPromise = null;
      }
    })();

    return this.metadataPromise;
  }

  /**
   * Estimates token count for a piece of text.
   * Standard thumb rule: 1 token ~= 4 characters for English.
   * Using 3.5 for a more conservative (higher) estimate to avoid overflow.
   */
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Compresses text from the middle if it exceeds the limit,
   * preserving the start (intro) and end (conclusion).
   */
  public static middleOutCompress(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;

    const keep = Math.floor(maxChars / 2);
    const start = text.substring(0, keep);
    const end = text.substring(text.length - keep);

    return `${start}\n\n[...MIDDLE SECTION COMPRESSED FOR LENGTH...]\n\n${end}`;
  }

  async call(
    config: LLMCallConfig,
    continuationCount = 0,
  ): Promise<LLMResponse> {
    try {
      await this.ensureMetadata();
      const modelMeta = this.modelsMetadata.get(config.model);

      // Estimate input tokens
      const estimatedInputTokens = this.estimateTokenCount(
        config.messages.map((m) => m.content || "").join(" "),
      );

      // Smart max_tokens logic
      let currentMaxTokens = config.maxTokens;

      if (modelMeta && modelMeta.context_length) {
        const totalCapacity = modelMeta.context_length;
        const safetyBuffer = 1000;
        const availableForOutput =
          totalCapacity - estimatedInputTokens - safetyBuffer;

        if (currentMaxTokens === undefined) {
          const providerMax = modelMeta.top_provider?.max_completion_tokens;
          if (typeof providerMax === "number" && providerMax > 0) {
            currentMaxTokens = Math.min(providerMax, availableForOutput);
          } else {
            currentMaxTokens = availableForOutput;
          }
        } else {
          currentMaxTokens = Math.min(currentMaxTokens, availableForOutput);
        }
      }

      currentMaxTokens = Math.max(currentMaxTokens ?? 4096, 128);

      if (continuationCount === 0) {
        console.log(
          `Calling OpenRouter with model: ${config.model}, ` +
          `input_est: ${estimatedInputTokens}, max_tokens: ${currentMaxTokens}, ` +
          `total_est: ${estimatedInputTokens + currentMaxTokens}`,
        );
      } else {
        console.log(
          `Continuing ${config.model} (Turn ${continuationCount + 1}), ` +
          `input_est: ${estimatedInputTokens}, max_tokens: ${currentMaxTokens}`,
        );
      }

      const requestBody = {
        model: config.model,
        messages: config.messages,
        max_tokens: currentMaxTokens,
        temperature: config.temperature,
      };

      // Debug: Log request
      console.log(`[API_REQ] ${JSON.stringify(requestBody, (key, value) => {
        if (typeof value === 'string' && value.length > 200) {
          return value.substring(0, 100) + '...[TRUNCATED]...' + value.substring(value.length - 100);
        }
        return value;
      })}`);

      const response = await this.client.post(
        "/chat/completions",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const choice = response.data.choices[0];
      const usage = response.data.usage;
      const finishReason = choice.finish_reason;
      const content = choice.message.content || "";

      // Debug: Log response
      console.log(`[API_RES] ${JSON.stringify(response.data, (key, value) => {
        if (typeof value === 'string' && value.length > 200) {
          return value.substring(0, 100) + '...[TRUNCATED]...' + value.substring(value.length - 100);
        }
        return value;
      })}`);

      console.log(
        `✓ Success (${config.model}), tokens: ${usage.total_tokens}, ` +
        `finish_reason: ${finishReason}, content_len: ${content.length}`,
      );

      // Debug: Print first and last non-empty lines
      const outputLines = content.split("\n").filter((l: string) => l.trim().length > 0);
      if (outputLines.length > 0) {
        console.log(`[DEBUG] FIRST LINE: ${outputLines[0].substring(0, 150)}`);
        console.log(
          `[DEBUG] LAST LINE: ${outputLines[outputLines.length - 1].substring(0, 150)}`,
        );
      }

      // Handle truncation via recursive continuation
      if (finishReason === "length" && continuationCount < 50) {
        const updatedMessages = [
          ...config.messages,
          { role: "assistant", content: content } as const,
          {
            role: "user",
            content:
              "IMPORTANT: Your previous response was truncated. " +
              "Please continue precisely from the last character provided above. " +
              "DO NOT repeat any of the previous text. " +
              "DO NOT wrap your continuation in markdown code blocks if you already started one. " +
              "Maintain JSON integrity so the full combined text is valid JSON.",
          } as const,
        ];

        const nextTurn = await this.call(
          {
            ...config,
            messages: updatedMessages,
          },
          continuationCount + 1,
        );

        const stitchedContent = this.stitch(content, nextTurn.content);

        if (continuationCount === 0) {
          console.log(`✓ Fully assembled response for ${config.model}, total_len: ${stitchedContent.length}`);
        }

        return {
          content: stitchedContent,
          tokensUsed: usage.total_tokens + nextTurn.tokensUsed,
          model: config.model,
        };
      }

      return {
        content,
        tokensUsed: usage.total_tokens,
        model: config.model,
      };
    } catch (error: any) {
      console.error(
        "OpenRouter API error:",
        error.response?.data || error.message,
      );
      throw new Error(`LLM call failed: ${error.message}`);
    }
  }

  /**
   * Stitches two strings together, removing any overlapping prefix from the second string.
   * This is crucial if the LLM repeats some of its previous context when continuing.
   */
  private stitch(text1: string, text2: string): string {
    if (!text2) return text1;
    if (!text1) return text2;

    // 1. Check for complete restarts: if text2 starts with the beginning of text1
    // (e.g. LLM just restarted the whole JSON)
    // We strictly check the first 50 chars to see if the model reset to the beginning
    const startOfText1 = text1.substring(0, Math.min(text1.length, 50));
    if (startOfText1 && text2.startsWith(startOfText1)) {
      console.log('⚠️ Detected LLM full restart during continuation. Aborting stitch to prevent loop.');
      // Returning text1 effectively ignores the duplicate turn and will trigger the "no progress" break loop
      return text1;
    }

    // 2. Logic Restart Detection: Check if text2 starts with a fresh JSON object definition
    // often implied by keys like "analysis_metadata" or "nodes" that appeared early in text1
    // This catches "Fuzzy Restarts" where the model skips the opening brace.
    if (text2.trim().startsWith('"analysis_metadata"') || text2.trim().startsWith('"nodes"')) {
      console.log('⚠️ Detected LLM logical restart (fuzzy match). Aborting stitch.');
      return text1;
    }

    // 3. Look for suffix-prefix overlap
    // We check from a reasonably large overlap down to 1
    const maxOverlap = Math.min(text1.length, text2.length, 2000);
    let bestOverlap = 0;

    for (let i = 1; i <= maxOverlap; i++) {
      if (text1.endsWith(text2.substring(0, i))) {
        bestOverlap = i;
      }
    }

    if (bestOverlap > 0) {
      console.log(`Detected ${bestOverlap} character overlap during continuation.`);
      return text1 + text2.substring(bestOverlap);
    }

    return text1 + text2;
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
      } else {
        // Fallback: Remove markdown code block markers if regex didn't match (e.g. incomplete block)
        // This handles cases where the response starts with ```json but doesn't end properly or regex fails
        content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
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
      // 3. Final attempt: deep cleaning for truncated/messy multi-turn responses
      try {
        let content = response.content;
        // Strip ALL markdown markers
        content = content.replace(/```(?:json)?/gi, '').replace(/```/g, '');

        const firstCurly = content.indexOf('{');
        const lastCurly = content.lastIndexOf('}');
        const firstSquare = content.indexOf('[');
        const lastSquare = content.lastIndexOf(']');

        let finalContent = "";
        if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
          finalContent = content.substring(firstCurly, lastCurly + 1);
        } else if (firstSquare !== -1) {
          finalContent = content.substring(firstSquare, lastSquare + 1);
        }

        if (finalContent) {
          return JSON.parse(finalContent) as T;
        }
      } catch (innerError) {
        // Fall through to original error
      }

      console.error('Failed to parse JSON response:', response.content.substring(0, 500));

      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `llm_error_${timestamp}.json`;
        const filePath = path.join('/tmp', filename);
        fs.writeFileSync(filePath, response.content, 'utf8');
        console.log(`[DEBUG] Failed LLM response dumped to: ${filePath}`);
      } catch (dumpError: any) {
        console.error('Failed to dump LLM response to file:', dumpError.message);
      }

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
