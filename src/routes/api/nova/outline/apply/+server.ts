import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomUUID } from 'node:crypto';
import { db, encodeJson } from '$lib/server/db/index.js';

type OutlineRecord = Record<string, unknown>;

interface OutlinePayload {
	arcs: OutlineRecord[];
	acts: OutlineRecord[];
	milestones?: OutlineRecord[];
	chapters: OutlineRecord[];
	scenes: OutlineRecord[];
	beats?: OutlineRecord[];
}

interface ApplyOutlineBody {
	projectId?: string;
	payload?: OutlinePayload;
}

interface ApplyOutlineResponse {
	ok: true;
	counts: {
		arcs: number;
		acts: number;
		milestones: number;
		chapters: number;
		scenes: number;
		beats: number;
	};
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function asOptionalString(value: unknown): string | null {
	const next = asString(value);
	return next.length > 0 ? next : null;
}

function asNumber(value: unknown, fallback: number): number {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const parsed = Number.parseInt(value, 10);
		if (Number.isFinite(parsed)) return parsed;
	}
	return fallback;
}

function asRecordArray(value: unknown): OutlineRecord[] {
	if (!Array.isArray(value)) return [];
	return value.filter(
		(entry): entry is OutlineRecord => typeof entry === 'object' && entry !== null && !Array.isArray(entry),
	);
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((entry): entry is string => typeof entry === 'string')
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

function sourceKey(record: OutlineRecord, fallbackKey: string): string {
	const rawId = asString(record.id);
	return rawId || fallbackKey;
}

function mapRef(ref: unknown, idMap: Map<string, string>): string | null {
	const key = asString(ref);
	if (!key) return null;
	return idMap.get(key) ?? null;
}

function normalizeArcRefs(raw: unknown, arcIdMap: Map<string, string>): Array<{ arcId: string; role: string }> {
	const rows = asRecordArray(raw);
	const refs: Array<{ arcId: string; role: string }> = [];
	for (const row of rows) {
		const mappedArcId = mapRef(row.arcId, arcIdMap);
		if (!mappedArcId) continue;
		refs.push({
			arcId: mappedArcId,
			role: asString(row.role),
		});
	}
	return refs;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { projectId, payload } = body as ApplyOutlineBody;
	if (!projectId || typeof projectId !== 'string') {
		return json({ error: 'projectId is required' }, { status: 400 });
	}
	if (!payload || typeof payload !== 'object') {
		return json({ error: 'payload is required' }, { status: 400 });
	}

	const projectExists = db
		.prepare('SELECT id FROM projects WHERE id = ?')
		.get(projectId) as { id: string } | undefined;
	if (!projectExists) {
		return json({ error: 'Project not found' }, { status: 404 });
	}

	const arcs = asRecordArray((payload as OutlinePayload).arcs);
	const acts = asRecordArray((payload as OutlinePayload).acts);
	const milestones = asRecordArray((payload as OutlinePayload).milestones ?? []);
	const chapters = asRecordArray((payload as OutlinePayload).chapters);
	const scenes = asRecordArray((payload as OutlinePayload).scenes);
	const beats = asRecordArray((payload as OutlinePayload).beats ?? []);

	const now = new Date().toISOString();

	const deleteStages = db.prepare('DELETE FROM stages WHERE projectId = ?');
	const deleteBeats = db.prepare('DELETE FROM beats WHERE projectId = ?');
	const deleteScenes = db.prepare('DELETE FROM scenes WHERE projectId = ?');
	const deleteChapters = db.prepare('DELETE FROM chapters WHERE projectId = ?');
	const deleteMilestones = db.prepare('DELETE FROM milestones WHERE projectId = ?');
	const deleteActs = db.prepare('DELETE FROM acts WHERE projectId = ?');
	const deleteArcs = db.prepare('DELETE FROM arcs WHERE projectId = ?');

	const insertArc = db.prepare(
		`INSERT INTO arcs (id, projectId, title, description, purpose, arcType, status, "order", createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @description, @purpose, @arcType, @status, @order, @createdAt, @updatedAt)`,
	);
	const insertAct = db.prepare(
		`INSERT INTO acts (id, projectId, arcId, title, "order", planningNotes, createdAt, updatedAt)
		 VALUES (@id, @projectId, @arcId, @title, @order, @planningNotes, @createdAt, @updatedAt)`,
	);
	const insertChapter = db.prepare(
		`INSERT INTO chapters (id, projectId, title, "order", summary, wordCount, actId, arcRefs, createdAt, updatedAt)
		 VALUES (@id, @projectId, @title, @order, @summary, @wordCount, @actId, @arcRefs, @createdAt, @updatedAt)`,
	);
	const insertScene = db.prepare(
		`INSERT INTO scenes (id, chapterId, projectId, title, summary, povCharacterId, locationId, timelineEventId, "order", content, wordCount, notes, characterIds, locationIds, arcRefs, createdAt, updatedAt)
		 VALUES (@id, @chapterId, @projectId, @title, @summary, @povCharacterId, @locationId, @timelineEventId, @order, @content, @wordCount, @notes, @characterIds, @locationIds, @arcRefs, @createdAt, @updatedAt)`,
	);
	const insertBeat = db.prepare(
		`INSERT INTO beats (id, sceneId, arcId, projectId, title, type, "order", notes, createdAt, updatedAt)
		 VALUES (@id, @sceneId, @arcId, @projectId, @title, @type, @order, @notes, @createdAt, @updatedAt)`,
	);
	const insertMilestone = db.prepare(
		`INSERT INTO milestones (id, actId, projectId, title, description, "order", chapterIds, createdAt, updatedAt)
		 VALUES (@id, @actId, @projectId, @title, @description, @order, @chapterIds, @createdAt, @updatedAt)`,
	);

	let insertedCounts: ApplyOutlineResponse['counts'] = {
		arcs: 0,
		acts: 0,
		milestones: 0,
		chapters: 0,
		scenes: 0,
		beats: 0,
	};

	const tx = db.transaction(() => {
		deleteStages.run(projectId);
		deleteBeats.run(projectId);
		deleteScenes.run(projectId);
		deleteChapters.run(projectId);
		deleteMilestones.run(projectId);
		deleteActs.run(projectId);
		deleteArcs.run(projectId);

		const arcIdMap = new Map<string, string>();
		const actIdMap = new Map<string, string>();
		const chapterIdMap = new Map<string, string>();
		const sceneIdMap = new Map<string, string>();

		const orderedArcIds: string[] = [];
		const orderedActIds: string[] = [];
		const chapterIdsByAct = new Map<string, string[]>();
		const actTitleById = new Map<string, string>();

		for (let i = 0; i < arcs.length; i++) {
			const row = arcs[i];
			const id = randomUUID();
			const key = sourceKey(row, `arc:${i}`);
			const title = asString(row.title) || asString(row.name) || `Arc ${i + 1}`;
			insertArc.run({
				id,
				projectId,
				title,
				description: asString(row.description),
				purpose: asString(row.purpose),
				arcType: asOptionalString(row.arcType),
				status: asString(row.status) || 'planned',
				order: asNumber(row.order, i),
				createdAt: now,
				updatedAt: now,
			});
			arcIdMap.set(key, id);
			const explicitId = asString(row.id);
			if (explicitId) arcIdMap.set(explicitId, id);
			orderedArcIds.push(id);
		}

		for (let i = 0; i < acts.length; i++) {
			const row = acts[i];
			const id = randomUUID();
			const key = sourceKey(row, `act:${i}`);
			const title = asString(row.title) || asString(row.name) || `Act ${i + 1}`;
			const mappedArcId = mapRef(row.arcId, arcIdMap);
			const fallbackArcId = orderedArcIds.length > 0 ? orderedArcIds[0] : null;
			const arcId = mappedArcId ?? fallbackArcId;
			insertAct.run({
				id,
				projectId,
				arcId,
				title,
				order: asNumber(row.order, i),
				planningNotes: asString(row.planningNotes) || asString(row.description),
				createdAt: now,
				updatedAt: now,
			});
			actIdMap.set(key, id);
			const explicitId = asString(row.id);
			if (explicitId) actIdMap.set(explicitId, id);
			orderedActIds.push(id);
			actTitleById.set(id, title);
		}

		for (let i = 0; i < chapters.length; i++) {
			const row = chapters[i];
			const id = randomUUID();
			const key = sourceKey(row, `chapter:${i}`);
			const title = asString(row.title) || asString(row.name) || `Chapter ${i + 1}`;
			const mappedActId = mapRef(row.actId, actIdMap);
			const fallbackActId = orderedActIds.length > 0 ? orderedActIds[0] : null;
			const actId = mappedActId ?? fallbackActId;
			const arcRefs = normalizeArcRefs(row.arcRefs, arcIdMap);

			insertChapter.run({
				id,
				projectId,
				title,
				order: asNumber(row.order, i),
				summary: asString(row.summary) || asString(row.description),
				wordCount: asNumber(row.wordCount, 0),
				actId,
				arcRefs: encodeJson(arcRefs),
				createdAt: now,
				updatedAt: now,
			});

			chapterIdMap.set(key, id);
			const explicitId = asString(row.id);
			if (explicitId) chapterIdMap.set(explicitId, id);
			if (actId) {
				chapterIdsByAct.set(actId, [...(chapterIdsByAct.get(actId) ?? []), id]);
			}
		}

		const orderedChapterIds = [...chapterIdMap.values()];
		for (let i = 0; i < scenes.length; i++) {
			const row = scenes[i];
			const id = randomUUID();
			const key = sourceKey(row, `scene:${i}`);
			const mappedChapterId = mapRef(row.chapterId, chapterIdMap);
			const fallbackChapterId = orderedChapterIds.length > 0 ? orderedChapterIds[0] : null;
			const chapterId = mappedChapterId ?? fallbackChapterId;
			if (!chapterId) continue;
			const arcRefs = normalizeArcRefs(row.arcRefs, arcIdMap);

			insertScene.run({
				id,
				chapterId,
				projectId,
				title: asString(row.title) || asString(row.name) || `Scene ${i + 1}`,
				summary: asString(row.summary) || asString(row.goal),
				povCharacterId: asOptionalString(row.povCharacterId),
				locationId: asOptionalString(row.locationId),
				timelineEventId: asOptionalString(row.timelineEventId),
				order: asNumber(row.order, i),
				content: asString(row.content),
				wordCount: asNumber(row.wordCount, 0),
				notes: asString(row.notes) || asString(row.outcome),
				characterIds: encodeJson(asStringArray(row.characterIds)),
				locationIds: encodeJson(asStringArray(row.locationIds)),
				arcRefs: encodeJson(arcRefs),
				createdAt: now,
				updatedAt: now,
			});
			sceneIdMap.set(key, id);
			const explicitId = asString(row.id);
			if (explicitId) sceneIdMap.set(explicitId, id);
		}

		const orderedSceneIds = [...sceneIdMap.values()];
		for (let i = 0; i < beats.length; i++) {
			const row = beats[i];
			const mappedSceneId = mapRef(row.sceneId, sceneIdMap);
			const mappedArcId = mapRef(row.arcId, arcIdMap);
			const sceneId = mappedSceneId ?? (orderedSceneIds.length > 0 ? orderedSceneIds[0] : null);
			const arcId = mappedArcId ?? (orderedArcIds.length > 0 ? orderedArcIds[0] : null);

			insertBeat.run({
				id: randomUUID(),
				sceneId,
				arcId,
				projectId,
				title: asString(row.title) || asString(row.name) || `Beat ${i + 1}`,
				type: asString(row.type),
				order: asNumber(row.order, i),
				notes: asString(row.notes) || asString(row.description),
				createdAt: now,
				updatedAt: now,
			});
		}

		const milestoneRows =
			milestones.length > 0
				? milestones
				: orderedActIds.map((actId, index) => ({
						actId,
						title: `Milestone ${index + 1}: ${actTitleById.get(actId) ?? 'Act Progression'}`,
						description: 'Auto-generated milestone bucket from applied outline draft.',
						chapterIds: chapterIdsByAct.get(actId) ?? [],
						order: index,
					}));

		for (let i = 0; i < milestoneRows.length; i++) {
			const row = milestoneRows[i];
			const mappedActId = mapRef(row.actId, actIdMap);
			const fallbackActId = orderedActIds.length > 0 ? orderedActIds[0] : null;
			const actId = mappedActId ?? fallbackActId;
			if (!actId) continue;

			const chapterIds = asStringArray(row.chapterIds)
				.map((rawChapterId) => chapterIdMap.get(rawChapterId) ?? rawChapterId)
				.filter(Boolean);
			const inferredChapterIds = chapterIds.length > 0 ? chapterIds : (chapterIdsByAct.get(actId) ?? []);

			insertMilestone.run({
				id: randomUUID(),
				actId,
				projectId,
				title: asString(row.title) || asString((row as OutlineRecord).name) || `Milestone ${i + 1}`,
				description: asString(row.description),
				order: asNumber(row.order, i),
				chapterIds: encodeJson(inferredChapterIds),
				createdAt: now,
				updatedAt: now,
			});
		}

		insertedCounts = {
			arcs: arcs.length,
			acts: acts.length,
			milestones: milestoneRows.length,
			chapters: chapters.length,
			scenes: scenes.length,
			beats: beats.length,
		};
	});

	try {
		tx();
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to apply outline draft.';
		return json({ error: message }, { status: 500 });
	}

	return json({
		ok: true,
		counts: insertedCounts,
	} satisfies ApplyOutlineResponse);
};
