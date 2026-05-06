/**
 * plan-018 stage-005 phase-001 — AI session store.
 *
 * Tracks per-session credential status for the Nova panel.
 * `hydrate()` calls GET /api/settings/ai-status and sets reactive state.
 * Uses Svelte 5 $state — must only be instantiated in browser context
 * or inside a Svelte component tree.
 */
import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';

interface AiStatusResponse {
	configured: boolean;
	providerId: string;
}

export class AiSessionStore {
	keyConfigured = $state<boolean>(false);
	providerId = $state<string>('openrouter');
	modelId = $state<string>('');
	loading = $state<boolean>(false);
	error = $state<string | null>(null);
	/** True once the first hydrate() call has settled. */
	checked = $state<boolean>(false);

	async hydrate(provider = 'openrouter'): Promise<void> {
		this.loading = true;
		this.error = null;
		try {
			const res = await fetch(
				`/api/settings/ai-status?providerId=${encodeURIComponent(provider)}`,
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = (await res.json()) as AiStatusResponse;
			this.keyConfigured = data.configured;
			this.providerId = data.providerId ?? provider;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unknown error';
			this.keyConfigured = false;
		} finally {
			this.loading = false;
			this.checked = true;
			this.modelId = getSelectedModel();
		}
	}

	/** Test-only reset. Restores initial defaults so component tests start clean. */
	__resetForTests(): void {
		this.keyConfigured = false;
		this.providerId = 'openrouter';
		this.modelId = '';
		this.loading = false;
		this.error = null;
		this.checked = false;
	}
}

export const aiSession = new AiSessionStore();
