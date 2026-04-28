import { describe, it, expect, beforeEach } from 'vitest';
import type { Act, Arc, Chapter, Scene } from '$lib/db/types.js';
import {
	selectArc,
	selectAct,
	selectChapter,
	resetForProject,
	getSelectedArcId,
	getSelectedActId,
	getSelectedChapterId,
	getSelectedArc,
	getSelectedAct,
	getSelectedChapter,
	selectActsForArc,
	selectChaptersForAct,
	selectScenesForChapter,
} from '../../src/modules/project/stores/hierarchy-store.svelte.js';

const PROJECT_A = 'proj-a';
const PROJECT_B = 'proj-b';

beforeEach(() => {
	resetForProject(PROJECT_A);
	resetForProject(PROJECT_B);
});

describe('hierarchy-store: selection', () => {
	it('starts with no selection per project', () => {
		expect(getSelectedArcId(PROJECT_A)).toBeUndefined();
		expect(getSelectedActId(PROJECT_A)).toBeUndefined();
		expect(getSelectedChapterId(PROJECT_A)).toBeUndefined();
	});

	it('persists selections per projectId', () => {
		selectArc(PROJECT_A, 'arc-1');
		selectArc(PROJECT_B, 'arc-2');
		expect(getSelectedArcId(PROJECT_A)).toBe('arc-1');
		expect(getSelectedArcId(PROJECT_B)).toBe('arc-2');
	});

	it('treats null as a meaningful "unassigned" selection', () => {
		selectArc(PROJECT_A, null);
		expect(getSelectedArcId(PROJECT_A)).toBeNull();
	});

	it('clears downstream when arc changes', () => {
		selectArc(PROJECT_A, 'arc-1');
		selectAct(PROJECT_A, 'act-1');
		selectChapter(PROJECT_A, 'ch-1');

		selectArc(PROJECT_A, 'arc-2');
		expect(getSelectedActId(PROJECT_A)).toBeUndefined();
		expect(getSelectedChapterId(PROJECT_A)).toBeUndefined();
	});

	it('clears chapter when act changes', () => {
		selectAct(PROJECT_A, 'act-1');
		selectChapter(PROJECT_A, 'ch-1');

		selectAct(PROJECT_A, 'act-2');
		expect(getSelectedChapterId(PROJECT_A)).toBeUndefined();
	});

	it('resetForProject clears only that project', () => {
		selectArc(PROJECT_A, 'arc-1');
		selectArc(PROJECT_B, 'arc-2');

		resetForProject(PROJECT_A);
		expect(getSelectedArcId(PROJECT_A)).toBeUndefined();
		expect(getSelectedArcId(PROJECT_B)).toBe('arc-2');
	});

	it('resetForProject is a no-op for unknown project', () => {
		expect(() => resetForProject('never-seen')).not.toThrow();
	});
});

describe('hierarchy-store: scoped helpers', () => {
	const acts: Act[] = [
		{ id: 'a1', projectId: PROJECT_A, arcId: 'arc-1', title: 'A1', order: 0, planningNotes: '', createdAt: '', updatedAt: '' },
		{ id: 'a2', projectId: PROJECT_A, arcId: 'arc-2', title: 'A2', order: 1, planningNotes: '', createdAt: '', updatedAt: '' },
		{ id: 'a3', projectId: PROJECT_A, title: 'A3 unassigned', order: 2, planningNotes: '', createdAt: '', updatedAt: '' },
	];
	const chapters: Chapter[] = [
		{ id: 'c1', projectId: PROJECT_A, actId: 'a1', title: 'C1', order: 0, summary: '', wordCount: 0, createdAt: '', updatedAt: '' },
		{ id: 'c2', projectId: PROJECT_A, title: 'C2 orphan', order: 1, summary: '', wordCount: 0, createdAt: '', updatedAt: '' },
	];
	const scenes: Scene[] = [
		{
			id: 's1', chapterId: 'c1', projectId: PROJECT_A, title: 'S1', summary: '',
			povCharacterId: null, locationId: null, timelineEventId: null, order: 0,
			content: '', wordCount: 0, notes: '', characterIds: [], locationIds: [],
			createdAt: '', updatedAt: '',
		},
	];

	it('selectActsForArc returns scoped, unassigned, or all', () => {
		expect(selectActsForArc(acts, 'arc-1').map((a) => a.id)).toEqual(['a1']);
		expect(selectActsForArc(acts, null).map((a) => a.id)).toEqual(['a3']);
		expect(selectActsForArc(acts, undefined)).toHaveLength(3);
	});

	it('selectChaptersForAct returns scoped, unassigned, or all', () => {
		expect(selectChaptersForAct(chapters, 'a1').map((c) => c.id)).toEqual(['c1']);
		expect(selectChaptersForAct(chapters, null).map((c) => c.id)).toEqual(['c2']);
		expect(selectChaptersForAct(chapters, undefined)).toHaveLength(2);
	});

	it('selectScenesForChapter returns scoped or all', () => {
		expect(selectScenesForChapter(scenes, 'c1').map((s) => s.id)).toEqual(['s1']);
		expect(selectScenesForChapter(scenes, undefined)).toHaveLength(1);
		expect(selectScenesForChapter(scenes, 'nonexistent')).toEqual([]);
	});

	it('getSelectedArc/Act/Chapter resolve against payload', () => {
		const arcs: Arc[] = [
			{ id: 'arc-1', projectId: PROJECT_A, title: 'Arc 1', description: '', purpose: '', order: 0, createdAt: '', updatedAt: '' },
		];
		selectArc(PROJECT_A, 'arc-1');
		expect(getSelectedArc(PROJECT_A, arcs)?.id).toBe('arc-1');

		selectAct(PROJECT_A, 'a1');
		expect(getSelectedAct(PROJECT_A, acts)?.id).toBe('a1');

		selectChapter(PROJECT_A, 'c1');
		expect(getSelectedChapter(PROJECT_A, chapters)?.id).toBe('c1');
	});

	it('getSelectedArc returns null when nothing selected', () => {
		expect(getSelectedArc(PROJECT_A, [])).toBeNull();
		expect(getSelectedAct(PROJECT_A, [])).toBeNull();
		expect(getSelectedChapter(PROJECT_A, [])).toBeNull();
	});
});
