import type {
	OutlineDraft,
	OutlineDraftAct,
	OutlineDraftArc,
	OutlineDraftChapter,
	OutlineDraftScene,
	OutlineDraftSceneIntent,
} from '$lib/ai/pipeline/outline-draft-contract.js';
import type { StageLifecycleStatus } from '$lib/ai/pipeline/contracts.js';
import type {
	OutlineMergeNodeKey,
	OutlineMergeNodeKind,
} from '$lib/ai/pipeline/outline-checkpoint-contract.js';

export class OutlineMaterializationMapError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'OutlineMaterializationMapError';
	}
}

export interface OutlineMaterializationMapOptions {
	nowIso?: string;
	selectedNodeIds?: readonly string[];
}

export interface MaterializedArcRef {
	arcId: string;
	role: 'primary';
}

export interface MaterializedArcRow {
	id: string;
	projectId: string;
	title: string;
	description: string;
	purpose: string;
	arcType: string | null;
	status: 'planned';
	order: number;
	createdAt: string;
	updatedAt: string;
	sourceId: string;
}

export interface MaterializedActRow {
	id: string;
	projectId: string;
	arcId: string;
	title: string;
	order: number;
	planningNotes: string;
	createdAt: string;
	updatedAt: string;
	sourceId: string;
}

export interface MaterializedMilestoneRow {
	id: string;
	actId: string;
	projectId: string;
	title: string;
	description: string;
	order: number;
	chapterIds: string[];
	createdAt: string;
	updatedAt: string;
	sourceId: string;
}

export interface MaterializedChapterRow {
	id: string;
	projectId: string;
	title: string;
	order: number;
	summary: string;
	wordCount: number;
	actId: string;
	arcRefs: MaterializedArcRef[];
	createdAt: string;
	updatedAt: string;
	sourceId: string;
}

export interface MaterializedSceneRow {
	id: string;
	chapterId: string;
	projectId: string;
	title: string;
	summary: string;
	povCharacterId: string | null;
	locationId: string | null;
	timelineEventId: string | null;
	order: number;
	content: string;
	wordCount: number;
	notes: string;
	characterIds: string[];
	locationIds: string[];
	arcRefs: MaterializedArcRef[];
	createdAt: string;
	updatedAt: string;
	sourceId: string;
}

export interface MaterializedBeatRow {
	id: string;
	sceneId: string | null;
	arcId: string | null;
	projectId: string;
	title: string;
	type: string;
	order: number;
	notes: string;
	createdAt: string;
	updatedAt: string;
	sourceId: string;
}

export interface MaterializedStageRow {
	id: string;
	beatId: string;
	projectId: string;
	title: string;
	description: string;
	order: number;
	status: StageLifecycleStatus;
	createdAt: string;
	updatedAt: string;
	sourceId: string;
}

export type SceneIntentMetadataKey = 'quickIntent' | 'quick-intent' | 'clarity';

export interface SceneIntentMetadataRow {
	projectId: string;
	scope: 'scene';
	ownerId: string;
	key: SceneIntentMetadataKey;
	value: Record<string, string>;
}

export interface OutlineMaterializationMap {
	projectId: string;
	draftId: string;
	createdAt: string;
	updatedAt: string;
	arcs: MaterializedArcRow[];
	acts: MaterializedActRow[];
	milestones: MaterializedMilestoneRow[];
	chapters: MaterializedChapterRow[];
	scenes: MaterializedSceneRow[];
	beats: MaterializedBeatRow[];
	stages: MaterializedStageRow[];
	sceneIntentMetadata: SceneIntentMetadataRow[];
	counts: {
		arcs: number;
		acts: number;
		milestones: number;
		chapters: number;
		scenes: number;
		beats: number;
		stages: number;
		sceneIntentMetadata: number;
	};
}

const DEFAULT_TIMESTAMP = '1970-01-01T00:00:00.000Z';
const NODE_KIND_PREFIXES: OutlineMergeNodeKind[] = ['arc', 'act', 'chapter', 'scene'];

function compareByOrderTitleId<T extends { order: number; title: string; id: string }>(a: T, b: T): number {
	return a.order - b.order || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
}

function sortNodes<T extends { order: number; title: string; id: string }>(nodes: readonly T[]): T[] {
	return [...nodes].sort(compareByOrderTitleId);
}

function assertNonEmpty<T>(nodes: readonly T[], message: string): asserts nodes is readonly [T, ...T[]] {
	if (nodes.length === 0) throw new OutlineMaterializationMapError(message);
}

