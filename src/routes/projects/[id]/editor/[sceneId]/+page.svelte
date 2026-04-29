<script lang="ts">
	import DocumentEditorFrame from '$modules/editor/components/DocumentEditorFrame.svelte';
	import VersionHistoryPanel from '$modules/editor/components/VersionHistoryPanel.svelte';
	import SaveStatus from '$modules/editor/components/SaveStatus.svelte';
	import RecoveryPrompt from '$modules/editor/components/RecoveryPrompt.svelte';
	import { editorState } from '$modules/editor/stores/editor.svelte.js';
	import * as autosaveService from '$modules/editor/services/autosave-service.js';
	import * as recoveryService from '$modules/editor/services/recovery-service.js';
	import type { AutosaveResult } from '$modules/editor/services/autosave-types.js';
	import type { PendingDraft } from '$modules/editor/services/recovery-service.js';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { PageHeader } from '$lib/components/ui/index.js';

	let { data } = $props();

	let saveResult = $state<AutosaveResult>({
		status: 'idle',
		savedAt: null,
		error: null,
		pendingDraft: null,
		attempt: 0,
	});
	let showHistory = $state(false);
	let recoveryDraft = $state<PendingDraft | null>(null);

	const sceneWordCount = $derived.by(() => {
		const normalized = editorState.pendingText.replace(/<[^>]+>/g, ' ').trim();
		if (!normalized) return 0;
		return normalized.split(/\s+/).length;
	});

	$effect(() => {
		editorState.setActiveScene(data.scene);
		autosaveService.mount(data.scene.id, data.scene.projectId, (r) => (saveResult = r));
		recoveryDraft = recoveryService.inspectDraft(data.scene.id, data.scene.content ?? '');
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

	function handleRecoveryRestore(draft: PendingDraft) {
		recoveryService.discardDraft(draft.sceneId);
		editorState.pendingText = draft.text;
		autosaveService.schedule(draft.text);
		recoveryDraft = null;
	}

	function handleRecoveryDiscard(draft: PendingDraft) {
		recoveryService.discardDraft(draft.sceneId);
		recoveryDraft = null;
	}
</script>

<svelte:head>
	<title>{data.scene.title} — Novellum</title>
</svelte:head>

<div class="editor-page">
	<div class="editor-header">
		<Breadcrumb items={[
			{ label: 'Editor', href: `/projects/${data.scene.projectId}/editor` },
			...(data.chapter ? [{ label: data.chapter.title, href: `/projects/${data.scene.projectId}/editor` }] : []),
			{ label: data.scene.title },
		]} />
		<PageHeader
			title={data.scene.title}
			description="Focused drafting studio for the current scene."
		>
			{#snippet actions()}
				<div class="header-actions" aria-label="Editor controls">
					<span class="meta-chip">Words: {sceneWordCount}</span>
					<SaveStatus result={saveResult} />
					<button class="btn-history" type="button" onclick={() => (showHistory = !showHistory)}>
						{showHistory ? 'Close History' : 'History'}
					</button>
				</div>
			{/snippet}
		</PageHeader>
	</div>

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

{#if recoveryDraft}
	<RecoveryPrompt
		draft={recoveryDraft}
		onRestore={handleRecoveryRestore}
		onDiscard={handleRecoveryDiscard}
	/>
{/if}

<style>
	.editor-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		background:
			radial-gradient(circle at 8% 8%, color-mix(in srgb, var(--color-nova-blue) 8%, transparent), transparent 36%),
			var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	.editor-header {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--color-border-default);
		background-color: var(--color-surface-ground);
		flex-shrink: 0;
	}

	.editor-header :global(.page-header) {
		border-bottom: none;
		padding-bottom: 0;
	}

	.editor-header :global(.page-header__title) {
		font-family: var(--font-sans);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
	}

	.editor-header :global(.page-header__description) {
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.meta-chip {
		font-size: var(--text-xs);
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
		color: var(--color-text-secondary);
	}

	.btn-history {
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 82%, transparent);
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.btn-history:hover {
		background: color-mix(in srgb, var(--color-nova-blue) 16%, transparent);
	}

	.editor-body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	@media (max-width: 900px) {
		.editor-header :global(.page-header__right) {
			width: 100%;
			justify-items: start;
		}
	}
</style>
