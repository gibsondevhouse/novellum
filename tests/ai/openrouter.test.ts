import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterClient, MissingCredentialsError } from '../../src/lib/ai/openrouter';

describe('OpenRouterClient', () => {
    let client: OpenRouterClient;
    
    beforeEach(() => {
        vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
        client = new OpenRouterClient();
        
        // Mock fetch
        globalThis.fetch = vi.fn();
        
        // Mock timers for fast exponential backoff testing
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('loads API key from localStorage if present', () => {
        if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
            vi.stubEnv('VITE_OPENROUTER_API_KEY', '');
            vi.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
                if (key === 'novellum_openrouter_key') return 'test-local-key';
                return null;
            });
            const localClient = new OpenRouterClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((localClient as any).apiKey).toBe('test-local-key');
        }
    });

    it('throws MissingCredentialsError if key is missing', async () => {
        vi.stubEnv('VITE_OPENROUTER_API_KEY', '');
        const clientWithoutKey = new OpenRouterClient();
        
        await expect(clientWithoutKey.complete({ model: 'test', messages: [] }))
            .rejects.toThrow(MissingCredentialsError);
    });

    it('returns answer from successful fetch', async () => {
        const mockResponse = {
            choices: [{ message: { content: 'hello' } }],
            model: 'test-model',
            usage: { total_tokens: 10 }
        };
        
        vi.mocked(globalThis.fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        } as Response);

        const result = await client.complete({ model: 'test-model', messages: [] });
        expect(result.text).toBe('hello');
        expect(result.model).toBe('test-model');
        expect(result.tokensUsed).toBe(10);
    });

    it('retries on 429 using exponential backoff', async () => {
        const fetchMock = vi.mocked(globalThis.fetch);
        
        // 1st request: 429
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 429,
            text: async () => 'Too Many Requests'
        } as Response);

        // 2nd request: 429
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 429,
            text: async () => 'Too Many Requests'
        } as Response);

        // 3rd request: success
        const mockSuccess = { choices: [{ message: { content: 'success' } }] };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSuccess
        } as Response);

        // Start completion
        const completePromise = client.complete({ model: 'test-model', messages: [] });

        // Advance timers for backoff
        // 1st delay is 1000ms
        await vi.advanceTimersByTimeAsync(1000);
        // 2nd delay is 2000ms
        await vi.advanceTimersByTimeAsync(2000);

        const result = await completePromise;
        expect(result.text).toBe('success');
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('falls back to secondary model after max retries on 5xx', async () => {
        const fetchMock = vi.mocked(globalThis.fetch);

        // 3 times 500 error for 'google/gemini-3.1-flash-lite-preview'
        for (let i = 0; i < 3; i++) {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error'
            } as Response);
        }

        // No fallback exists, so it should throw after 3 retries
        const completePromise = client.complete({ model: 'google/gemini-3.1-flash-lite-preview', messages: [] });
        // Attach catch early to avoid Unhandled Rejection warning
        completePromise.catch(() => {});

        // Advance timers to pass the 3 retries (1000, 2000)
        await vi.advanceTimersByTimeAsync(3000);

        // Should throw since no fallback models are defined
        await expect(completePromise).rejects.toThrow('[OpenRouterClient] All models/retries failed');
    });

    it('throws if all models and retries fail', async () => {
        const fetchMock = vi.mocked(globalThis.fetch);
        
        // Mock to always return 500
        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => 'Error'
        } as Response);

        // Attempt completion with single model (3 retries = 3 total fetches)
        const completePromise = client.complete({ model: 'dummy-model', messages: [] });
        // Attach catch early to avoid Unhandled Rejection warning
        completePromise.catch(() => {});
        
        await vi.runAllTimersAsync();

        await expect(completePromise).rejects.toThrow('All models/retries failed');
    });

    describe('streamComplete', () => {
        it('throws MissingCredentialsError if key is missing', async () => {
            vi.stubEnv('VITE_OPENROUTER_API_KEY', '');
            const clientWithoutKey = new OpenRouterClient();
            
            const generator = clientWithoutKey.streamComplete({ model: 'test', messages: [] });
            await expect(async () => {
                // eslint-disable-next-line no-empty
                for await (const _ of generator) {}
            }).rejects.toThrow(MissingCredentialsError);
        });

        it('yields chunks from successful SSE stream', async () => {
            const fetchMock = vi.mocked(globalThis.fetch);

            // Create a mock stream reader
            let readCallCount = 0;
            const encoder = new TextEncoder();
            
            const mockReader = {
                read: vi.fn().mockImplementation(async () => {
                    readCallCount++;
                    if (readCallCount === 1) {
                        return { value: encoder.encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'), done: false };
                    }
                    if (readCallCount === 2) {
                        return { value: encoder.encode('data: {"choices":[{"delta":{"content":" streaming"}}]}\n\n'), done: false };
                    }
                    if (readCallCount === 3) {
                        return { value: encoder.encode('data: [DONE]\n\n'), done: false };
                    }
                    return { done: true, value: undefined };
                })
            };

            const mockResponse = {
                ok: true,
                body: { getReader: () => mockReader }
            } as unknown as Response;

            fetchMock.mockResolvedValueOnce(mockResponse);

            const generator = client.streamComplete({ model: 'test-model', messages: [] });
            const chunks: string[] = [];
            for await (const chunk of generator) {
                chunks.push(chunk);
            }

            expect(chunks).toEqual(['Hello', ' streaming']);
            expect(fetchMock).toHaveBeenCalled();
        });

        it('handles malformed JSON chunks gracefully without crashing', async () => {
            const fetchMock = vi.mocked(globalThis.fetch);

            const encoder = new TextEncoder();
            let readCallCount = 0;
            const mockReader = {
                read: vi.fn().mockImplementation(async () => {
                    readCallCount++;
                    if (readCallCount === 1) {
                        return { value: encoder.encode('data: {"choices":[{"delta":{"content":"Valid chunk"}}]}\n\n'), done: false };
                    }
                    if (readCallCount === 2) {
                        // Malformed JSON chunk
                        return { value: encoder.encode('data: {"choices":[{malformed]}\n\n'), done: false };
                    }
                    if (readCallCount === 3) {
                        return { value: encoder.encode('data: [DONE]\n\n'), done: false };
                    }
                    return { done: true, value: undefined };
                })
            };

            fetchMock.mockResolvedValueOnce({
                ok: true,
                body: { getReader: () => mockReader }
            } as unknown as Response);

            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const generator = client.streamComplete({ model: 'test-model', messages: [] });
            const chunks: string[] = [];
            for await (const chunk of generator) {
                chunks.push(chunk);
            }

            expect(chunks).toEqual(['Valid chunk']);
            expect(warnSpy).toHaveBeenCalledWith(
                '[OpenRouterClient] Malformed stream chunk:',
                '{"choices":[{malformed]}'
            );
            
            warnSpy.mockRestore();
        });
    });
});