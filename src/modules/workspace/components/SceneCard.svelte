<script lang="ts">
	import type { Scene } from '$lib/db/types.js';

	let { scene, selected, onSelect, onUpdateTitle, onUpdateSummary } = $props<{
		scene: Scene;
		selected: boolean;
		onSelect: () => void;
		onUpdateTitle: (value: string) => void;
		onUpdateSummary: (value: string) => void;
	}>();
</script>

<div class="scene-card" class:selected>
	<div class="scene-card-header">
		<input
			type="text"
			class="scene-title-input"
			value={scene.title}
			oninput={(e) => onUpdateTitle(e.currentTarget.value)}
			onclick={onSelect}
		/>
		<span class="scene-meta">
			{scene.wordCount > 0 ? `${scene.wordCount} words` : 'No content'}
		</span>
	</div>
	<textarea
		class="scene-summary-input"
		value={scene.summary}
		oninput={(e) => onUpdateSummary(e.currentTarget.value)}
		placeholder="What happens in this scene..."
		rows="2"
		onclick={() => { if (!selected) onSelect(); }}
	></textarea>
</div>

<style>
	.scene-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		min-height: var(--card-row-height, 148px);
		overflow: hidden;
	}

	.scene-card:hover {
		border-color: var(--color-border-hover);
		background: var(--color-surface-hover);
	}

	.scene-card.selected {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 1px var(--color-primary);
	}

	.scene-card-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.scene-title-input {
		font-size: var(--text-md);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		margin-left: calc(var(--space-2) * -1);
		border-radius: var(--radius-sm);
		flex: 1;
		min-width: 0;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.scene-title-input:hover {
		background: var(--color-surface-hover);
	}

	.scene-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.scene-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.scene-summary-input {
		font-family: inherit;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		background: transparent;
		border: 1px solid transparent;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		resize: none;
		line-height: 1.5;
		width: 100%;
		flex: 1;
		transition: background var(--duration-base) var(--ease-standard),
			border-color var(--duration-base) var(--ease-standard);
	}

	.scene-summary-input:hover {
		background: var(--color-surface-hover);
	}

	.scene-summary-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}
</style>
