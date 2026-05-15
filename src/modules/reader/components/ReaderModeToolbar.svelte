<script lang="ts">
	import PillNav from '$lib/components/ui/PillNav.svelte';
	import { getReaderMode, setReaderMode, type ReaderMode } from '$lib/stores/reader-mode.svelte.js';

	let {
		showExitFullscreen = false,
		onExitFullscreen,
	}: {
		showExitFullscreen?: boolean;
		onExitFullscreen?: () => void;
	} = $props();

	const modeItems = [
		{ id: 'classic', label: 'Classic' },
		{ id: 'book', label: 'Book' },
		{ id: 'fullscreen', label: 'Full Screen' },
	];

	function handleModeSelect(id: string) {
		setReaderMode(id as ReaderMode);
	}
</script>

	<div class="reader-toolbar">
		<div class="reader-toolbar__left">
			<a class="reader-toolbar__back" href="/projects">Back to Projects</a>
		</div>

	<div class="reader-toolbar__center">
		<PillNav
			items={modeItems}
			activeId={getReaderMode()}
			onSelect={handleModeSelect}
			ariaLabel="Reader mode"
		/>
	</div>

	<div class="reader-toolbar__right">
		{#if showExitFullscreen}
			<button type="button" class="reader-toolbar__exit" onclick={onExitFullscreen}>
				Exit full screen
			</button>
		{/if}
	</div>
</div>

<style>
	.reader-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-5);
		border-bottom: 1px solid var(--color-border-subtle);
		background: var(--color-surface-base);
		min-height: 64px;
	}

	.reader-toolbar__left,
	.reader-toolbar__right {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.reader-toolbar__right {
		justify-content: flex-end;
	}

	.reader-toolbar__back {
		text-decoration: none;
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		padding: var(--space-1) 0;
		border-bottom: 1px solid transparent;
		transition:
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.reader-toolbar__back:hover {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
	}

	.reader-toolbar__back:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-xs);
	}

	.reader-toolbar__exit {
		appearance: none;
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		font: inherit;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.reader-toolbar__exit:hover {
		color: var(--color-text-primary);
	}

	.reader-toolbar__exit:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 640px) {
		.reader-toolbar {
			flex-direction: column;
			gap: var(--space-3);
			padding: var(--space-4);
			min-height: auto;
		}

		.reader-toolbar__left,
		.reader-toolbar__right {
			flex: none;
			width: 100%;
			justify-content: center;
		}
	}
</style>
