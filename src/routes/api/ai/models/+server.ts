import { createHash } from 'node:crypto';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import { createOpenRouterProvider } from '$lib/ai/providers/openrouter-provider.js';
import type { AiModel } from '$lib/ai/providers/types.js';

const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
	models: AiModel[];
	fetchedAt: number;
	/**
	 * SHA-256 of the API key the cache was filled with. Keyed cache so
	 * rotating the credential naturally misses the cache — no explicit
	 * invalidation on save needed.
	 */
	keyHash: string;
}

const cache = new Map<string, CacheEntry>();

function hashKey(apiKey: string): string {
	return createHash('sha256').update(apiKey).digest('hex');
}

/** Test hook — clears the in-memory model cache. */
export function __clearModelsCacheForTests() {
	cache.clear();
}

export const GET: RequestHandler = async ({ url }) => {
	const providerId = url.searchParams.get('providerId') ?? 'openrouter';

	if (providerId !== 'openrouter') {
		return json({ error: { code: 'unsupported_provider' } }, { status: 400 });
	}

	const credentialService = createCredentialService();
	const apiKey = await credentialService.loadProviderKey(providerId);
	if (!apiKey) {
		return json(
			{ error: { code: 'no_credentials', message: 'No AI provider credentials configured.' } },
			{ status: 401 },
		);
	}

	const keyHash = hashKey(apiKey);
	const cached = cache.get(providerId);
	const now = Date.now();
	if (cached && cached.keyHash === keyHash && now - cached.fetchedAt < CACHE_TTL_MS) {
		return json({ models: cached.models, cached: true });
	}

	try {
		const provider = createOpenRouterProvider();
		const models = await provider.listModels(apiKey);
		cache.set(providerId, { models, fetchedAt: now, keyHash });
		return json({ models, cached: false });
	} catch (err) {
		const raw = err instanceof Error ? err.message : 'unknown';
		// Defensive: a misconfigured upstream may echo the key in its
		// error message. Strip it before reflecting anything to the
		// client.
		const message = apiKey ? raw.split(apiKey).join('***REDACTED***') : raw;
		return json({ error: { code: 'provider_error', message } }, { status: 502 });
	}
};
