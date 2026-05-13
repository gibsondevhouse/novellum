<!--
	SceneSignalNudge — dismissible warn-signal chips on the editor canvas.

	Floats at the bottom-right of the editor area when warn-severity signals
	are present. Each chip has a one-click "Ask Nova" button that pre-fills
	the Nova composer with a targeted, goal-aware prompt so the writer can
	address the signal without leaving their flow or hunting through panels.

	Dismissed state resets when sceneId changes so stale dismissals from
	a previous scene don't hide valid nudges in the next.
-->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { SvelteSet } from 'svelte/reactivity';
	import { novaPanel } from '$modules/nova';
	import { signalToNovaPrompt } from '../services/scene-analysis-utils.js';

	// Signals that warrant a nudge. OK and info signals are surfaced in the
	// compass panel; only actionable warnings get inline real estate.
	const WARN_SIGNAL_SET = new Set([
		'Low tension detected in recent paragraphs.',
		'No clear conflict present yet.',
		'No turning point detected yet.',
		'Scene may be drifting from its goal.',
	]);

	interface Props {
		signals: string[];
		sceneGoal: string;
		/** Changes here reset dismissed state so stale dismissals don't bleed across scenes. */
		sceneId: string | null;
	}

	let { signals, sceneGoal, sceneId }: Props = $props();

	const dismissed = new SvelteSet<string>();

	$effect(() => {
		void sceneId;
		dismissed.clear();
	});

	const visibleNudges = $derived(
		signals.filter((s) => WARN_SIGNAL_SET.has(s) && !dismissed.has(s)).slice(0, 3),
	);

	function dismiss(signal: string): void {
		dismissed.add(signal);
	}

	function askNova(signal: string): void {
		novaPanel.openWithPrompt(signalToNovaPrompt(signal, sceneGoal));
	}
</script>

{#if visibleNudges.length > 0}
	<div class="nudge-stack" aria-label="Writing signals" role="status" aria-live="polite">
		{#each visibleNudges as nudge (nudge)}
			<div class="nudge-chip" transition:fly={{ x: 24, duration: 200, opacity: 0 }}>
				<svg class="nudge-warn-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
					<line x1="12" y1="9" x2="12" y2="13"/>
					<line x1="12" y1="17" x2="12.01" y2="17"/>
				</svg>
				<span class="nudge-text">{nudge}</span>
				<button
					type="button"
					class="nudge-btn nudge-btn--nova"
					onclick={() => askNova(nudge)}
					aria-label="Ask Nova: {nudge}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.88 5.76a2 2 0 0 0 1.27 1.27L21 12l-5.85 1.97a2 2 0 0 0-1.27 1.27L12 21l-1.88-5.76a2 2 0 0 0-1.27-1.27L3 12l5.85-1.97a2 2 0 0 0 1.27-1.27L12 3z"/></svg>
					Ask Nova
				</button>
				<button
					type="button"
					class="nudge-btn nudge-btn--dismiss"
					onclick={() => dismiss(nudge)}
					aria-label="Dismiss: {nudge}"
				>×</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.nudge-stack {
		position: absolute;
		bottom: 24px;
		right: 20px;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		z-index: 20;
		pointer-events: none;
		max-width: 340px;
		width: max-content;
	}

	.nudge-chip {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: color-mix(in srgb, var(--color-surface-elevated, #fff) 96%, transparent);
		border: 1px solid var(--color-border-default);
		border-left: 3px solid hsl(38deg 90% 55%);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(10px);
		pointer-events: auto;
	}

	.nudge-warn-icon {
		flex-shrink: 0;
		color: hsl(38deg 90% 50%);
	}

	.nudge-text {
		flex: 1;
		font-size: 11px;
		line-height: 1.4;
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nudge-btn {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 2px 6px;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		font-size: 11px;
		font-weight: var(--font-weight-medium);
		line-height: 1.4;
		cursor: pointer;
		background: transparent;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.nudge-btn--nova {
		color: var(--color-nova-blue);
		border-color: color-mix(in srgb, var(--color-nova-blue) 30%, transparent);
	}

	.nudge-btn--nova:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 10%, transparent);
	}

	.nudge-btn--dismiss {
		color: var(--color-text-muted);
		font-size: 14px;
		line-height: 1;
		padding: 1px 5px;
	}

	.nudge-btn--dismiss:hover {
		color: var(--color-text-secondary);
		background: var(--color-surface-overlay);
	}

	/* Compact layout on very narrow viewports */
	@media (max-width: 640px) {
		.nudge-stack {
			right: 8px;
			bottom: 12px;
			max-width: calc(100vw - 16px);
		}

		.nudge-text {
			max-width: 180px;
		}
	}
</style>
