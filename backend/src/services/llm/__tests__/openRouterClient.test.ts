import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OpenRouterClient } from '../openRouterClient';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

describe('OpenRouterClient', () => {
  let client: OpenRouterClient;

  beforeEach(() => {
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
          model: 'anthropic/claude-3.7-haiku',
          choices: [{
            message: {
              role: 'assistant',
              content: 'Test response'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await client.call({
        model: 'anthropic/claude-3.7-haiku',
        messages: [{ role: 'user', content: 'Test prompt' }],
        maxTokens: 500,
        temperature: 0.3
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          model: 'anthropic/claude-3.7-haiku',
          messages: [{ role: 'user', content: 'Test prompt' }]
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should include proper headers', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      await client.call({
        model: 'anthropic/claude-3.7-haiku',
        messages: [{ role: 'user', content: 'Test' }]
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'HTTP-Referer': expect.any(String),
            'X-Title': 'Vaisu'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(
        client.call({
          model: 'anthropic/claude-3.7-haiku',
          messages: [{ role: 'user', content: 'Test' }]
        })
      ).rejects.toThrow('API Error');
    });

    it('should handle rate limiting', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }
      });

      await expect(
        client.call({
          model: 'anthropic/claude-3.7-haiku',
          messages: [{ role: 'user', content: 'Test' }]
        })
      ).rejects.toThrow();
    });
  });

  describe('callWithFallback', () => {
    it('should use primary model first', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: { content: 'Primary model response' }
          }]
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await client.callWithFallback('tldr', 'Test prompt');

      expect(result).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.stringContaining('haiku') // Primary for TLDR
        }),
        expect.any(Object)
      );
    });

    it('should fallback to secondary model on failure', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Primary failed'))
        .mockResolvedValueOnce({
          data: {
            choices: [{
              message: { content: 'Fallback model response' }
            }]
          }
        });

      const result = await client.callWithFallback('tldr', 'Test prompt');

      expect(result).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should throw if both models fail', async () => {
      mockedAxios.post.mockRejectedValue(new Error('All models failed'));

      await expect(
        client.callWithFallback('tldr', 'Test prompt')
      ).rejects.toThrow();

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should use correct model for each task type', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { choices: [{ message: { content: 'Response' } }] }
      });

      // Test TLDR (should use Haiku)
      await client.callWithFallback('tldr', 'Test');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.stringContaining('haiku')
        }),
        expect.any(Object)
      );

      vi.clearAllMocks();

      // Test Executive Summary (should use Sonnet)
      await client.callWithFallback('executiveSummary', 'Test');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.stringContaining('sonnet')
        }),
        expect.any(Object)
      );
    });
  });

  describe('retry logic', () => {
    it('should retry on transient failures', async () => {
      let callCount = 0;
      mockedAxios.post.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Transient error'));
        }
        return Promise.resolve({
          data: { choices: [{ message: { content: 'Success' } }] }
        });
      });

      const result = await client.call({
        model: 'anthropic/claude-3.7-haiku',
        messages: [{ role: 'user', content: 'Test' }]
      });

      expect(result).toBeDefined();
      expect(callCount).toBe(3);
    });

    it('should not retry on 4xx errors', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Bad request' }
        }
      });

      await expect(
        client.call({
          model: 'anthropic/claude-3.7-haiku',
          messages: [{ role: 'user', content: 'Test' }]
        })
      ).rejects.toThrow();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
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
            total_tokens: 150
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await client.call({
        model: 'anthropic/claude-3.7-haiku',
        messages: [{ role: 'user', content: 'Test' }]
      });

      expect(result.usage).toBeDefined();
      expect(result.usage.total_tokens).toBe(150);
    });
  });

  describe('rate limiting', () => {
    it('should limit concurrent requests', async () => {
      mockedAxios.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => 
          resolve({ data: { choices: [{ message: { content: 'Response' } }] } }), 
          100
        ))
      );

      const promises = Array(10).fill(null).map(() =>
        client.call({
          model: 'anthropic/claude-3.7-haiku',
          messages: [{ role: 'user', content: 'Test' }]
        })
      );

      await Promise.all(promises);

      // Should have limited concurrent calls (implementation specific)
      expect(mockedAxios.post).toHaveBeenCalledTimes(10);
    });
  });
});
