import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getPreference,
	setPreference,
} from '$lib/server/preferences/preferences-service.js';
import {
	createOllamaProvider,
	OLLAMA_DEFAULT_BASE_URL,
} from '$lib/ai/providers/index.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
	type ActiveProvider,
} from '$lib/ai/provider-config.js';
import { ensureOllamaRunning } from '$lib/server/ai/ollama-launcher.js';

/**
 * `/api/settings/ai-ollama` — Ollama configuration endpoint.
 *
 * Ollama is a local-first provider that does not require an API key, so
 * it lives outside the credential service. Configuration (base URL,
 * preferred model) is stored in `app_preferences` under the
 * `app.ai.ollama.*` namespace.
 *
 * GET    → current config + status
 * POST   → { action: 'save' | 'test' | 'list-models' | 'set-active', ... }
 */

export interface OllamaStatus {
	baseUrl: string;
	model: string | null;
	activeProvider: ActiveProvider;
	configured: boolean;
}

function readStatus(): OllamaStatus {
	const baseUrl = getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
	const model = getPreference<string>(OLLAMA_MODEL_KEY) ?? null;
	const activeProvider =
		getPreference<ActiveProvider>(ACTIVE_PROVIDER_KEY) ?? 'openrouter';
	return {
		baseUrl,
		model,
		activeProvider,
		configured: model !== null,
	};
}

function err(code: string, message: string, status: number) {
	return json({ error: { code, message } }, { status });
}

export const GET: RequestHandler = () => {
	return json(readStatus());
};

interface RequestBody {
	action?: unknown;
	baseUrl?: unknown;
	model?: unknown;
	activeProvider?: unknown;
}

const ALLOWED_ACTIONS = new Set([
	'save',
	'test',
	'list-models',
	'set-active',
	'start',
]);

function normaliseBaseUrl(input: unknown): string {
	if (typeof input !== 'string' || input.trim().length === 0) {
		return OLLAMA_DEFAULT_BASE_URL;
	}
	let url = input.trim();
	if (!/^https?:\/\//i.test(url)) {
		url = `http://${url}`;
	}
	return url.replace(/\/+$/, '');
}

export const POST: RequestHandler = async ({ request }) => {
	let body: RequestBody;
	try {
		body = (await request.json()) as RequestBody;
	} catch {
		return err('invalid_json', 'Invalid JSON body.', 400);
	}

	const action = typeof body.action === 'string' ? body.action : '';
	if (!ALLOWED_ACTIONS.has(action)) {
		return err('invalid_action', 'Unknown action.', 400);
	}

	if (action === 'save') {
		const baseUrl = normaliseBaseUrl(body.baseUrl);
		setPreference(OLLAMA_BASE_URL_KEY, baseUrl);
		if (typeof body.model === 'string' && body.model.trim().length > 0) {
			setPreference(OLLAMA_MODEL_KEY, body.model.trim());
		}
		return json(readStatus());
	}

	if (action === 'set-active') {
		const next = body.activeProvider;
		if (next !== 'openrouter' && next !== 'ollama') {
			return err(
				'invalid_active_provider',
				'activeProvider must be openrouter or ollama.',
				400,
			);
		}
		setPreference(ACTIVE_PROVIDER_KEY, next);
		// When the user flips to Ollama, eagerly bring up the daemon so
		// the very next AI call doesn't fail with ECONNREFUSED.
		if (next === 'ollama') {
			const baseUrl =
				getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
			void ensureOllamaRunning(baseUrl);
		}
		return json(readStatus());
	}

	const baseUrl =
		typeof body.baseUrl === 'string' && body.baseUrl.trim().length > 0
			? normaliseBaseUrl(body.baseUrl)
			: (getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL);

	if (action === 'start') {
		const result = await ensureOllamaRunning(baseUrl);
		return json(result);
	}

	const provider = createOllamaProvider({ baseUrl });

	if (action === 'test') {
		const result = await provider.validateKey('');
		return json(result);
	}

	// action === 'list-models'
	try {
		// Auto-start before listing — if the daemon was idle this avoids
		// surfacing a confusing "no models" empty state.
		await ensureOllamaRunning(baseUrl);
		const models = await provider.listModels('');
		return json({ models });
	} catch (caught) {
		const message = caught instanceof Error ? caught.message : 'unknown';
		return err('provider_error', message, 502);
	}
};
