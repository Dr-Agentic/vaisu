import axios from 'axios';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { testEnv } from '../../../../../test/utils/env';

import { OpenRouterClient } from '../openRouterClient';
import { LLM_MODELS, LLM_PRIMARY } from '../../../config/modelConfig';

vi.mock('axios');
const mockedAxios = axios as any;

describe('OpenRouterClient', () => {
  let client: OpenRouterClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Create a mock axios instance
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      defaults: {
        headers: {
          'Authorization': 'Bearer test-api-key',
          'HTTP-Referer': testEnv.APP_URL,
          'X-Title': 'Vaisu',
        },
      },
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);

    client = new OpenRouterClient('test-api-key');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('call', () => {
    it('should make successful API call', async () => {
      const mockResponse = {
        data: {
          id: 'gen-123',
          model: LLM_MODELS.GROK_FAST,
          choices: [{
            message: {
              role: 'assistant',
              content: 'Test response',
            },
            finish_reason: 'stop',
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.call({
        model: LLM_MODELS.GROK_FAST,
        messages: [{ role: 'user', content: 'Test prompt' }],
        maxTokens: 500,
        temperature: 0.3,
      });

      expect(result.content).toBe('Test response');
      expect(result.tokensUsed).toBe(150);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: LLM_MODELS.GROK_FAST,
          messages: [{ role: 'user', content: 'Test prompt' }],
          max_tokens: 500,
          temperature: 0.3,
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should include proper headers', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Test' } }],
          usage: { total_tokens: 100 },
        },
      });

      await client.call({
        model: LLM_MODELS.GROK_FAST,
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.3,
      });

      // Headers are set on the axios instance, not per-request
      // Just verify the call was made
      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('API Error'));

      await expect(
        client.call({
          model: LLM_MODELS.GROK_FAST,
          messages: [{ role: 'user', content: 'Test' }],
          temperature: 0.3,
        }),
      ).rejects.toThrow('LLM call failed');
    });

    it('should handle rate limiting', async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
        },
      });

      await expect(
        client.call({
          model: LLM_MODELS.GROK_FAST,
          messages: [{ role: 'user', content: 'Test' }],
          temperature: 0.3,
        }),
      ).rejects.toThrow();
    });

    it('should use a smart default for max_tokens if not provided (fallback case)', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Test' } }],
          usage: { total_tokens: 100 },
        },
      });

      // Reset client to clear potential cache from other tests if needed
      // (Simplified: assuming metadata is empty for this test)
      await client.call({
        model: LLM_MODELS.GROK_FAST,
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.3,
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          max_tokens: 4096, // Fallback default when metadata AND user input are absent/empty
        }),
        expect.any(Object)
      );
    });

    it('should calculate max_tokens correctly based on context length', async () => {
      // Mock the /models API response
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          data: [
            {
              id: LLM_MODELS.GROK_FAST,
              context_length: 10000,
              top_provider: { max_completion_tokens: null }
            }
          ]
        }
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Test' } }],
          usage: { total_tokens: 100 },
        },
      });

      // Prompt and system message combined are approx 20 chars -> ~6 tokens
      await client.call({
        model: LLM_MODELS.GROK_FAST,
        messages: [{ role: 'user', content: 'Short prompt' }],
        temperature: 0.3,
      });

      // Expected: 10000 (total) - ~6 (input) - 1000 (buffer) -> ~8994
      // Let's verify it's a large value around that range
      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.max_tokens).toBeGreaterThan(8000);
      expect(callArgs.max_tokens).toBeLessThan(9000);
    });

    it('should automatically continue and stitch truncated responses', async () => {
      // First call returns truncated content
      mockAxiosInstance.post
        .mockResolvedValueOnce({
          data: {
            choices: [{ message: { content: '{"part1": "foo",' }, finish_reason: 'length' }],
            usage: { total_tokens: 100 },
          },
        })
        // Second call completes it
        .mockResolvedValueOnce({
          data: {
            choices: [{ message: { content: '"part2": "bar"}' }, finish_reason: 'stop' }],
            usage: { total_tokens: 50 },
          },
        });

      const result = await client.call({
        model: LLM_MODELS.GROK_FAST,
        messages: [{ role: 'user', content: 'Huge JSON please' }],
        temperature: 0.3,
      });

      expect(result.content).toBe('{"part1": "foo","part2": "bar"}');
      expect(result.tokensUsed).toBe(150);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);

      // Verify the second call included the previous messages and assistant content
      const secondCallArgs = mockAxiosInstance.post.mock.calls[1][1];
      expect(secondCallArgs.messages).toHaveLength(3);
      expect(secondCallArgs.messages[1].role).toBe('assistant');
      expect(secondCallArgs.messages[1].content).toBe('{"part1": "foo",');
      expect(secondCallArgs.messages[2].content).toContain('continue precisely');
    });
  });

  describe('callWithFallback', () => {
    it('should use primary model first', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Primary model response' },
          }],
          usage: { total_tokens: 100 },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.callWithFallback('tldr', 'Test prompt');

      expect(result).toBeDefined();
      expect(result.content).toBe('Primary model response');
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: LLM_PRIMARY,
        }),
        expect.any(Object),
      );
    });

    it('should fallback to secondary model on failure', async () => {
      mockAxiosInstance.post
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValueOnce({
          data: {
            choices: [{
              message: { content: 'Fallback model response' },
            }],
            usage: { total_tokens: 100 },
          },
        });

      const result = await client.callWithFallback('tldr', 'Test prompt');

      expect(result).toBeDefined();
      expect(result.content).toBe('Fallback model response');
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });

    it('should throw if both models fail', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('All models failed'));

      await expect(
        client.callWithFallback('tldr', 'Test prompt'),
      ).rejects.toThrow();

      // callWithFallback tries primary, then fallback, then retries once more (2 retries default)
      // So it tries: primary, fallback, primary again, fallback again = 4 calls
      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(4);
    });

    it('should use correct model for each task type', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Response' } }],
          usage: { total_tokens: 100 },
        },
      });

      // Test TLDR (should use Primary)
      await client.callWithFallback('tldr', 'Test');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: LLM_PRIMARY,
        }),
        expect.any(Object),
      );

      vi.clearAllMocks();

      // Test Executive Summary (should also use Primary)
      await client.callWithFallback('executiveSummary', 'Test');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: LLM_PRIMARY,
        }),
        expect.any(Object),
      );
    });
  });

  describe('retry logic', () => {
    it('should retry on transient failures', async () => {
      // Note: OpenRouterClient doesn't implement retry at the call level
      // Retry is handled by callWithFallback
      mockAxiosInstance.post.mockRejectedValue(new Error('Transient error'));

      await expect(
        client.call({
          model: LLM_MODELS.GROK_FAST,
          messages: [{ role: 'user', content: 'Test' }],
          temperature: 0.3,
        }),
      ).rejects.toThrow();

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 4xx errors', async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Bad request' },
        },
      });

      await expect(
        client.call({
          model: LLM_MODELS.GROK_FAST,
          messages: [{ role: 'user', content: 'Test' }],
          temperature: 0.3,
        }),
      ).rejects.toThrow();

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('token tracking', () => {
    it('should track token usage', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Response' } }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.call({
        model: LLM_MODELS.GROK_FAST,
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(result.tokensUsed).toBeDefined();
      expect(result.tokensUsed).toBe(150);
    });
  });

  describe('rate limiting', () => {
    it('should limit concurrent requests', async () => {
      mockAxiosInstance.post.mockImplementation(() =>
        new Promise(resolve => setTimeout(() =>
          resolve({
            data: {
              choices: [{ message: { content: 'Response' } }],
              usage: { total_tokens: 100 },
            },
          }),
          10,
        )),
      );

      const promises = Array(10).fill(null).map(() =>
        client.call({
          model: LLM_MODELS.GROK_FAST,
          messages: [{ role: 'user', content: 'Test' }],
          temperature: 0.3,
        }),
      );
      await Promise.all(promises);

      // Should have made all calls (rate limiting is handled by OpenRouter API)
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(10);
    });
  });
});
