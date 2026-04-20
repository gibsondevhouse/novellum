import { apiGet } from '$lib/api-client';

export const ssr = false;

export async function load() {
	const [styles, systemPrompts, instructions] = await Promise.all([
		apiGet('/api/db/writing_styles').catch(() => []),
		apiGet('/api/db/system_prompts').catch(() => []),
		apiGet('/api/db/chat_instructions').catch(() => [])
	]);

	return {
		styles,
		systemPrompts,
		instructions
	};
}