function assertUniqueNodeId(
	seen: Map<string, string>,
	id: string,
	label: string,
): void {
	const previous = seen.get(id);
	if (previous) {
		throw new OutlineMaterializationMapError(
			`Duplicate outline id "${id}" appears in both ${previous} and ${label}.`,
		);
	}
	seen.set(id, label);
}

function beatIdForScene(sceneId: string, order: number): string {
	return `beat:${sceneId}:${order}`;
}

function stageIdForBeat(beatId: string, order: number): string {
	return `stage:${beatId}:${order}`;
}

function collectAndValidateIds(draft: OutlineDraft): void {
	const seen = new Map<string, string>();
	assertNonEmpty(draft.arcs, 'Outline draft must include at least one arc.');
	for (const arc of draft.arcs) {
		assertUniqueNodeId(seen, arc.id, `arc ${arc.title}`);
		assertNonEmpty(arc.acts, `Arc ${arc.id} must include at least one act.`);
		for (const act of arc.acts) {
			assertUniqueNodeId(seen, act.id, `act ${act.title}`);
			assertNonEmpty(act.chapters, `Act ${act.id} must include at least one chapter.`);
			for (const chapter of act.chapters) {
				assertUniqueNodeId(seen, chapter.id, `chapter ${chapter.title}`);
				assertNonEmpty(chapter.scenes, `Chapter ${chapter.id} must include at least one scene.`);
				for (const scene of chapter.scenes) {
					assertUniqueNodeId(seen, scene.id, `scene ${scene.title}`);
					for (const beat of scene.beats ?? []) {
						const beatId = beatIdForScene(scene.id, beat.order);
						assertUniqueNodeId(seen, beatId, `beat ${beat.title}`);
						for (const stage of beat.stages) {
							assertUniqueNodeId(seen, stageIdForBeat(beatId, stage.order), `stage ${stage.title}`);
						}
					}
				}
			}
		}
	}
}

function nodeKey(kind: OutlineMergeNodeKind, id: string): OutlineMergeNodeKey {
	return `${kind}:${id}`;
}

function parseNodeKey(value: string): OutlineMergeNodeKey {
	const trimmed = value.trim();
	for (const kind of NODE_KIND_PREFIXES) {
		const prefix = `${kind}:`;
		if (trimmed.startsWith(prefix) && trimmed.length > prefix.length) {
			return trimmed as OutlineMergeNodeKey;
		}
	}
	throw new OutlineMaterializationMapError(
		`Selected outline node "${trimmed || '(empty)'}" is not a valid merge node id.`,
	);
}

function collectDraftNodeKeys(draft: OutlineDraft): Set<OutlineMergeNodeKey> {
	const keys = new Set<OutlineMergeNodeKey>();
	for (const arc of draft.arcs) {
		keys.add(nodeKey('arc', arc.id));
		for (const act of arc.acts) {
			keys.add(nodeKey('act', act.id));
			for (const chapter of act.chapters) {
				keys.add(nodeKey('chapter', chapter.id));
				for (const scene of chapter.scenes) {
					keys.add(nodeKey('scene', scene.id));
				}
			}
		}
	}
	return keys;
}

function normalizeSelectedNodeIds(
	draft: OutlineDraft,
	selectedNodeIds: readonly string[] | undefined,
): Set<OutlineMergeNodeKey> | null {
	if (selectedNodeIds === undefined) return null;
	if (selectedNodeIds.length === 0) {
		throw new OutlineMaterializationMapError('At least one outline node must be selected.');
	}

	const draftKeys = collectDraftNodeKeys(draft);
	const selectedKeys = new Set<OutlineMergeNodeKey>();
	for (const rawKey of selectedNodeIds) {
		if (typeof rawKey !== 'string') {
			throw new OutlineMaterializationMapError('Selected outline node ids must be strings.');
		}
		const key = parseNodeKey(rawKey);
		if (!draftKeys.has(key)) {
			throw new OutlineMaterializationMapError(
				`Selected outline node "${key}" does not exist in checkpoint draft.`,
			);
		}
		selectedKeys.add(key);
	}

	if (selectedKeys.size === 0) {
		throw new OutlineMaterializationMapError('At least one outline node must be selected.');
	}
	return selectedKeys;
}

function isNodeSelected(
	selectedKeys: ReadonlySet<OutlineMergeNodeKey> | null,
	kind: OutlineMergeNodeKind,
	id: string,
): boolean {
	return selectedKeys === null || selectedKeys.has(nodeKey(kind, id));
}

function shouldIncludeScene(
	selectedKeys: ReadonlySet<OutlineMergeNodeKey> | null,
	scene: OutlineDraftScene,
): boolean {
	return isNodeSelected(selectedKeys, 'scene', scene.id);
}

