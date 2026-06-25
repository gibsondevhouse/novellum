<script lang="ts">
	import type {
		Character,
		Faction,
		GlossaryTerm,
		Location,
		LoreEntry,
		Theme,
	} from '$lib/db/domain-types';
	import {
		GhostButton,
		PrimaryButton,
		SectionHeader,
		SurfacePanel,
	} from '$lib/components/ui/index.js';
	import BiographyPanel from './BiographyPanel.svelte';
	import CharacterForm from './CharacterForm.svelte';
	import FactionForm from './FactionForm.svelte';
	import GlossaryTermForm from './GlossaryTermForm.svelte';
	import LocationForm from './LocationForm.svelte';
	import LoreEntryForm from './LoreEntryForm.svelte';
	import ThemeForm from './ThemeForm.svelte';
	import {
		createCharacter,
		createFaction,
		createGlossaryTerm,
		createLocation,
		createLoreEntry,
		createTheme,
		getCharactersByProjectId,
		getFactionsByProjectId,
		getGlossaryTermsByProjectId,
		getLocationsByProjectId,
		getLoreEntriesByProjectId,
		getThemesByProjectId,
		removeCharacter,
		removeFaction,
		removeGlossaryTerm,
		removeLocation,
		removeLoreEntry,
		removeTheme,
		updateCharacter,
		updateFaction,
		updateGlossaryTerm,
		updateLocation,
		updateLoreEntry,
		updateTheme,
		type CharacterFormData,
		type FactionFormData,
		type GlossaryTermFormData,
		type LocationFormData,
		type LoreEntryFormData,
		type StoryBibleDossier,
		type StoryBibleDossierKind,
		type ThemeFormData,
	} from '../services/story-bible-crud.js';
	import {
		createDossierLinkIndex,
		type DossierLinkTarget,
	} from '../services/dossier-link-resolver.js';

	let { projectId }: { projectId: string } = $props();

	const NAV_ITEMS: Array<{ id: StoryBibleDossierKind; label: string; empty: string }> = [
		{ id: 'characters', label: 'Characters', empty: 'No characters yet.' },
		{ id: 'locations', label: 'Locations', empty: 'No locations yet.' },
		{ id: 'factions', label: 'Factions', empty: 'No factions yet.' },
		{ id: 'glossaryTerms', label: 'Glossary', empty: 'No glossary terms yet.' },
		{ id: 'themes', label: 'Themes', empty: 'No themes yet.' },
		{ id: 'loreEntries', label: 'Lore', empty: 'No lore entries yet.' },
	];

	let activeKind = $state<StoryBibleDossierKind>('characters');
	let editingId = $state<string | null>(null);
	let isCreating = $state(false);
	let isLoading = $state(false);
	let saving = $state(false);
	let error = $state('');

	let characters = $state<Character[]>([]);
	let locations = $state<Location[]>([]);
	let factions = $state<Faction[]>([]);
	let glossaryTerms = $state<GlossaryTerm[]>([]);
	let themes = $state<Theme[]>([]);
	let loreEntries = $state<LoreEntry[]>([]);

	const activeNavItem = $derived(NAV_ITEMS.find((item) => item.id === activeKind) ?? NAV_ITEMS[0]);
	const activeItems = $derived.by(() => getItems(activeKind));
	const selectedItem = $derived.by(() => activeItems.find((item) => item.id === editingId) ?? null);
	const showForm = $derived(isCreating || selectedItem !== null);
	const formModeLabel = $derived(selectedItem ? 'Edit' : 'Create');
	const linkIndex = $derived(
		createDossierLinkIndex({ characters, locations, factions, glossaryTerms, themes, loreEntries }),
	);

	$effect(() => {
		void refreshAll(projectId);
	});

	function getItems(kind: StoryBibleDossierKind): StoryBibleDossier[] {
		switch (kind) {
			case 'characters':
				return characters;
			case 'locations':
				return locations;
			case 'factions':
				return factions;
			case 'glossaryTerms':
				return glossaryTerms;
			case 'themes':
				return themes;
			case 'loreEntries':
				return loreEntries;
		}
	}

	function titleFor(item: StoryBibleDossier): string {
		if ('name' in item) return item.name;
		if ('term' in item) return item.term;
		return item.title;
	}

	function detailFor(item: StoryBibleDossier): string {
		if ('bio' in item && item.bio) return item.bio;
		if ('description' in item && item.description) return item.description;
		if ('definition' in item && item.definition) return item.definition;
		if ('content' in item && item.content) return item.content;
		return 'No details recorded.';
	}

	function selectKind(kind: StoryBibleDossierKind): void {
		activeKind = kind;
		editingId = null;
		isCreating = false;
		error = '';
	}

	function startCreate(): void {
		editingId = null;
		isCreating = true;
		error = '';
	}

	function startEdit(id: string): void {
		editingId = id;
		isCreating = false;
		error = '';
	}

	function closeForm(): void {
		editingId = null;
		isCreating = false;
		error = '';
	}

	function navigateToDossier(target: DossierLinkTarget): void {
		activeKind = target.kind;
		editingId = target.id;
		isCreating = false;
		error = '';
	}

	async function refreshAll(nextProjectId: string): Promise<void> {
		isLoading = true;
		error = '';
		try {
			[characters, locations, factions, glossaryTerms, themes, loreEntries] = await Promise.all([
				getCharactersByProjectId(nextProjectId),
				getLocationsByProjectId(nextProjectId),
				getFactionsByProjectId(nextProjectId),
				getGlossaryTermsByProjectId(nextProjectId),
				getThemesByProjectId(nextProjectId),
				getLoreEntriesByProjectId(nextProjectId),
			]);
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Unable to load story bible dossiers.';
		} finally {
			isLoading = false;
		}
	}

	async function afterMutation(): Promise<void> {
		await refreshAll(projectId);
		closeForm();
	}

	async function saveCharacter(data: CharacterFormData): Promise<void> {
		await saveDossier(() =>
			selectedItem && activeKind === 'characters'
				? updateCharacter(selectedItem.id, data)
				: createCharacter({ ...data, projectId }),
		);
	}

	async function saveLocation(data: LocationFormData): Promise<void> {
		await saveDossier(() =>
			selectedItem && activeKind === 'locations'
				? updateLocation(selectedItem.id, data)
				: createLocation({ ...data, projectId }),
		);
	}

	async function saveFaction(data: FactionFormData): Promise<void> {
		await saveDossier(() =>
			selectedItem && activeKind === 'factions'
				? updateFaction(selectedItem.id, data)
				: createFaction({ ...data, projectId }),
		);
	}

	async function saveGlossaryTerm(data: GlossaryTermFormData): Promise<void> {
		await saveDossier(() =>
			selectedItem && activeKind === 'glossaryTerms'
				? updateGlossaryTerm(selectedItem.id, data)
				: createGlossaryTerm({ ...data, projectId }),
		);
	}

	async function saveTheme(data: ThemeFormData): Promise<void> {
		await saveDossier(() =>
			selectedItem && activeKind === 'themes'
				? updateTheme(selectedItem.id, data)
				: createTheme({ ...data, projectId }),
		);
	}

	async function saveLoreEntry(data: LoreEntryFormData): Promise<void> {
		await saveDossier(() =>
			selectedItem && activeKind === 'loreEntries'
				? updateLoreEntry(selectedItem.id, data)
				: createLoreEntry({ ...data, projectId }),
		);
	}

	async function saveDossier(mutator: () => Promise<unknown>): Promise<void> {
		saving = true;
		error = '';
		try {
			await mutator();
			await afterMutation();
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'Unable to save dossier.';
		} finally {
			saving = false;
		}
	}

	async function deleteSelected(): Promise<void> {
		if (!selectedItem) return;

		await saveDossier(async () => {
			switch (activeKind) {
				case 'characters':
					await removeCharacter(selectedItem.id);
					return;
				case 'locations':
					await removeLocation(selectedItem.id);
					return;
				case 'factions':
					await removeFaction(selectedItem.id);
					return;
				case 'glossaryTerms':
					await removeGlossaryTerm(selectedItem.id);
					return;
				case 'themes':
					await removeTheme(selectedItem.id);
					return;
				case 'loreEntries':
					await removeLoreEntry(selectedItem.id);
			}
		});
	}
