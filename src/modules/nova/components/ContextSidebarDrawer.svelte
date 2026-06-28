<script lang="ts">
	import { novaSession } from '../stores/nova-session.svelte.js';
	import {
		contextControl,
		estimateContextTokens,
		type ContextControlEntity,
		type ContextControlEntityKind,
	} from '../stores/context-control.svelte.js';

	interface Props {
		projectId?: string | null;
		open: boolean;
		onClose: () => void;
		initialEntities?: ContextControlEntity[];
		maxTokens?: number;
	}

	let {
		projectId = null,
		open,
		onClose,
		initialEntities = [],
		maxTokens = 8_000,
	}: Props = $props();

	let entities = $state<ContextControlEntity[]>([]);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let loadSequence = 0;

	const disclosure = $derived(novaSession.contextDisclosure);
	const attachments = $derived(novaSession.attachments);
	const contextEntities = $derived(initialEntities.length > 0 ? initialEntities : entities);
	const attachedEntityIds = $derived(
		new Set(
			attachments
				.filter((attachment) => attachment.kind === 'entity')
				.map((attachment) => (attachment.kind === 'entity' ? attachment.entityId : '')),
		),
	);
	const visibleEntities = $derived(
		[...contextEntities].sort((a, b) => {
			const kind = a.kind.localeCompare(b.kind);
			return kind !== 0 ? kind : a.label.localeCompare(b.label);
		}),
	);
	const activeEntityCount = $derived(
		visibleEntities.filter((entity) => contextControl.getOverride(entity.id) !== 'excluded').length,
	);
	const entityTokenEstimate = $derived(
		visibleEntities.reduce((sum, entity) => {
			if (contextControl.getOverride(entity.id) === 'excluded') return sum;
			return sum + estimateContextTokens(`${entity.label}\n${entity.summary ?? ''}`);
		}, 0),
	);
	const attachmentTokenEstimate = $derived(
		attachments.reduce((sum, attachment) => {
			if (attachment.kind === 'file') return sum + estimateContextTokens(attachment.content);
			return sum + estimateContextTokens(`${attachment.label}\n${attachment.summary ?? ''}`);
		}, 0),
	);
	const disclosedTokenEstimate = $derived((disclosure?.itemCount ?? 0) * 24);
	const totalTokenEstimate = $derived(
		entityTokenEstimate + attachmentTokenEstimate + disclosedTokenEstimate,
	);
	const tokenPercent = $derived(
		Math.min(100, Math.round((totalTokenEstimate / Math.max(1, maxTokens)) * 100)),
	);
	const tokenSeverity = $derived.by(() => {
		if (tokenPercent >= 90 || contextControl.pinnedEntityIds.length > 12) return 'danger';
		if (tokenPercent >= 70 || contextControl.pinnedEntityIds.length > 8) return 'warning';
		return 'normal';
	});
	const hasOverrides = $derived(
		contextControl.pinnedEntityIds.length > 0 || contextControl.excludedEntityIds.length > 0,
	);

	$effect(() => {
		if (!open || !projectId || initialEntities.length > 0) return;
		void loadEntities(projectId);
	});

	$effect(() => {
		contextControl.registerEntities(contextEntities);
	});

	async function loadJsonArray<T>(path: string): Promise<T[]> {
		const response = await fetch(path);
		if (!response.ok) throw new Error('Context sources could not be loaded.');
		const payload = (await response.json()) as unknown;
		return Array.isArray(payload) ? (payload as T[]) : [];
	}

	async function loadEntities(nextProjectId: string): Promise<void> {
		const sequence = ++loadSequence;
		loading = true;
		loadError = null;
		try {
			const query = `projectId=${encodeURIComponent(nextProjectId)}`;
			const [characters, locations, loreEntries] = await Promise.all([
				loadJsonArray<{ id: string; name?: string; bio?: string; summary?: string }>(
					`/api/db/characters?${query}`,
				),
				loadJsonArray<{ id: string; name?: string; description?: string; summary?: string }>(
					`/api/db/locations?${query}`,
				),
				loadJsonArray<{ id: string; title?: string; content?: string }>(
					`/api/db/lore_entries?${query}`,
				),
			]);
			if (sequence !== loadSequence) return;
			entities = [
				...characters.map((character) => ({
					id: character.id,
					kind: 'character' as const,
					label: character.name?.trim() || 'Unnamed character',
					summary: character.summary ?? character.bio,
				})),
				...locations.map((location) => ({
					id: location.id,
					kind: 'location' as const,
					label: location.name?.trim() || 'Unnamed location',
					summary: location.summary ?? location.description,
				})),
				...loreEntries.map((entry) => ({
					id: entry.id,
					kind: 'loreEntry' as const,
					label: entry.title?.trim() || 'Untitled lore',
					summary: entry.content,
				})),
			];
		} catch (error) {
			if (sequence !== loadSequence) return;
			loadError = error instanceof Error ? error.message : 'Context sources could not be loaded.';
		} finally {
			if (sequence === loadSequence) loading = false;
		}
	}

	function kindLabel(kind: ContextControlEntityKind): string {
		if (kind === 'loreEntry') return 'Lore';
		return kind.charAt(0).toUpperCase() + kind.slice(1);
	}

	function rowTokenEstimate(entity: ContextControlEntity): number {
		return estimateContextTokens(`${entity.label}\n${entity.summary ?? ''}`);
	}
