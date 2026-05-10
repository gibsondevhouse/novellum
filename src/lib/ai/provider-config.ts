/**
 * Shared preference keys for AI provider routing.
 *
 * Lives outside `+server.ts` so other endpoints (e.g. `/api/ai/+server.ts`)
 * can read the same canonical keys without breaking SvelteKit's
 * postbuild validation rule that endpoint files only export handlers.
 */
export const ACTIVE_PROVIDER_KEY = 'app.ai.activeProvider';
export const OLLAMA_BASE_URL_KEY = 'app.ai.ollama.baseUrl';
export const OLLAMA_MODEL_KEY = 'app.ai.ollama.model';

export type ActiveProvider = 'openrouter' | 'ollama';
