import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SENTINEL = 'sk-or-v1-TEST-SENTINEL-12345678';

const listModels = vi.fn();
vi.mock('$lib/ai/providers/openrouter-provider.js', () => ({
	createOpenRouterProvider: () => ({
		providerId: 'openrouter',
		displayName: 'OpenRouter',
		validateKey: vi.fn(),
		listModels,
		complete: vi.fn(),
		stream: vi.fn(),
	}),
}));

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'novellum-models-route-'));
	process.env.NOVELLUM_APP_DATA_DIR = dir;
	listModels.mockReset();
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
	delete process.env.NOVELLUM_APP_DATA_DIR;
});

async function loadHandler() {
	const mod = await import('../../src/routes/api/ai/models/+server.js');
	mod.__clearModelsCacheForTests();
	return mod;
}

async function seedKey() {
	const aiKey = await import('../../src/routes/api/settings/ai-key/+server.js');
	await aiKey.POST({
		request: new Request('http://localhost/api/settings/ai-key', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ providerId: 'openrouter', apiKey: SENTINEL, action: 'save' }),
		}),
	} as Parameters<typeof aiKey.POST>[0]);
}

describe('GET /api/ai/models', () => {
	it('returns 401 no_credentials when no key is stored', async () => {
		const { GET } = await loadHandler();
		const res = await GET({
			url: new URL('http://localhost/api/ai/models'),
		} as Parameters<typeof GET>[0]);
		expect(res.status).toBe(401);
		expect((await res.json()).error.code).toBe('no_credentials');
	});

	it('returns the model list on first call (cached=false)', async () => {
		await seedKey();
		listModels.mockResolvedValueOnce([
			{ id: 'a', name: 'A', contextLength: 1000 },
			{ id: 'b', name: 'B' },
		]);

		const { GET } = await loadHandler();
		const res = await GET({
			url: new URL('http://localhost/api/ai/models'),
		} as Parameters<typeof GET>[0]);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.cached).toBe(false);
		expect(body.models).toHaveLength(2);
	});

	it('serves a cache hit on the second call within 60 s', async () => {
		await seedKey();
		listModels.mockResolvedValueOnce([{ id: 'a' }]);

		const { GET } = await loadHandler();
		const url = new URL('http://localhost/api/ai/models');

		const first = await GET({ url } as Parameters<typeof GET>[0]);
		expect(first.status).toBe(200);

		const second = await GET({ url } as Parameters<typeof GET>[0]);
		const body = await second.json();
		expect(body.cached).toBe(true);
		expect(listModels).toHaveBeenCalledTimes(1);
	});

	it('returns 200 with empty models list when provider returns nothing', async () => {
		await seedKey();
		listModels.mockResolvedValueOnce([]);

		const { GET } = await loadHandler();
		const res = await GET({
			url: new URL('http://localhost/api/ai/models'),
		} as Parameters<typeof GET>[0]);

		expect(res.status).toBe(200);
		expect((await res.json()).models).toEqual([]);
	});

	it('rejects unsupported providers', async () => {
		const { GET } = await loadHandler();
		const res = await GET({
			url: new URL('http://localhost/api/ai/models?providerId=anthropic'),
		} as Parameters<typeof GET>[0]);
		expect(res.status).toBe(400);
		expect((await res.json()).error.code).toBe('unsupported_provider');
	});

	it('returns 502 provider_error when listModels throws', async () => {
		await seedKey();
		listModels.mockRejectedValueOnce(new Error('upstream_dead'));

		const { GET } = await loadHandler();
		const res = await GET({
			url: new URL('http://localhost/api/ai/models'),
		} as Parameters<typeof GET>[0]);
		expect(res.status).toBe(502);
	});
});
