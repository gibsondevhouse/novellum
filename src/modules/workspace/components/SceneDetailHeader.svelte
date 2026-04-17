<script lang="ts">
	import type { Scene } from '$lib/db/types.js';

	let { scene, onUpdateScene, onDeleteScene } = $props<{
		scene: Scene;
		onUpdateScene?: (id: string, changes: Partial<Scene>) => void;
		onDeleteScene?: (id: string) => void;
	}>();

	let editTitle = $state('');

	$effect(() => {
		if (scene) {
			editTitle = scene.title || '';
		}
	});
</script>

<header class="scene-header">
	<div class="title-row">
		<span class="scene-ordinal">Scene {scene.order + 1}</span>
		<input
			type="text"
			class="scene-title-input"
			bind:value={editTitle}
			onchange={() => onUpdateScene?.(scene.id, { title: editTitle })}
			placeholder="Untitled Scene"
		/>
		<button class="delete-scene-btn" onclick={() => onDeleteScene?.(scene.id)} title="Delete scene">&times;</button>
	</div>
</header>

<style>
	.scene-header {
		display: flex;
		align-items: center;
		padding: var(--space-3) 0 var(--space-4);
		margin-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
	}

	.scene-ordinal {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.scene-title-input {
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

	.scene-title-input:hover {
		background: var(--color-surface-hover);
	}

	.scene-title-input:focus {
		background: var(--color-surface-raised);
		border-color: var(--color-border-focus);
		outline: none;
	}

	.delete-scene-btn {
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

	.delete-scene-btn:hover {
		color: var(--color-danger, #ef4444);
		background: var(--color-surface-hover);
	}
</style>
