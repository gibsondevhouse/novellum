<script lang="ts">
	import PenSquare from '@lucide/svelte/icons/pen-square';
	import Plus from '@lucide/svelte/icons/plus';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Waypoints from '@lucide/svelte/icons/waypoints';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Character, CharacterRelationship } from '$lib/db/types.js';
	import {
		Button,
		GhostButton,
		PrimaryButton,
		SurfacePanel,
	} from '$lib/components/ui/index.js';
	import CharacterAssetLinker from '$modules/bible/components/CharacterAssetLinker.svelte';
	import CharacterForm from '$modules/bible/components/CharacterForm.svelte';
	import CharacterScratchpad from '$modules/bible/components/CharacterScratchpad.svelte';
	import RelationshipEditor from '$modules/bible/components/RelationshipEditor.svelte';
	import {
		getCharacters,
		getCharacterSaving,
		getRelationships,
		initCharacters,
		initRelationships,
		submitCreateCharacter,
		submitDeleteCharacter,
		submitUpdateCharacter,
	} from '$modules/bible/stores/bible-crud.svelte.js';

	let {
		projectId,
		characters,
		relationships,
	}: {
		projectId: string;
		characters: Character[];
		relationships: CharacterRelationship[];
	} = $props();

	$effect(() => {
		initCharacters(characters);
		initRelationships(relationships);
	});

	let drawerMode = $state<'create' | 'edit' | null>(null);
	let editingCharacterId = $state<string | null>(null);
	let confirmDelete = $state(false);
	let selectionOverride = $state<string | null>(null);

	const personaList = $derived(getCharacters());
	const activeSelectionId = $derived(selectionOverride ?? page.url.searchParams.get('selected') ?? '');
	const selectedCharacter = $derived(
		personaList.find((character) => character.id === activeSelectionId) ?? null,
	);
	const editingCharacter = $derived(
		personaList.find((character) => character.id === editingCharacterId) ?? null,
	);

	$effect(() => {
		if (!activeSelectionId) return;
		if (!personaList.some((character) => character.id === activeSelectionId)) {
			void selectCharacter(null, true);
		}
	});

	function getLineageTag(character: Character): string {
		return character.tags[0] ?? character.diasporaOrigin ?? 'Uncatalogued';
	}

	function getAvatarLabel(character: Character): string {
		return character.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}

	function getPhotoSrc(photoUrl: string): string {
		const trimmed = photoUrl.trim();
		if (!trimmed) return '';
		if (/^https?:\/\//i.test(trimmed)) return trimmed;
		return `/api/local-files/image?path=${encodeURIComponent(trimmed)}`;
	}

	async function selectCharacter(id: string | null, replaceState = false) {
		selectionOverride = id ?? '';
		const url = new URL(page.url);
		if (id) url.searchParams.set('selected', id);
		else url.searchParams.delete('selected');

		await goto(`${url.pathname}${url.search}`, {
			keepFocus: true,
			noScroll: true,
			replaceState,
		});
		selectionOverride = null;
	}

	function openCreateDrawer() {
		drawerMode = 'create';
		editingCharacterId = null;
		confirmDelete = false;
	}

	function openEditDrawer(character: Character) {
		drawerMode = 'edit';
		editingCharacterId = character.id;
		confirmDelete = false;
	}

	function closeDrawer() {
		drawerMode = null;
		editingCharacterId = null;
		confirmDelete = false;
	}

	async function handleCreate(
		formData: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		const created = await submitCreateCharacter(projectId, formData);
		closeDrawer();
		await selectCharacter(created.id);
	}

	async function handleUpdate(
		formData: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
	) {
		if (!editingCharacter) return;
		await submitUpdateCharacter(editingCharacter.id, formData);
		closeDrawer();
	}

	async function handleDeleteSelected() {
		if (!selectedCharacter) return;
		await submitDeleteCharacter(selectedCharacter.id);
		closeDrawer();
		await selectCharacter(null, true);
	}

	async function handleAssetApply(nextPath: string) {
		if (!selectedCharacter) return;
		await submitUpdateCharacter(selectedCharacter.id, { photoUrl: nextPath });
	}

	function handleDrawerBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			closeDrawer();
		}
	}
