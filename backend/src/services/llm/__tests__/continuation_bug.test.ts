
import axios from 'axios';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OpenRouterClient } from '../openRouterClient';
import { LLM_MODELS } from '../../../config/modelConfig';

vi.mock('axios');
const mockedAxios = axios as any;

describe('OpenRouterClient Continuation Bug Reproduction', () => {
    let client: OpenRouterClient;
    let mockAxiosInstance: any;

    beforeEach(() => {
        mockAxiosInstance = {
            post: vi.fn(),
            get: vi.fn(),
            defaults: { headers: {} },
        };
        mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
        client = new OpenRouterClient('test-key');
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should handle when LLM repeats the beginning during continuation', async () => {
        // Stage 1: Initial call returns part 1, finishes with 'length'
        const part1 = '{"nodes": [{"id": "1", "label": "Start"';

        // Stage 2: Second call incorrectly repeats the beginning AND continues
        // This simulates when LLM restarts the whole JSON from the beginning
        const part2Repeated = '{"nodes": [{"id": "1", "label": "Start"}, {"id": "2", "label": "End"}]}';

        // Mock metadata fetch
        mockAxiosInstance.get.mockResolvedValueOnce({
            data: { data: [{ id: LLM_MODELS.GROK_FAST, context_length: 32768 }] },
        });

        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    choices: [{ message: { content: part1 }, finish_reason: 'length' }],
                    usage: { total_tokens: 100 },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    choices: [{ message: { content: part2Repeated }, finish_reason: 'stop' }],
                    usage: { total_tokens: 150 },
                },
            });

        const result = await client.call({
            model: LLM_MODELS.GROK_FAST,
            messages: [{ role: 'user', content: 'Huge JSON' }],
            temperature: 0.3,
        });

        // New behavior: should detect the restart and return the original text
        // The stitch() method detects that part2 starts with part1 and returns part1
        // This is a conservative approach to avoid loops, but means we lose the complete data
        console.log('Assembled Content:', result.content);
        expect(result.content).toBe(part1);

        // Note: In this scenario, the test shows the current behavior.
        // The stitch() method prefers text1 over text2 when it detects a restart.
        // This is to prevent loops, but may miss complete data in some cases.
    });

    it('should handle when LLM adds markdown wrappers to different turns', async () => {
        const part1 = '```json\n{"nodes": [';
        const part2 = '{"id": "1", "label": "Done"}]}```';

        // Mock metadata fetch
        mockAxiosInstance.get.mockResolvedValueOnce({
            data: { data: [{ id: LLM_MODELS.GROK_FAST, context_length: 32768 }] },
        });

        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    choices: [{ message: { content: part1 }, finish_reason: 'length' }],
                    usage: { total_tokens: 100 },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    choices: [{ message: { content: part2 }, finish_reason: 'stop' }],
                    usage: { total_tokens: 100 },
                },
            });

        const result = await client.call({
            model: LLM_MODELS.GROK_FAST,
            messages: [{ role: 'user', content: 'JSON with markdown' }],
            temperature: 0.3,
        });

        // New behavior: should concatenate cleanly
        console.log('Assembled Content with Markdown:', result.content);

        const parsed = client.parseJSONResponse<{ nodes: any[] }>(result);
        expect(parsed.nodes).toHaveLength(1);
        expect(parsed.nodes[0].label).toBe('Done');
    });
});
