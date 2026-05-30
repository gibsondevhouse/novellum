import { apiGet, ApiError } from '$lib/api-client.js';
import type {
	Act,
	Arc,
	Beat,
	Chapter,
	Character,
	CharacterRelationship,
	Faction,
	GlossaryTerm,
	Location,
	LoreEntry,
	Milestone,
	PlotThread,
	Project,
	Scene,
	Stage,
	StoryFrame,
	Theme,
	TimelineEvent,
} from '$lib/db/domain-types';
import { normalizeSevenLayerOutline } from '$modules/outline/services/seven-layer-outline.js';
import type {
	AiContext,
	AiTask,
	ContextPolicy,
	ProjectContextCounts,
} from './types.js';
import {
	MAX_CHARACTERS,
	MAX_LOCATIONS,
	MAX_ADJACENT_SCENE_CHARS,
	MAX_CHAPTER_SCENE_CHARS,
	MAX_CONTINUITY_SCENE_CHARS,
	MAX_CONTINUITY_TOTAL_CHARS,
	MAX_CHAPTER_CHARACTERS,
	MAX_CHAPTER_LOCATIONS,
	MAX_WORLDBUILD_CHARACTERS,
	MAX_WORLDBUILD_FACTIONS,
	MAX_WORLDBUILD_LOCATIONS,
	MAX_WORLDBUILD_LORE_ENTRIES,
	MAX_WORLDBUILD_PLOT_THREADS,
	MAX_WORLDBUILD_TIMELINE_EVENTS,
	MAX_WORLDBUILD_CHARACTER_BIO_CHARS,
	MAX_WORLDBUILD_LOCATION_DESC_CHARS,
	MAX_WORLDBUILD_LORE_CONTENT_CHARS,
	MAX_WORLDBUILD_PLOT_DESC_CHARS,
	MAX_WORLDBUILD_TIMELINE_DESC_CHARS,
} from './constants.js';

function emptyContext(policy: ContextPolicy): AiContext {
	return {
		policy,
		scene: null,
		adjacentScenes: [],
		chapter: null,
		beats: [],
		characters: [],
		locations: [],
		loreEntries: [],
		plotThreads: [],
		project: null,
		storyFrames: [],
		timelineEvents: [],
		characterRelationships: [],
		factions: [],
		themes: [],
		glossaryTerms: [],
	};
}

async function getOrUndefined<T>(path: string): Promise<T | undefined> {
	try {
		return await apiGet<T>(path);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) return undefined;
		throw err;
	}
}

async function safeCount(endpoint: string, projectId: string): Promise<number> {
	try {
		const rows = await apiGet<unknown[]>(endpoint, { projectId });
		return rows.length;
	} catch {
		return 0;
	}
}

async function fetchProjectContextCounts(projectId: string): Promise<ProjectContextCounts> {
	const [
		chapters,
		scenes,
		beats,
		characters,
		characterRelationships,
		locations,
		loreEntries,
		plotThreads,
		timelineEvents,
		acts,
		arcs,
		milestones,
		writingStyles,
	] = await Promise.all([
		safeCount('/api/db/chapters', projectId),
		safeCount('/api/db/scenes', projectId),
		safeCount('/api/db/beats', projectId),
		safeCount('/api/db/characters', projectId),
		safeCount('/api/db/character_relationships', projectId),
		safeCount('/api/db/locations', projectId),
		safeCount('/api/db/lore_entries', projectId),
		safeCount('/api/db/plot_threads', projectId),
		safeCount('/api/db/timeline_events', projectId),
		safeCount('/api/db/acts', projectId),
		safeCount('/api/db/arcs', projectId),
		safeCount('/api/db/milestones', projectId),
		safeCount('/api/db/writing_styles', projectId),
	]);

	return {
		chapters,
		scenes,
		beats,
		characters,
		characterRelationships,
		locations,
		loreEntries,
		plotThreads,
		timelineEvents,
		acts,
		arcs,
		milestones,
		writingStyles,
	};
}

async function fetchCharactersByIds(ids: string[], limit: number): Promise<Character[]> {
	const results = await Promise.all(
		ids.slice(0, limit).map((id) => getOrUndefined<Character>(`/api/db/characters/${id}`)),
	);
	return results.filter((c): c is Character => c !== undefined);
}

async function fetchLocationsByIds(ids: string[], limit: number): Promise<Location[]> {
	const results = await Promise.all(
		ids.slice(0, limit).map((id) => getOrUndefined<Location>(`/api/db/locations/${id}`)),
	);
	return results.filter((l): l is Location => l !== undefined);
}

