import { apiGet } from '$lib/api-client';

export const ssr = false;

export async function load({ fetch }) {
	const [styles, systemPrompts, instructions, templates] = await Promise.all([
		apiGet('/api/db/writing_styles').catch(() => []),
		apiGet('/api/db/system_prompts').catch(() => []),
		apiGet('/api/db/chat_instructions').catch(() => []),
		apiGet('/api/db/templates').catch(() => [])
	]);

	return {
		styles,
		systemPrompts,
		instructions,
		templates
	};
}
