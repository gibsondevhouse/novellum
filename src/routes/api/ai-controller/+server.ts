import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomUUID } from 'node:crypto';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';
import { getPreference } from '$lib/server/preferences/preferences-service.js';
import {
	ACTIVE_PROVIDER_KEY,
	OLLAMA_BASE_URL_KEY,
	OLLAMA_MODEL_KEY,
	type ActiveProvider,
} from '$lib/ai/provider-config.js';
import {
	createDefaultAiController,
	type AiControllerRequest,
	type AiControllerRequestSource,
	type AiControllerTargetKind,
	type ModelGatewayProviderResult,
} from '$lib/server/ai/controller/index.js';
import {
	createOllamaProvider,
	createOpenRouterProvider,
	OLLAMA_DEFAULT_BASE_URL,
} from '$lib/ai/providers/index.js';
import { ensureOllamaRunning } from '$lib/server/ai/ollama-launcher.js';

const credentialService = createCredentialService();
const openRouterProvider = createOpenRouterProvider();

function isSource(value: unknown): value is AiControllerRequestSource {
	return (
		typeof value === 'string' &&
		['nova', 'editor', 'outline', 'worldbuilding', 'api', 'system'].includes(value)
	);
}

function isTargetKind(value: unknown): value is AiControllerTargetKind {
	return (
		typeof value === 'string' &&
		[
			'project',
			'arc',
			'act',
			'milestone',
			'chapter',
			'scene',
			'beat',
			'worldbuilding_entity',
			'selection',
			'pipeline',
			'unknown',
		].includes(value)
	);
}

async function resolveProvider(): Promise<ModelGatewayProviderResult> {
	const activeProvider: ActiveProvider =
		getPreference<ActiveProvider>(ACTIVE_PROVIDER_KEY) ?? 'openrouter';

	if (activeProvider === 'ollama') {
		const baseUrl = getPreference<string>(OLLAMA_BASE_URL_KEY) ?? OLLAMA_DEFAULT_BASE_URL;
		const modelOverride = getPreference<string>(OLLAMA_MODEL_KEY) ?? undefined;
		await ensureOllamaRunning(baseUrl);
		return {
			kind: 'ok',
			provider: createOllamaProvider({ baseUrl }),
			apiKey: '',
			modelOverride,
		};
	}

	const key = await credentialService.loadProviderKey('openrouter');
	if (key) return { kind: 'ok', provider: openRouterProvider, apiKey: key };
	if (process.env.NOVELLUM_AI_MOCK === '1') return { kind: 'mock' };
	return { kind: 'no_credentials' };
}

function parseRequest(body: unknown): AiControllerRequest | null {
	if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
	const value = body as Record<string, unknown>;
	const action = typeof value.action === 'object' && value.action !== null
		? (value.action as Record<string, unknown>)
		: null;
	const target = typeof value.target === 'object' && value.target !== null
		? (value.target as Record<string, unknown>)
		: {};
	const source = isSource(action?.source) ? action.source : 'api';
	const actionId = typeof action?.id === 'string' ? action.id : typeof value.action === 'string' ? value.action : '';
	if (!actionId) return null;
	const targetKind = isTargetKind(target.kind) ? target.kind : 'unknown';
	const projectId = typeof value.projectId === 'string' ? value.projectId : null;
	return {
		requestId: typeof value.requestId === 'string' ? value.requestId : `ai-request-${randomUUID()}`,
		projectId,
		requestedBy:
			value.requestedBy === 'system' || value.requestedBy === 'worker' ? value.requestedBy : 'user',
		action: {
			source,
			id: actionId,
			instruction: typeof action?.instruction === 'string' ? action.instruction : undefined,
			mode: typeof action?.mode === 'string' ? action.mode : undefined,
			payload: action?.payload as AiControllerRequest['action']['payload'],
		},
		target: {
			kind: targetKind,
			id: typeof target.id === 'string' ? target.id : null,
			projectId,
			label: typeof target.label === 'string' ? target.label : undefined,
		},
		contextRefs: [],
		createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
		metadata: value.metadata as AiControllerRequest['metadata'],
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const controllerRequest = parseRequest(body);
	if (!controllerRequest) {
		return json(
			{ error: { code: 'invalid_request', message: 'Invalid AI controller request.' } },
			{ status: 400 },
		);
	}
	const controller = createDefaultAiController({ resolveProvider });
	const response = await controller.execute(controllerRequest, { signal: request.signal });
	return json(response, { status: response.ok ? 200 : response.status === 'blocked' ? 403 : 500 });
};
