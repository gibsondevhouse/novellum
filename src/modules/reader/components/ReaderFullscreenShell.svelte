<script lang="ts">
	import type { ReaderInputChapter, ReaderInputProject } from '$modules/reader/reader-pages.js';
	import BookReaderView from './BookReaderView.svelte';
	import PillNav from '$lib/components/ui/PillNav.svelte';
	import { getReaderMode, setReaderMode, type ReaderMode } from '$lib/stores/reader-mode.svelte.js';

	interface Props {
		project: ReaderInputProject;
		chapters: ReaderInputChapter[];
		onExit: () => void;
	}

	let { project, chapters, onExit }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onExit();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="reader-fullscreen"
	role="dialog"
	aria-modal="true"
	aria-label="Full screen book reader"
>
	<div class="reader-fullscreen__topbar">
		<PillNav
			items={[
				{ id: 'classic', label: 'Classic' },
				{ id: 'book', label: 'Book' },
				{ id: 'fullscreen', label: 'Full Screen' },
			]}
			activeId={getReaderMode()}
			onSelect={(id) => setReaderMode(id as ReaderMode)}
			ariaLabel="Reader mode"
		/>
		<button type="button" class="reader-fullscreen__exit" onclick={onExit}>
			Exit full screen
		</button>
	</div>

	<div class="reader-fullscreen__body">
		<BookReaderView {project} {chapters} fullscreen={true} />
	</div>
</div>

<style>
	.reader-fullscreen {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
	}

	.reader-fullscreen__topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-5);
		border-bottom: 1px solid var(--color-border-subtle);
		background: var(--color-surface-base);
	}

	.reader-fullscreen__exit {
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

	.reader-fullscreen__exit:hover {
		color: var(--color-text-primary);
	}

	.reader-fullscreen__exit:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.reader-fullscreen__body {
		flex: 1;
		display: flex;
		align-items: stretch;
		justify-content: center;
		overflow: auto;
	}
</style>
