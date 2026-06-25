import { describe, expect, it } from 'vitest';
import type {
	OutlineDraft,
	OutlineDraftAct,
	OutlineDraftChapter,
	OutlineDraftScene,
} from '../../../src/lib/ai/pipeline/outline-draft-contract.js';
import { calculateOutlineDiff } from '../../../src/lib/server/outline/outline-diff-engine.js';
import type { ExistingOutlineHierarchy } from '../../../src/lib/server/outline/outline-diff-engine.js';

const timestamp = '2026-06-25T00:00:00.000Z';

function scene(id: string, order: number, title = `Scene ${order}`): OutlineDraftScene {
	return {
		id,
		slug: id,
		title,
		order,
		summary: `${title} summary`,
		intent: {
			goal: `${title} goal`,
			conflict: `${title} conflict`,
			turn: `${title} turn`,
			outcome: `${title} outcome`,
		},
		characterIds: [],
		locationIds: [],
		plotThreadIds: [],
	};
}

function chapter(
	id: string,
	order: number,
	scenes: OutlineDraftScene[] = [scene('scene-1', 0, 'Opening Scene')],
): OutlineDraftChapter {
	return {
		id,
		slug: id,
		title: `Chapter ${order + 1}`,
		order,
		summary: `Chapter ${order + 1} summary`,
		scenes,
	};
}

function act(
	id: string,
	order: number,
	chapters: OutlineDraftChapter[] = [chapter('chapter-1', 0)],
): OutlineDraftAct {
	return {
		id,
		slug: id,
		title: `Act ${order + 1}`,
		order,
		summary: `Act ${order + 1} summary`,
		chapters,
	};
}

function draft(acts: OutlineDraftAct[] = [act('act-1', 0)]): OutlineDraft {
	return {
		type: 'vibe-outline.draft',
		version: 1,
		schemaVersion: '1.0.0',
		id: 'draft-1',
		projectId: 'project-1',
		slug: 'draft-1',
		title: 'Generated Outline',
		sourceContext: {
			summary: 'Seed context',
			includedDomains: [],
			entityCounts: {},
		},
		arcs: [
			{
				id: 'arc-1',
				slug: 'arc-1',
				title: 'Primary Arc',
				order: 0,
				summary: 'Primary arc summary',
				purpose: 'Track the central plot.',
				acts,
			},
		],
	};
}

function existingFromDraft(outline: OutlineDraft): ExistingOutlineHierarchy {
	const arcs: ExistingOutlineHierarchy['arcs'][number][] = [];
	const acts: ExistingOutlineHierarchy['acts'][number][] = [];
	const chapters: ExistingOutlineHierarchy['chapters'][number][] = [];
	const scenes: ExistingOutlineHierarchy['scenes'][number][] = [];

	for (const arc of outline.arcs) {
		arcs.push({
			id: arc.id,
			projectId: outline.projectId,
			title: arc.title,
			description: arc.summary,
			purpose: arc.purpose,
			order: arc.order,
			status: 'planned',
			createdAt: timestamp,
			updatedAt: timestamp,
		});

		for (const draftAct of arc.acts) {
			acts.push({
				id: draftAct.id,
				projectId: outline.projectId,
				arcId: arc.id,
				title: draftAct.title,
				order: draftAct.order,
				planningNotes: draftAct.summary,
				createdAt: timestamp,
				updatedAt: timestamp,
			});

			for (const draftChapter of draftAct.chapters) {
				chapters.push({
					id: draftChapter.id,
					projectId: outline.projectId,
					title: draftChapter.title,
					order: draftChapter.order,
					summary: draftChapter.summary,
					wordCount: 0,
					actId: draftAct.id,
					createdAt: timestamp,
					updatedAt: timestamp,
				});

				for (const draftScene of draftChapter.scenes) {
					scenes.push({
						id: draftScene.id,
						projectId: outline.projectId,
						chapterId: draftChapter.id,
						title: draftScene.title,
						summary: draftScene.summary,
						povCharacterId: draftScene.povCharacterId ?? null,
						locationId: draftScene.locationIds[0] ?? null,
						timelineEventId: null,
						order: draftScene.order,
						content: '',
						wordCount: 0,
						notes: '',
						characterIds: [...draftScene.characterIds],
						locationIds: [...draftScene.locationIds],
						createdAt: timestamp,
						updatedAt: timestamp,
					});
				}
			}
		}
	}

	return { arcs, acts, chapters, scenes };
}

