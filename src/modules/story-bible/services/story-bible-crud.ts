import type {
	Character,
	Faction,
	GlossaryTerm,
	Location,
	LoreEntry,
	Theme,
} from '$lib/db/domain-types';
import { createRepository } from '$lib/factories/repository-factory.js';

export type StoryBibleDossierKind =
	| 'characters'
	| 'locations'
	| 'factions'
	| 'glossaryTerms'
	| 'themes'
	| 'loreEntries';

export type StoryBibleDossier = Character | Location | Faction | GlossaryTerm | Theme | LoreEntry;

export type CharacterFormData = Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;
export type LocationFormData = Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;
export type FactionFormData = Omit<Faction, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;
export type GlossaryTermFormData = Omit<
	GlossaryTerm,
	'id' | 'projectId' | 'createdAt' | 'updatedAt'
>;
export type ThemeFormData = Omit<Theme, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;
export type LoreEntryFormData = Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;

const characterRepository = createRepository<Character>({
	endpoint: '/api/db/characters',
	entityName: 'Character',
});

const locationRepository = createRepository<Location>({
	endpoint: '/api/db/locations',
	entityName: 'Location',
});

const factionRepository = createRepository<Faction>({
	endpoint: '/api/db/factions',
	entityName: 'Faction',
});

const glossaryTermRepository = createRepository<GlossaryTerm>({
	endpoint: '/api/db/glossary_terms',
	entityName: 'Glossary term',
});

const themeRepository = createRepository<Theme>({
	endpoint: '/api/db/themes',
	entityName: 'Theme',
});

const loreEntryRepository = createRepository<LoreEntry>({
	endpoint: '/api/db/lore_entries',
	entityName: 'Lore entry',
});

export const getCharactersByProjectId = characterRepository.getByProjectId;
export const createCharacter = characterRepository.create;
export const updateCharacter = characterRepository.update;
export const removeCharacter = characterRepository.remove;

export const getLocationsByProjectId = locationRepository.getByProjectId;
export const createLocation = locationRepository.create;
export const updateLocation = locationRepository.update;
export const removeLocation = locationRepository.remove;

export const getFactionsByProjectId = factionRepository.getByProjectId;
export const createFaction = factionRepository.create;
export const updateFaction = factionRepository.update;
export const removeFaction = factionRepository.remove;

export const getGlossaryTermsByProjectId = glossaryTermRepository.getByProjectId;
export const createGlossaryTerm = glossaryTermRepository.create;
export const updateGlossaryTerm = glossaryTermRepository.update;
export const removeGlossaryTerm = glossaryTermRepository.remove;

export const getThemesByProjectId = themeRepository.getByProjectId;
export const createTheme = themeRepository.create;
export const updateTheme = themeRepository.update;
export const removeTheme = themeRepository.remove;

export const getLoreEntriesByProjectId = loreEntryRepository.getByProjectId;
export const createLoreEntry = loreEntryRepository.create;
export const updateLoreEntry = loreEntryRepository.update;
export const removeLoreEntry = loreEntryRepository.remove;