</script>

<div class="landing-shell dossier-shell">
	<div class="landing-page dossier-page">
		<section class="hero dossier-hero" aria-labelledby="individuals-title">
			<div class="dossier-header">
				<div>
					<a class="dossier-back-link" href="/projects/{projectId}/world-building/characters">← Personae</a>
					<h1 id="individuals-title">Individuals</h1>
					<p>Review and edit character profiles, relationships, and notes in one place.</p>
				</div>
				<PrimaryButton onclick={openCreateDrawer}>
					<Plus class="button-icon" aria-hidden="true" />
					<span>Add Persona</span>
				</PrimaryButton>
			</div>
		</section>

		<section class="lane dossier-lane" aria-label="Individuals workspace">
			<div class="dossier-grid">
		<aside class="dossier-sidebar" aria-label="Persona Index">
			<SurfacePanel>
				<div class="dossier-sidebar__panel">
					<div class="dossier-sidebar__panel-header">
						<div>
							<p class="meta-eyebrow">Persona Index</p>
							<h2>Roster</h2>
						</div>
						<span class="meta-count">{personaList.length}</span>
					</div>

					{#if personaList.length === 0}
						<div class="dossier-sidebar__empty">
							<UserRound class="dossier-sidebar__empty-icon" aria-hidden="true" />
							<p>No personas yet.</p>
						</div>
					{:else}
						<ul class="persona-list" aria-label="Individuals roster">
							{#each personaList as character (character.id)}
								<li>
									<button
										class:persona-list__item--active={selectedCharacter?.id === character.id}
										class="persona-list__item"
										type="button"
										onclick={() => selectCharacter(character.id)}
										aria-current={selectedCharacter?.id === character.id ? 'true' : undefined}
									>
										<div class="persona-list__avatar">
											{#if character.photoUrl}
												<img src={getPhotoSrc(character.photoUrl)} alt="" />
											{:else}
												<span>{getAvatarLabel(character)}</span>
											{/if}
										</div>
										<div class="persona-list__copy">
											<strong>{character.name}</strong>
											<span>{getLineageTag(character)}</span>
										</div>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</SurfacePanel>
		</aside>

		<section class="dossier-stage">
			{#if selectedCharacter}
				<div class="dossier-stage__stack">
					<SurfacePanel>
						<div class="identity-panel">
							<div class="identity-panel__grid">
								{#key `${selectedCharacter.id}:${selectedCharacter.photoUrl}`}
									<CharacterAssetLinker value={selectedCharacter.photoUrl} onApply={handleAssetApply} />
								{/key}

							<div class="identity-panel__copy">
								<div class="identity-panel__meta-row">
									<span>Persona ID {selectedCharacter.id.slice(0, 8)}</span>
									<span>Updated {new Date(selectedCharacter.updatedAt).toLocaleDateString()}</span>
								</div>
								<h2>{selectedCharacter.name}</h2>
								<p class="identity-panel__subhead">
									<span>Pronunciation: {selectedCharacter.pronunciation || 'Unfiled'}</span>
									<span>Aliases: {selectedCharacter.aliases.length ? selectedCharacter.aliases.join(', ') : 'None logged'}</span>
								</p>
								<div class="identity-panel__tags">
									<span>{selectedCharacter.diasporaOrigin || 'Diaspora origin pending'}</span>
									<span>{selectedCharacter.faction || 'Unaffiliated'}</span>
									<span>{getLineageTag(selectedCharacter)}</span>
								</div>
								<p class="identity-panel__bio">
									{selectedCharacter.bio || 'No dossier summary recorded yet.'}
								</p>
								<div class="identity-panel__actions">
									<Button type="button" variant="outline" onclick={() => openEditDrawer(selectedCharacter)}>
										<PenSquare class="button-icon" aria-hidden="true" />
										<span>Edit Dossier</span>
									</Button>
									<Button type="button" variant="ghost" onclick={() => openEditDrawer(selectedCharacter)}>
										<Trash2 class="button-icon" aria-hidden="true" />
										<span>Delete</span>
									</Button>
								</div>
							</div>
							</div>
						</div>
					</SurfacePanel>

					<div class="dossier-modules">
						<SurfacePanel>
							<div class="dossier-module">
								<div class="dossier-module__header">
								<div>
									<p class="meta-eyebrow">Relational Web</p>
									<h3>Connections</h3>
								</div>
								<Waypoints class="module-icon" aria-hidden="true" />
							</div>
							<RelationshipEditor
								characterId={selectedCharacter.id}
								projectId={projectId}
								allCharacters={personaList}
								initialRelationships={getRelationships()}
								onSelectCharacter={(characterId) => selectCharacter(characterId)}
							/>
							</div>
						</SurfacePanel>

						<SurfacePanel>
							<div class="dossier-module">
								<div class="dossier-module__header">
								<div>
									<p class="meta-eyebrow">Anomalies & Traits</p>
									<h3>Traits and Signals</h3>
								</div>
								<Sparkles class="module-icon" aria-hidden="true" />
							</div>
							<div class="token-group">
								{#if selectedCharacter.anomalies.length}
									{#each selectedCharacter.anomalies as anomaly, index (`${anomaly}-${index}`)}
										<span class="token token--lime">{anomaly}</span>
									{/each}
								{:else}
									<p class="module-empty">No uncanny signatures recorded yet.</p>
								{/if}
							</div>
							<div class="token-group">
								{#each selectedCharacter.traits as trait, index (`trait-${trait}-${index}`)}
									<span class="token">{trait}</span>
								{/each}
								{#each selectedCharacter.flaws as flaw, index (`flaw-${flaw}-${index}`)}
									<span class="token token--warn">{flaw}</span>
								{/each}
							</div>
							</div>
						</SurfacePanel>

						<CharacterScratchpad projectId={projectId} characterId={selectedCharacter.id} />
					</div>
				</div>
			{:else}
				<SurfacePanel>
					<div class="dossier-empty">
						<svg viewBox="0 0 280 160" aria-hidden="true" class="dossier-empty__graphic">
							<rect x="18" y="18" width="244" height="124" rx="16" />
							<path d="M42 56h90" />
							<path d="M42 80h156" />
							<path d="M42 104h128" />
							<circle cx="220" cy="74" r="24" />
							<path d="M208 74h24" />
							<path d="M220 62v24" />
						</svg>
						<h2>Select a Persona</h2>
						<p>Choose someone from the roster to open their dossier, relationships, and local markdown scratchpad.</p>
					</div>
				</SurfacePanel>
			{/if}
		</section>
			</div>
		</section>
	</div>

	{#if drawerMode}
		<div
			class="drawer-backdrop"
			role="button"
			tabindex="0"
			onclick={closeDrawer}
			onkeydown={handleDrawerBackdropKeydown}
			aria-label="Close persona drawer"
		>
			<div
				class="drawer-panel"
				role="dialog"
				aria-modal="true"
				tabindex="-1"
				aria-label={drawerMode === 'create' ? 'Create persona dossier' : 'Edit persona dossier'}
				onclick={(event) => event.stopPropagation()}
				onkeydown={(event) => event.stopPropagation()}
			>
				<div class="drawer-panel__header">
					<div>
						<p class="meta-eyebrow">{drawerMode === 'create' ? 'New Persona' : 'Edit Persona'}</p>
						<h2>{drawerMode === 'create' ? 'Compose a Dossier' : editingCharacter?.name || 'Edit Dossier'}</h2>
					</div>
					<GhostButton onclick={closeDrawer} type="button">Close</GhostButton>
				</div>

				<CharacterForm
					character={drawerMode === 'edit' ? editingCharacter : null}
					saving={getCharacterSaving()}
					onSave={drawerMode === 'create' ? handleCreate : handleUpdate}
					onCancel={closeDrawer}
				/>

				{#if drawerMode === 'edit' && editingCharacter}
					<div class="drawer-panel__danger-zone">
						<h3>Destructive Action</h3>
						<p>Deleting removes the persona record from the local database. Scratchpad markdown remains local unless you remove the file separately.</p>
						<div class="drawer-panel__danger-actions">
							{#if confirmDelete}
								<Button variant="destructive" type="button" onclick={handleDeleteSelected}>
									<Trash2 class="button-icon" aria-hidden="true" />
									<span>Delete Persona</span>
								</Button>
								<GhostButton type="button" onclick={() => (confirmDelete = false)}>Cancel</GhostButton>
							{:else}
								<Button variant="outline" type="button" onclick={() => (confirmDelete = true)}>
									<Trash2 class="button-icon" aria-hidden="true" />
									<span>Arm Delete</span>
								</Button>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.landing-shell {
		position: relative;
		overflow: hidden;
	}

	.landing-shell::before {
		content: '';
		position: absolute;
		inset: -20% -10% auto;
		height: 460px;
		background:
			radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2), transparent 42%),
			radial-gradient(circle at 75% 10%, rgba(6, 182, 212, 0.14), transparent 38%);
		pointer-events: none;
	}

	.landing-page {
		position: relative;
		max-width: 1040px;
		margin: 0 auto;
	}

	.dossier-shell {
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
		padding: var(--space-8) 0 var(--space-10);
	}

	.dossier-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
	}

	.dossier-hero {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 92%, black 8%);
		border-radius: var(--radius-lg);
	}

	.dossier-header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		align-items: flex-start;
	}

	.dossier-header h1,
	.dossier-header p,
	.identity-panel__copy h2,
	.dossier-empty h2 {
		margin: 0;
	}

	.dossier-back-link,
	.meta-eyebrow,
	.meta-count,
	.drawer-panel__danger-zone p {
		font-family: var(--font-mono);
	}

	.dossier-back-link,
	.meta-eyebrow {
		font-size: var(--text-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.dossier-header p {
		margin-top: var(--space-2);
		max-width: 52ch;
		color: var(--color-text-secondary);
	}

	.dossier-lane {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		scroll-margin-top: 72px;
		padding: var(--space-7) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.dossier-grid {
		display: grid;
		grid-template-columns: minmax(17rem, 21rem) minmax(0, 1fr);
		gap: var(--space-5);
		min-height: 42rem;
	}

	.dossier-sidebar,
	.dossier-stage,
	.dossier-stage__stack {
		min-height: 0;
	}

	.dossier-sidebar__panel,
	.dossier-stage__stack {
		height: 100%;
	}

	.dossier-sidebar__panel {
		gap: var(--space-4);
		padding: 0;
		overflow: hidden;
	}

	.dossier-sidebar__panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4) var(--space-4) 0;
	}

	.dossier-sidebar__panel-header h2 {
		margin: 0;
		font-size: var(--text-base);
	}

	.meta-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--color-border-default);
		color: var(--color-text-secondary);
		background: var(--color-surface-overlay);
	}

	.dossier-sidebar__empty,
	.dossier-empty {
		display: grid;
		place-items: center;
		text-align: center;
		gap: var(--space-3);
		padding: var(--space-6);
		min-height: 100%;
	}

	:global(.dossier-sidebar__empty-icon),
	:global(.module-icon),
	:global(.button-icon) {
		width: 1rem;
		height: 1rem;
		stroke-width: 1.5;
	}

	.persona-list {
		list-style: none;
		margin: 0;
		padding: 0 var(--space-2) var(--space-2);
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.persona-list__item {
		width: 100%;
		padding: 0.8rem 0.9rem;
		border: 1px solid transparent;
		border-radius: calc(var(--radius-lg) - 0.2rem);
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr);
		gap: 0.85rem;
		align-items: center;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			transform var(--duration-fast) var(--ease-standard);
	}

	.persona-list__item:hover,
	.persona-list__item:focus-visible {
		background: var(--color-surface-overlay);
		border-color: color-mix(in srgb, var(--color-nova-blue) 22%, transparent);
		transform: none;
	}

	.persona-list__item--active {
		background: color-mix(in srgb, var(--color-nova-blue) 10%, var(--color-surface-overlay));
		border-color: color-mix(in srgb, var(--color-nova-blue) 35%, var(--color-border-default));
		box-shadow: inset 2px 0 0 color-mix(in srgb, var(--color-nova-blue) 70%, transparent);
	}

	.persona-list__avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.85rem;
		overflow: hidden;
		display: grid;
		place-items: center;
		background: var(--color-surface-elevated);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		letter-spacing: 0.1em;
		color: var(--color-text-secondary);
	}

	.persona-list__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.persona-list__copy {
		display: grid;
		gap: 0.2rem;
		min-width: 0;
	}

	.persona-list__copy strong,
	.persona-list__copy span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.persona-list__copy span {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.dossier-stage__stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.identity-panel {
		background: transparent;
	}

	.identity-panel__grid {
		display: grid;
		grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
		gap: var(--space-4);
	}

	.identity-panel__copy {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.identity-panel__meta-row,
	.identity-panel__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		font-size: var(--text-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.identity-panel__subhead {
		display: grid;
		gap: 0.35rem;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.identity-panel__tags span,
	.token {
		padding: 0.45rem 0.7rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 85%, transparent);
	}

	.identity-panel__bio {
		max-width: 68ch;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: 1.75;
		color: var(--color-text-primary);
	}

	.identity-panel__actions,
	.drawer-panel__danger-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: center;
	}

	.dossier-modules {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.dossier-modules :global(.scratchpad-panel) {
		grid-column: 1 / -1;
	}

	.dossier-module {
		gap: var(--space-4);
	}

	.dossier-module__header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		align-items: center;
	}

	.dossier-module__header h3 {
		margin: 0;
	}

	:global(.module-icon) {
		color: var(--color-nova-blue);
	}

	.token-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
	}

	.token {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.token--lime {
		border-color: color-mix(in srgb, var(--color-success) 35%, transparent);
		color: var(--color-text-primary);
		background: color-mix(in srgb, var(--color-success) 8%, var(--color-surface-overlay));
	}

	.token--warn {
		border-color: color-mix(in srgb, var(--color-error) 45%, transparent);
		color: var(--color-text-primary);
		background: color-mix(in srgb, var(--color-error) 8%, var(--color-surface-overlay));
	}

	.module-empty {
		margin: 0;
		color: var(--color-text-secondary);
	}

	.dossier-empty__graphic {
		width: min(100%, 18rem);
		height: auto;
		stroke: color-mix(in srgb, var(--color-nova-blue) 42%, var(--color-border-default));
		fill: none;
		stroke-width: 1.25;
	}

	.drawer-backdrop {
		position: fixed;
		inset: 0;
		z-index: 30;
		background: rgba(3, 6, 10, 0.72);
		backdrop-filter: blur(4px);
		display: flex;
		justify-content: flex-end;
	}

	.drawer-panel {
		width: min(42rem, 100%);
		height: 100%;
		overflow: auto;
		padding: var(--space-5);
		background: var(--color-surface-base);
		border-left: 1px solid color-mix(in srgb, var(--color-nova-blue) 18%, var(--color-border-default));
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.drawer-panel__header,
	.drawer-panel__danger-zone {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.drawer-panel__header {
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
	}

	.drawer-panel__header h2,
	.drawer-panel__danger-zone h3,
	.drawer-panel__danger-zone p {
		margin: 0;
	}

	.drawer-panel__danger-zone {
		padding: var(--space-4);
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-error) 24%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-error) 8%, var(--color-surface-ground));
	}

	@media (max-width: 1040px) {
		.dossier-grid,
		.identity-panel__grid,
		.dossier-modules {
			grid-template-columns: 1fr;
		}

		.dossier-sidebar__panel {
			max-height: 22rem;
		}

		.dossier-lane {
			padding-inline: 0;
		}
	}

	@media (max-width: 720px) {
		.dossier-header,
		.drawer-panel__header,
		.identity-panel__actions {
			flex-direction: column;
			align-items: stretch;
		}

		.drawer-panel {
			width: 100%;
		}
	}
</style>