async function getBeatsBySceneId(sceneId: string): Promise<Beat[]> {
	const beats = await apiGet<Beat[]>('/api/db/beats', { sceneId });
	return [...beats].sort((a, b) => a.order - b.order);
}

async function getScenesByChapterId(chapterId: string): Promise<Scene[]> {
	const scenes = await apiGet<Scene[]>('/api/db/scenes', { chapterId });
	return [...scenes].sort((a, b) => a.order - b.order);
}

async function buildOutlineHierarchy(projectId: string) {
	const [arcs, acts, milestones, chapters, scenes, beats, stages] = await Promise.all([
		apiGet<Arc[]>('/api/db/arcs', { projectId }),
		apiGet<Act[]>('/api/db/acts', { projectId }),
		apiGet<Milestone[]>('/api/db/milestones', { projectId }),
		apiGet<Chapter[]>('/api/db/chapters', { projectId }),
		apiGet<Scene[]>('/api/db/scenes', { projectId }),
		apiGet<Beat[]>('/api/db/beats', { projectId }),
		apiGet<Stage[]>('/api/db/stages', { projectId }),
	]);
	return normalizeSevenLayerOutline({ arcs, acts, milestones, chapters, scenes, beats, stages });
}

async function buildSceneOnlyData(sceneId: string) {
	const scene = await getOrUndefined<Scene>(`/api/db/scenes/${sceneId}`);
	if (!scene) return null;
	const [beats, characters, locations] = await Promise.all([
		getBeatsBySceneId(sceneId),
		fetchCharactersByIds(scene.characterIds, MAX_CHARACTERS),
		fetchLocationsByIds(scene.locationIds, MAX_LOCATIONS),
	]);
	return { scene, beats, characters, locations };
}

function trimText(value: string | undefined | null, maxChars: number): string {
	return typeof value === 'string' ? value.slice(0, maxChars) : '';
}

function limitList<T>(rows: T[], max: number): T[] {
	return rows.slice(0, max);
}

function sanitizeWorldbuildCharacters(rows: Character[]): Character[] {
	return limitList(rows, MAX_WORLDBUILD_CHARACTERS).map((character) => ({
		...character,
		bio: trimText(character.bio, MAX_WORLDBUILD_CHARACTER_BIO_CHARS),
		traits: (character.traits ?? []).slice(0, 8),
		goals: (character.goals ?? []).slice(0, 6),
		flaws: (character.flaws ?? []).slice(0, 6),
		notes: trimText(character.notes, 220),
	}));
}

function sanitizeWorldbuildLocations(rows: Location[]): Location[] {
	return limitList(rows, MAX_WORLDBUILD_LOCATIONS).map((location) => ({
		...location,
		description: trimText(location.description, MAX_WORLDBUILD_LOCATION_DESC_CHARS),
		tags: (location.tags ?? []).slice(0, 6),
		notableFeatures: (location.notableFeatures ?? []).slice(0, 6),
		conflictPressure: trimText(location.conflictPressure, 200),
		storyRole: trimText(location.storyRole, 200),
	}));
}

function sanitizeWorldbuildLoreEntries(rows: LoreEntry[]): LoreEntry[] {
	return limitList(rows, MAX_WORLDBUILD_LORE_ENTRIES).map((entry) => ({
		...entry,
		content: trimText(entry.content, MAX_WORLDBUILD_LORE_CONTENT_CHARS),
		tags: (entry.tags ?? []).slice(0, 6),
	}));
}

function sanitizeWorldbuildPlotThreads(rows: PlotThread[]): PlotThread[] {
	return limitList(rows, MAX_WORLDBUILD_PLOT_THREADS).map((thread) => ({
		...thread,
		description: trimText(thread.description, MAX_WORLDBUILD_PLOT_DESC_CHARS),
		relatedSceneIds: (thread.relatedSceneIds ?? []).slice(0, 8),
		relatedCharacterIds: (thread.relatedCharacterIds ?? []).slice(0, 8),
	}));
}

function sanitizeWorldbuildTimeline(rows: TimelineEvent[]): TimelineEvent[] {
	return limitList(rows, MAX_WORLDBUILD_TIMELINE_EVENTS).map((event) => ({
		...event,
		description: trimText(event.description, MAX_WORLDBUILD_TIMELINE_DESC_CHARS),
		relatedCharacterIds: (event.relatedCharacterIds ?? []).slice(0, 8),
		relatedSceneIds: (event.relatedSceneIds ?? []).slice(0, 8),
	}));
}

