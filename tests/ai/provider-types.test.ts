import { describe, it, expectTypeOf } from 'vitest';
import type {
	AiProvider,
	AiProviderConfig,
	AiProviderFactory,
	CompletionRequest,
	CompletionResponse,
	StreamChunk,
	ValidateKeyResult,
	AiModel,
} from '../../src/lib/ai/providers/types.js';

describe('AiProvider type contract', () => {
	it('exposes providerId, displayName, and four async methods', () => {
		expectTypeOf<AiProvider['providerId']>().toEqualTypeOf<string>();
		expectTypeOf<AiProvider['displayName']>().toEqualTypeOf<string>();
		expectTypeOf<AiProvider['validateKey']>().toBeFunction();
		expectTypeOf<AiProvider['listModels']>().toBeFunction();
		expectTypeOf<AiProvider['complete']>().toBeFunction();
		expectTypeOf<AiProvider['stream']>().toBeFunction();
	});

	it('every networked method takes apiKey as a required first argument', () => {
		expectTypeOf<AiProvider['validateKey']>()
			.parameter(0)
			.toEqualTypeOf<string>();
		expectTypeOf<AiProvider['listModels']>()
			.parameter(0)
			.toEqualTypeOf<string>();
		expectTypeOf<AiProvider['complete']>()
			.parameter(0)
			.toEqualTypeOf<string>();
		expectTypeOf<AiProvider['stream']>()
			.parameter(0)
			.toEqualTypeOf<string>();
	});

	it('ValidateKeyResult is a discriminated union with reason variants', () => {
		const ok: ValidateKeyResult = { ok: true, verifiedAt: '2026-04-28T00:00:00Z' };
		const bad: ValidateKeyResult = { ok: false, reason: 'invalid', message: 'no' };
		const limited: ValidateKeyResult = { ok: false, reason: 'rate_limited', message: 'slow down' };
		const net: ValidateKeyResult = { ok: false, reason: 'network_error', message: 'offline' };
		const unk: ValidateKeyResult = { ok: false, reason: 'unknown', message: 'mystery' };
		expectTypeOf(ok).toMatchTypeOf<ValidateKeyResult>();
		expectTypeOf(bad).toMatchTypeOf<ValidateKeyResult>();
		expectTypeOf(limited).toMatchTypeOf<ValidateKeyResult>();
		expectTypeOf(net).toMatchTypeOf<ValidateKeyResult>();
		expectTypeOf(unk).toMatchTypeOf<ValidateKeyResult>();
	});

	it('CompletionRequest carries an optional AbortSignal for cancellation', () => {
		expectTypeOf<CompletionRequest['signal']>().toEqualTypeOf<AbortSignal | undefined>();
	});

	it('StreamChunk is a discriminated union of delta | done | error', () => {
		const delta: StreamChunk = { type: 'delta', content: 'a' };
		const done: StreamChunk = { type: 'done', finishReason: 'stop' };
		const err: StreamChunk = { type: 'error', message: 'x', recoverable: false };
		expectTypeOf(delta).toMatchTypeOf<StreamChunk>();
		expectTypeOf(done).toMatchTypeOf<StreamChunk>();
		expectTypeOf(err).toMatchTypeOf<StreamChunk>();
	});

	it('AiProviderFactory returns an AiProvider given optional config', () => {
		expectTypeOf<AiProviderFactory>().parameter(0).toEqualTypeOf<AiProviderConfig | undefined>();
		expectTypeOf<ReturnType<AiProviderFactory>>().toEqualTypeOf<AiProvider>();
	});

	it('AiModel has id and name and optional pricing/contextLength', () => {
		expectTypeOf<AiModel['id']>().toEqualTypeOf<string>();
		expectTypeOf<AiModel['name']>().toEqualTypeOf<string>();
		expectTypeOf<AiModel['contextLength']>().toEqualTypeOf<number | undefined>();
	});

	it('CompletionResponse exposes finishReason union', () => {
		expectTypeOf<CompletionResponse['finishReason']>().toEqualTypeOf<
			'stop' | 'length' | 'content_filter' | 'tool_calls' | 'other'
		>();
	});
});