describe('calculateOutlineDiff', () => {
	it('returns an empty diff for identical draft and hierarchy structures', () => {
		const outline = draft();
		const result = calculateOutlineDiff(outline, existingFromDraft(outline));

		expect(result.isEmpty).toBe(true);
		expect(result.counts).toEqual({
			insertions: 0,
			modifications: 0,
			deletions: 0,
			total: 0,
		});
		expect(result.insertions).toEqual([]);
		expect(result.modifications).toEqual([]);
		expect(result.deletions).toEqual([]);
	});

	it('detects added nodes recursively in root-first order', () => {
		const existingOutline = draft();
		const nextOutline = draft([
			act('act-1', 0),
			act('act-2', 1, [chapter('chapter-2', 0, [scene('scene-2', 0, 'Inserted Scene')])]),
		]);

		const result = calculateOutlineDiff(nextOutline, existingFromDraft(existingOutline));

		expect(result.insertions.map((entry) => `${entry.node.kind}:${entry.node.id}`)).toEqual([
			'act:act-2',
			'chapter:chapter-2',
			'scene:scene-2',
		]);
		expect(result.counts.insertions).toBe(3);
		expect(result.isEmpty).toBe(false);
	});

	it('detects deleted nodes recursively in leaf-first order', () => {
		const existingOutline = draft([
			act('act-1', 0),
			act('act-2', 1, [chapter('chapter-2', 0, [scene('scene-2', 0, 'Deleted Scene')])]),
		]);
		const nextOutline = draft();

		const result = calculateOutlineDiff(nextOutline, existingFromDraft(existingOutline));

		expect(result.deletions.map((entry) => `${entry.node.kind}:${entry.node.id}`)).toEqual([
			'scene:scene-2',
			'chapter:chapter-2',
			'act:act-2',
		]);
		expect(result.counts.deletions).toBe(3);
	});

	it('lists modified fields for matched nodes', () => {
		const existingOutline = draft();
		const nextOutline = draft([
			{
				...act('act-1', 0),
				summary: 'Revised act notes',
				chapters: [
					{
						...chapter('chapter-1', 0),
						scenes: [
							{
								...scene('scene-1', 0, 'Opening Scene'),
								summary: 'Revised scene summary',
								characterIds: ['character-2', 'character-1'],
							},
						],
					},
				],
			},
		]);

		const result = calculateOutlineDiff(nextOutline, existingFromDraft(existingOutline));

		expect(result.modifications).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					node: expect.objectContaining({ kind: 'act', id: 'act-1' }),
					changes: [
						{ field: 'summary', before: 'Act 1 summary', after: 'Revised act notes' },
					],
				}),
				expect.objectContaining({
					node: expect.objectContaining({ kind: 'scene', id: 'scene-1' }),
					changes: [
						{
							field: 'characterIds',
							before: [],
							after: ['character-1', 'character-2'],
						},
						{
							field: 'summary',
							before: 'Opening Scene summary',
							after: 'Revised scene summary',
						},
					],
				}),
			]),
		);
	});

	it('treats moved child nodes as parent-id modifications', () => {
		const existingOutline = draft([
			act('act-1', 0, [
				chapter('chapter-1', 0, [scene('scene-1', 0, 'Opening Scene')]),
				chapter('chapter-2', 1, [scene('scene-2', 0, 'Second Scene')]),
			]),
		]);
		const nextOutline = draft([
			act('act-1', 0, [
				chapter('chapter-1', 0, [scene('scene-2', 0, 'Second Scene')]),
				chapter('chapter-2', 1, [scene('scene-1', 0, 'Opening Scene')]),
			]),
		]);

		const result = calculateOutlineDiff(nextOutline, existingFromDraft(existingOutline));
		const movedScene = result.modifications.find(
			(entry) => entry.node.kind === 'scene' && entry.node.id === 'scene-1',
		);

		expect(movedScene?.changes).toEqual([
			{ field: 'parentId', before: 'chapter-1', after: 'chapter-2' },
		]);
	});
});
