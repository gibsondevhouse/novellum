<script lang="ts">
	import DocumentEditorFrame from '$modules/editor/components/DocumentEditorFrame.svelte';
	import VersionHistoryPanel from '$modules/editor/components/VersionHistoryPanel.svelte';
	import { editorState } from '$modules/editor/stores/editor.svelte.js';
	import * as autosaveService from '$modules/editor/services/autosave-service.js';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	let { data } = $props();

	let saveStatus = $state<'saving' | 'saved' | 'idle'>('idle');
	let showHistory = $state(false);

	$effect(() => {
		editorState.setActiveScene(data.scene);
		autosaveService.mount(data.scene.id, data.scene.projectId, (s) => (saveStatus = s));
		return () => autosaveService.unmount();
	});

	$effect(() => {
		const text = editorState.pendingText;
		if (text !== (data.scene.content ?? '')) {
			autosaveService.schedule(text);
		}
	});

	function handleRestore(text: string) {
		editorState.pendingText = text;
		autosaveService.flushNow();
		showHistory = false;
	}
</script>

<svelte:head>
	<title>{data.scene.title} — Novellum</title>
</svelte:head>

<div class="editor-page">
	<header class="editor-header">
		<Breadcrumb items={[
			{ label: 'Editor', href: `/projects/${data.scene.projectId}/editor` },
			...(data.chapter ? [{ label: data.chapter.title, href: `/projects/${data.scene.projectId}/editor` }] : []),
			{ label: data.scene.title },
		]} />
		<h1 class="scene-title">{data.scene.title}</h1>
		<div class="header-actions">
			{#if saveStatus === 'saving'}
				<span class="save-indicator saving">Saving…</span>
			{:else if saveStatus === 'saved'}
				<span class="save-indicator saved">Saved ✓</span>
			{/if}
			<button class="btn-history" onclick={() => (showHistory = !showHistory)}>History</button>
		</div>
	</header>

	<div class="editor-body">
		<DocumentEditorFrame
			initialContent={data.scene.content ?? ''}
			onContentChange={(html) => editorState.pendingText = html}
		/>

		{#if showHistory}
			<VersionHistoryPanel
				sceneId={data.scene.id}
				projectId={data.scene.projectId}
				currentText={editorState.pendingText}
				onRestore={handleRestore}
				onClose={() => (showHistory = false)}
			/>
		{/if}
	</div>
</div>

<style>
	.editor-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--color-surface-raised);
	}

	.editor-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--color-border-default);
		background-color: var(--color-surface-ground);
		flex-shrink: 0;
	}

	.scene-title {
		font-family: var(--font-sans);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0;
		flex: 1;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-left: auto;
	}

	.save-indicator {
		font-size: var(--text-sm);
	}

	.save-indicator.saving {
		color: var(--color-text-secondary);
	}

	.save-indicator.saved {
		color: var(--color-success);
	}

	.btn-history {
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-3);
		cursor: pointer;
	}

	.editor-body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}
</style>