</script>

<div class="story-bible-workspace">
	<aside class="story-bible-nav" aria-label="Story bible dossier categories">
		<div class="nav-heading">Dossiers</div>
		{#each NAV_ITEMS as item (item.id)}
			<button
				type="button"
				class:active={activeKind === item.id}
				onclick={() => selectKind(item.id)}
				aria-pressed={activeKind === item.id}
			>
				<span>{item.label}</span>
				<span>{getItems(item.id).length}</span>
			</button>
		{/each}
	</aside>

	<section class="story-bible-main" aria-labelledby="story-bible-heading">
		<SurfacePanel>
			<SectionHeader
				id="story-bible-heading"
				title={activeNavItem.label}
				description={`${activeItems.length} saved`}
			>
				{#snippet actions()}
					<PrimaryButton type="button" onclick={startCreate}
						>New {activeNavItem.label}</PrimaryButton
					>
				{/snippet}
			</SectionHeader>

			{#if error}
				<p class="error-message" role="alert">{error}</p>
			{/if}

			{#if isLoading}
				<p class="state-message">Loading...</p>
			{:else if activeItems.length === 0}
				<p class="state-message">{activeNavItem.empty}</p>
			{:else}
				<div class="dossier-list" aria-label={`${activeNavItem.label} list`}>
					{#each activeItems as item (item.id)}
						<button
							type="button"
							class:active={editingId === item.id}
							onclick={() => startEdit(item.id)}
						>
							<span>{titleFor(item)}</span>
							<small>{detailFor(item)}</small>
						</button>
					{/each}
				</div>
			{/if}
		</SurfacePanel>

		{#if showForm}
			<SurfacePanel>
				<div class="editor-panel">
					<div class="editor-heading">
						<div>
							<p>{formModeLabel}</p>
							<h2>{activeNavItem.label}</h2>
						</div>
						{#if selectedItem}
							<GhostButton type="button" onclick={deleteSelected} disabled={saving}
								>Delete</GhostButton
							>
						{/if}
					</div>

					{#if selectedItem}
						<BiographyPanel
							text={detailFor(selectedItem)}
							index={linkIndex}
							{projectId}
							onNavigate={navigateToDossier}
						/>
					{/if}

					{#key `${activeKind}-${selectedItem?.id ?? 'new'}`}
						{#if activeKind === 'characters'}
							<CharacterForm
								character={selectedItem as Character | null}
								{saving}
								onSave={saveCharacter}
								onCancel={closeForm}
							/>
						{:else if activeKind === 'locations'}
							<LocationForm
								location={selectedItem as Location | null}
								{saving}
								onSave={saveLocation}
								onCancel={closeForm}
							/>
						{:else if activeKind === 'factions'}
							<FactionForm
								faction={selectedItem as Faction | null}
								{saving}
								onSave={saveFaction}
								onCancel={closeForm}
							/>
						{:else if activeKind === 'glossaryTerms'}
							<GlossaryTermForm
								term={selectedItem as GlossaryTerm | null}
								{saving}
								onSave={saveGlossaryTerm}
								onCancel={closeForm}
							/>
						{:else if activeKind === 'themes'}
							<ThemeForm
								theme={selectedItem as Theme | null}
								{saving}
								onSave={saveTheme}
								onCancel={closeForm}
							/>
						{:else}
							<LoreEntryForm
								entry={selectedItem as LoreEntry | null}
								{saving}
								onSave={saveLoreEntry}
								onCancel={closeForm}
							/>
						{/if}
					{/key}
				</div>
			</SurfacePanel>
		{/if}
	</section>
</div>

<style>
	.story-bible-workspace {
		display: grid;
		grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
		gap: var(--space-4);
		padding: var(--space-6);
		min-height: 100%;
	}

	.story-bible-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border-right: 1px solid var(--color-border-subtle);
	}

	.nav-heading {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.story-bible-nav button,
	.dossier-list button {
		border: 1px solid transparent;
		background: transparent;
		color: var(--color-text-secondary);
		text-align: left;
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.story-bible-nav button {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
	}

	.story-bible-nav button:hover,
	.story-bible-nav button.active,
	.dossier-list button:hover,
	.dossier-list button.active {
		border-color: var(--color-border-default);
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.story-bible-main {
		display: grid;
		align-content: start;
		gap: var(--space-4);
		min-width: 0;
	}

	.dossier-list {
		display: grid;
		gap: var(--space-2);
	}

	.dossier-list button {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-3);
	}

	.dossier-list span {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
	}

	.dossier-list small {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.editor-panel {
		display: grid;
		gap: var(--space-4);
	}

	.editor-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
		padding-bottom: var(--space-3);
	}

	.editor-heading p,
	.editor-heading h2,
	.state-message,
	.error-message {
		margin: 0;
	}

	.editor-heading p {
		font-size: var(--text-xs);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.editor-heading h2 {
		font-size: var(--text-lg);
		font-weight: var(--font-weight-medium);
	}

	.state-message {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.error-message {
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	@media (max-width: 760px) {
		.story-bible-workspace {
			grid-template-columns: 1fr;
			padding: var(--space-4);
		}

		.story-bible-nav {
			border-right: 0;
			border-bottom: 1px solid var(--color-border-subtle);
		}
	}
</style>
