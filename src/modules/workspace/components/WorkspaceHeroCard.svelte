<!--
  WorkspaceHeroCard: Structural mode identity display.
  Shows the active mode's display name and conceptual description.
  Selected-item detail is handled separately by WorkspaceDetailCard.
-->
<script lang="ts">
	import type { WorkspaceMode } from '../types.js';
	import type { CoreArcType, ArcType } from '$lib/db/types.js';

	let { mode, focusedArcType = null }: { mode: WorkspaceMode; focusedArcType?: ArcType | null } =
		$props();

	const modeNames: Record<WorkspaceMode, string> = {
		arcs: 'Arcs',
		acts: 'Acts',
		chapters: 'Chapters',
		scenes: 'Scenes',
	};

	const modeDesc: Record<WorkspaceMode, string> = {
		arcs: 'The major narrative movements of your story — transformations, thematic shifts, and long-form character change.',
		acts: 'The structural phases shaping momentum through setup, escalation, and resolution.',
		chapters: 'The readable units that control pacing and progression for the reader.',
		scenes:
			'The core units of action where characters pursue goals, encounter conflict, and create change.',
	};

	const modeDeep: Record<WorkspaceMode, { label: string; body: string; hint: string }> = {
		arcs: {
			label: 'What is an Arc?',
			body: 'An arc is a long-form narrative container — the largest unit of meaningful change in your story. It holds together the emotional or thematic journey of a character, relationship, or world-state across multiple acts and chapters.',
			hint: 'Think of an arc as the answer to: "What fundamentally changes across this story?"',
		},
		acts: {
			label: 'What is an Act?',
			body: 'An act is a structural phase that drives narrative momentum. It clusters chapters around a dramatic purpose — establishing the world, escalating conflict, reaching a turning point, or resolving stakes.',
			hint: 'Think of an act as the answer to: "What role does this stretch of story play?"',
		},
		chapters: {
			label: 'What is a Chapter?',
			body: "A chapter is the reader's primary unit of time. It controls the pace of information delivery, creates natural rest points, and shapes how the story is experienced from the outside.",
			hint: 'Think of a chapter as the answer to: "Where does the reader pause and what do they carry forward?"',
		},
		scenes: {
			label: 'What is a Scene?',
			body: 'A scene is the atomic unit of action. Every scene places a character in pursuit of a goal, introduces an obstacle, and produces a consequence that shifts the story — even by a fraction.',
			hint: 'Think of a scene as the answer to: "What happens, and how does it change what comes next?"',
		},
	};

	const arcTypeDeep: Record<CoreArcType, { label: string; body: string; hint: string }> = {
		character: {
			label: 'Character Arc',
			body: 'A character arc follows the inner transformation of a person — their beliefs, identity, or moral stance — driven by external events and internal resistance.',
			hint: 'Think: "Who does this character become, and why did it take this long?"',
		},
		plot: {
			label: 'Plot Arc',
			body: 'A plot arc tracks the external chain of cause and consequence — the events that escalate stakes, shift power, and drive the story toward a decisive resolution.',
			hint: 'Think: "What happens, and how does each event force the next?"',
		},
		relationship: {
			label: 'Relationship Arc',
			body: 'A relationship arc charts how the bond between two or more characters evolves — trust built or broken, alliances forged, love strained, and loyalties tested.',
			hint: 'Think: "How does the connection between these people change the story?"',
		},
		theme: {
			label: 'Theme Arc',
			body: "A theme arc is the story's argument — the idea it explores, challenges, and ultimately affirms or subverts across its full span.",
			hint: 'Think: "What question is this story asking, and what does it answer by the end?"',
		},
		world: {
			label: 'World Arc',
			body: "A world arc follows the transformation of a place, society, or system — how the story's events reshape the environment the characters inhabit.",
			hint: 'Think: "How is this world different by the time the story ends?"',
		},
	};

	const explainer = $derived(
		mode === 'arcs' && focusedArcType !== null && focusedArcType in arcTypeDeep
			? arcTypeDeep[focusedArcType as CoreArcType]
			: modeDeep[mode],
	);
</script>

{#key mode}
	<div class="mode-identity-row">
		<div class="mode-identity">
			<h2 class="mode-identity__name">{modeNames[mode]}</h2>
			<p class="mode-identity__desc">{modeDesc[mode]}</p>
		</div>
		{#key explainer}
			<div class="mode-explainer" aria-label="Concept explanation" aria-live="polite">
				<p class="mode-explainer__label">{explainer.label}</p>
				<p class="mode-explainer__body">{explainer.body}</p>
				<p class="mode-explainer__hint">{explainer.hint}</p>
			</div>
		{/key}
	</div>
{/key}

<style>
	.mode-identity-row {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: var(--space-6);
		animation: mode-appear var(--duration-enter) var(--ease-decelerate) both;
	}

	@keyframes mode-appear {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mode-identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		flex: 0 0 auto;
		min-width: 200px;
		max-width: 280px;
	}

	.mode-identity__name {
		font-family: var(--font-display);
		font-size: clamp(2.25rem, 5vw, 3.25rem);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		margin: 0;
	}

	.mode-identity__desc {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		max-width: 38ch;
		margin: 0;
		opacity: 0.6;
	}

	.mode-explainer {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface-glass);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		align-self: center;
		min-width: 0;
		animation: explainer-enter var(--duration-base) var(--ease-decelerate) both;
	}

	@keyframes explainer-enter {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mode-explainer__label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.mode-explainer__body {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	.mode-explainer__hint {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
		font-style: italic;
	}

	@media (prefers-reduced-motion: reduce) {
		.mode-identity-row {
			animation: none;
		}
		.mode-explainer {
			animation: none;
		}
	}
</style>
