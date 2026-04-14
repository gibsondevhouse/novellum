<!--
  StructureCarousel: Horizontal carousel showing 3 poster cards at a time.
  Left/right arrow navigation. Mode-keyed so it resets on mode switch.
-->
<script lang="ts">
	import type { WorkspaceMode } from '../types.js';
	import StructureCrudCard from './StructureCrudCard.svelte';
	import CreateStructureCard from './CreateStructureCard.svelte';

	let {
		items,
		selectedId,
		mode,
		onCreate,
		onSelect,
		onRename,
		onDelete,
	}: {
		items: Array<{ id: string; title: string; subtitle: string }>;
		selectedId: string | null;
		mode: WorkspaceMode;
		onCreate: () => void;
		onSelect: (id: string) => void;
		onRename: (id: string, newTitle: string) => void;
		onDelete: (id: string) => void;
	} = $props();

	const VISIBLE = 3;
	const GAP = 12; // --space-3

	let offset = $state(0);
	let viewportEl = $state<HTMLElement | undefined>(undefined);

	// total = items + 1 create card
	const total = $derived(items.length + 1);
	const canPrev = $derived(offset > 0);
	const canNext = $derived(offset + VISIBLE < total);

	// Clamp offset if items shrink
	$effect(() => {
		const max = Math.max(0, total - VISIBLE);
		if (offset > max) offset = max;
	});

	// Scroll viewport to match offset
	$effect(() => {
		if (!viewportEl) return;
		const slot = viewportEl.querySelector<HTMLElement>('.carousel-slot');
		if (!slot) return;
		const cardW = slot.offsetWidth;
		viewportEl.scrollTo({ left: offset * (cardW + GAP), behavior: 'smooth' });
	});

	function prev() {
		if (canPrev) offset = Math.max(0, offset - 1);
	}

	function next() {
		if (canNext) offset = Math.min(total - VISIBLE, offset + 1);
	}

	function handleCarouselKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prev();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			next();
		}
	}
</script>

<div
	class="carousel"
	role="listbox"
	aria-label="Story structure items"
	tabindex="0"
	onkeydown={handleCarouselKeydown}
>
	<button
		class="carousel-arrow"
		onclick={prev}
		disabled={!canPrev}
		aria-label="Previous"
	>
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M10 3L5.5 8L10 13"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#key mode}
		<div class="carousel-viewport" bind:this={viewportEl}>
			<div class="carousel-track">
				{#each items as item (item.id)}
					<div class="carousel-slot">
						<StructureCrudCard
							id={item.id}
							title={item.title}
							subtitle={item.subtitle}
							selected={item.id === selectedId}
							{onSelect}
							{onRename}
							{onDelete}
						/>
					</div>
				{/each}
				<div class="carousel-slot carousel-slot--create">
					<CreateStructureCard {mode} {onCreate} />
				</div>
			</div>
		</div>
	{/key}

	<button class="carousel-arrow" onclick={next} disabled={!canNext} aria-label="Next">
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M6 3L10.5 8L6 13"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
</div>

<style>
	.carousel {
		display: flex;
		align-items: stretch;
		gap: var(--space-2);
		animation: carousel-appear var(--duration-enter) var(--ease-decelerate) both;
	}

	@keyframes carousel-appear {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.carousel-arrow {
		flex: 0 0 36px;
		width: 36px;
		align-self: center;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;
		transition:
			color var(--duration-fast) var(--ease-standard),
			background var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard);
	}

	.carousel-arrow:hover:not(:disabled) {
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
		border-color: var(--color-border-default);
	}

	.carousel-arrow:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.carousel-arrow:disabled {
		opacity: 0.2;
		pointer-events: none;
	}

	.carousel-viewport {
		flex: 1;
		overflow-x: scroll;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}

	.carousel-viewport::-webkit-scrollbar {
		display: none;
	}

	.carousel-track {
		display: flex;
		gap: var(--space-3);
		/* track stretches to fit all cards; card width drives the math */
	}

	.carousel-slot {
		/* Each slot takes exactly 1/3 of the viewport,
		   accounting for 2 gaps of --space-3 between 3 cards */
		flex: 0 0 calc((100% - 2 * var(--space-3)) / 3);
	}

	/* CreateStructureCard fills poster height via its container */
	.carousel-slot--create {
		display: flex;
	}

	@media (prefers-reduced-motion: reduce) {
		.carousel {
			animation: none;
		}
	}
</style>
