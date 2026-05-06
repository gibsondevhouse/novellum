import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import { selectSecureStore } from '$lib/server/credentials/select-secure-store.js';
import { createOpenRouterProvider } from '$lib/ai/providers/openrouter-provider.js';

/**
 * `/api/settings/ai-key` — single endpoint for save / delete / test.
 *
 * The transient `apiKey` value supplied to a `test` action is never
 * persisted; it is only forwarded to the provider's `validateKey` call.
 */

function service() {
	return createCredentialService(selectSecureStore());
}
function openrouter() {
	return createOpenRouterProvider();
}

const ALLOWED_ACTIONS = new Set(['save', 'delete', 'test']);
const MIN_KEY_LEN = 16;
const MAX_KEY_LEN = 4 * 1024;

interface RequestBody {
	providerId?: unknown;
	apiKey?: unknown;
	action?: unknown;
}

function err(code: string, message: string, status: number) {
	return json({ error: { code, message } }, { status });
}

export const POST: RequestHandler = async ({ request }) => {
	let body: RequestBody;
	try {
		body = (await request.json()) as RequestBody;
	} catch {
		return err('invalid_json', 'Invalid JSON body.', 400);
	}

	const providerId = typeof body.providerId === 'string' ? body.providerId : '';
	const action = typeof body.action === 'string' ? body.action : '';
	const apiKey = typeof body.apiKey === 'string' ? body.apiKey : null;

	if (!providerId) return err('invalid_provider', 'providerId is required.', 400);
	if (!ALLOWED_ACTIONS.has(action)) return err('invalid_action', 'Unknown action.', 400);
	if (providerId !== 'openrouter') {
		return err('unsupported_provider', 'Only openrouter is supported in V1.', 400);
	}

	if (apiKey !== null) {
		if (apiKey.length > MAX_KEY_LEN) {
			return err('payload_too_large', 'apiKey too large.', 413);
		}
		if (apiKey.length < MIN_KEY_LEN && action === 'save') {
			return err('invalid_api_key', 'apiKey is too short.', 400);
		}
	}

	try {
		if (action === 'save') {
			if (!apiKey) return err('invalid_api_key', 'apiKey is required for save.', 400);
			const status = await service().saveProviderKey(providerId, apiKey);
			return json(status);
		}

		if (action === 'delete') {
			await service().deleteProviderKey(providerId);
			return json({ ok: true });
		}

		// action === 'test'
		const candidate = apiKey ?? (await service().loadProviderKey(providerId));
		if (!candidate) {
			return err('no_credentials_to_test', 'No key available to test.', 400);
		}

		const result = await openrouter().validateKey(candidate);
		if (result.ok) {
			await service().markVerified(providerId, result.verifiedAt);
		}
		return json(result);
	} catch (caught) {
		const message = caught instanceof Error ? caught.message : 'unknown';
		return err('server_error', sanitize(message, apiKey), 500);
	}
};

function sanitize(message: string, apiKey: string | null): string {
	if (!apiKey) return message;
	return message.split(apiKey).join('***REDACTED***');
}
