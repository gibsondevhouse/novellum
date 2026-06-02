import { db } from '$lib/server/db/index.js';
import type { Chapter, Project, Scene } from '$lib/db/domain-types.js';
import type { SceneDraftContext } from './author-draft-contract.js';

type JsonRecord = Record<string, unknown>;

function isObject(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function parseTargetWords(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.round(value);
	if (typeof value !== 'string') return undefined;
	const match = value.match(/(\d{2,6})/);
	if (!match) return undefined;
	const parsed = parseInt(match[1] ?? '', 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function loadProject(projectId: string): Project | null {
	return (db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined) ?? null;
}

function loadChapter(chapterId: string): Chapter | null {
	return (db.prepare('SELECT * FROM chapters WHERE id = ?').get(chapterId) as Chapter | undefined) ?? null;
}

function parseSceneRow(row: unknown): Scene {
	const r = row as Record<string, unknown>;
	return {
		...(row as Scene),
		characterIds: JSON.parse((r.characterIds as string | null) ?? '[]') as string[],
		locationIds: JSON.parse((r.locationIds as string | null) ?? '[]') as string[],
	};
}

function loadScene(sceneId: string): Scene | null {
	const row = db.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId);
	return row ? parseSceneRow(row) : null;
}

function loadScenesInChapter(chapterId: string): Scene[] {
	const rows = db
		.prepare('SELECT * FROM scenes WHERE chapterId = ? ORDER BY "order" ASC')
		.all(chapterId);
	return rows.map(parseSceneRow);
}

function loadSceneMetadata(
	projectId: string,
	sceneId: string,
	key: string,
): JsonRecord | null {
	const row = db
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(projectId, 'scene', sceneId, key) as { value?: string } | undefined;
	if (!row?.value) return null;
	try {
		const parsed = JSON.parse(row.value) as unknown;
		return isObject(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function loadChapterMetadata(
	projectId: string,
	chapterId: string,
	key: string,
): JsonRecord | null {
	const row = db
		.prepare(
			'SELECT value FROM project_metadata WHERE projectId = ? AND scope = ? AND ownerId = ? AND key = ?',
		)
		.get(projectId, 'chapter', chapterId, key) as { value?: string } | undefined;
	if (!row?.value) return null;
	try {
		const parsed = JSON.parse(row.value) as unknown;
		return isObject(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function loadCanonRefs(projectId: string, scene: Scene): string[] {
	const characterIds = new Set<string>([...(scene.characterIds ?? [])]);
	if (scene.povCharacterId) characterIds.add(scene.povCharacterId);
	const locationIds = new Set<string>([...(scene.locationIds ?? [])]);
	if (scene.locationId) locationIds.add(scene.locationId);

	const characters = characterIds.size
		? (db
				.prepare(
					`SELECT id, name FROM characters WHERE projectId = ? AND id IN (${Array.from(characterIds)
						.map(() => '?')
						.join(',')})`,
				)
				.all(projectId, ...Array.from(characterIds)) as Array<{ id: string; name: string }>)
		: [];
	const locations = locationIds.size
		? (db
				.prepare(
					`SELECT id, name FROM locations WHERE projectId = ? AND id IN (${Array.from(locationIds)
						.map(() => '?')
						.join(',')})`,
				)
				.all(projectId, ...Array.from(locationIds)) as Array<{ id: string; name: string }>)
		: [];

	const refs: string[] = [];
	for (const c of characters) refs.push(`character:${c.name} (${c.id})`);
	for (const l of locations) refs.push(`location:${l.name} (${l.id})`);
	return refs;
}

function loadUnresolvedThreads(projectId: string): string[] {
	const rows = db
		.prepare(
			`SELECT title, description FROM plot_threads WHERE projectId = ? AND status != 'resolved' ORDER BY createdAt ASC`,
		)
		.all(projectId) as Array<{ title: string; description: string }>;
	return rows.map((r) =>
		r.description?.trim() ? `${r.title}: ${r.description.trim()}` : r.title,
	);
}

export function buildSceneDraftContext(projectId: string, sceneId: string): SceneDraftContext | null {
	const scene = loadScene(sceneId);
	if (!scene || scene.projectId !== projectId) return null;

	const chapter = loadChapter(scene.chapterId);
	if (!chapter || chapter.projectId !== projectId) return null;

	const project = loadProject(projectId);
	if (!project) return null;

	const clarity = loadSceneMetadata(projectId, sceneId, 'clarity');
	const quickIntent =
		loadSceneMetadata(projectId, sceneId, 'quickIntent') ??
		loadSceneMetadata(projectId, sceneId, 'quick-intent');
	const chapterClarity = loadChapterMetadata(projectId, chapter.id, 'clarity');

	const scenesInChapter = loadScenesInChapter(chapter.id);
	const sceneIndex = scenesInChapter.findIndex((s) => s.id === scene.id);
	const priorScene = sceneIndex > 0 ? scenesInChapter[sceneIndex - 1] : null;

	const goal = asString(quickIntent?.goal ?? '').trim() || asString(clarity?.sceneGoal ?? '').trim();
	const conflict =
		asString(quickIntent?.obstacle ?? '').trim() ||
		asString(quickIntent?.conflict ?? '').trim() ||
		asString(clarity?.immediateObstacle ?? '').trim();
	const outcome = asString(quickIntent?.outcome ?? '').trim() || asString(clarity?.outcome ?? '').trim();
	const turn = asString(clarity?.turningPoint ?? '').trim();

	const targetWordCount = (() => {
		const fromChapter = parseTargetWords(chapterClarity?.targetLength);
		if (fromChapter && scenesInChapter.length > 0) {
			return Math.max(0, Math.round(fromChapter / scenesInChapter.length));
		}
		return undefined;
	})();

	return {
		project: {
			title: project.title,
			logline: project.logline?.trim() || undefined,
			synopsis: project.synopsis?.trim() || undefined,
		},
		chapter: {
			id: chapter.id,
			title: chapter.title?.trim() || undefined,
			position: chapter.order,
			summary: chapter.summary?.trim() || undefined,
		},
		scene: {
			id: scene.id,
			position: scene.order,
			title: scene.title?.trim() || undefined,
			goal: goal || undefined,
			conflict: conflict || undefined,
			turn: turn || undefined,
			outcome: outcome || undefined,
			povCharacterId: scene.povCharacterId ?? undefined,
			targetWordCount,
		},
		continuity: {
			relevantCanonRefs: loadCanonRefs(projectId, scene),
			priorSceneSummary: priorScene?.summary?.trim() || undefined,
			unresolvedThreads: loadUnresolvedThreads(projectId),
		},
	};
}
