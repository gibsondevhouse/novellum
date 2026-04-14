<!--
  EmptyDetailCard: Shown in the detail slot when no item is selected.
  Provides a deeper conceptual explanation of the active mode,
  including structural relationships to adjacent modes.
-->
<script lang="ts">
	import type { WorkspaceMode } from '../types.js';
	import type { ArcType } from '$lib/db/types.js';

	let {
		mode,
		focusedArcType = null,
	}: {
		mode: WorkspaceMode;
		focusedArcType?: ArcType | null;
	} = $props();

	type EmptyDetail = {
		eyebrow: string;
		heading: string;
		intro: string;
		relationship: string;
		tip: string;
	};

	const arcTypeContent: Record<ArcType, EmptyDetail> = {
		character: {
			eyebrow: 'Arc Type',
			heading: 'Character Arc',
			intro:
				'A character arc tracks the internal transformation of a person — their beliefs, identity, or moral stance shifting under the pressure of events. The arc begins with who they are, and ends with who they have become.',
			relationship:
				'Acts are the pressure chambers of a character arc. Each act should mark a threshold moment — a point where the character is forced to choose, fail, or change in a way that cannot be undone. The first act establishes the wound or flaw; middle acts test it; the final act demands resolution.',
			tip: 'Ask what your character believes at the start, and what they believe at the end. Each act should make the gap between those states feel earned.',
		},
		plot: {
			eyebrow: 'Arc Type',
			heading: 'Plot Arc',
			intro:
				'A plot arc traces the external chain of events — the escalating sequence of action, consequence, and decision that drives the story toward its resolution. It is the engine of what happens.',
			relationship:
				'Acts are the structural stages of a plot arc. Each act should close one door and open another — raising stakes, reversing fortunes, or revealing information that changes what is possible. The plot arc uses acts as gears: each one shifts the speed and direction of narrative momentum.',
			tip: "Every act transition should make the protagonist's situation meaningfully harder, more dangerous, or more irreversible.",
		},
		relationship: {
			eyebrow: 'Arc Type',
			heading: 'Relationship Arc',
			intro:
				'A relationship arc maps the evolution of a bond between two or more characters — trust built or destroyed, distance closed or opened, loyalty formed or fractured. It tracks not just what happens between people, but what it costs them.',
			relationship:
				'Acts create the conditions for relationship change. Each act should shift the relational dynamic in a meaningful way — a betrayal, a confession, a test of loyalty, a moment of rupture or reunion. By the act boundary, the relationship should be in a different state than it entered.',
			tip: "Map each act's effect on your characters' dynamic. If an act ends and the relationship is unchanged, something is missing.",
		},
		thematic: {
			eyebrow: 'Arc Type',
			heading: 'Thematic Arc',
			intro:
				"A thematic arc is the story's argument — the central question it raises, explores, and ultimately answers or leaves open. It is what the story is about beneath the surface of what happens.",
			relationship:
				'Acts develop the thematic arc by putting the central idea under increasing pressure. Each act should introduce a new dimension or complication of the theme — perhaps first presenting the question, then offering false answers, then forcing a confrontation with the truth. The final act is where the theme lands.',
			tip: 'Name the thematic question in one sentence. Then trace how each act makes that question harder to answer easily.',
		},
		world: {
			eyebrow: 'Arc Type',
			heading: 'World Arc',
			intro:
				'A world arc follows the transformation of a setting, society, or system — how the events of the story leave the world in a fundamentally different state. The world itself becomes a character with its own trajectory.',
			relationship:
				"Acts are milestones in the world's change. Each act should leave the world slightly more altered — a faction weakened, a law overturned, a city scarred, a belief system cracked. By the final act, the world should be recognizably transformed from where the story began.",
			tip: 'Track what your world looks like at the start and end of each act. The delta between those states is your world arc in motion.',
		},
	};

	const content: Record<WorkspaceMode, EmptyDetail> = {
		arcs: {
			eyebrow: 'Story Architecture',
			heading: 'Arcs & Acts',
			intro:
				'An arc is the largest unit of meaningful change in your story — the full journey of a character, relationship, or world-state from one condition to another. Every arc has a beginning tension and an ending resolution, even if that resolution is ambiguous.',
			relationship:
				"Acts live inside arcs. A single arc typically spans two or more acts, with each act serving a distinct phase of that arc's momentum: establishing the stakes, escalating the pressure, and landing the transformation. Acts are structural; arcs are thematic.",
			tip: 'Start by asking what fundamentally changes across your story. That change is your arc.',
		},
		acts: {
			eyebrow: 'Story Architecture',
			heading: 'Acts & Arcs',
			intro:
				'An act is a structural movement — a phase of the story where narrative energy flows in a consistent direction. Acts control momentum: they establish, escalate, pivot, or resolve. Within each act, chapters cluster around a shared dramatic purpose.',
			relationship:
				'Acts are the scaffolding inside an arc. While an arc describes the emotional journey, an act describes the mechanical staging of that journey. One arc may contain multiple acts; one act may serve multiple arcs simultaneously.',
			tip: 'Define each act by the single dramatic question it holds open — and the moment it closes.',
		},
		chapters: {
			eyebrow: 'Story Architecture',
			heading: 'Chapters & Acts',
			intro:
				"A chapter is the reader's primary unit of time. It creates a natural rest point — a moment where the reader pauses, processes what happened, and carries forward a shift in understanding or feeling.",
			relationship:
				"Chapters live inside acts. An act is made of chapters, and each chapter should advance the act's dramatic purpose while contributing its own localized tension and payoff. The rhythm of chapter length and density shapes how the act breathes.",
			tip: 'Each chapter should end in a different state than it began — even subtly.',
		},
		scenes: {
			eyebrow: 'Story Architecture',
			heading: 'Scenes & Chapters',
			intro:
				'A scene is the atomic building block of narrative action. Every scene places a character in pursuit of a goal, introduces an obstacle or complication, and produces a consequence that changes what is possible next.',
			relationship:
				'Scenes live inside chapters. A chapter is assembled from scenes, and the accumulation of scene-level conflict and consequence is what gives the chapter its shape. A strong scene leaves the story in a different position than it found it.',
			tip: 'A scene without a consequence is a description. Give every scene a result.',
		},
	};

	const c = $derived(
		mode === 'arcs' && focusedArcType !== null ? arcTypeContent[focusedArcType] : content[mode],
	);
