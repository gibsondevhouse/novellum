<script lang="ts">
	import type { Snippet } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import type { ManualCreateAction } from '$modules/outline/types.js';

	let {
		manualCreateAction,
		manualTitleInputId,
		manualActionTitle,
		manualActionBusy,
		manualActionError,
		outlineRefreshStatus,
		aiPanel,
		onManualTitleInput,
		onManualSubmit,
	} = $props<{
		manualCreateAction: ManualCreateAction;
		manualTitleInputId: string;
		manualActionTitle: string;
		manualActionBusy: boolean;
		manualActionError: string | null;
		outlineRefreshStatus: string | null;
		aiPanel: Snippet;
		onManualTitleInput: (value: string) => void;
		onManualSubmit: (event: SubmitEvent) => void | Promise<void>;
	}>();
</script>

<section class="outline-workbench" aria-label="Outline workflows">
	<section class="manual-workflow-tool" aria-label="Manual outline builder">
		<header class="workflow-header">
			<div class="workflow-heading">
				<span class="workflow-kicker">{manualCreateAction.kicker}</span>
				<h2>{manualCreateAction.title}</h2>
			</div>
			<span class="workflow-icon" aria-hidden="true">
				<Plus />
			</span>
		</header>

		<p class="workflow-copy">{manualCreateAction.description}</p>

		<form class="quick-create" onsubmit={(event) => void onManualSubmit(event)}>
			<label class="quick-create__label" for={manualTitleInputId}>Title</label>
			<div class="quick-create__row">
				<input
					id={manualTitleInputId}
					class="quick-create__input"
					type="text"
					value={manualActionTitle}
					placeholder={manualCreateAction.placeholder}
					disabled={manualActionBusy || !manualCreateAction.canCreate}
					aria-invalid={manualActionError ? 'true' : undefined}
					aria-describedby={manualActionError ? 'manual-create-error' : undefined}
					oninput={(event) => onManualTitleInput(event.currentTarget.value)}
				/>
				<button
					type="submit"
					class="quick-create__button"
					disabled={manualActionBusy || !manualCreateAction.canCreate || !manualActionTitle.trim()}
					title={manualCreateAction.disabledReason ?? undefined}
				>
					<Plus aria-hidden="true" />
					<span>{manualActionBusy ? 'Creating...' : manualCreateAction.buttonLabel}</span>
				</button>
			</div>
			{#if manualCreateAction.disabledReason}
				<p class="workflow-note">{manualCreateAction.disabledReason}</p>
			{/if}
			{#if manualActionError}
				<p id="manual-create-error" class="workflow-error" role="alert">{manualActionError}</p>
			{/if}
		</form>
	</section>

	<section class="ai-workflow-lane" aria-label="AI outline proposal">
		<header class="ai-workflow-header">
			<span class="workflow-icon workflow-icon--ai" aria-hidden="true">
				<Sparkles />
			</span>
			<div class="workflow-heading">
				<span class="workflow-kicker">AI proposal</span>
				<h2>Generate, review, merge</h2>
			</div>
		</header>
		{@render aiPanel()}
		{#if outlineRefreshStatus}
			<p class="outline-refresh-status" role="status">{outlineRefreshStatus}</p>
		{/if}
	</section>
</section>

<style>
	.outline-workbench {
		display: grid;
		grid-template-columns: minmax(18rem, 0.9fr) minmax(20rem, 1.1fr);
		gap: var(--space-5);
		align-items: start;
		margin-bottom: var(--space-5);
		width: min(920px, 100%);
	}

	.manual-workflow-tool {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-raised) 86%, transparent);
	}

	.workflow-header,
	.ai-workflow-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.ai-workflow-header {
		justify-content: flex-start;
		margin-bottom: var(--space-3);
	}

	.workflow-heading {
		display: grid;
		gap: var(--space-1);
		min-width: 0;
	}

	.workflow-kicker,
	.quick-create__label,
	.workflow-note,
	.outline-refresh-status {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.workflow-kicker,
	.quick-create__label {
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-weight: var(--font-weight-semibold);
	}

	.workflow-heading h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		color: var(--color-text-primary);
	}

	.workflow-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 1px solid color-mix(in srgb, var(--color-teal) 42%, var(--color-border-default));
		border-radius: var(--radius-md);
		color: var(--color-teal);
		background: color-mix(in srgb, var(--color-teal) 12%, transparent);
		flex: 0 0 auto;
	}

	.workflow-icon :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.workflow-icon--ai {
		color: color-mix(in srgb, var(--color-candle) 82%, var(--color-text-primary));
		border-color: color-mix(in srgb, var(--color-candle) 42%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-candle) 10%, transparent);
	}

	.workflow-copy {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.quick-create {
		display: grid;
		gap: var(--space-2);
	}

	.quick-create__row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--space-2);
		align-items: center;
	}

	.quick-create__input {
		width: 100%;
		min-width: 0;
		height: 2.35rem;
		padding: 0 var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-ground) 72%, transparent);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}

	.quick-create__input:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-teal) 62%, var(--color-border-default));
	}

	.quick-create__input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.quick-create__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: 2.35rem;
		padding: 0 var(--space-3);
		border: 1px solid color-mix(in srgb, var(--color-teal) 55%, var(--color-border-default));
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-teal) 18%, transparent);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		white-space: nowrap;
	}

	.quick-create__button :global(svg) {
		width: 0.9rem;
		height: 0.9rem;
	}

	.quick-create__button:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-teal) 28%, transparent);
	}

	.quick-create__button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.workflow-note,
	.workflow-error,
	.outline-refresh-status {
		margin: 0;
		line-height: var(--leading-relaxed);
	}

	.workflow-error {
		font-size: var(--text-xs);
		color: color-mix(in srgb, var(--color-destructive) 82%, var(--color-text-primary));
	}

	.ai-workflow-lane {
		min-width: 0;
		display: grid;
		gap: var(--space-2);
	}

	.outline-refresh-status {
		color: var(--color-text-secondary);
	}

	@media (max-width: 980px) {
		.outline-workbench {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 620px) {
		.quick-create__row {
			grid-template-columns: 1fr;
		}

		.quick-create__button {
			width: 100%;
		}
	}
</style>
