<!--
	plan-018 stage-005 phase-002 — Context disclosure pill.

	Renders a compact summary of the RAG context that was sent to the
	model on the last Nova request. Hidden when no context is present.
-->
<script lang="ts">
	import { novaSession } from '../stores/nova-session.svelte.js';

	const disclosure = $derived(novaSession.contextDisclosure);

	function pillLabel(d: typeof disclosure): string {
		if (!d || d.scopes.length === 0) return '';
		const parts: string[] = [];
		if (d.scopes.includes('scene')) parts.push('Scene');
		if (d.scopes.includes('characters')) parts.push('Characters');
		if (d.itemCount > 0) parts.push(`${d.itemCount} items`);
		return parts.join(' · ');
	}
</script>

{#if disclosure && disclosure.scopes.length > 0}
	<span class="context-pill" title="Context sent to model">{pillLabel(disclosure)}</span>
{/if}

<style>
	.context-pill {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-surface-raised);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}
</style>
