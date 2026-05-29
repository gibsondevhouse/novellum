<!--
	plan-031 stage-003 phase-002 part-001 + phase-003 parts-001-002 —
	Attach popover with Project and Upload tabs.

	Opened by the `+` button in NovaComposer. Fetches scenes, characters,
	and locations from the project when the Project tab is active. Handles
	.md/.txt file uploads (100KB max) in the Upload tab. Writes directly
	to novaSession.attachments — no parent coordination needed.
-->
<script lang="ts">
	import { novaSession } from '../stores/nova-session.svelte.js';
	import { validateAttachmentFile } from '../utils/attachment-validator.js';
	import type { NovaEntityKind } from '../types.js';

	type Tab = 'project' | 'upload';

	interface EntityItem {
		id: string;
		kind: NovaEntityKind;
		label: string;
		summary?: string;
	}

	interface Props {
		projectId?: string | null;
		open: boolean;
		onClose: () => void;
		anchorEl?: HTMLElement | null;
	}

	let { projectId = null, open, onClose, anchorEl = null }: Props = $props();

	let activeTab = $state<Tab>('project');
	let popoverEl = $state<HTMLElement | null>(null);
	let fileInputEl = $state<HTMLInputElement | null>(null);

	let scenes = $state<EntityItem[]>([]);
	let characters = $state<EntityItem[]>([]);
	let locations = $state<EntityItem[]>([]);
	let loadingEntities = $state(false);
	let entityError = $state<string | null>(null);

	let uploadError = $state<string | null>(null);
	let uploadSuccess = $state<string | null>(null);

	const attachedEntityIds = $derived(
		new Set(
			novaSession.attachments
				.filter((a) => a.kind === 'entity')
				.map((a) => (a.kind === 'entity' ? a.entityId : '')),
		),
	);

	// Fetch entities when popover opens on project tab with a projectId.
	$effect(() => {
		if (!open || activeTab !== 'project' || !projectId) {
			if (!projectId) entityError = null;
			return;
		}
		void fetchEntities(projectId);
	});

	// Close on outside click.
	$effect(() => {
		if (!open) return;
		function handleOutsideClick(event: MouseEvent) {
			const target = event.target as Node;
			if (popoverEl && !popoverEl.contains(target) && anchorEl && !anchorEl.contains(target)) {
				onClose();
			}
		}
		document.addEventListener('mousedown', handleOutsideClick);
		return () => document.removeEventListener('mousedown', handleOutsideClick);
	});

	// Close on Escape.
	$effect(() => {
		if (!open) return;
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.stopPropagation();
				onClose();
			}
		}
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	// Focus first interactive element when popover opens.
	$effect(() => {
		if (!open || !popoverEl) return;
		const first = popoverEl.querySelector<HTMLElement>(
			'button, input, [tabindex]:not([tabindex="-1"])',
		);
		first?.focus();
	});

	async function fetchEntities(pid: string): Promise<void> {
		loadingEntities = true;
		entityError = null;
		try {
			const [scenesRes, charsRes, locsRes] = await Promise.all([
				fetch(`/api/db/scenes?projectId=${encodeURIComponent(pid)}`),
				fetch(`/api/db/characters?projectId=${encodeURIComponent(pid)}`),
				fetch(`/api/db/locations?projectId=${encodeURIComponent(pid)}`),
			]);

			if (!scenesRes.ok || !charsRes.ok || !locsRes.ok) {
				throw new Error('Failed to load project entities.');
			}

			const [scenesData, charsData, locsData] = await Promise.all([
				scenesRes.json() as Promise<Array<{ id: string; title?: string; summary?: string }>>,
				charsRes.json() as Promise<Array<{ id: string; name?: string; summary?: string }>>,
				locsRes.json() as Promise<Array<{ id: string; name?: string; summary?: string }>>,
			]);

			scenes = scenesData.map((s) => ({
				id: s.id,
				kind: 'scene' as NovaEntityKind,
				label: s.title ?? 'Untitled scene',
				summary: s.summary,
			}));
			characters = charsData.map((c) => ({
				id: c.id,
				kind: 'character' as NovaEntityKind,
				label: c.name ?? 'Unnamed character',
				summary: c.summary,
			}));
			locations = locsData.map((l) => ({
				id: l.id,
				kind: 'location' as NovaEntityKind,
				label: l.name ?? 'Unnamed location',
				summary: l.summary,
			}));
		} catch (err) {
			entityError = err instanceof Error ? err.message : 'Failed to load project entities.';
		} finally {
			loadingEntities = false;
		}
	}

	function toggleEntity(item: EntityItem): void {
		if (attachedEntityIds.has(item.id)) {
			const existing = novaSession.attachments.find(
				(a) => a.kind === 'entity' && a.entityId === item.id,
			);
			if (existing) novaSession.removeAttachment(existing.id);
		} else {
			novaSession.addAttachment({
				kind: 'entity',
				id: crypto.randomUUID(),
				entityKind: item.kind,
				entityId: item.id,
				label: item.label,
				summary: item.summary,
			});
		}
	}

	function handleFileChange(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		processFile(file);
		input.value = '';
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();
		const file = event.dataTransfer?.files?.[0];
		if (file) processFile(file);
	}

	function handleDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	function processFile(file: File): void {
		uploadError = null;
		uploadSuccess = null;

		const result = validateAttachmentFile(file);
		if (!result.valid) {
			uploadError = result.error ?? 'Invalid file.';
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result as string;
			novaSession.addAttachment({
				kind: 'file',
				id: crypto.randomUUID(),
				filename: file.name,
				content,
				sizeBytes: file.size,
			});
			uploadSuccess = `"${file.name}" attached.`;
		};
		reader.onerror = () => {
			uploadError = 'Could not read file.';
		};
		reader.readAsText(file);
	}

	function tabLabel(kind: NovaEntityKind): string {
		if (kind === 'scene') return 'Scene';
		if (kind === 'character') return 'Character';
		return 'Location';
	}

	const hasNoEntities = $derived(
		!loadingEntities && scenes.length === 0 && characters.length === 0 && locations.length === 0,
	);
