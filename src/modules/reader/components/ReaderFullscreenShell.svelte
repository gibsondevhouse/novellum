<script lang="ts">
	import type { ReaderInputChapter, ReaderInputProject } from '$modules/reader/reader-pages.js';
	import BookReaderView from './BookReaderView.svelte';
	import ReaderModeToolbar from './ReaderModeToolbar.svelte';

	interface Props {
		project: ReaderInputProject;
		chapters: ReaderInputChapter[];
		onExit: () => void;
		/**
		 * plan-023 stage-003: forwarded to the embedded `BookReaderView`
		 * so the deep-link target survives the fullscreen wrapper.
		 */
		targetPageId?: string | null;
	}

	let { project, chapters, onExit, targetPageId = null }: Props = $props();

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
	<ReaderModeToolbar showExitFullscreen={true} onExitFullscreen={onExit} />

	<div class="reader-fullscreen__body">
		<BookReaderView {project} {chapters} {targetPageId} fullscreen={true} />
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

	.reader-fullscreen__body {
		flex: 1;
		display: flex;
		align-items: stretch;
		justify-content: center;
		overflow: auto;
	}
</style>
