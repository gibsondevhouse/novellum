<!--
	plan-018 stage-005 phase-002 — Context disclosure pill.

	Renders a compact summary of the RAG context that was sent to the
	model on the last Nova request. Hidden when no context is present.
-->
<script lang="ts">
	import { novaSession } from '../stores/nova-session.svelte.js';

	const disclosure = $derived(novaSession.contextDisclosure);

	function pillLabel(d: typeof disclosure): string {
		if (!d) return '';
		if (d.scopes.includes('no-context')) return 'No context attached';
		const parts: string[] = [];
		if (d.scopes.includes('project')) parts.push('Project attached');
		if (d.scopes.includes('story-frame')) parts.push('Story frame');
		if (d.scopes.includes('outline')) parts.push('Outline');
		if (d.scopes.includes('scene')) parts.push('Scene');
		if (d.scopes.includes('characters')) parts.push('Characters');
		if (d.scopes.includes('locations')) parts.push('Locations');
		if (d.itemCount > 0) parts.push(`${d.itemCount} items`);
		if (d.attachedCount > 0) parts.push(`${d.attachedCount} attached`);
		if (d.compressed) parts.push('Compressed');
		if (d.truncated) parts.push('Trimmed');
		return parts.join(' · ');
	}

	function pillTitle(d: typeof disclosure): string {
		if (!d) return '';
		if (d.warnings.length === 0) return 'Context sent to model';
		return `Context sent to model — ${d.warnings.join(' ')}`;
	}
</script>

{#if disclosure}
	<span class="context-pill" title={pillTitle(disclosure)}>
		<span class="context-pill__dot" aria-hidden="true"></span>
		{pillLabel(disclosure)}
	</span>
{/if}

<style>
	.context-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 88%, var(--color-candle) 12%);
		background: color-mix(in srgb, var(--color-surface-raised) 90%, var(--color-candle) 10%);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		letter-spacing: 0.01em;
		white-space: nowrap;
	}

	.context-pill__dot {
		width: var(--size-dot-small);
		height: var(--size-dot-small);
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-candle) 72%, var(--color-text-secondary));
	}
</style>
