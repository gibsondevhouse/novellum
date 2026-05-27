import { beforeEach, describe, expect, it } from 'vitest';
import type { Act, Arc, Beat, Chapter, Milestone, Scene, Stage } from '$lib/db/domain-types';
import {
	getPipelineHierarchyPath,
	getPipelineHierarchyReadiness,
	getPipelinePathDiagnostics,
	hasCompleteHierarchyPath,
	repairPipelineHierarchyPath,
	resetForProject,
	selectAct,
	selectArc,
	selectBeat,
	selectChapter,
	selectMilestone,
	selectScene,
	selectStage,
} from '../../src/modules/project/stores/hierarchy-store.svelte.js';

const PROJECT_ID = 'proj-pipeline-path';

function createFixture() {
	const arcs: Arc[] = [
		{
			id: 'arc-1',
			projectId: PROJECT_ID,
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
			projectId: PROJECT_ID,
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
			projectId: PROJECT_ID,
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
			projectId: PROJECT_ID,
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
			projectId: PROJECT_ID,
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
			projectId: PROJECT_ID,
			sceneId: 'scene-1',
			arcId: null,
			title: 'Beat 1',
			type: 'beat',
			order: 0,
			notes: '',
			createdAt: '',
			updatedAt: '',
		},
		{
			id: 'beat-legacy',
			projectId: PROJECT_ID,
			sceneId: null,
			arcId: 'arc-1',
			title: 'Legacy Beat',
			type: 'beat',
			order: 1,
			notes: '',
			createdAt: '',
			updatedAt: '',
		},
	];

	const stages: Stage[] = [
		{
			id: 'stage-1',
			projectId: PROJECT_ID,
			beatId: 'beat-1',
			title: 'Stage 1',
			description: '',
			order: 0,
			status: 'planned',
			createdAt: '',
			updatedAt: '',
		},
		{
			id: 'stage-legacy',
			projectId: PROJECT_ID,
			beatId: 'beat-legacy',
			title: 'Legacy Stage',
			description: '',
			order: 1,
			status: 'planned',
			createdAt: '',
			updatedAt: '',
		},
	];

	return { arcs, acts, milestones, chapters, scenes, beats, stages };
}

beforeEach(() => {
	resetForProject(PROJECT_ID);
});

describe('pipeline hierarchy path contract', () => {
	it('tracks a full 7-layer path and clears descendants on parent change', () => {
		selectArc(PROJECT_ID, 'arc-1');
		selectAct(PROJECT_ID, 'act-1');
		selectMilestone(PROJECT_ID, 'milestone-1');
		selectChapter(PROJECT_ID, 'chapter-1');
		selectScene(PROJECT_ID, 'scene-1');
		selectBeat(PROJECT_ID, 'beat-1');
		selectStage(PROJECT_ID, 'stage-1');

		expect(hasCompleteHierarchyPath(PROJECT_ID)).toBe(true);
		expect(getPipelineHierarchyReadiness(PROJECT_ID)).toBe('ready');
		expect(getPipelineHierarchyPath(PROJECT_ID)).toMatchObject({
			arcId: 'arc-1',
			actId: 'act-1',
			milestoneId: 'milestone-1',
			chapterId: 'chapter-1',
			sceneId: 'scene-1',
			beatId: 'beat-1',
			stageId: 'stage-1',
		});

		selectScene(PROJECT_ID, 'scene-2');
		const next = getPipelineHierarchyPath(PROJECT_ID);
		expect(next.sceneId).toBe('scene-2');
		expect(next.beatId).toBeUndefined();
		expect(next.stageId).toBeUndefined();
		expect(getPipelineHierarchyReadiness(PROJECT_ID)).toBe('partial');
	});

	it('auto-populates missing ancestors as unassigned when selecting descendants directly', () => {
		selectStage(PROJECT_ID, 'stage-1');
		const path = getPipelineHierarchyPath(PROJECT_ID);

		expect(path.arcId).toBeNull();
		expect(path.actId).toBeNull();
		expect(path.milestoneId).toBeNull();
		expect(path.chapterId).toBeNull();
		expect(path.sceneId).toBeNull();
		expect(path.beatId).toBeNull();
		expect(path.stageId).toBe('stage-1');
	});

	it('repairs stale selections and records diagnostics', () => {
		selectArc(PROJECT_ID, 'arc-1');
		selectAct(PROJECT_ID, 'act-1');
		selectMilestone(PROJECT_ID, 'milestone-1');
		selectChapter(PROJECT_ID, 'chapter-1');
		selectScene(PROJECT_ID, 'scene-1');
		selectBeat(PROJECT_ID, 'beat-1');
		selectStage(PROJECT_ID, 'stage-missing');

		repairPipelineHierarchyPath(PROJECT_ID, createFixture());
		const path = getPipelineHierarchyPath(PROJECT_ID);
		expect(path.stageId).toBeUndefined();
		expect(path.beatId).toBe('beat-1');

		const diagnostics = getPipelinePathDiagnostics(PROJECT_ID);
		expect(diagnostics.some((item) => item.code === 'stale_node' && item.layer === 'stage')).toBe(
			true,
		);
	});

	it('clears previous repair diagnostics once the path is stable', () => {
		selectStage(PROJECT_ID, 'stage-missing');

		repairPipelineHierarchyPath(PROJECT_ID, createFixture());
		expect(getPipelinePathDiagnostics(PROJECT_ID)).not.toHaveLength(0);

		repairPipelineHierarchyPath(PROJECT_ID, createFixture());
		expect(getPipelinePathDiagnostics(PROJECT_ID)).toHaveLength(0);
	});

	it('realigns mismatched parents from selected stage scope', () => {
		selectArc(PROJECT_ID, 'arc-wrong');
		selectAct(PROJECT_ID, 'act-wrong');
		selectChapter(PROJECT_ID, 'chapter-wrong');
		selectScene(PROJECT_ID, 'scene-wrong');
		selectBeat(PROJECT_ID, 'beat-wrong');
		selectStage(PROJECT_ID, 'stage-1');

		repairPipelineHierarchyPath(PROJECT_ID, createFixture());
		const path = getPipelineHierarchyPath(PROJECT_ID);
		expect(path).toMatchObject({
			arcId: 'arc-1',
			actId: 'act-1',
			chapterId: 'chapter-1',
			sceneId: 'scene-1',
			beatId: 'beat-1',
			stageId: 'stage-1',
		});
	});

	it('clears beat/stage when a selected stage resolves to legacy beat without scene', () => {
		selectStage(PROJECT_ID, 'stage-legacy');

		repairPipelineHierarchyPath(PROJECT_ID, createFixture());
		const path = getPipelineHierarchyPath(PROJECT_ID);
		expect(path.beatId).toBeUndefined();
		expect(path.stageId).toBeUndefined();

		const diagnostics = getPipelinePathDiagnostics(PROJECT_ID);
		expect(
			diagnostics.some(
				(item) => item.code === 'unsupported_legacy_branch' && item.layer === 'beat',
			),
		).toBe(true);
	});
});
