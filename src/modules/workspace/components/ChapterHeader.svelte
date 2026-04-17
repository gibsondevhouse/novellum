<script lang="ts">
	import type { Chapter } from '$lib/db/types.js';

	let { chapter, onUpdateChapter, onDeleteChapter } = $props<{
		chapter: Chapter;
		onUpdateChapter?: (id: string, changes: Partial<Chapter>) => void;
		onDeleteChapter?: (id: string) => void;
	}>();

	let editChapter = $state({
		title: '',
		summary: '',
	});

	$effect(() => {
		if (chapter) {
			editChapter.title = chapter.title || '';
			editChapter.summary = chapter.summary || '';
		}
	});

	function handleFieldUpdate(field: keyof typeof editChapter, value: string) {
		(editChapter as Record<string, unknown>)[field] = value;
		onUpdateChapter?.(chapter.id, { [field]: value });
	}
</script>

<header class="chapter-header">
	<div class="header-left">
		<div class="title-row">
			<span class="chapter-ordinal">Ch. {chapter.order + 1}</span>
			<input
				type="text"
				class="chapter-title-input"
				bind:value={editChapter.title}
				onchange={() => handleFieldUpdate('title', editChapter.title)}
				placeholder="Untitled Chapter"
			/>
			<button class="delete-chapter-btn" onclick={() => onDeleteChapter?.(chapter.id)} title="Delete chapter">&times;</button>
		</div>
	</div>
	<div class="header-right">
		<span class="field-label">Chapter Purpose</span>
		<textarea
			class="chapter-summary-input"
			bind:value={editChapter.summary}
			onchange={() => handleFieldUpdate('summary', editChapter.summary)}
			placeholder="What does this chapter accomplish for the reader?"
			rows="3"
		></textarea>
	</div>
</header>

<style>
	.chapter-header {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		padding: var(--space-3) 0 var(--space-4);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		align-items: stretch;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.chapter-ordinal {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.chapter-title-input {
		font-size: var(--text-2xl);
		font-family: var(--font-display);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		border: 1px solid transparent;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		line-height: var(--leading-tight);
		flex: 1;
		min-width: 0;
	}

	.chapter-title-input:hover {
		background: var(--color-surface-hover);
	}

	.chapter-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.delete-chapter-btn {
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-tertiary);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		line-height: 1;
		transition: color 0.15s ease, background 0.15s ease;
	}

	.delete-chapter-btn:hover {
		color: var(--color-danger, #ef4444);
		background: var(--color-surface-hover);
	}

	.header-right {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-top: var(--space-1);
	}

	.field-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.chapter-summary-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		border: 1px solid transparent;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.6;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
		width: 100%;
		min-height: 2.4rem;
	}

	.chapter-summary-input:hover {
		background: var(--color-surface-hover);
	}

	.chapter-summary-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}
</style>
