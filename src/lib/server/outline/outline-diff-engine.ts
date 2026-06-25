import type {
	OutlineDraft,
	OutlineDraftAct,
	OutlineDraftArc,
	OutlineDraftChapter,
	OutlineDraftScene,
} from '$lib/ai/pipeline/outline-draft-contract.js';
import type { Act, Arc, Chapter, Scene } from '$lib/db/domain-types.js';

export type OutlineDiffNodeKind = 'arc' | 'act' | 'chapter' | 'scene';
export type OutlineDiffOperation = 'insert' | 'update' | 'delete';

export interface ExistingOutlineHierarchy {
	arcs: readonly Arc[];
	acts: readonly Act[];
	chapters: readonly Chapter[];
	scenes: readonly Scene[];
}

export interface OutlineDiffNodeRef {
	kind: OutlineDiffNodeKind;
	id: string;
	title: string;
	order: number;
	parentId: string | null;
	path: string;
	pathIds: string[];
}

export interface OutlineDiffFieldChange {
	field: string;
	before: ComparableValue;
	after: ComparableValue;
}

export interface OutlineDiffEntry {
	operation: OutlineDiffOperation;
	node: OutlineDiffNodeRef;
	changes: OutlineDiffFieldChange[];
}

export interface OutlineDiffResult {
	insertions: OutlineDiffEntry[];
	modifications: OutlineDiffEntry[];
	deletions: OutlineDiffEntry[];
	counts: {
		insertions: number;
		modifications: number;
		deletions: number;
		total: number;
	};
	isEmpty: boolean;
}

type ComparablePrimitive = string | number | boolean | null;
type ComparableValue = ComparablePrimitive | readonly ComparablePrimitive[];

interface ComparableOutlineNode {
	ref: OutlineDiffNodeRef;
	fields: Record<string, ComparableValue>;
}

const KIND_DEPTH: Record<OutlineDiffNodeKind, number> = {
	arc: 0,
	act: 1,
	chapter: 2,
	scene: 3,
};

function compareByOrderTitleId<T extends { order: number; title: string; id: string }>(
	a: T,
	b: T,
): number {
	return a.order - b.order || a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
}

function sortNodes<T extends { order: number; title: string; id: string }>(
	nodes: readonly T[],
): T[] {
	return [...nodes].sort(compareByOrderTitleId);
}

function normalizeText(value: string | null | undefined): string {
	return value ?? '';
}

