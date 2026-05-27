import { describe, expect, it } from 'vitest';
import type { Act, Arc, Beat, Chapter, Milestone, Scene, Stage } from '$lib/db/domain-types';
import type { PipelineHierarchyPath } from '../../src/modules/outline/services/seven-layer-outline.js';
import { buildSevenLayerNavigatorModel } from '../../src/modules/outline/services/pipeline-seven-layer-navigator.js';

const PROJECT_ID = 'proj-nav-1';
const NOW = '2026-05-26T00:00:00Z';

function createFixture() {
	const arcs: Arc[] = [
		{
			id: 'arc-1',
			projectId: PROJECT_ID,
			title: 'Arc One',
			description: '',
			purpose: '',
			order: 0,
			createdAt: NOW,
			updatedAt: NOW,
		},
		{
			id: 'arc-2',
			projectId: PROJECT_ID,
			title: 'Arc Two',
			description: '',
			purpose: '',
			order: 1,
			createdAt: NOW,
			updatedAt: NOW,
		},
	];

	const acts: Act[] = [
		{
			id: 'act-1',
			projectId: PROJECT_ID,
			arcId: 'arc-1',
			title: 'Act One',
			order: 0,
			planningNotes: '',
			createdAt: NOW,
			updatedAt: NOW,
		},
		{
			id: 'act-2',
			projectId: PROJECT_ID,
			arcId: 'arc-2',
			title: 'Act Two',
			order: 1,
			planningNotes: '',
			createdAt: NOW,
			updatedAt: NOW,
		},
	];

	const milestones: Milestone[] = [
		{
			id: 'mile-1',
			projectId: PROJECT_ID,
			actId: 'act-1',
			title: 'Milestone One',
			description: '',
			order: 0,
			chapterIds: ['chapter-2', 'chapter-1'],
			createdAt: NOW,
			updatedAt: NOW,
		},
		{
			id: 'mile-2',
			projectId: PROJECT_ID,
			actId: 'act-2',
			title: 'Milestone Two',
			description: '',
			order: 1,
			chapterIds: ['chapter-3'],
			createdAt: NOW,
			updatedAt: NOW,
		},
	];

	const chapters: Chapter[] = [
		{
			id: 'chapter-1',
			projectId: PROJECT_ID,
			actId: 'act-1',
			title: 'Chapter One',
			order: 0,
			summary: '',
			wordCount: 0,
			createdAt: NOW,
			updatedAt: NOW,
		},
		{
			id: 'chapter-2',
			projectId: PROJECT_ID,
			actId: 'act-1',
			title: 'Chapter Two',
			order: 1,
			summary: '',
			wordCount: 0,
			createdAt: NOW,
			updatedAt: NOW,
		},
		{
			id: 'chapter-3',
			projectId: PROJECT_ID,
			actId: 'act-2',
			title: 'Chapter Three',
			order: 2,
			summary: '',
			wordCount: 0,
			createdAt: NOW,
			updatedAt: NOW,
		},
	];

	const scenes: Scene[] = [
		{
			id: 'scene-1',
			projectId: PROJECT_ID,
			chapterId: 'chapter-1',
			title: 'Scene One',
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
			createdAt: NOW,
			updatedAt: NOW,
		},
	];

	const beats: Beat[] = [
		{
			id: 'beat-1',
			projectId: PROJECT_ID,
			sceneId: 'scene-1',
			arcId: null,
			title: 'Beat One',
			type: 'beat',
			order: 0,
			notes: '',
			createdAt: NOW,
			updatedAt: NOW,
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
			createdAt: NOW,
			updatedAt: NOW,
		},
	];

	const stages: Stage[] = [
		{
			id: 'stage-1',
			projectId: PROJECT_ID,
			beatId: 'beat-1',
			title: 'Stage One',
			description: '',
			order: 0,
			status: 'planned',
			createdAt: NOW,
			updatedAt: NOW,
		},
		{
			id: 'stage-2',
			projectId: PROJECT_ID,
			beatId: 'beat-missing',
			title: 'Orphan Stage',
			description: '',
			order: 1,
			status: 'planned',
			createdAt: NOW,
			updatedAt: NOW,
		},
	];

	return { arcs, acts, milestones, chapters, scenes, beats, stages };
}

function path(overrides: Partial<PipelineHierarchyPath>): PipelineHierarchyPath {
	return {
		arcId: undefined,
		actId: undefined,
		milestoneId: undefined,
		chapterId: undefined,
		sceneId: undefined,
		beatId: undefined,
		stageId: undefined,
		...overrides,
	};
}

describe('buildSevenLayerNavigatorModel', () => {
	it('scopes each layer to selected parent chain', () => {
		const model = buildSevenLayerNavigatorModel({
			...createFixture(),
			path: path({
				arcId: 'arc-1',
				actId: 'act-1',
				milestoneId: 'mile-1',
				chapterId: 'chapter-1',
				sceneId: 'scene-1',
				beatId: 'beat-1',
				stageId: 'stage-1',
			}),
		});

		expect(model.columns.find((c) => c.layer === 'act')?.items.map((item) => item.id)).toEqual([
			'act-1',
		]);
		expect(
			model.columns.find((c) => c.layer === 'milestone')?.items.map((item) => item.id),
		).toEqual(['mile-1']);
		expect(model.columns.find((c) => c.layer === 'chapter')?.items.map((item) => item.id)).toEqual([
			'chapter-2',
			'chapter-1',
		]);
		expect(model.columns.find((c) => c.layer === 'scene')?.items.map((item) => item.id)).toEqual([
			'scene-1',
		]);
		expect(model.columns.find((c) => c.layer === 'beat')?.items.map((item) => item.id)).toEqual([
			'beat-1',
		]);
		expect(model.columns.find((c) => c.layer === 'stage')?.items.map((item) => item.id)).toEqual([
			'stage-1',
		]);
	});

	it('never shows stages when no beat is selected', () => {
		const model = buildSevenLayerNavigatorModel({
			...createFixture(),
			path: path({ arcId: 'arc-1', actId: 'act-1', milestoneId: 'mile-1', chapterId: 'chapter-1' }),
		});

		expect(model.columns.find((c) => c.layer === 'stage')?.items).toEqual([]);
		expect(model.columns.find((c) => c.layer === 'stage')?.emptyHint).toContain('Select a beat');
	});

	it('returns layer-aware empty hints when parent selection is missing', () => {
		const model = buildSevenLayerNavigatorModel({
			...createFixture(),
			path: path({}),
		});

		expect(model.columns.find((c) => c.layer === 'act')?.items).toEqual([]);
		expect(model.columns.find((c) => c.layer === 'act')?.emptyHint).toContain('Select an arc');
		expect(model.columns.find((c) => c.layer === 'chapter')?.emptyHint).toContain(
			'Select a milestone',
		);
	});

	it('builds breadcrumb labels from selected layers only', () => {
		const model = buildSevenLayerNavigatorModel({
			...createFixture(),
			path: path({ arcId: 'arc-1', actId: 'act-1', milestoneId: undefined, chapterId: 'chapter-1' }),
		});

		expect(model.breadcrumbs).toEqual([
			{ layer: 'arc', label: 'Arc One' },
			{ layer: 'act', label: 'Act One' },
		]);
	});
});
