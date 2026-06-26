<script lang="ts">
	import type { BrainstormSession as BrainstormSessionData } from '$lib/ai/types.js';
	import BrainstormInput from './BrainstormInput.svelte';
	import ProposalList from './ProposalList.svelte';

	interface Props {
		session?: BrainstormSessionData | null;
		initialSeedIdea?: string;
		loading?: boolean;
		error?: string | null;
		showInput?: boolean;
		showProposalList?: boolean;
		onSubmit?: (seedIdea: string) => void;
	}

	let {
		session = null,
		initialSeedIdea = '',
		loading = false,
		error = null,
		showInput = true,
		showProposalList = true,
		onSubmit
	}: Props = $props();

	const statusMessage = $derived.by(() => {
		if (loading) return 'Generating brainstorm proposals.';
		if (error) return error;
		if (session) return 'Brainstorm proposals are ready for review.';
		return 'No brainstorm proposals generated yet.';
	});

	function handleSubmit(seedIdea: string): void {
		onSubmit?.(seedIdea);
	}
</script>

<section
	class="brainstorm-session"
	aria-label="Nova brainstorm session"
	data-testid="nova-brainstorm-session"
>
	<header class="brainstorm-session__header">
		<div>
			<p class="brainstorm-session__eyebrow">Brainstorm Agent</p>
			<h2>Seed proposals</h2>
		</div>
		<span class="brainstorm-session__state" data-loading={loading}>
			{loading ? 'Running' : session ? 'Review ready' : 'Idle'}
		</span>
	</header>

	{#if showInput}
		<BrainstormInput
			{initialSeedIdea}
			busy={loading}
			onSubmit={handleSubmit}
		/>
	{/if}

	<div
		class:error={Boolean(error)}
		class="brainstorm-session__status"
		data-testid="nova-brainstorm-status"
		role={error ? 'alert' : 'status'}
		aria-live="polite"
	>
		{statusMessage}
	</div>

	{#if showProposalList}
		<ProposalList {session} />
	{/if}
</section>

<style>
	.brainstorm-session {
		display: grid;
		gap: var(--space-3);
		color: var(--color-text-primary);
	}

	.brainstorm-session__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.brainstorm-session__header h2,
	.brainstorm-session__header p,
	.brainstorm-session__status {
		margin: 0;
	}

	.brainstorm-session__eyebrow {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.brainstorm-session__header h2 {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-tight);
	}

	.brainstorm-session__state {
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		background: var(--color-surface-ground);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
	}

	.brainstorm-session__state[data-loading='true'] {
		border-color: color-mix(in srgb, var(--color-candle) 40%, var(--color-border-subtle));
		color: var(--color-candle);
	}

	.brainstorm-session__status {
		padding: var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: var(--color-surface-ground);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
	}

	.brainstorm-session__status.error {
		border-color: color-mix(in srgb, var(--color-error) 40%, var(--color-border-subtle));
		background: var(--color-error-subtle);
		color: var(--color-error-on-dark);
	}
</style>