function shouldIncludeChapter(
	selectedKeys: ReadonlySet<OutlineMergeNodeKey> | null,
	chapter: OutlineDraftChapter,
): boolean {
	return (
		isNodeSelected(selectedKeys, 'chapter', chapter.id) ||
		chapter.scenes.some((scene) => shouldIncludeScene(selectedKeys, scene))
	);
}

function shouldIncludeAct(
	selectedKeys: ReadonlySet<OutlineMergeNodeKey> | null,
	act: OutlineDraftAct,
): boolean {
	return (
		isNodeSelected(selectedKeys, 'act', act.id) ||
		act.chapters.some((chapter) => shouldIncludeChapter(selectedKeys, chapter))
	);
}

function shouldIncludeArc(
	selectedKeys: ReadonlySet<OutlineMergeNodeKey> | null,
	arc: OutlineDraftArc,
): boolean {
	return (
		isNodeSelected(selectedKeys, 'arc', arc.id) ||
		arc.acts.some((act) => shouldIncludeAct(selectedKeys, act))
	);
}

function arcRef(arc: OutlineDraftArc): MaterializedArcRef[] {
	return [{ arcId: arc.id, role: 'primary' }];
}

function milestoneIdForAct(act: OutlineDraftAct): string {
	return `milestone:${act.id}`;
}

function quickIntentValue(intent: OutlineDraftSceneIntent): Record<string, string> {
	return {
		goal: intent.goal,
		obstacle: intent.conflict,
		conflict: intent.conflict,
		turn: intent.turn,
		outcome: intent.outcome,
	};
}

function clarityValue(intent: OutlineDraftSceneIntent): Record<string, string> {
	return {
		sceneGoal: intent.goal,
		immediateObstacle: intent.conflict,
		turningPoint: intent.turn,
		outcome: intent.outcome,
	};
}

function sceneIntentRows(projectId: string, scene: OutlineDraftScene): SceneIntentMetadataRow[] {
	return [
		{
			projectId,
			scope: 'scene',
			ownerId: scene.id,
			key: 'quickIntent',
			value: quickIntentValue(scene.intent),
		},
		{
			projectId,
			scope: 'scene',
			ownerId: scene.id,
			key: 'quick-intent',
			value: quickIntentValue(scene.intent),
		},
		{
			projectId,
			scope: 'scene',
			ownerId: scene.id,
			key: 'clarity',
			value: clarityValue(scene.intent),
		},
	];
}

function mapArc(
	projectId: string,
	arc: OutlineDraftArc,
	nowIso: string,
): MaterializedArcRow {
	return {
		id: arc.id,
		projectId,
		title: arc.title,
		description: arc.summary,
		purpose: arc.purpose,
		arcType: null,
		status: 'planned',
		order: arc.order,
		createdAt: nowIso,
		updatedAt: nowIso,
		sourceId: arc.id,
	};
}

function mapAct(
	projectId: string,
	arc: OutlineDraftArc,
	act: OutlineDraftAct,
	nowIso: string,
): MaterializedActRow {
	return {
		id: act.id,
		projectId,
		arcId: arc.id,
		title: act.title,
		order: act.order,
		planningNotes: act.summary,
		createdAt: nowIso,
		updatedAt: nowIso,
		sourceId: act.id,
	};
}

function mapChapter(
	projectId: string,
	arc: OutlineDraftArc,
	act: OutlineDraftAct,
	chapter: OutlineDraftChapter,
	nowIso: string,
): MaterializedChapterRow {
	return {
		id: chapter.id,
		projectId,
		title: chapter.title,
		order: chapter.order,
		summary: chapter.summary,
		wordCount: 0,
		actId: act.id,
		arcRefs: arcRef(arc),
		createdAt: nowIso,
		updatedAt: nowIso,
		sourceId: chapter.id,
	};
}

function mapScene(
	projectId: string,
	arc: OutlineDraftArc,
	chapter: OutlineDraftChapter,
	scene: OutlineDraftScene,
	nowIso: string,
): MaterializedSceneRow {
	return {
		id: scene.id,
		chapterId: chapter.id,
		projectId,
		title: scene.title,
		summary: scene.summary,
		povCharacterId: scene.povCharacterId ?? null,
		locationId: scene.locationIds[0] ?? null,
		timelineEventId: null,
		order: scene.order,
		content: '',
		wordCount: 0,
		notes: '',
		characterIds: [...scene.characterIds],
		locationIds: [...scene.locationIds],
		arcRefs: arcRef(arc),
		createdAt: nowIso,
		updatedAt: nowIso,
		sourceId: scene.id,
	};
}