</script>

{#if open}
	<div
		bind:this={popoverEl}
		class="nova-attach-popover"
		role="dialog"
		aria-label="Attach to Nova"
		aria-modal="false"
	>
		<div class="nova-attach-popover__tabs" role="tablist" aria-label="Attach source">
			<button
				type="button"
				role="tab"
				class="nova-attach-tab"
				class:is-active={activeTab === 'project'}
				aria-selected={activeTab === 'project'}
				id="attach-tab-project"
				aria-controls="attach-panel-project"
				onclick={() => { activeTab = 'project'; }}
			>Project</button>
			<button
				type="button"
				role="tab"
				class="nova-attach-tab"
				class:is-active={activeTab === 'upload'}
				aria-selected={activeTab === 'upload'}
				id="attach-tab-upload"
				aria-controls="attach-panel-upload"
				onclick={() => { activeTab = 'upload'; uploadError = null; uploadSuccess = null; }}
			>Upload</button>
		</div>

		{#if activeTab === 'project'}
			<div
				id="attach-panel-project"
				role="tabpanel"
				aria-labelledby="attach-tab-project"
				class="nova-attach-panel"
			>
				{#if !projectId}
					<p class="nova-attach-empty">No project open. Upload a file instead.</p>
				{:else if loadingEntities}
					<p class="nova-attach-loading" aria-live="polite">Loading…</p>
				{:else if entityError}
					<p class="nova-attach-error" role="alert">{entityError}</p>
				{:else if hasNoEntities}
					<p class="nova-attach-empty">No scenes, characters, or locations found.</p>
				{:else}
					{#if scenes.length > 0}
						<p class="nova-attach-group-label">Scenes</p>
						<ul class="nova-attach-list" role="list">
							{#each scenes as item (item.id)}
								{@const attached = attachedEntityIds.has(item.id)}
								<li>
									<button
										type="button"
										class="nova-attach-item"
										class:is-attached={attached}
										onclick={() => toggleEntity(item)}
										aria-pressed={attached}
										title={item.summary ?? item.label}
									>
										<span class="nova-attach-item__kind">{tabLabel(item.kind)}</span>
										<span class="nova-attach-item__label">{item.label}</span>
										{#if attached}
											<span class="nova-attach-item__check" aria-hidden="true">✓</span>
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
					{#if characters.length > 0}
						<p class="nova-attach-group-label">Characters</p>
						<ul class="nova-attach-list" role="list">
							{#each characters as item (item.id)}
								{@const attached = attachedEntityIds.has(item.id)}
								<li>
									<button
										type="button"
										class="nova-attach-item"
										class:is-attached={attached}
										onclick={() => toggleEntity(item)}
										aria-pressed={attached}
										title={item.summary ?? item.label}
									>
										<span class="nova-attach-item__kind">{tabLabel(item.kind)}</span>
										<span class="nova-attach-item__label">{item.label}</span>
										{#if attached}
											<span class="nova-attach-item__check" aria-hidden="true">✓</span>
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
					{#if locations.length > 0}
						<p class="nova-attach-group-label">Locations</p>
						<ul class="nova-attach-list" role="list">
							{#each locations as item (item.id)}
								{@const attached = attachedEntityIds.has(item.id)}
								<li>
									<button
										type="button"
										class="nova-attach-item"
										class:is-attached={attached}
										onclick={() => toggleEntity(item)}
										aria-pressed={attached}
										title={item.summary ?? item.label}
									>
										<span class="nova-attach-item__kind">{tabLabel(item.kind)}</span>
										<span class="nova-attach-item__label">{item.label}</span>
										{#if attached}
											<span class="nova-attach-item__check" aria-hidden="true">✓</span>
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
			</div>
		{:else}
			<div
				id="attach-panel-upload"
				role="tabpanel"
				aria-labelledby="attach-tab-upload"
				class="nova-attach-panel"
			>
				<button
					type="button"
					class="nova-attach-dropzone"
					aria-label="Drop .md or .txt file here or click to browse"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					onclick={() => fileInputEl?.click()}
				>
					<span class="nova-attach-dropzone__icon" aria-hidden="true">↑</span>
					<span class="nova-attach-dropzone__label">.md or .txt — max 100 KB</span>
				</button>
				<input
					bind:this={fileInputEl}
					type="file"
					accept=".md,.txt"
					class="nova-attach-file-input"
					aria-label="Choose file"
					onchange={handleFileChange}
				/>
				{#if uploadError}
					<p class="nova-attach-error" role="alert">{uploadError}</p>
				{/if}
				{#if uploadSuccess}
					<p class="nova-attach-success" role="status">{uploadSuccess}</p>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.nova-attach-popover {
		position: absolute;
		bottom: calc(100% + var(--space-1));
		left: 0;
		z-index: 100;
		width: 260px;
		max-width: calc(100vw - var(--space-4));
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 86%, var(--color-candle) 14%);
		background: var(--color-surface-raised);
		box-shadow: var(--shadow-overlay);
		overflow: hidden;
	}

	.nova-attach-popover__tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.nova-attach-tab {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.nova-attach-tab:hover {
		color: var(--color-text-secondary);
	}

	.nova-attach-tab.is-active {
		color: var(--color-text-primary);
		border-bottom-color: var(--color-candle);
	}

	.nova-attach-tab:focus-visible {
		outline: none;
		box-shadow: inset var(--focus-ring);
	}

	.nova-attach-panel {
		max-height: 220px;
		overflow-y: auto;
		padding: var(--space-2);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.nova-attach-group-label {
		margin: 0;
		padding: var(--space-1) var(--space-1) 0;
		font-size: 10px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.nova-attach-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.nova-attach-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		width: 100%;
		padding: var(--space-1) var(--space-2);
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		text-align: left;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.nova-attach-item:hover {
		background: color-mix(in srgb, var(--color-surface-hover) 90%, var(--color-candle) 10%);
		color: var(--color-text-primary);
		border-color: var(--color-border-subtle);
	}

	.nova-attach-item:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nova-attach-item.is-attached {
		background: color-mix(in srgb, var(--color-candle) 10%, var(--color-surface-raised));
		color: var(--color-text-primary);
		border-color: color-mix(in srgb, var(--color-candle) 40%, var(--color-border-subtle));
	}

	.nova-attach-item__kind {
		flex-shrink: 0;
		padding: 0 var(--space-1);
		border-radius: var(--radius-xs);
		background: color-mix(in srgb, var(--color-surface-ground) 80%, transparent);
		color: var(--color-text-muted);
		font-size: 9px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.nova-attach-item__label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nova-attach-item__check {
		flex-shrink: 0;
		color: var(--color-candle);
		font-size: var(--text-xs);
	}

	.nova-attach-empty,
	.nova-attach-loading {
		margin: 0;
		padding: var(--space-2) var(--space-1);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: center;
	}

	.nova-attach-error {
		margin: 0;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-error, #e53e3e) 12%, var(--color-surface-raised));
		color: var(--color-error, #e53e3e);
		font-size: var(--text-xs);
	}

	.nova-attach-success {
		margin: 0;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-candle) 14%, var(--color-surface-raised));
		color: var(--color-text-primary);
		font-size: var(--text-xs);
	}

	.nova-attach-dropzone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
		padding: var(--space-4) var(--space-2);
		border-radius: var(--radius-md);
		border: 1px dashed color-mix(in srgb, var(--color-border-default) 80%, var(--color-candle) 20%);
		background: color-mix(in srgb, var(--color-surface-ground) 92%, transparent);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.nova-attach-dropzone:hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, var(--color-candle) 20%);
		border-color: color-mix(in srgb, var(--color-candle) 50%, var(--color-border-default));
	}

	.nova-attach-dropzone:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nova-attach-dropzone__icon {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
	}

	.nova-attach-dropzone__label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.nova-attach-file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
