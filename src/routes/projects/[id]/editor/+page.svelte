<script lang="ts">
	import type { Scene } from '$lib/db';
	import AiPanel from '$lib/components/AiPanel.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { aiPanel } from '$lib/stores/ai-panel.svelte';
	import { editorState } from '../../../../modules/editor/stores/editor.svelte.ts';
	import * as autosaveService from '$modules/editor/services/autosave-service.js';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';

	let { data } = $props<{ data: { scenes: Scene[] } }>();

	let activeContent = $state('');
	let currentSceneId = $state<string | null>(null);

	$effect(() => {
		if (data.scenes.length > 0 && editorState.activeSceneId === null) {
			editorState.setActiveSceneId(data.scenes[0].id);
		}
	});

	$effect(() => {
		const sceneId = editorState.activeSceneId;
		const scene = data.scenes.find((s: Scene) => s.id === sceneId);
		if (scene && sceneId !== currentSceneId) {
			if (currentSceneId) autosaveService.flushNow();
			currentSceneId = sceneId;
			activeContent = scene.content ?? '';
			autosaveService.mount(scene.id, scene.projectId);
		}
	});

	$effect(() => {
		return () => {
			autosaveService.flushNow();
			autosaveService.unmount();
		};
	});

	function handleContentInput() {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) return;
		const scene = data.scenes.find((s: Scene) => s.id === sceneId);
		if (scene) {
			scene.content = activeContent;
			autosaveService.schedule(activeContent);
		}
	}

	// Close AI panel when user navigates back via browser history
	$effect(() => {
		if (!page.state?.aiPanelOpen && aiPanel.isOpen) {
			aiPanel.isOpen = false;
		}
	});

	async function handleAccept(text: string) {
		const sceneId = editorState.activeSceneId;
		if (!sceneId) return;
		const updated = activeContent + '\n\n' + text;
		activeContent = updated;

		const scene = data.scenes.find((s: Scene) => s.id === sceneId);
		if (scene) {
			scene.content = updated;
			autosaveService.schedule(updated);
		}
	}

	function handleAskAi() {
		if (!aiPanel.isOpen) {
			// Shallow-route: push history entry so browser back closes the panel
			pushState('', { ...page.state, aiPanelOpen: true });
			aiPanel.toggle();
		}
		const prompt = activeContent
			? `Continue this scene naturally:\n\n${activeContent.slice(-500)}`
			: 'Help me start a new scene.';
		aiPanel.requestSuggestion(prompt);
	}
</script>

<svelte:head>
	<title>Editor — Novellum</title>
</svelte:head>

<div class="editor-page" class:ai-open={aiPanel.isOpen}>
	<!-- Document list (left panel) -->
	<aside class="doc-list">
		<div class="doc-list-header">
			<span class="doc-list-title">Scenes</span>
		</div>
		{#if data.scenes.length === 0}
			<EmptyState title="No scenes yet" />
		{:else}
			<ul class="scene-list">
				{#each data.scenes as scene (scene.id)}
					<li>
						<button
							class="scene-item"
							class:active={editorState.activeSceneId === scene.id}
							onclick={() => {
								editorState.setActiveSceneId(scene.id);
							}}
						>
							{scene.title}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>

	<!-- Editor area (center panel) -->
	<main class="editor-area">
		<div class="editor-toolbar">
			<GhostButton onclick={handleAskAi} title="Ask AI for a suggestion">
				✦ Ask AI
			</GhostButton>
		</div>
		{#if data.scenes.length === 0}
			<EmptyState title="No scenes yet" description="Add one from the Outline." />
		{:else}
			<textarea
				class="editor-textarea"
				bind:value={activeContent}
				oninput={handleContentInput}
				placeholder="Start writing..."
			></textarea>
		{/if}
	</main>

	<!-- AI panel (right) -->
	<AiPanel onAccept={handleAccept} />
</div>

<style>
	.editor-page {
		display: grid;
		grid-template-columns: 200px 1fr 0;
		height: calc(100vh - 120px);
		gap: 0;
		overflow: hidden;
		transition: grid-template-columns var(--duration-enter) var(--ease-standard);
	}

	.editor-page.ai-open {
		grid-template-columns: 200px 1fr 280px;
	}

	.doc-list {
		background-color: var(--color-slate);
		border-right: 1px solid var(--color-border);
		padding: var(--space-3);
		overflow-y: auto;
	}

	.doc-list-header {
		padding: var(--space-2) 0;
		margin-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.doc-list-title {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.scene-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.scene-item {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-2);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		cursor: pointer;
		transition:
			background-color 0.1s ease,
			color 0.1s ease;
	}

	.scene-item:hover {
		background-color: var(--color-border);
		color: var(--color-text-primary);
	}

	.scene-item.active {
		background-color: color-mix(in srgb, var(--color-teal) 10%, transparent);
		color: var(--color-teal);
	}

	.editor-area {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.editor-toolbar {
		display: flex;
		justify-content: flex-end;
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}

	.editor-textarea {
		flex: 1;
		width: 100%;
		max-width: var(--prose-width-max);
		margin-left: auto;
		margin-right: auto;
		background-color: var(--color-surface-raised);
		color: var(--color-text-primary);
		border: none;
		padding: var(--space-6) var(--prose-inset);
		font-family: var(--font-mono);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		resize: none;
		outline: none;
	}
</style>