async function loadWorldbuildingSnapshot(projectId: string) {
	const [characters, factions, locations, loreEntries, plotThreads, timelineEvents] =
		await Promise.all([
			apiGet<Character[]>('/api/db/characters', { projectId }),
			apiGet<Faction[]>('/api/db/factions', { projectId }),
			apiGet<Location[]>('/api/db/locations', { projectId }),
			apiGet<LoreEntry[]>('/api/db/lore_entries', { projectId }),
			apiGet<PlotThread[]>('/api/db/plot_threads', { projectId }),
			apiGet<TimelineEvent[]>('/api/db/timeline_events', { projectId }),
		]);

	return {
		characters: sanitizeWorldbuildCharacters(characters),
		factions: limitList(factions, MAX_WORLDBUILD_FACTIONS),
		locations: sanitizeWorldbuildLocations(locations),
		loreEntries: sanitizeWorldbuildLoreEntries(loreEntries),
		plotThreads: sanitizeWorldbuildPlotThreads(plotThreads),
		timelineEvents: sanitizeWorldbuildTimeline(timelineEvents),
	};
}

export async function buildContext(task: AiTask, projectId: string): Promise<AiContext> {
	switch (task.contextPolicy) {
		case 'project_summary': {
			const [project, storyFrames, projectCounts] = await Promise.all([
				getOrUndefined<Project>(`/api/db/projects/${projectId}`),
				apiGet<StoryFrame[]>('/api/db/story_frames', { projectId }),
				fetchProjectContextCounts(projectId),
			]);

			return {
				policy: 'project_summary',
				scene: null,
				adjacentScenes: [],
				chapter: null,
				beats: [],
				characters: [],
				locations: [],
				loreEntries: [],
				plotThreads: [],
				project: project ?? null,
				projectCounts,
				storyFrames,
				timelineEvents: [],
				characterRelationships: [],
				factions: [],
				themes: [],
				glossaryTerms: [],
			};
		}

		case 'scene_only': {
			if (!task.targetEntityId) return emptyContext('scene_only');
			const data = await buildSceneOnlyData(task.targetEntityId);
			if (!data) return emptyContext('scene_only');
			return {
				policy: 'scene_only',
				scene: data.scene,
				adjacentScenes: [],
				chapter: null,
				beats: data.beats,
				characters: data.characters,
				locations: data.locations,
				loreEntries: [],
				plotThreads: [],
				project: null,
				storyFrames: [],
				timelineEvents: [],
				characterRelationships: [],
				factions: [],
				themes: [],
				glossaryTerms: [],
			};
		}

		case 'scene_plus_adjacent': {
			if (!task.targetEntityId) return emptyContext('scene_plus_adjacent');
			const data = await buildSceneOnlyData(task.targetEntityId);
			if (!data) return emptyContext('scene_plus_adjacent');

			const allScenesInChapter = await getScenesByChapterId(data.scene.chapterId);

			const sceneIndex = allScenesInChapter.findIndex((s) => s.id === task.targetEntityId);
			const adjacentScenes: Scene[] = [];

			if (sceneIndex > 0) {
				const prev = allScenesInChapter[sceneIndex - 1];
				adjacentScenes.push({ ...prev, content: prev.content.slice(0, MAX_ADJACENT_SCENE_CHARS) });
			}
			if (sceneIndex >= 0 && sceneIndex < allScenesInChapter.length - 1) {
				const next = allScenesInChapter[sceneIndex + 1];
				adjacentScenes.push({ ...next, content: next.content.slice(0, MAX_ADJACENT_SCENE_CHARS) });
			}

			return {
				policy: 'scene_plus_adjacent',
				scene: data.scene,
				adjacentScenes,
				chapter: null,
				beats: data.beats,
				characters: data.characters,
				locations: data.locations,
				loreEntries: [],
				plotThreads: [],
				project: null,
				storyFrames: [],
				timelineEvents: [],
				characterRelationships: [],
				factions: [],
				themes: [],
				glossaryTerms: [],
			};
		}

		case 'worldbuilding_scope': {
			const [project, storyFrames, snapshot] = await Promise.all([
				getOrUndefined<Project>(`/api/db/projects/${projectId}`),
				apiGet<StoryFrame[]>('/api/db/story_frames', { projectId }),
				loadWorldbuildingSnapshot(projectId),
			]);

			return {
				policy: 'worldbuilding_scope',
				scene: null,
				adjacentScenes: [],
				chapter: null,
				beats: [],
				characters: snapshot.characters,
				locations: snapshot.locations,
				loreEntries: snapshot.loreEntries,
				plotThreads: snapshot.plotThreads,
				project: project ?? null,
				storyFrames,
				timelineEvents: snapshot.timelineEvents,
				characterRelationships: [],
				factions: snapshot.factions,
				themes: [],
				glossaryTerms: [],
			};
		}

		case 'chapter_scope':
		case 'outline_scope': {
			const isAuthorFamily =
				task.taskType === 'pipeline' && task.pipelineTask?.family === 'vibe-author';
			const includeProjectContext = task.contextPolicy === 'outline_scope' || isAuthorFamily;
			const includeWorldbuildContext = task.contextPolicy === 'outline_scope' || isAuthorFamily;
			// targetEntityId may be a scene id or chapter id — try scene first
			let chapterId: string | null = null;
			if (task.targetEntityId) {
				const scene = await getOrUndefined<Scene>(`/api/db/scenes/${task.targetEntityId}`);
				chapterId = scene ? scene.chapterId : task.targetEntityId;
			}

			// outline_scope can run without a target (whole-project outline). For
			// chapter_scope we still require a chapter to anchor against.
			const includeHierarchy = task.contextPolicy === 'outline_scope' || isAuthorFamily;
			const [hierarchy, project, storyFrames, plotThreads, worldbuildingSnapshot] = await Promise.all([
				includeHierarchy ? buildOutlineHierarchy(projectId) : Promise.resolve(undefined),
				includeProjectContext
					? getOrUndefined<Project>(`/api/db/projects/${projectId}`)
					: Promise.resolve(undefined),
				includeProjectContext
					? apiGet<StoryFrame[]>('/api/db/story_frames', { projectId })
					: Promise.resolve([]),
				includeProjectContext
					? apiGet<PlotThread[]>('/api/db/plot_threads', { projectId })
					: Promise.resolve([]),
				includeWorldbuildContext ? loadWorldbuildingSnapshot(projectId) : Promise.resolve(null),
			]);

			if (!chapterId) {
				const empty = emptyContext(task.contextPolicy);
				return {
					...empty,
					characters: worldbuildingSnapshot?.characters ?? [],
					locations: worldbuildingSnapshot?.locations ?? [],
					loreEntries: worldbuildingSnapshot?.loreEntries ?? [],
					plotThreads: worldbuildingSnapshot?.plotThreads ?? plotThreads,
					project: project ?? null,
					storyFrames,
					timelineEvents: worldbuildingSnapshot?.timelineEvents ?? [],
					factions: worldbuildingSnapshot?.factions ?? [],
					...(hierarchy ? { outlineHierarchy: hierarchy } : {}),
				};
			}

			const chapter = await getOrUndefined<Chapter>(`/api/db/chapters/${chapterId}`);
			if (!chapter) {
				const empty = emptyContext(task.contextPolicy);
				return {
					...empty,
					characters: worldbuildingSnapshot?.characters ?? [],
					locations: worldbuildingSnapshot?.locations ?? [],
					loreEntries: worldbuildingSnapshot?.loreEntries ?? [],
					plotThreads: worldbuildingSnapshot?.plotThreads ?? plotThreads,
					project: project ?? null,
					storyFrames,
					timelineEvents: worldbuildingSnapshot?.timelineEvents ?? [],
					factions: worldbuildingSnapshot?.factions ?? [],
					...(hierarchy ? { outlineHierarchy: hierarchy } : {}),
				};
			}

			const rawScenes = await getScenesByChapterId(chapterId);
			const scenes = rawScenes.map((s) => ({
				...s,
				content:
					task.contextPolicy === 'outline_scope' ? '' : s.content.slice(0, MAX_CHAPTER_SCENE_CHARS),
			}));

			const allBeatsArrays = await Promise.all(scenes.map((s) => getBeatsBySceneId(s.id)));
			const beats = allBeatsArrays.flat();

			const allCharacterIds = [...new Set(rawScenes.flatMap((s) => s.characterIds))];
			const allLocationIds = [...new Set(rawScenes.flatMap((s) => s.locationIds))];

			const [characters, locations] = await Promise.all([
				fetchCharactersByIds(allCharacterIds, MAX_CHAPTER_CHARACTERS),
				fetchLocationsByIds(allLocationIds, MAX_CHAPTER_LOCATIONS),
			]);
			const contextCharacters = includeWorldbuildContext
				? (worldbuildingSnapshot?.characters ?? [])
				: characters;
			const contextLocations = includeWorldbuildContext
				? (worldbuildingSnapshot?.locations ?? [])
				: locations;
			const contextLoreEntries = includeWorldbuildContext
				? (worldbuildingSnapshot?.loreEntries ?? [])
				: [];
			const contextPlotThreads = includeWorldbuildContext
				? (worldbuildingSnapshot?.plotThreads ?? plotThreads)
				: plotThreads;
			const contextTimelineEvents = includeWorldbuildContext
				? (worldbuildingSnapshot?.timelineEvents ?? [])
				: [];
			const contextFactions = includeWorldbuildContext
				? (worldbuildingSnapshot?.factions ?? [])
				: [];

			return {
				policy: task.contextPolicy,
				scene: null,
				adjacentScenes: scenes,
				chapter,
				beats,
				characters: contextCharacters,
				locations: contextLocations,
				loreEntries: contextLoreEntries,
				plotThreads: contextPlotThreads,
				project: project ?? null,
				storyFrames,
				timelineEvents: contextTimelineEvents,
				characterRelationships: [],
				factions: contextFactions,
				themes: [],
				glossaryTerms: [],
				...(hierarchy ? { outlineHierarchy: hierarchy } : {}),
			};
		}

		case 'continuity_scope': {
			const includeWorldbuildContext =
				task.taskType === 'pipeline' &&
				(task.pipelineTask?.family === 'vibe-worldbuild' ||
					task.pipelineTask?.family === 'vibe-author');
			const includeOutlineHierarchy =
				task.taskType === 'pipeline' && task.pipelineTask?.family === 'vibe-author';
			const [chapters, rawScenes, characters, locations, loreEntries, plotThreads] =
				await Promise.all([
					apiGet<Chapter[]>('/api/db/chapters', { projectId }),
					apiGet<Scene[]>('/api/db/scenes', { projectId }),
					apiGet<Character[]>('/api/db/characters', { projectId }),
					apiGet<Location[]>('/api/db/locations', { projectId }),
					apiGet<LoreEntry[]>('/api/db/lore_entries', { projectId }),
					apiGet<PlotThread[]>('/api/db/plot_threads', { projectId }),
				]);

			const [
				project,
				storyFrames,
				timelineEvents,
				characterRelationships,
				factions,
				themes,
				glossaryTerms,
			] = await Promise.all([
				includeWorldbuildContext
					? getOrUndefined<Project>(`/api/db/projects/${projectId}`)
					: Promise.resolve(undefined),
				includeWorldbuildContext
					? apiGet<StoryFrame[]>('/api/db/story_frames', { projectId })
					: Promise.resolve([]),
				includeWorldbuildContext
					? apiGet<TimelineEvent[]>('/api/db/timeline_events', { projectId })
					: Promise.resolve([]),
				includeWorldbuildContext
					? apiGet<CharacterRelationship[]>('/api/db/character_relationships', { projectId })
					: Promise.resolve([]),
				includeWorldbuildContext
					? apiGet<Faction[]>('/api/db/factions', { projectId })
					: Promise.resolve([]),
				includeWorldbuildContext
					? apiGet<Theme[]>('/api/db/themes', { projectId })
					: Promise.resolve([]),
				includeWorldbuildContext
					? apiGet<GlossaryTerm[]>('/api/db/glossary_terms', { projectId })
					: Promise.resolve([]),
			]);

			const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
			const chapterOrderMap = new Map(sortedChapters.map((c, i) => [c.id, i]));

			const sortedScenes = [...rawScenes].sort((a, b) => {
				const cDiff =
					(chapterOrderMap.get(a.chapterId) ?? 0) - (chapterOrderMap.get(b.chapterId) ?? 0);
				return cDiff !== 0 ? cDiff : a.order - b.order;
			});

			const scenes = sortedScenes.map((s) => ({
				...s,
				content: s.content.slice(0, MAX_CONTINUITY_SCENE_CHARS),
			}));

			// Enforce total char limit: trim oldest scenes first
			let totalChars = scenes.reduce((sum, s) => sum + s.content.length, 0);
			for (let i = 0; i < scenes.length && totalChars > MAX_CONTINUITY_TOTAL_CHARS; i++) {
				totalChars -= scenes[i].content.length;
				scenes[i] = { ...scenes[i], content: '' };
			}

			return {
				policy: 'continuity_scope',
				scene: null,
				adjacentScenes: scenes,
				chapter: null,
				beats: [],
				characters,
				locations,
				loreEntries,
				plotThreads,
				project: project ?? null,
				storyFrames,
				timelineEvents,
				characterRelationships,
				factions,
				themes,
				glossaryTerms,
				...(includeOutlineHierarchy
					? { outlineHierarchy: await buildOutlineHierarchy(projectId) }
					: {}),
			};
		}

		default:
			throw new Error(`Unknown context policy: ${task.contextPolicy}`);
	}
}