function normalizeStringList(value: readonly string[] | null | undefined): readonly string[] {
	return [...(value ?? [])].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function refFor(
	kind: OutlineDiffNodeKind,
	id: string,
	title: string,
	order: number,
	parentId: string | null,
	pathIds: readonly string[],
): OutlineDiffNodeRef {
	return {
		kind,
		id,
		title,
		order,
		parentId,
		pathIds: [...pathIds],
		path: pathIds.map((pathId, index) => `${index === pathIds.length - 1 ? kind : 'parent'}:${pathId}`).join('/'),
	};
}

function draftArcNode(arc: OutlineDraftArc): ComparableOutlineNode {
	return {
		ref: refFor('arc', arc.id, arc.title, arc.order, null, [arc.id]),
		fields: {
			title: arc.title,
			order: arc.order,
			summary: arc.summary,
			purpose: arc.purpose,
		},
	};
}

function draftActNode(arc: OutlineDraftArc, act: OutlineDraftAct): ComparableOutlineNode {
	return {
		ref: refFor('act', act.id, act.title, act.order, arc.id, [arc.id, act.id]),
		fields: {
			parentId: arc.id,
			title: act.title,
			order: act.order,
			summary: act.summary,
		},
	};
}

function draftChapterNode(
	arc: OutlineDraftArc,
	act: OutlineDraftAct,
	chapter: OutlineDraftChapter,
): ComparableOutlineNode {
	return {
		ref: refFor('chapter', chapter.id, chapter.title, chapter.order, act.id, [
			arc.id,
			act.id,
			chapter.id,
		]),
		fields: {
			parentId: act.id,
			title: chapter.title,
			order: chapter.order,
			summary: chapter.summary,
		},
	};
}

function draftSceneNode(
	arc: OutlineDraftArc,
	act: OutlineDraftAct,
	chapter: OutlineDraftChapter,
	scene: OutlineDraftScene,
): ComparableOutlineNode {
	return {
		ref: refFor('scene', scene.id, scene.title, scene.order, chapter.id, [
			arc.id,
			act.id,
			chapter.id,
			scene.id,
		]),
		fields: {
			parentId: chapter.id,
			title: scene.title,
			order: scene.order,
			summary: scene.summary,
			povCharacterId: scene.povCharacterId ?? null,
			characterIds: normalizeStringList(scene.characterIds),
			locationIds: normalizeStringList(scene.locationIds),
			primaryLocationId: scene.locationIds[0] ?? null,
		},
	};
}

function flattenDraft(draft: OutlineDraft): ComparableOutlineNode[] {
	const nodes: ComparableOutlineNode[] = [];
	for (const arc of sortNodes(draft.arcs)) {
		nodes.push(draftArcNode(arc));
		for (const act of sortNodes(arc.acts)) {
			nodes.push(draftActNode(arc, act));
			for (const chapter of sortNodes(act.chapters)) {
				nodes.push(draftChapterNode(arc, act, chapter));
				for (const scene of sortNodes(chapter.scenes)) {
					nodes.push(draftSceneNode(arc, act, chapter, scene));
				}
			}
		}
	}
	return nodes;
}

function existingArcNode(arc: Arc): ComparableOutlineNode {
	return {
		ref: refFor('arc', arc.id, arc.title, arc.order, null, [arc.id]),
		fields: {
			title: arc.title,
			order: arc.order,
			summary: normalizeText(arc.description),
			purpose: normalizeText(arc.purpose),
		},
	};
}

function existingActNode(act: Act): ComparableOutlineNode {
	return {
		ref: refFor('act', act.id, act.title, act.order, act.arcId ?? null, [
			act.arcId ?? 'unassigned',
			act.id,
		]),
		fields: {
			parentId: act.arcId ?? null,
			title: act.title,
			order: act.order,
			summary: normalizeText(act.planningNotes),
		},
	};
}

function existingChapterNode(
	chapter: Chapter,
	actsById: ReadonlyMap<string, Act>,
): ComparableOutlineNode {
	const act = chapter.actId ? actsById.get(chapter.actId) : undefined;
	return {
		ref: refFor('chapter', chapter.id, chapter.title, chapter.order, chapter.actId ?? null, [
			act?.arcId ?? 'unassigned',
			chapter.actId ?? 'unassigned',
			chapter.id,
		]),
		fields: {
			parentId: chapter.actId ?? null,
			title: chapter.title,
			order: chapter.order,
			summary: normalizeText(chapter.summary),
		},
	};
}

function existingSceneNode(
	scene: Scene,
	chaptersById: ReadonlyMap<string, Chapter>,
	actsById: ReadonlyMap<string, Act>,
): ComparableOutlineNode {
	const chapter = chaptersById.get(scene.chapterId);
	const act = chapter?.actId ? actsById.get(chapter.actId) : undefined;
	return {
		ref: refFor('scene', scene.id, scene.title, scene.order, scene.chapterId, [
			act?.arcId ?? 'unassigned',
			chapter?.actId ?? 'unassigned',
			scene.chapterId,
			scene.id,
		]),
		fields: {
			parentId: scene.chapterId,
			title: scene.title,
			order: scene.order,
			summary: normalizeText(scene.summary),
			povCharacterId: scene.povCharacterId ?? null,
			characterIds: normalizeStringList(scene.characterIds),
			locationIds: normalizeStringList(scene.locationIds),
			primaryLocationId: scene.locationId ?? null,
		},
	};
}

function indexById<T extends { id: string }>(nodes: readonly T[]): Map<string, T> {
	return new Map(nodes.map((node) => [node.id, node]));
}

function flattenExisting(existing: ExistingOutlineHierarchy): ComparableOutlineNode[] {
	const actsById = indexById(existing.acts);
	const chaptersById = indexById(existing.chapters);

	return [
		...sortNodes(existing.arcs).map(existingArcNode),
		...sortNodes(existing.acts).map(existingActNode),
		...sortNodes(existing.chapters).map((chapter) => existingChapterNode(chapter, actsById)),
		...sortNodes(existing.scenes).map((scene) => existingSceneNode(scene, chaptersById, actsById)),
	];
}

function nodeKey(node: ComparableOutlineNode): string {
	return `${node.ref.kind}:${node.ref.id}`;
}

function valuesEqual(before: ComparableValue, after: ComparableValue): boolean {
	return JSON.stringify(before) === JSON.stringify(after);
}

function collectFieldChanges(
	before: Record<string, ComparableValue>,
	after: Record<string, ComparableValue>,
): OutlineDiffFieldChange[] {
	const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort((a, b) =>
		a.localeCompare(b),
	);

	return fields.flatMap((field) => {
		const beforeValue = before[field] ?? null;
		const afterValue = after[field] ?? null;
		return valuesEqual(beforeValue, afterValue)
			? []
			: [{ field, before: beforeValue, after: afterValue }];
	});
}

function sortEntries(
	entries: readonly OutlineDiffEntry[],
	direction: 'root-first' | 'leaf-first',
): OutlineDiffEntry[] {
	return [...entries].sort((a, b) => {
		const depthA = KIND_DEPTH[a.node.kind];
		const depthB = KIND_DEPTH[b.node.kind];
		const depthSort = direction === 'root-first' ? depthA - depthB : depthB - depthA;
		return depthSort || a.node.path.localeCompare(b.node.path) || a.node.id.localeCompare(b.node.id);
	});
}

export function calculateOutlineDiff(
	draft: OutlineDraft,
	existing: ExistingOutlineHierarchy,
): OutlineDiffResult {
	const draftNodes = flattenDraft(draft);
	const existingNodes = flattenExisting(existing);
	const draftByKey = new Map(draftNodes.map((node) => [nodeKey(node), node]));
	const existingByKey = new Map(existingNodes.map((node) => [nodeKey(node), node]));

	const insertions: OutlineDiffEntry[] = [];
	const modifications: OutlineDiffEntry[] = [];
	const deletions: OutlineDiffEntry[] = [];

	for (const draftNode of draftNodes) {
		const existingNode = existingByKey.get(nodeKey(draftNode));
		if (!existingNode) {
			insertions.push({ operation: 'insert', node: draftNode.ref, changes: [] });
			continue;
		}

		const changes = collectFieldChanges(existingNode.fields, draftNode.fields);
		if (changes.length > 0) {
			modifications.push({ operation: 'update', node: draftNode.ref, changes });
		}
	}

	for (const existingNode of existingNodes) {
		if (!draftByKey.has(nodeKey(existingNode))) {
			deletions.push({ operation: 'delete', node: existingNode.ref, changes: [] });
		}
	}

	const sortedInsertions = sortEntries(insertions, 'root-first');
	const sortedModifications = sortEntries(modifications, 'root-first');
	const sortedDeletions = sortEntries(deletions, 'leaf-first');
	const total = sortedInsertions.length + sortedModifications.length + sortedDeletions.length;

	return {
		insertions: sortedInsertions,
		modifications: sortedModifications,
		deletions: sortedDeletions,
		counts: {
			insertions: sortedInsertions.length,
			modifications: sortedModifications.length,
			deletions: sortedDeletions.length,
			total,
		},
		isEmpty: total === 0,
	};
}
