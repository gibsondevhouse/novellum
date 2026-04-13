import type {
	Character,
	CharacterRelationship,
	Location,
	LoreEntry,
	PlotThread,
	TimelineEvent,
} from '$lib/db/types.js';
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
let characters: Character[] = $state([]);
let characterSaving = $state(false);
let characterError: string | null = $state(null);

export function getCharacters() {
	return characters;
}
export function getCharacterSaving() {
	return characterSaving;
}
export function getCharacterError() {
	return characterError;
}
export function initCharacters(list: Character[]) {
	characters = list;
}

export async function submitCreateCharacter(
	projectId: string,
	data: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
): Promise<Character> {
	characterSaving = true;
	characterError = null;
	try {
		const char = await createCharacter({ ...data, projectId });
		characters = [...characters, char];
		return char;
	} catch {
		characterError = 'Failed to save character.';
		throw new Error(characterError);
	} finally {
		characterSaving = false;
	}
}

export async function submitUpdateCharacter(
	id: string,
	data: Partial<Omit<Character, 'id' | 'createdAt'>>,
): Promise<void> {
	characterSaving = true;
	characterError = null;
	try {
		await updateCharacter(id, data);
		characters = characters.map((c) => (c.id === id ? { ...c, ...data } : c));
	} catch {
		characterError = 'Failed to update character.';
	} finally {
		characterSaving = false;
	}
}

export async function submitDeleteCharacter(id: string): Promise<void> {
	await removeCharacter(id);
	characters = characters.filter((c) => c.id !== id);
}

// ── Relationship CRUD ────────────────────────────────────────────────────────
let relationships: CharacterRelationship[] = $state([]);

export function getRelationships() {
	return relationships;
}
export function initRelationships(list: CharacterRelationship[]) {
	relationships = list;
}

export async function submitCreateRelationship(
	data: Omit<CharacterRelationship, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
	const rel = await createRelationship(data);
	relationships = [...relationships, rel];
}

export async function submitDeleteRelationship(id: string): Promise<void> {
	await removeRelationship(id);
	relationships = relationships.filter((r) => r.id !== id);
}

// ── Location CRUD ────────────────────────────────────────────────────────────
let locations: Location[] = $state([]);
let locationSaving = $state(false);
let locationError: string | null = $state(null);

export function getLocations() {
	return locations;
}
export function getLocationSaving() {
	return locationSaving;
}
export function getLocationError() {
	return locationError;
}
export function initLocations(list: Location[]) {
	locations = list;
}

export async function submitCreateLocation(
	projectId: string,
	data: Omit<Location, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
): Promise<Location> {
	locationSaving = true;
	locationError = null;
	try {
		const loc = await createLocation({ ...data, projectId });
		locations = [...locations, loc];
		return loc;
	} catch {
		locationError = 'Failed to save location.';
		throw new Error(locationError);
	} finally {
		locationSaving = false;
	}
}

export async function submitUpdateLocation(
	id: string,
	data: Partial<Omit<Location, 'id' | 'createdAt'>>,
): Promise<void> {
	locationSaving = true;
	locationError = null;
	try {
		await updateLocation(id, data);
		locations = locations.map((l) => (l.id === id ? { ...l, ...data } : l));
	} catch {
		locationError = 'Failed to update location.';
	} finally {
		locationSaving = false;
	}
}

export async function submitDeleteLocation(id: string): Promise<void> {
	await removeLocation(id);
	locations = locations.filter((l) => l.id !== id);
}

// ── Lore Entry CRUD ──────────────────────────────────────────────────────────
let loreEntries: LoreEntry[] = $state([]);
let loreSaving = $state(false);
let loreError: string | null = $state(null);

export function getLoreEntries() {
	return loreEntries;
}
export function getLoreSaving() {
	return loreSaving;
}
export function getLoreError() {
	return loreError;
}
export function initLoreEntries(list: LoreEntry[]) {
	loreEntries = list;
}

export async function submitCreateLoreEntry(
	projectId: string,
	data: Omit<LoreEntry, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
): Promise<LoreEntry> {
	loreSaving = true;
	loreError = null;
	try {
		const entry = await createLoreEntry({ ...data, projectId });
		loreEntries = [...loreEntries, entry];
		return entry;
	} catch {
		loreError = 'Failed to save lore entry.';
		throw new Error(loreError);
	} finally {
		loreSaving = false;
	}
}