</script>

{#key mode}
	<div class="empty-detail">
		{#key focusedArcType}
			<div class="empty-detail__primary">
				<span class="empty-detail__eyebrow">{c.eyebrow}</span>
				<h3 class="empty-detail__heading">{c.heading}</h3>
			</div>
			<div class="empty-detail__body">
				<p class="empty-detail__intro">{c.intro}</p>
				<p class="empty-detail__relationship">{c.relationship}</p>
				<p class="empty-detail__tip">{c.tip}</p>
			</div>
		{/key}
	</div>
{/key}

<style>
	.empty-detail {
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-5) var(--space-8);
		display: flex;
		align-items: flex-start;
		gap: var(--space-8);
		animation: detail-appear 180ms var(--ease-decelerate) both;
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
		overflow: hidden;
		height: 245px;
	}

	@keyframes detail-appear {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.empty-detail__primary,
	.empty-detail__body {
		animation: content-swap 160ms var(--ease-decelerate) both;
	}

	@keyframes content-swap {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.empty-detail__primary {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex-shrink: 0;
		min-width: 160px;
		max-width: 200px;
	}

	.empty-detail__eyebrow {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.4;
	}

	.empty-detail__heading {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		margin: 0;
		opacity: 0.4;
	}

	.empty-detail__body {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-top: 2px;
	}

	.empty-detail__intro,
	.empty-detail__relationship {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
		opacity: 0.55;
	}

	.empty-detail__tip {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
		font-style: italic;
		opacity: 0.45;
	}

	@media (max-width: 600px) {
		.empty-detail {
			flex-direction: column;
			gap: var(--space-3);
			padding: var(--space-4) var(--space-5);
		}
		.empty-detail__primary {
			min-width: unset;
			max-width: unset;
		}
	}
</style>