</script>

{#if open}
	<div
		class="context-drawer"
		role="dialog"
		aria-label="AI context controls"
		data-testid="context-sidebar-drawer"
	>
		<header class="context-drawer__header">
			<div>
				<h3>Context</h3>
				<p>
					{activeEntityCount} implicit sources · {contextControl.pinnedEntityIds.length} pinned · {contextControl
						.excludedEntityIds.length} excluded
				</p>
			</div>
			<button
				type="button"
				class="context-drawer__close"
				aria-label="Close context controls"
				onclick={onClose}
			>
				×
			</button>
		</header>

		<div class="context-meter" data-severity={tokenSeverity} data-testid="context-token-meter">
			<div class="context-meter__row">
				<span>{totalTokenEstimate} estimated tokens</span>
				<span>{tokenPercent}%</span>
			</div>
			<div class="context-meter__track" aria-hidden="true">
				<span class="context-meter__bar" style:width={`${tokenPercent}%`}></span>
			</div>
			{#if tokenSeverity === 'danger'}
				<p class="context-meter__warning" role="status">
					Context is over the safe review threshold.
				</p>
			{:else if tokenSeverity === 'warning'}
				<p class="context-meter__warning" role="status">
					Context is approaching the review threshold.
				</p>
			{/if}
		</div>

		<section class="context-drawer__section" aria-labelledby="implicit-context-heading">
			<div class="context-drawer__section-heading">
				<h4 id="implicit-context-heading">Implicit Context</h4>
				{#if hasOverrides}
					<button
						type="button"
						class="context-drawer__clear"
						onclick={() => contextControl.clear()}
					>
						Clear
					</button>
				{/if}
			</div>

			{#if loading}
				<p class="context-drawer__state" aria-live="polite">Loading context sources…</p>
			{:else if loadError}
				<p class="context-drawer__state is-error">{loadError}</p>
			{:else if visibleEntities.length === 0}
				<p class="context-drawer__state">No context sources found.</p>
			{:else}
				<ul class="context-source-list" role="list">
					{#each visibleEntities as entity (entity.id)}
						{@const override = contextControl.getOverride(entity.id)}
						<li class="context-source" data-state={override}>
							<div class="context-source__main">
								<span class="context-source__kind">{kindLabel(entity.kind)}</span>
								<strong>{entity.label}</strong>
								<span>{rowTokenEstimate(entity)} tokens</span>
							</div>
							<div class="context-source__actions" aria-label={`${entity.label} context controls`}>
								<button
									type="button"
									class:is-active={override === 'pinned'}
									aria-pressed={override === 'pinned'}
									data-testid="context-pin-toggle"
									data-entity-id={entity.id}
									onclick={() => contextControl.togglePinned(entity.id)}
								>
									Pin
								</button>
								<button
									type="button"
									class:is-active={override === 'excluded'}
									aria-pressed={override === 'excluded'}
									data-testid="context-exclude-toggle"
									data-entity-id={entity.id}
									onclick={() => contextControl.toggleExcluded(entity.id)}
								>
									Exclude
								</button>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="context-drawer__section" aria-labelledby="attached-context-heading">
			<h4 id="attached-context-heading">Attached Context</h4>
			{#if attachments.length === 0}
				<p class="context-drawer__state">No attachments staged.</p>
			{:else}
				<ul class="context-attachment-list" role="list">
					{#each attachments as attachment (attachment.id)}
						<li class="context-attachment">
							{#if attachment.kind === 'entity'}
								<span>{attachedEntityIds.has(attachment.entityId) ? 'Attached' : 'Detached'}</span>
								<strong>{attachment.label}</strong>
							{:else}
								<span>File</span>
								<strong>{attachment.filename}</strong>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}

<style>
	.context-drawer {
		position: absolute;
		top: calc(var(--space-9) + var(--space-2));
		left: var(--space-3);
		right: var(--space-3);
		max-height: min(72vh, 680px);
		overflow: auto;
		z-index: 4;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 94%, var(--color-surface-overlay));
		box-shadow: var(--shadow-lg);
	}

	.context-drawer__header,
	.context-drawer__section-heading,
	.context-meter__row,
	.context-source,
	.context-source__actions,
	.context-attachment {
		display: flex;
		align-items: center;
	}

	.context-drawer__header,
	.context-drawer__section-heading,
	.context-meter__row,
	.context-source,
	.context-attachment {
		justify-content: space-between;
		gap: var(--space-2);
	}

	.context-drawer h3,
	.context-drawer h4,
	.context-drawer p {
		margin: 0;
	}

	.context-drawer h3 {
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
	}

	.context-drawer h4 {
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
	}

	.context-drawer p,
	.context-source__main span,
	.context-attachment span {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.context-drawer__close,
	.context-drawer__clear,
	.context-source__actions button {
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.context-drawer__close {
		width: var(--space-7);
		height: var(--space-7);
		font-size: var(--text-lg);
		line-height: 1;
	}

	.context-drawer__clear,
	.context-source__actions button {
		padding: 2px var(--space-2);
		font-size: var(--text-xs);
	}

	.context-drawer__close:hover,
	.context-drawer__clear:hover,
	.context-source__actions button:hover,
	.context-source__actions button.is-active {
		border-color: var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 78%, var(--color-candle) 22%);
		color: var(--color-text-primary);
	}

	.context-source[data-state='excluded'] {
		opacity: 0.68;
	}

	.context-meter {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.context-meter__track {
		height: var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-surface-overlay);
		overflow: hidden;
	}

	.context-meter__bar {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--color-success);
	}

	.context-meter[data-severity='warning'] .context-meter__bar {
		background: var(--color-warning);
	}

	.context-meter[data-severity='danger'] .context-meter__bar {
		background: var(--color-error);
	}

	.context-meter__warning {
		color: var(--color-warning);
	}

	.context-meter[data-severity='danger'] .context-meter__warning {
		color: var(--color-error);
	}

	.context-source-list,
	.context-attachment-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		list-style: none;
		margin: var(--space-2) 0 0;
		padding: 0;
	}

	.context-source,
	.context-attachment {
		padding: var(--space-2);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-ground) 82%, var(--color-surface-overlay));
	}

	.context-source__main {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.context-source__main strong,
	.context-attachment strong {
		overflow: hidden;
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.context-source__kind {
		text-transform: uppercase;
	}

	.context-source__actions {
		flex-shrink: 0;
	}

	.context-drawer__state {
		padding-block: var(--space-2);
	}

	.context-drawer__state.is-error {
		color: var(--color-error);
	}
</style>