export async function submitUpdateLoreEntry(
	id: string,
	data: Partial<Omit<LoreEntry, 'id' | 'createdAt'>>,
): Promise<void> {
	loreSaving = true;
	loreError = null;
	try {
		await updateLoreEntry(id, data);
		loreEntries = loreEntries.map((e) => (e.id === id ? { ...e, ...data } : e));
	} catch {
		loreError = 'Failed to update lore entry.';
	} finally {
		loreSaving = false;
	}
}

export async function submitDeleteLoreEntry(id: string): Promise<void> {
	await removeLoreEntry(id);
	loreEntries = loreEntries.filter((e) => e.id !== id);
}

// ── Plot Thread CRUD ─────────────────────────────────────────────────────────
let plotThreads: PlotThread[] = $state([]);
let plotThreadSaving = $state(false);
let plotThreadError: string | null = $state(null);

export function getPlotThreads() {
	return plotThreads;
}
export function getPlotThreadSaving() {
	return plotThreadSaving;
}
export function getPlotThreadError() {
	return plotThreadError;
}
export function initPlotThreads(list: PlotThread[]) {
	plotThreads = list;
}

export async function submitCreatePlotThread(
	projectId: string,
	data: Omit<PlotThread, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
): Promise<PlotThread> {
	plotThreadSaving = true;
	plotThreadError = null;
	try {
		const thread = await createPlotThread({ ...data, projectId });
		plotThreads = [...plotThreads, thread];
		return thread;
	} catch {
		plotThreadError = 'Failed to save plot thread.';
		throw new Error(plotThreadError);
	} finally {
		plotThreadSaving = false;
	}
}

export async function submitUpdatePlotThread(
	id: string,
	data: Partial<Omit<PlotThread, 'id' | 'createdAt'>>,
): Promise<void> {
	plotThreadSaving = true;
	plotThreadError = null;
	try {
		await updatePlotThread(id, data);
		plotThreads = plotThreads.map((t) => (t.id === id ? { ...t, ...data } : t));
	} catch {
		plotThreadError = 'Failed to update plot thread.';
	} finally {
		plotThreadSaving = false;
	}
}

export async function submitDeletePlotThread(id: string): Promise<void> {
	await removePlotThread(id);
	plotThreads = plotThreads.filter((t) => t.id !== id);
}

// ── Timeline Event CRUD ───────────────────────────────────────────────────────
let timelineEvents: TimelineEvent[] = $state([]);
let timelineSaving = $state(false);
let timelineError: string | null = $state(null);

export function getTimelineEvents() {
	return timelineEvents;
}
export function getTimelineSaving() {
	return timelineSaving;
}
export function getTimelineError() {
	return timelineError;
}
export function initTimelineEvents(list: TimelineEvent[]) {
	timelineEvents = list;
}

export async function submitCreateTimelineEvent(
	projectId: string,
	data: Omit<TimelineEvent, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
): Promise<TimelineEvent> {
	timelineSaving = true;
	timelineError = null;
	try {
		const event = await createTimelineEvent({ ...data, projectId });
		timelineEvents = [...timelineEvents, event];
		return event;
	} catch {
		timelineError = 'Failed to save timeline event.';
		throw new Error(timelineError);
	} finally {
		timelineSaving = false;
	}
}

export async function submitUpdateTimelineEvent(
	id: string,
	data: Partial<Omit<TimelineEvent, 'id' | 'createdAt'>>,
): Promise<void> {
	timelineSaving = true;
	timelineError = null;
	try {
		await updateTimelineEvent(id, data);
		timelineEvents = timelineEvents.map((e) => (e.id === id ? { ...e, ...data } : e));
	} catch {
		timelineError = 'Failed to update timeline event.';
	} finally {
		timelineSaving = false;
	}
}

export async function submitDeleteTimelineEvent(id: string): Promise<void> {
	await removeTimelineEvent(id);
	timelineEvents = timelineEvents.filter((e) => e.id !== id);
}
