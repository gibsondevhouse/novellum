import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockApiGet = vi.fn();
class MockApiError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

vi.mock('$lib/api-client.js', () => ({
	apiGet: (...args: unknown[]) => mockApiGet(...args),
	apiPost: vi.fn(),
	apiPut: vi.fn(),
	apiDel: vi.fn(),
	ApiError: MockApiError,
}));

const { buildContext } = await import('../../../src/lib/ai/context-engine.js');
import type { AiTask } from '../../../src/lib/ai/types.js';

const projectId = 'proj-1';
const now = '2026-05-26T00:00:00Z';

// Endpoint routing — context-engine fans out to /api/db/* via apiGet.
// We dispatch by path + qs to keep individual tests readable.
type Layer =
	| 'arcs'
	| 'acts'
	| 'milestones'
	| 'chapters'
	| 'scenes'
	| 'beats'
	| 'stages'
	| 'characters'
	| 'locations'
	| 'lore_entries'
	| 'plot_threads'
	| 'story_frames'
	| 'timeline_events'
	| 'character_relationships'
	| 'factions'
	| 'themes'
	| 'glossary_terms'
	| 'projects';

interface Fixture {
	arcs: unknown[];
	acts: unknown[];
	milestones: unknown[];
	chapters: unknown[];
	scenes: unknown[];
	beats: unknown[];
	stages: unknown[];
	characters: unknown[];
	locations: unknown[];
	lore_entries: unknown[];
	plot_threads: unknown[];
	story_frames: unknown[];
	timeline_events: unknown[];
	character_relationships: unknown[];
	factions: unknown[];
	themes: unknown[];
	glossary_terms: unknown[];
	project: unknown | null;
}

function blankFixture(): Fixture {
	return {
		arcs: [],
		acts: [],
		milestones: [],
		chapters: [],
		scenes: [],
		beats: [],
		stages: [],
		characters: [],
		locations: [],
		lore_entries: [],
		plot_threads: [],
		story_frames: [],
		timeline_events: [],
		character_relationships: [],
		factions: [],
		themes: [],
		glossary_terms: [],
		project: null,
	};
}

function installRouter(fixture: Fixture) {
	mockApiGet.mockImplementation(async (path: string, _qs?: Record<string, string>) => {
		const singleMatch = path.match(/^\/api\/db\/([a-z_]+)\/([\w-]+)$/);
		if (singleMatch) {
			const [, resource, id] = singleMatch;
			if (resource === 'projects') return fixture.project;
			const bucket = (fixture as unknown as Record<string, unknown[]>)[resource];
			if (!bucket) throw new MockApiError(`Not found ${path}`, 404);
			const hit = (bucket as Array<{ id: string }>).find((row) => row.id === id);
			if (!hit) throw new MockApiError(`Not found ${path}`, 404);
			return hit;
		}
		const listMatch = path.match(/^\/api\/db\/([a-z_]+)$/);
		if (listMatch) {
			const [, resource] = listMatch;
			const key = resource as Layer;
			const bucket = (fixture as unknown as Record<string, unknown[]>)[key];
			return bucket ?? [];
		}
		throw new MockApiError(`Unexpected path ${path}`, 500);
	});
}

const baseChapter = { projectId, title: 'Ch', order: 1, summary: '', wordCount: 0, createdAt: now, updatedAt: now };
const baseScene = {
	projectId,
	title: 'Sc',
	summary: '',
	povCharacterId: null,
	locationId: null,
	timelineEventId: null,
	content: '',
	wordCount: 0,
	notes: '',
	characterIds: [],
	locationIds: [],
	order: 1,
	createdAt: now,
	updatedAt: now,
};

beforeEach(() => {
	mockApiGet.mockReset();
});

