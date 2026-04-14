<!--
  HeroTitleRail: Bottom-anchored story navigator.
  ← prev · active title · next → with directional arrows.
  Center is dominant; adjacent titles are muted and navigable.
  Layout zones maintain symmetry even at sequence ends.
-->
<script lang="ts">
	import type { WorkspaceMode } from '../types.js';
	import type { ArcType } from '$lib/db/types.js';

	const ARC_TYPES: { value: ArcType; label: string }[] = [
		{ value: 'character', label: 'Character' },
		{ value: 'plot', label: 'Plot' },
		{ value: 'relationship', label: 'Relationship' },
		{ value: 'thematic', label: 'Thematic' },
		{ value: 'world', label: 'World' },
	];

	let {
		items,
		activeIndex,
		emptyLabel,
		onNavigate,
		mode,
		focusedArcType = null,
		onArcTypeFocus,
	}: {
		items: { id: string; title: string }[];
		activeIndex: number;
		emptyLabel: string;
		onNavigate: (index: number) => void;
		mode?: WorkspaceMode;
		focusedArcType?: ArcType | null;
		onArcTypeFocus?: (t: ArcType | null) => void;
	} = $props();

	const prev = $derived(activeIndex > 0 ? (items[activeIndex - 1] ?? null) : null);
	const current = $derived(activeIndex >= 0 ? (items[activeIndex] ?? null) : null);
	const next = $derived(
		activeIndex >= 0 && activeIndex < items.length - 1 ? (items[activeIndex + 1] ?? null) : null,
	);

	const showArcTypes = $derived(mode === 'arcs');

	const centerLabel = $derived(items.length === 0 || current === null ? emptyLabel : current.title);

	function toggleArcType(t: ArcType) {
		onArcTypeFocus?.(focusedArcType === t ? null : t);
	}
</script>

<nav class="title-rail" aria-label="Item navigation">
	<!-- LEFT — previous item -->
	<div class="rail-zone rail-zone--left">
		{#if prev}
			<button
				class="rail-adj"
				onclick={() => onNavigate(activeIndex - 1)}
				aria-label="Previous: {prev.title}"
				type="button"
			>
				<svg
					class="rail-adj__arrow"
					width="11"
					height="11"
					viewBox="0 0 11 11"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M7 1.5L2.5 5.5L7 9.5"
						stroke="currentColor"
						stroke-width="1.25"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span class="rail-adj__title">{prev.title}</span>
			</button>
		{/if}
	</div>

	<!-- CENTER — active item or arc type list -->
	<div class="rail-zone rail-zone--center">
		{#if showArcTypes}
			<div class="arc-type-list" role="group" aria-label="Arc types">
				{#each ARC_TYPES as t, i (t.value)}
					{#if i > 0}<span class="arc-type-sep" aria-hidden="true">|</span>{/if}
					<button
						class="arc-type-item"
						class:arc-type-item--active={focusedArcType === t.value}
						onclick={() => toggleArcType(t.value)}
						type="button"
						aria-pressed={focusedArcType === t.value}>{t.label}</button
					>
				{/each}
			</div>
		{:else}
			{#key centerLabel}
				<span class="rail-center" aria-current="true">{centerLabel}</span>
			{/key}
		{/if}
	</div>

	<!-- RIGHT — next item -->
	<div class="rail-zone rail-zone--right">
		{#if next}
			<button
				class="rail-adj rail-adj--right"
				onclick={() => onNavigate(activeIndex + 1)}
				aria-label="Next: {next.title}"
				type="button"
			>
				<span class="rail-adj__title">{next.title}</span>
				<svg
					class="rail-adj__arrow"
					width="11"
					height="11"
					viewBox="0 0 11 11"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M4 1.5L8.5 5.5L4 9.5"
						stroke="currentColor"
						stroke-width="1.25"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		{/if}
	</div>
</nav>

<style>
	.title-rail {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 40px;
		padding: 0 var(--space-8);
		display: flex;
		align-items: center;
		border-top: 1px solid var(--color-border-subtle);
		background: linear-gradient(
			to top,
			var(--color-surface-raised) 0%,
			color-mix(in srgb, var(--color-surface-raised) 80%, transparent) 60%,
			transparent 100%
		);
	}

	/* ── Zones ── */
	.rail-zone {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.rail-zone--left {
		flex: 0 1 28%;
		justify-content: flex-start;
	}

	.rail-zone--center {
		flex: 1;
		justify-content: center;
		overflow: hidden;
		padding: 0 var(--space-4);
	}

	.rail-zone--right {
		flex: 0 1 28%;
		justify-content: flex-end;
	}

	/* ── Center label ── */
	.rail-center {
		display: block;
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		text-align: center;
		letter-spacing: var(--tracking-tight);
		animation: rail-enter var(--duration-enter) var(--ease-decelerate) both;
	}

	@keyframes rail-enter {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ── Adjacent items ── */
	.rail-adj {
		display: flex;
		align-items: center;
		gap: 5px;
		background: none;
		border: none;
		padding: var(--space-2) 0;
		font-family: var(--font-sans);
		color: var(--color-text-muted);
		opacity: 0.4;
		cursor: pointer;
		min-width: 0;
		max-width: 100%;
		transition:
			opacity var(--duration-base) var(--ease-standard),
			color var(--duration-base) var(--ease-standard);
	}

	.rail-adj:hover {
		opacity: 0.75;
		color: var(--color-text-secondary);
	}

	.rail-adj:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-xs);
		opacity: 0.75;
	}

	.rail-adj__arrow {
		flex-shrink: 0;
		color: currentColor;
	}

	.rail-adj__title {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-normal);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	/* ── Arc type list ── */
	.arc-type-list {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.arc-type-sep {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		opacity: 0.25;
		user-select: none;
	}

	.arc-type-item {
		background: none;
		border: none;
		padding: 3px var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		opacity: 0.5;
		cursor: pointer;
		border-radius: var(--radius-sm);
		letter-spacing: var(--tracking-wide);
		transition:
			color var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard),
			background var(--duration-fast) var(--ease-standard);
	}

	.arc-type-item:hover {
		color: var(--color-text-secondary);
		opacity: 1;
		background: var(--color-surface-glass);
	}

	.arc-type-item--active {
		color: var(--color-nova-blue);
		opacity: 1;
		background: color-mix(in srgb, var(--color-nova-blue) 8%, transparent);
	}

	.arc-type-item--active:hover {
		color: var(--color-nova-blue);
		background: color-mix(in srgb, var(--color-nova-blue) 12%, transparent);
	}

	.arc-type-item:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.rail-center {
			animation: none;
		}
	}
</style>
