import { db } from '$lib/db/index.js';
import type { Character, Location, Scene } from '$lib/db/types.js';
import type { AiContext, AiTask, ContextPolicy } from './types.js';

const MAX_CHARACTERS = 5;
const MAX_LOCATIONS = 3;
const MAX_ADJACENT_SCENE_CHARS = 500;
const MAX_CHAPTER_SCENE_CHARS = 300;
const MAX_CONTINUITY_SCENE_CHARS = 200;
const MAX_CONTINUITY_TOTAL_CHARS = 24000;
const MAX_CHAPTER_CHARACTERS = 10;
const MAX_CHAPTER_LOCATIONS = 5;

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
	};
}

async function fetchCharactersByIds(ids: string[], limit: number): Promise<Character[]> {
	const results = await Promise.all(ids.slice(0, limit).map((id) => db.characters.get(id)));
	return results.filter((c): c is Character => c !== undefined);
}

async function fetchLocationsByIds(ids: string[], limit: number): Promise<Location[]> {
	const results = await Promise.all(ids.slice(0, limit).map((id) => db.locations.get(id)));
	return results.filter((l): l is Location => l !== undefined);
}

async function buildSceneOnlyData(sceneId: string) {
	const scene = await db.scenes.get(sceneId);
	if (!scene) return null;
	const [beats, characters, locations] = await Promise.all([
		db.beats.where('sceneId').equals(sceneId).sortBy('order'),
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
			};
		}

		case 'scene_plus_adjacent': {
			if (!task.targetEntityId) return emptyContext('scene_plus_adjacent');
			const data = await buildSceneOnlyData(task.targetEntityId);
			if (!data) return emptyContext('scene_plus_adjacent');

			const allScenesInChapter = await db.scenes
				.where('chapterId')
				.equals(data.scene.chapterId)
				.sortBy('order');

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
			};
		}

		case 'chapter_scope':
		case 'outline_scope': {
			// targetEntityId may be a scene id or chapter id — try scene first
			let chapterId: string | null = null;
			if (task.targetEntityId) {
				const scene = await db.scenes.get(task.targetEntityId);
				chapterId = scene ? scene.chapterId : task.targetEntityId;
			}
			if (!chapterId) return emptyContext(task.contextPolicy);

			const chapter = await db.chapters.get(chapterId);
			if (!chapter) return emptyContext(task.contextPolicy);

			const rawScenes = await db.scenes.where('chapterId').equals(chapterId).sortBy('order');
			const scenes = rawScenes.map((s) => ({
				...s,
				content:
					task.contextPolicy === 'outline_scope' ? '' : s.content.slice(0, MAX_CHAPTER_SCENE_CHARS),
			}));

			const allBeatsArrays = await Promise.all(
				scenes.map((s) => db.beats.where('sceneId').equals(s.id).sortBy('order')),
			);
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
				plotThreads: [],
			};
		}

		case 'continuity_scope': {
			const chapters = await db.chapters.where('projectId').equals(projectId).sortBy('order');
			const chapterOrderMap = new Map(chapters.map((c, i) => [c.id, i]));

			const rawScenes = await db.scenes.where('projectId').equals(projectId).toArray();
			rawScenes.sort((a, b) => {
				const cDiff =
					(chapterOrderMap.get(a.chapterId) ?? 0) - (chapterOrderMap.get(b.chapterId) ?? 0);
				return cDiff !== 0 ? cDiff : a.order - b.order;
			});

			const scenes = rawScenes.map((s) => ({
				...s,
				content: s.content.slice(0, MAX_CONTINUITY_SCENE_CHARS),
			}));

			// Enforce total char limit: trim oldest scenes first
			let totalChars = scenes.reduce((sum, s) => sum + s.content.length, 0);
			for (let i = 0; i < scenes.length && totalChars > MAX_CONTINUITY_TOTAL_CHARS; i++) {
				totalChars -= scenes[i].content.length;
				scenes[i] = { ...scenes[i], content: '' };
			}

			const [characters, locations, loreEntries, plotThreads] = await Promise.all([
				db.characters.where('projectId').equals(projectId).toArray(),
				db.locations.where('projectId').equals(projectId).toArray(),
				db.lore_entries.where('projectId').equals(projectId).toArray(),
				db.plot_threads.where('projectId').equals(projectId).toArray(),
			]);

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
			};
		}

		default:
			throw new Error(`Unknown context policy: ${task.contextPolicy}`);
	}
}