function beatNotes(summary: string, purpose: string): string {
	return `${summary}\n\nPurpose: ${purpose}`.trim();
}

function mapBeatsAndStages(
	projectId: string,
	arc: OutlineDraftArc,
	scene: OutlineDraftScene,
	nowIso: string,
): { beats: MaterializedBeatRow[]; stages: MaterializedStageRow[] } {
	const beats: MaterializedBeatRow[] = [];
	const stages: MaterializedStageRow[] = [];

	for (const beat of sortNodes(
		(scene.beats ?? []).map((item) => ({ ...item, id: beatIdForScene(scene.id, item.order) })),
	)) {
		const beatId = beat.id;
		beats.push({
			id: beatId,
			sceneId: scene.id,
			arcId: arc.id,
			projectId,
			title: beat.title,
			type: beat.type,
			order: beat.order,
			notes: beatNotes(beat.summary, beat.purpose),
			createdAt: nowIso,
			updatedAt: nowIso,
			sourceId: beatId,
		});

		for (const stage of sortNodes(
			beat.stages.map((item) => ({ ...item, id: stageIdForBeat(beatId, item.order) })),
		)) {
			stages.push({
				id: stage.id,
				beatId,
				projectId,
				title: stage.title,
				description: stage.purpose,
				order: stage.order,
				status: stage.status,
				createdAt: nowIso,
				updatedAt: nowIso,
				sourceId: stage.id,
			});
		}
	}

	return { beats, stages };
}

function mapMilestone(
	projectId: string,
	act: OutlineDraftAct,
	chapterIds: string[],
	nowIso: string,
): MaterializedMilestoneRow {
	return {
		id: milestoneIdForAct(act),
		actId: act.id,
		projectId,
		title: `${act.title} milestone`,
		description: 'Generated milestone bucket for accepted outline chapters.',
		order: act.order,
		chapterIds,
		createdAt: nowIso,
		updatedAt: nowIso,
		sourceId: act.id,
	};
}

export function buildOutlineMaterializationMap(
	draft: OutlineDraft,
	options: OutlineMaterializationMapOptions = {},
): OutlineMaterializationMap {
	collectAndValidateIds(draft);

	const projectId = draft.projectId;
	const nowIso = options.nowIso ?? DEFAULT_TIMESTAMP;
	const selectedKeys = normalizeSelectedNodeIds(draft, options.selectedNodeIds);
	const arcs: MaterializedArcRow[] = [];
	const acts: MaterializedActRow[] = [];
	const milestones: MaterializedMilestoneRow[] = [];
	const chapters: MaterializedChapterRow[] = [];
	const scenes: MaterializedSceneRow[] = [];
	const beats: MaterializedBeatRow[] = [];
	const stages: MaterializedStageRow[] = [];
	const sceneIntentMetadata: SceneIntentMetadataRow[] = [];

	for (const arc of sortNodes(draft.arcs)) {
		if (!shouldIncludeArc(selectedKeys, arc)) continue;
		arcs.push(mapArc(projectId, arc, nowIso));
		for (const act of sortNodes(arc.acts)) {
			if (!shouldIncludeAct(selectedKeys, act)) continue;
			acts.push(mapAct(projectId, arc, act, nowIso));
			const chapterIdsForAct: string[] = [];
			for (const chapter of sortNodes(act.chapters)) {
				if (!shouldIncludeChapter(selectedKeys, chapter)) continue;
				chapters.push(mapChapter(projectId, arc, act, chapter, nowIso));
				chapterIdsForAct.push(chapter.id);
				for (const scene of sortNodes(chapter.scenes)) {
					if (!shouldIncludeScene(selectedKeys, scene)) continue;
					scenes.push(mapScene(projectId, arc, chapter, scene, nowIso));
					const mapped = mapBeatsAndStages(projectId, arc, scene, nowIso);
					beats.push(...mapped.beats);
					stages.push(...mapped.stages);
					sceneIntentMetadata.push(...sceneIntentRows(projectId, scene));
				}
			}
			milestones.push(mapMilestone(projectId, act, chapterIdsForAct, nowIso));
		}
	}

	return {
		projectId,
		draftId: draft.id,
		createdAt: nowIso,
		updatedAt: nowIso,
		arcs,
		acts,
		milestones,
		chapters,
		scenes,
		beats,
		stages,
		sceneIntentMetadata,
		counts: {
			arcs: arcs.length,
			acts: acts.length,
			milestones: milestones.length,
			chapters: chapters.length,
			scenes: scenes.length,
			beats: beats.length,
			stages: stages.length,
			sceneIntentMetadata: sceneIntentMetadata.length,
		},
	};
}
