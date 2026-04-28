import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SENTINEL = 'sk-or-v1-TEST-SENTINEL-12345678';

const validateKey = vi.fn();
vi.mock('$lib/ai/providers/openrouter-provider.js', () => ({
	createOpenRouterProvider: () => ({
		providerId: 'openrouter',
		displayName: 'OpenRouter',
		validateKey,
		listModels: vi.fn(),
		complete: vi.fn(),
		stream: vi.fn(),
	}),
}));

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'novellum-ai-key-route-'));
	process.env.NOVELLUM_APP_DATA_DIR = dir;
	validateKey.mockReset();
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
	delete process.env.NOVELLUM_APP_DATA_DIR;
	vi.restoreAllMocks();
});

async function loadHandlers() {
	const aiKey = await import('../../src/routes/api/settings/ai-key/+server.js');
	const aiStatus = await import('../../src/routes/api/settings/ai-status/+server.js');
	return { aiKey, aiStatus };
}

function jsonRequest(body: unknown): Request {
	return new Request('http://localhost/api/settings/ai-key', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

describe('POST /api/settings/ai-key', () => {
	it('action=save persists the key and returns redacted status', async () => {
		const { aiKey } = await loadHandlers();
		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', apiKey: SENTINEL, action: 'save' }),
		} as Parameters<typeof aiKey.POST>[0]);
		const body = await res.json();
		expect(res.status).toBe(200);
		expect(body.configured).toBe(true);
		expect(body.maskedHint).toBe('***5678');
		expect(JSON.stringify(body)).not.toContain(SENTINEL);
	});

	it('action=delete clears the stored key', async () => {
		const { aiKey } = await loadHandlers();
		await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', apiKey: SENTINEL, action: 'save' }),
		} as Parameters<typeof aiKey.POST>[0]);

		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', action: 'delete' }),
		} as Parameters<typeof aiKey.POST>[0]);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it('action=test with supplied key calls validateKey without persisting', async () => {
		validateKey.mockResolvedValueOnce({ ok: true, verifiedAt: '2026-04-28T00:00:00.000Z' });
		const { aiKey } = await loadHandlers();

		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', apiKey: SENTINEL, action: 'test' }),
		} as Parameters<typeof aiKey.POST>[0]);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.ok).toBe(true);
		expect(validateKey).toHaveBeenCalledWith(SENTINEL);
	});

	it('action=test uses the stored key when none is supplied', async () => {
		const { aiKey } = await loadHandlers();
		await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', apiKey: SENTINEL, action: 'save' }),
		} as Parameters<typeof aiKey.POST>[0]);

		validateKey.mockResolvedValueOnce({ ok: true, verifiedAt: '2026-04-28T00:00:00.000Z' });
		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', action: 'test' }),
		} as Parameters<typeof aiKey.POST>[0]);

		expect(res.status).toBe(200);
		expect(validateKey).toHaveBeenCalledWith(SENTINEL);
	});

	it('action=test returns 400 no_credentials_to_test when nothing is available', async () => {
		const { aiKey } = await loadHandlers();
		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', action: 'test' }),
		} as Parameters<typeof aiKey.POST>[0]);

		expect(res.status).toBe(400);
		expect((await res.json()).error.code).toBe('no_credentials_to_test');
	});

	it('rejects unknown action', async () => {
		const { aiKey } = await loadHandlers();
		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', action: 'rotate' }),
		} as Parameters<typeof aiKey.POST>[0]);

		expect(res.status).toBe(400);
		expect((await res.json()).error.code).toBe('invalid_action');
	});

	it('rejects unsupported provider', async () => {
		const { aiKey } = await loadHandlers();
		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'anthropic', apiKey: SENTINEL, action: 'save' }),
		} as Parameters<typeof aiKey.POST>[0]);

		expect(res.status).toBe(400);
		expect((await res.json()).error.code).toBe('unsupported_provider');
	});

	it('rejects keys that are too short on save', async () => {
		const { aiKey } = await loadHandlers();
		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', apiKey: 'short', action: 'save' }),
		} as Parameters<typeof aiKey.POST>[0]);

		expect(res.status).toBe(400);
		expect((await res.json()).error.code).toBe('invalid_api_key');
	});

	it('rejects keys that exceed 4 KB', async () => {
		const { aiKey } = await loadHandlers();
		const huge = 'k'.repeat(5000);
		const res = await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', apiKey: huge, action: 'save' }),
		} as Parameters<typeof aiKey.POST>[0]);

		expect(res.status).toBe(413);
		expect((await res.json()).error.code).toBe('payload_too_large');
	});

	it('returns 400 invalid_json on a malformed body', async () => {
		const { aiKey } = await loadHandlers();
		const res = await aiKey.POST({
			request: new Request('http://localhost/api/settings/ai-key', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: 'not json',
			}),
		} as Parameters<typeof aiKey.POST>[0]);
		expect(res.status).toBe(400);
	});
});

describe('GET /api/settings/ai-status', () => {
	it('returns configured=false when nothing is stored', async () => {
		const { aiStatus } = await loadHandlers();
		const res = await aiStatus.GET({
			url: new URL('http://localhost/api/settings/ai-status?providerId=openrouter'),
		} as Parameters<typeof aiStatus.GET>[0]);
		const body = await res.json();
		expect(body.configured).toBe(false);
	});

	it('returns configured=true with masked hint after save', async () => {
		const { aiKey, aiStatus } = await loadHandlers();
		await aiKey.POST({
			request: jsonRequest({ providerId: 'openrouter', apiKey: SENTINEL, action: 'save' }),
		} as Parameters<typeof aiKey.POST>[0]);

		const res = await aiStatus.GET({
			url: new URL('http://localhost/api/settings/ai-status?providerId=openrouter'),
		} as Parameters<typeof aiStatus.GET>[0]);
		const body = await res.json();
		expect(body.configured).toBe(true);
		expect(body.maskedHint).toBe('***5678');
		expect(JSON.stringify(body)).not.toContain(SENTINEL);
	});
});
