<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		width = 480,
		topOffset = 0,
		accentColor = 'var(--color-teal)',
		onResize,
		children,
	} = $props<{
		width?: number;
		topOffset?: number;
		/** CSS color value applied as the left-accent (border + shadow tint). Pass a CSS variable or literal color. */
		accentColor?: string;
		/** If provided, a drag-resize handle is rendered on the left edge. */
		onResize?: (w: number) => void;
		children: Snippet;
	}>();

	function startResize(e: MouseEvent) {
		if (!onResize) return;
		const startX = e.clientX;
		const startWidth = width;
		e.preventDefault();

		function onMouseMove(ev: MouseEvent) {
			const delta = startX - ev.clientX;
			const next = Math.max(320, Math.min(startWidth + delta, 680));
			onResize!(next);
		}

		function onMouseUp() {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}
</script>

<aside
	class="planning-surface-card"
	style="--ps-accent: {accentColor}; --ps-width: {width}px; margin-top: {topOffset}px"
>
	{#if onResize}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="ps-resize-handle"
			role="separator"
			aria-label="Resize panel"
			aria-orientation="vertical"
			onmousedown={startResize}
		></div>
	{/if}
	{@render children()}
</aside>

<style>
	/* ── Card shell ── */
	.planning-surface-card {
		width: var(--ps-width, 480px);
		min-width: 320px;
		max-width: 680px;
		flex-shrink: 0;
		align-self: flex-start;
		position: sticky;
		top: var(--space-6);
		max-height: calc(100vh - var(--space-6));
		min-height: calc(100vh - var(--space-6));
		display: flex;
		flex-direction: column;
		overflow: hidden;
		/* Left-side rounding: card reads as a floating surface emerging from the right edge */
		border-top-left-radius: var(--radius-lg);
		border-bottom-left-radius: var(--radius-lg);
		/* Tinted left border driven by accent CSS var */
		border-left: 3px solid color-mix(in srgb, var(--ps-accent) 55%, transparent);
		border-top: 1px solid color-mix(in srgb, var(--color-border-default) 80%, transparent);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 60%, transparent);
		background: var(--color-surface-elevated);
		box-shadow:
			-14px 0 48px rgba(0, 0, 0, 0.65),
			-2px 0 10px color-mix(in srgb, var(--ps-accent) 10%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		/* Smooth anchor transition when selected item changes */
		transition: margin-top 280ms var(--ease-editorial);
		animation: ps-enter 220ms var(--ease-editorial) forwards;
	}

	@keyframes ps-enter {
		from {
			opacity: 0;
			transform: translateX(16px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* ── Resize handle ── */
	.ps-resize-handle {
		position: absolute;
		left: 0;
		top: 0;
		width: 5px;
		height: 100%;
		cursor: col-resize;
		background: transparent;
		z-index: 2;
		border-top-left-radius: var(--radius-lg);
		border-bottom-left-radius: var(--radius-lg);
		transition: background 0.15s;
	}

	.ps-resize-handle:hover {
		background: color-mix(in srgb, var(--ps-accent) 35%, transparent);
	}
</style>
