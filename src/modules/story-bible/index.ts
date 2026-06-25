export { default as StoryBiblePlaceholder } from './components/StoryBiblePlaceholder.svelte';
export { default as StoryBibleWorkspacePage } from './components/StoryBibleWorkspacePage.svelte';
export { default as BiographyPanel } from './components/BiographyPanel.svelte';
export { default as CharacterForm } from './components/CharacterForm.svelte';
export { default as LocationForm } from './components/LocationForm.svelte';
export { default as FactionForm } from './components/FactionForm.svelte';
export { default as GlossaryTermForm } from './components/GlossaryTermForm.svelte';
export { default as ThemeForm } from './components/ThemeForm.svelte';
export { default as LoreEntryForm } from './components/LoreEntryForm.svelte';
export type {
	CharacterFormData,
	FactionFormData,
	GlossaryTermFormData,
	LocationFormData,
	LoreEntryFormData,
	StoryBibleDossier,
	StoryBibleDossierKind,
	ThemeFormData,
} from './services/story-bible-crud.js';
export type {
	StoryBibleListResult,
	StoryBibleQueryOptions,
	StoryBibleSnapshot,
	StoryBibleSqliteDatabase,
	StoryBibleSqliteStatement,
} from './services/story-bible-repository.js';
export { StoryBibleRepository } from './services/story-bible-repository.js';
export type {
	DossierLinkIndex,
	DossierLinkIndexInput,
	DossierLinkSegment,
	DossierLinkTarget,
	DossierReferenceKind,
} from './services/dossier-link-resolver.js';
export {
	buildDossierLinkHref,
	createDossierLinkIndex,
	resolveDossierLinks,
} from './services/dossier-link-resolver.js';
