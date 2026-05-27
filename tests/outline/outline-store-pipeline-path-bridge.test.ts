import { beforeEach, describe, expect, it } from 'vitest';
import type { Act, Arc, Beat, Chapter, Milestone, Scene, Stage } from '$lib/db/domain-types';
import {
	getPipelineHierarchyPath,
	getPipelinePathDiagnostics,
	resetForProject,
} from '../../src/modules/project/stores/hierarchy-store.svelte.js';
import {
	getActiveProjectId,
	getSelectedActId,
	getSelectedChapterId,
	getSelectedSceneId,
	repairSelectionPathForActiveProject,
	setActiveProject,
	setSelectedAct,
	setSelectedChapter,
	setSelectedScene,
} from '../../src/modules/outline/stores/outline-store.svelte.js';

const PROJECT_A = 'proj-outline-bridge-a';
const PROJECT_B = 'proj-outline-bridge-b';

function createRepairFixture(projectId: string) {
	const arcs: Arc[] = [
		{
			id: 'arc-1',
			projectId,
			title: 'Arc 1',
			description: '',
			purpose: '',
			order: 0,
			createdAt: '',
			updatedAt: '',
		},
	];

	const acts: Act[] = [
		{
			id: 'act-1',
			projectId,
			arcId: 'arc-1',
			title: 'Act 1',
			order: 0,
			planningNotes: '',
			createdAt: '',
			updatedAt: '',
		},
	];

	const milestones: Milestone[] = [
		{
			id: 'milestone-1',
			projectId,
			actId: 'act-1',
			title: 'Milestone 1',
			description: '',
			order: 0,
			chapterIds: ['chapter-1'],
			createdAt: '',
			updatedAt: '',
		},
	];

	const chapters: Chapter[] = [
		{
			id: 'chapter-1',
			projectId,
			actId: 'act-1',
			title: 'Chapter 1',
			order: 0,
			summary: '',
			wordCount: 0,
			createdAt: '',
			updatedAt: '',
		},
	];

	const scenes: Scene[] = [
		{
			id: 'scene-1',
			projectId,
			chapterId: 'chapter-1',
			title: 'Scene 1',
			summary: '',
			povCharacterId: null,
			locationId: null,
			timelineEventId: null,
			order: 0,
			content: '',
			wordCount: 0,
			notes: '',
			characterIds: [],
			locationIds: [],
			createdAt: '',
			updatedAt: '',
		},
	];

	const beats: Beat[] = [
		{
			id: 'beat-1',
			projectId,
			sceneId: 'scene-1',
			arcId: null,
			title: 'Beat 1',
			type: 'beat',
			order: 0,
			notes: '',
			createdAt: '',
			updatedAt: '',
		},
	];

	const stages: Stage[] = [
		{
			id: 'stage-1',
			projectId,
			beatId: 'beat-1',
			title: 'Stage 1',
			description: '',
			order: 0,
			status: 'planned',
			createdAt: '',
			updatedAt: '',
		},
	];

	return { arcs, acts, milestones, chapters, scenes, beats, stages };
}

beforeEach(() => {
	setActiveProject(null);
	resetForProject(PROJECT_A);
	resetForProject(PROJECT_B);
});

describe('outline-store pipeline path bridge', () => {
	it('no-ops selection writes when no active project is set', () => {
		expect(getActiveProjectId()).toBeNull();

		setSelectedAct('act-1');
		setSelectedChapter('chapter-1');
		setSelectedScene('scene-1');

		expect(getSelectedActId()).toBeUndefined();
		expect(getSelectedChapterId()).toBeUndefined();
		expect(getSelectedSceneId()).toBeUndefined();
		expect(getPipelineHierarchyPath(PROJECT_A).actId).toBeUndefined();
		expect(getPipelineHierarchyPath(PROJECT_B).actId).toBeUndefined();
	});

	it('writes outline selections into the canonical project hierarchy path', () => {
		setActiveProject(PROJECT_A);

		setSelectedAct('act-1');
		setSelectedChapter('chapter-1');
		setSelectedScene('scene-1');

		expect(getSelectedActId()).toBe('act-1');
		expect(getSelectedChapterId()).toBe('chapter-1');
		expect(getSelectedSceneId()).toBe('scene-1');
		expect(getPipelineHierarchyPath(PROJECT_A)).toMatchObject({
			actId: 'act-1',
			chapterId: 'chapter-1',
			sceneId: 'scene-1',
		});

		setSelectedAct('act-2');
		expect(getSelectedActId()).toBe('act-2');
		expect(getSelectedChapterId()).toBeUndefined();
		expect(getSelectedSceneId()).toBeUndefined();
	});

	it('keeps selection isolated per project when active project changes', () => {
		setActiveProject(PROJECT_A);
		setSelectedAct('act-a');
		setSelectedChapter('chapter-a');

		setActiveProject(PROJECT_B);
		setSelectedAct('act-b');

		expect(getSelectedActId()).toBe('act-b');
		expect(getPipelineHierarchyPath(PROJECT_A)).toMatchObject({
			actId: 'act-a',
			chapterId: 'chapter-a',
		});
		expect(getPipelineHierarchyPath(PROJECT_B)).toMatchObject({
			actId: 'act-b',
			chapterId: undefined,
		});

		setActiveProject(PROJECT_A);
		expect(getSelectedActId()).toBe('act-a');
		expect(getSelectedChapterId()).toBe('chapter-a');
	});

	it('repairs stale active-project selections against loaded hierarchy datasets', () => {
		setActiveProject(PROJECT_A);
		setSelectedScene('scene-missing');

		repairSelectionPathForActiveProject(createRepairFixture(PROJECT_A));

		expect(getSelectedSceneId()).toBeUndefined();
		const diagnostics = getPipelinePathDiagnostics(PROJECT_A);
		expect(diagnostics.some((item) => item.code === 'stale_node' && item.layer === 'scene')).toBe(
			true,
		);
	});
});
