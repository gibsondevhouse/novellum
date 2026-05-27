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
import type { AiContext, AiTask, ContextPolicy } from './types.js';
import {
	MAX_CHARACTERS,
	MAX_LOCATIONS,
	MAX_ADJACENT_SCENE_CHARS,
	MAX_CHAPTER_SCENE_CHARS,
	MAX_CONTINUITY_SCENE_CHARS,
	MAX_CONTINUITY_TOTAL_CHARS,
	MAX_CHAPTER_CHARACTERS,
	MAX_CHAPTER_LOCATIONS,
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

export async function buildContext(task: AiTask, projectId: string): Promise<AiContext> {
	switch (task.contextPolicy) {
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

		case 'chapter_scope':
		case 'outline_scope': {
			const isAuthorFamily =
				task.taskType === 'pipeline' && task.pipelineTask?.family === 'vibe-author';
			const includeProjectContext = task.contextPolicy === 'outline_scope' || isAuthorFamily;
			// targetEntityId may be a scene id or chapter id — try scene first
			let chapterId: string | null = null;
			if (task.targetEntityId) {
				const scene = await getOrUndefined<Scene>(`/api/db/scenes/${task.targetEntityId}`);
				chapterId = scene ? scene.chapterId : task.targetEntityId;
			}

			// outline_scope can run without a target (whole-project outline). For
			// chapter_scope we still require a chapter to anchor against.
			const includeHierarchy = task.contextPolicy === 'outline_scope' || isAuthorFamily;
			const [hierarchy, project, storyFrames, plotThreads] = await Promise.all([
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
			]);

			if (!chapterId) {
				const empty = emptyContext(task.contextPolicy);
				return {
					...empty,
					project: project ?? null,
					storyFrames,
					plotThreads,
					...(hierarchy ? { outlineHierarchy: hierarchy } : {}),
				};
			}

			const chapter = await getOrUndefined<Chapter>(`/api/db/chapters/${chapterId}`);
			if (!chapter) {
				const empty = emptyContext(task.contextPolicy);
				return {
					...empty,
					project: project ?? null,
					storyFrames,
					plotThreads,
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

			return {
				policy: task.contextPolicy,
				scene: null,
				adjacentScenes: scenes,
				chapter,
				beats,
				characters,
				locations,
				loreEntries: [],
				plotThreads,
				project: project ?? null,
				storyFrames,
				timelineEvents: [],
				characterRelationships: [],
				factions: [],
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