describe('context-engine seven-layer hierarchy mapping', () => {
	it('outline_scope attaches the full seven-layer outlineHierarchy', async () => {
		const fixture = blankFixture();
		fixture.chapters = [{ id: 'c1', ...baseChapter }];
		fixture.scenes = [{ id: 's1', ...baseScene, chapterId: 'c1' }];
		fixture.arcs = [
			{ id: 'arc1', projectId, title: 'Arc', description: '', purpose: '', order: 1, createdAt: now, updatedAt: now },
		];
		fixture.acts = [{ id: 'act1', projectId, arcId: 'arc1', title: 'Act', order: 1, planningNotes: '', createdAt: now, updatedAt: now }];
		fixture.milestones = [
			{ id: 'm1', projectId, actId: 'act1', title: 'M', description: '', order: 1, chapterIds: ['c1'], createdAt: now, updatedAt: now },
		];
		fixture.beats = [
			{ id: 'b1', projectId, sceneId: 's1', title: 'Beat', type: 'action', order: 1, notes: '', createdAt: now, updatedAt: now },
		];
		fixture.stages = [
			{ id: 'st1', projectId, beatId: 'b1', title: 'Stage', description: '', order: 1, status: 'in_progress', createdAt: now, updatedAt: now },
		];
		installRouter(fixture);

		const task: AiTask = {
			taskType: 'pipeline',
			role: 'author',
			targetEntityId: 's1',
			contextPolicy: 'outline_scope',
			outputFormat: 'json',
			pipelineTask: { key: 'vibe-author.outline', family: 'vibe-author', stage: 'outline' },
		};

		const ctx = await buildContext(task, projectId);
		expect(ctx.outlineHierarchy).toBeDefined();
		expect(ctx.outlineHierarchy!.arcs.map((a) => a.id)).toEqual(['arc1']);
		expect(ctx.outlineHierarchy!.acts.map((a) => a.id)).toEqual(['act1']);
		expect(ctx.outlineHierarchy!.milestones.map((m) => m.id)).toEqual(['m1']);
		expect(ctx.outlineHierarchy!.chapters.map((c) => c.id)).toEqual(['c1']);
		expect(ctx.outlineHierarchy!.scenes.map((s) => s.id)).toEqual(['s1']);
		expect(ctx.outlineHierarchy!.beats.map((b) => b.id)).toEqual(['b1']);
		expect(ctx.outlineHierarchy!.stages.map((s) => s.id)).toEqual(['st1']);
	});

	it('vibe-author continuity_scope attaches the seven-layer outlineHierarchy', async () => {
		const fixture = blankFixture();
		fixture.project = { id: projectId, name: 'P', createdAt: now, updatedAt: now };
		fixture.milestones = [
			{ id: 'm1', projectId, actId: 'act1', title: 'M', description: '', order: 1, chapterIds: [], createdAt: now, updatedAt: now },
		];
		fixture.stages = [
			{ id: 'st1', projectId, beatId: 'b1', title: 'Stage', description: '', order: 1, status: 'planned', createdAt: now, updatedAt: now },
		];
		installRouter(fixture);

		const task: AiTask = {
			taskType: 'pipeline',
			role: 'author',
			targetEntityId: null,
			contextPolicy: 'continuity_scope',
			outputFormat: 'json',
			pipelineTask: { key: 'vibe-author.premise', family: 'vibe-author', stage: 'premise' },
		};

		const ctx = await buildContext(task, projectId);
		expect(ctx.outlineHierarchy).toBeDefined();
		expect(ctx.outlineHierarchy!.milestones).toHaveLength(1);
		expect(ctx.outlineHierarchy!.stages).toHaveLength(1);
	});

	it('vibe-worldbuild continuity_scope does NOT attach outlineHierarchy', async () => {
		installRouter(blankFixture());

		const task: AiTask = {
			taskType: 'pipeline',
			role: 'worldbuild',
			targetEntityId: null,
			contextPolicy: 'continuity_scope',
			outputFormat: 'json',
			pipelineTask: { key: 'vibe-worldbuild.lore', family: 'vibe-worldbuild', stage: 'lore' },
		};

		const ctx = await buildContext(task, projectId);
		expect(ctx.outlineHierarchy).toBeUndefined();
	});

	it('chapter_scope (non-author) does NOT attach outlineHierarchy', async () => {
		const fixture = blankFixture();
		fixture.chapters = [{ id: 'c1', ...baseChapter }];
		fixture.scenes = [{ id: 's1', ...baseScene, chapterId: 'c1' }];
		installRouter(fixture);

		const task: AiTask = {
			taskType: 'continuity_check',
			role: 'continuity',
			targetEntityId: 'c1',
			contextPolicy: 'chapter_scope',
			outputFormat: 'json',
		};

		const ctx = await buildContext(task, projectId);
		expect(ctx.outlineHierarchy).toBeUndefined();
	});

	it('regression: omitting milestones from the hierarchy must be detectable', async () => {
		const fixture = blankFixture();
		fixture.milestones = [
			{ id: 'm1', projectId, actId: 'act1', title: 'M', description: '', order: 1, chapterIds: [], createdAt: now, updatedAt: now },
		];
		installRouter(fixture);

		const task: AiTask = {
			taskType: 'pipeline',
			role: 'author',
			targetEntityId: null,
			contextPolicy: 'outline_scope',
			outputFormat: 'json',
			pipelineTask: { key: 'vibe-author.outline', family: 'vibe-author', stage: 'outline' },
		};
		const ctx = await buildContext(task, projectId);
		// If the implementation regressed and dropped milestones, this would be []
		expect(ctx.outlineHierarchy?.milestones).toEqual([
			expect.objectContaining({ id: 'm1' }),
		]);
	});

	it('regression: omitting stages from the hierarchy must be detectable', async () => {
		const fixture = blankFixture();
		fixture.stages = [
			{ id: 'st1', projectId, beatId: 'b1', title: 'Stage', description: '', order: 1, status: 'completed', createdAt: now, updatedAt: now },
		];
		installRouter(fixture);

		const task: AiTask = {
			taskType: 'pipeline',
			role: 'author',
			targetEntityId: null,
			contextPolicy: 'outline_scope',
			outputFormat: 'json',
			pipelineTask: { key: 'vibe-author.outline', family: 'vibe-author', stage: 'outline' },
		};
		const ctx = await buildContext(task, projectId);
		expect(ctx.outlineHierarchy?.stages).toEqual([
			expect.objectContaining({ id: 'st1', status: 'completed' }),
		]);
	});
});
