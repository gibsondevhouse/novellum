<script lang="ts">
	import type { AutosaveResult } from '$modules/editor/services/autosave-types.js';

	interface Props {
		result: AutosaveResult;
		/** Override the "now" reference for tests. */
		now?: () => number;
	}

	let { result, now = () => Date.now() }: Props = $props();

	function formatRelative(iso: string | null, ref: number): string {
		if (!iso) return '';
		const diff = Math.max(0, ref - new Date(iso).getTime());
		const seconds = Math.floor(diff / 1000);
		if (seconds < 5) return 'just now';
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return `${Math.floor(hours / 24)}d ago`;
	}

	const label = $derived.by(() => {
		const ref = now();
		switch (result.status) {
			case 'saving':
				return result.attempt > 0 ? `Retrying (attempt ${result.attempt})…` : 'Saving…';
			case 'saved': {
				const rel = formatRelative(result.savedAt, ref);
				return rel ? `Saved · ${rel}` : 'Saved';
			}
			case 'failed':
				return result.error ?? 'Save failed';
			case 'idle':
			default:
				return 'Idle';
		}
	});

	const tone = $derived.by(() => {
		if (result.status === 'failed') return 'failed';
		if (result.status === 'saving') return 'saving';
		if (result.status === 'saved') return 'saved';
		return 'idle';
	});
</script>

<span
	class="save-status"
	data-status={result.status}
	data-tone={tone}
	role="status"
	aria-live="polite"
	aria-atomic="true"
>
	{label}
</span>

<style>
	.save-status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		font-size: var(--font-size-xs, 0.75rem);
		font-weight: 500;
		color: var(--color-text-muted, #888);
		background: var(--color-surface-subtle, transparent);
		border-radius: var(--radius-sm, 4px);
		transition: color 200ms ease, background-color 200ms ease;
	}
	.save-status[data-tone='saving'] {
		color: var(--color-accent, #6c8ef5);
	}
	.save-status[data-tone='saved'] {
		color: var(--color-success, #2f9e44);
	}
	.save-status[data-tone='failed'] {
		color: var(--color-danger, #e03131);
		background: var(--color-danger-soft, rgba(224, 49, 49, 0.08));
	}
</style>
