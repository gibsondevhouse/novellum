import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCredentialService } from '$lib/server/credentials/credential-service.js';

export const GET: RequestHandler = async ({ url }) => {
	const providerId = url.searchParams.get('providerId') ?? 'openrouter';
	const status = await createCredentialService().getProviderStatus(providerId);
	return json(status);
};
