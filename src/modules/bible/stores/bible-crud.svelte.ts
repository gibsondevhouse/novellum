import type {
	Character,
	CharacterRelationship,
	Location,
	LoreEntry,
	PlotThread,
	TimelineEvent,
} from '$lib/db/types.js';
import {
	createEntityCrudStore,
	createEntityCrudLiteStore,
} from '$lib/factories/entity-crud-store.svelte.js';
import {
	createCharacter,
	updateCharacter,
	removeCharacter,
	createRelationship,
	removeRelationship,
} from '../services/character-repository.js';
import { createLocation, updateLocation, removeLocation } from '../services/location-repository.js';
import {
	createLoreEntry,
	updateLoreEntry,
	removeLoreEntry,
} from '../services/lore-entry-repository.js';
import {
	createPlotThread,
	updatePlotThread,
	removePlotThread,
} from '../services/plot-thread-repository.js';
import {
	createTimelineEvent,
	updateTimelineEvent,
	removeTimelineEvent,
} from '../services/timeline-event-repository.js';

// ── Character CRUD ──────────────────────────────────────────────────────────
const characterStore = createEntityCrudStore<Character>({
	create: createCharacter,
	update: updateCharacter,
	remove: removeCharacter,
	entityName: 'character',
});
export const getCharacters = characterStore.getList;
export const getCharacterSaving = characterStore.getSaving;
export const getCharacterError = characterStore.getError;
export const initCharacters = characterStore.initList;
export const submitCreateCharacter = characterStore.submitCreate;
export const submitUpdateCharacter = characterStore.submitUpdate;
export const submitDeleteCharacter = characterStore.submitDelete;

// ── Relationship CRUD ────────────────────────────────────────────────────────
const relationshipStore = createEntityCrudLiteStore<CharacterRelationship>({
	create: createRelationship,
	remove: removeRelationship,
});
export const getRelationships = relationshipStore.getList;
export const initRelationships = relationshipStore.initList;
export const submitCreateRelationship = relationshipStore.submitCreate;
export const submitDeleteRelationship = relationshipStore.submitDelete;

// ── Location CRUD ────────────────────────────────────────────────────────────
const locationStore = createEntityCrudStore<Location>({
	create: createLocation,
	update: updateLocation,
	remove: removeLocation,
	entityName: 'location',
});
export const getLocations = locationStore.getList;
export const getLocationSaving = locationStore.getSaving;
export const getLocationError = locationStore.getError;
export const initLocations = locationStore.initList;
export const submitCreateLocation = locationStore.submitCreate;
export const submitUpdateLocation = locationStore.submitUpdate;
export const submitDeleteLocation = locationStore.submitDelete;

// ── Lore Entry CRUD ──────────────────────────────────────────────────────────
const loreStore = createEntityCrudStore<LoreEntry>({
	create: createLoreEntry,
	update: updateLoreEntry,
	remove: removeLoreEntry,
	entityName: 'lore entry',
});
export const getLoreEntries = loreStore.getList;
export const getLoreSaving = loreStore.getSaving;
export const getLoreError = loreStore.getError;
export const initLoreEntries = loreStore.initList;
export const submitCreateLoreEntry = loreStore.submitCreate;
export const submitUpdateLoreEntry = loreStore.submitUpdate;
export const submitDeleteLoreEntry = loreStore.submitDelete;

// ── Plot Thread CRUD ─────────────────────────────────────────────────────────
const plotThreadStore = createEntityCrudStore<PlotThread>({
	create: createPlotThread,
	update: updatePlotThread,
	remove: removePlotThread,
	entityName: 'plot thread',
});
export const getPlotThreads = plotThreadStore.getList;
export const getPlotThreadSaving = plotThreadStore.getSaving;
export const getPlotThreadError = plotThreadStore.getError;
export const initPlotThreads = plotThreadStore.initList;
export const submitCreatePlotThread = plotThreadStore.submitCreate;
export const submitUpdatePlotThread = plotThreadStore.submitUpdate;
export const submitDeletePlotThread = plotThreadStore.submitDelete;

// ── Timeline Event CRUD ───────────────────────────────────────────────────────
const timelineStore = createEntityCrudStore<TimelineEvent>({
	create: createTimelineEvent,
	update: updateTimelineEvent,
	remove: removeTimelineEvent,
	entityName: 'timeline event',
});
export const getTimelineEvents = timelineStore.getList;
export const getTimelineSaving = timelineStore.getSaving;
export const getTimelineError = timelineStore.getError;
export const initTimelineEvents = timelineStore.initList;
export const submitCreateTimelineEvent = timelineStore.submitCreate;
export const submitUpdateTimelineEvent = timelineStore.submitUpdate;
export const submitDeleteTimelineEvent = timelineStore.submitDelete;
