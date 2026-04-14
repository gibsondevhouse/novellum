<!--
  WorkspaceHeroShell: Dominant hero section of the Workspace.
  Large, premium card surface with quiet mode navigation,
  editorial hero content, and the bottom title rail.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { WorkspaceMode } from '../types.js';
	import type { ArcType } from '$lib/db/types.js';
	import StructureModeSwitcher from './StructureModeSwitcher.svelte';
	import HeroTitleRail from './HeroTitleRail.svelte';
	import { WORKSPACE_MODE_LABELS } from '../types.js';

	let {
		activeMode,
		items,
		activeIndex,
		onNavigate,
		onCreate,
		focusedArcType = null,
		onArcTypeFocus,
		children,
	}: {
		activeMode: WorkspaceMode;
		items: { id: string; title: string }[];
		activeIndex: number;
		onNavigate: (index: number) => void;
		onCreate: () => void;
		focusedArcType?: ArcType | null;
		onArcTypeFocus?: (t: ArcType | null) => void;
		children: Snippet;
	} = $props();

	const emptyLabel = $derived(
		`No ${WORKSPACE_MODE_LABELS[activeMode].slice(0, -1).toLowerCase()} selected`,
	);
</script>

<section class="workspace-hero" aria-label="Structure overview">
	<header class="workspace-hero__nav">
		<StructureModeSwitcher {activeMode} />
		<button
			class="workspace-hero__new"
			onclick={onCreate}
			type="button"
			aria-label="Create new item"
		>
			NEW +
		</button>
	</header>
	<div class="workspace-hero__body">
		{#key activeMode}
			<div class="workspace-hero__body-inner">
				{@render children()}
			</div>
		{/key}
	</div>
	<HeroTitleRail
		{items}
		{activeIndex}
		{emptyLabel}
		{onNavigate}
		mode={activeMode}
		{focusedArcType}
		{onArcTypeFocus}
	/>
</section>

<style>
	.workspace-hero {
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		min-height: 320px;
		display: flex;
		flex-direction: column;
		position: sticky;
		top: 0;
		z-index: 1;
		overflow: hidden;
		/* Bottom clearance for the absolutely-positioned rail */
		padding-bottom: 40px;
	}

	.workspace-hero__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-5) var(--space-8) 0;
	}

	.workspace-hero__new {
		background: none;
		border: none;
		padding: 0;
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.35;
		cursor: pointer;
		transition: opacity var(--duration-base) var(--ease-standard);
		user-select: none;
	}

	.workspace-hero__new:hover {
		opacity: 0.75;
	}

	.workspace-hero__new:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-xs);
	}

	.workspace-hero__body {
		flex: 1;
		padding: var(--space-4) var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.workspace-hero__body-inner {
		animation: hero-mode-enter var(--duration-enter) var(--ease-decelerate) both;
		width: 100%;
	}

	@keyframes hero-mode-enter {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.workspace-hero__body-inner {
			animation: none;
		}
	}
</style>
