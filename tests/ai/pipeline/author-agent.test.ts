import { describe, expect, it } from 'vitest';
import { Orchestrator } from '../../../src/lib/ai/orchestrator.js';
import {
	AUTHOR_PIPELINE_KEYS,
	isAuthorTaskKey,
	parseAuthorOutput,
	type AuthorSceneDraftPayload,
} from '../../../src/lib/ai/pipeline/author-agent.js';
import type { AuthorRevisionPack } from '../../../src/lib/ai/pipeline/author-schemas.js';
import { PIPELINE_TASK_KEYS, resolvePipelineAction } from '../../../src/lib/ai/pipeline/task-catalog.js';
import { isAuthorPipelineTask, resolveTask } from '../../../src/lib/ai/task-resolver.js';

describe('author task catalog', () => {
	it('exposes all four author pipeline keys via the catalog and resolver', () => {
		expect(AUTHOR_PIPELINE_KEYS).toEqual([
			PIPELINE_TASK_KEYS.AUTHOR_PREMISE,
			PIPELINE_TASK_KEYS.AUTHOR_OUTLINE,
			PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT,
			PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK,
		]);

		for (const key of AUTHOR_PIPELINE_KEYS) {
			const def = resolvePipelineAction(`pipeline:${key}`);
			expect(def?.family).toBe('vibe-author');
			expect(isAuthorTaskKey(key)).toBe(true);
		}
	});

	it('marks vibe-author tasks via isAuthorPipelineTask', () => {
		const task = resolveTask(`pipeline:${PIPELINE_TASK_KEYS.AUTHOR_PREMISE}`, {
			activeProjectId: 'p1',
			activeChapterId: null,
			activeSceneId: null,
			activeBeatId: null,
		});
		expect(isAuthorPipelineTask(task)).toBe(true);
	});
});

describe('parseAuthorOutput — JSON stages', () => {
	it('parses author premise output with extra surrounding prose', () => {
		const raw = `Here is the premise:\n${JSON.stringify({
			bookHook: 'A storm thief must heist the sky.',
			protagonist: {
				name: 'Iri Vale',
				role: 'Lead thief',
				want: 'Reclaim her sister from the storm vaults.',
				need: 'Trust the crew enough to be saved.',
				problem: 'The vault key only responds to the regent who owns her debt.',
			},
			antagonistForce: 'Regent Voss and the Barometer Guild',
			coreConflict: 'Personal redemption versus civic uprising.',
			stakes: 'A drowning city; her sister; her own debt-bond.',
			pivotPromise: 'Storm key is keyed to her blood.',
			targetLength: '95k',
			comps: ['Mistborn for heists', 'The City We Became for civic stakes'],
			whyThisBook: 'It is the single conflict the world has been building toward.',
		})}`;

		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_PREMISE, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		expect(result.payload).toMatchObject({
			bookHook: 'A storm thief must heist the sky.',
			protagonist: { name: 'Iri Vale' },
		});
		expect(result.fallbackMessage).toBeNull();
	});

	it('returns schema_validation_failed when premise protagonist block is missing fields', () => {
		const raw = JSON.stringify({
			bookHook: 'Hook',
			protagonist: { name: 'X' },
			antagonistForce: 'A',
			coreConflict: 'B',
			stakes: 'C',
			pivotPromise: 'D',
			targetLength: '95k',
			comps: ['x'],
			whyThisBook: 'Z',
		});
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_PREMISE, raw);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('schema_validation_failed');
		expect(result.fallbackMessage).toContain('strict JSON');
	});

	it('returns missing_json_object for whitespace-only output', () => {
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_OUTLINE, '   \n\t  ');
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('missing_json_object');
	});

	it('returns invalid_json_object for malformed JSON candidate', () => {
		const result = parseAuthorOutput(
			PIPELINE_TASK_KEYS.AUTHOR_OUTLINE,
			'preamble {arcs: [}, broken json',
		);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('invalid_json_object');
	});

	it('parses outline with all seven-layer entity buckets', () => {
		const raw = JSON.stringify({
			arcs: [{ id: 'arc-1', title: 'Rise of the storm thief' }],
			acts: [{ id: 'act-1', arcId: 'arc-1', title: 'Act I' }],
			milestones: [{ id: 'm-1', actId: 'act-1', title: 'Heist accepted' }],
			chapters: [{ id: 'ch-1', milestoneId: 'm-1', title: 'Skymarket' }],
			scenes: [
				{
					id: 'sc-1',
					chapterId: 'ch-1',
					title: 'Approach',
					povCharacterId: 'iri',
				},
			],
		});
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_OUTLINE, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		expect(result.payload).toMatchObject({
			arcs: [{ id: 'arc-1' }],
			scenes: [{ povCharacterId: 'iri' }],
		});
	});

	it('accepts outline output when beats are present but milestones are omitted', () => {
		const raw = JSON.stringify({
			arcs: [{ id: 'arc-1', title: 'Rise of the storm thief' }],
			acts: [{ id: 'act-1', arcId: 'arc-1', title: 'Act I' }],
			chapters: [{ id: 'ch-1', actId: 'act-1', title: 'Skymarket' }],
			scenes: [
				{
					id: 'sc-1',
					chapterId: 'ch-1',
					title: 'Approach',
					povCharacterId: 'iri',
				},
			],
			beats: [{ id: 'b-1', sceneId: 'sc-1', title: 'Alarm trip' }],
		});

		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_OUTLINE, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		expect(result.payload).toMatchObject({
			beats: [{ id: 'b-1' }],
			milestones: [{ id: 'b-1' }],
		});
	});

	it('sorts revision-pack issues by severity (critical first)', () => {
		const raw = JSON.stringify({
			summary: 'Two issues found.',
			issues: [
				{
					id: 'iss-1',
					severity: 'low',
					kind: 'style',
					location: 'sc-1 line 14',
					description: 'Repeats word "storm" three times.',
					recommendation: 'Use synonyms.',
				},
				{
					id: 'iss-2',
					severity: 'critical',
					kind: 'continuity',
					location: 'sc-1 paragraph 4',
					description: 'Iri is in two places at once.',
					recommendation: 'Pick one location.',
				},
				{
					id: 'iss-3',
					severity: 'medium',
					kind: 'pacing',
					location: 'sc-1 end',
					description: 'Climax lands too soft.',
					recommendation: 'Lift the turning beat.',
				},
			],
		});
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		const pack = result.payload as AuthorRevisionPack;
		expect(pack.issues.map((i) => i.severity)).toEqual(['critical', 'medium', 'low']);
	});

	it('rejects revision-pack with invalid severity enum', () => {
		const raw = JSON.stringify({
			summary: 'x',
			issues: [
				{
					id: 'iss-1',
					severity: 'blocker',
					kind: 'continuity',
					location: 'l',
					description: 'd',
					recommendation: 'r',
				},
			],
		});
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK, raw);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('schema_validation_failed');
	});
});

describe('parseAuthorOutput — scene-draft prose+sidecar', () => {
	const validSidecar = {
		sceneId: 'sc-1',
		chapterId: 'ch-1',
		povCharacterId: 'iri',
		wordCount: 412,
		usedCanonRefs: {
			characterIds: ['iri', 'voss'],
			locationIds: ['skymarket'],
			factionIds: [],
			loreEntryIds: ['storm-debt'],
		},
		uncertainties: ['Whether Voss knows about the sister.'],
		continuityRisks: [],
	};

	it('extracts prose and sidecar from a well-formed scene draft', () => {
		const raw = `Iri descended into the Skymarket as the storm clocks rolled past midnight.\nShe felt the vault key pulse against her ribs.\n\n\`\`\`json\n${JSON.stringify(validSidecar)}\n\`\`\``;
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		const payload = result.payload as AuthorSceneDraftPayload;
		expect(payload.prose).toContain('Iri descended into the Skymarket');
		expect(payload.prose).not.toContain('```');
		expect(payload.sidecar.sceneId).toBe('sc-1');
		expect(payload.sidecar.wordCount).toBe(412);
		expect(payload.sidecar.usedCanonRefs.characterIds).toEqual(['iri', 'voss']);
	});

	it('accepts a ```json sidecar fence label variant', () => {
		const raw = `Prose body.\n\n\`\`\`json sidecar\n${JSON.stringify(validSidecar)}\n\`\`\``;
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		const payload = result.payload as AuthorSceneDraftPayload;
		expect(payload.sidecar.sceneId).toBe('sc-1');
	});

	it('flags missing_scene_sidecar when no fenced JSON block is present', () => {
		const raw = 'Prose only, no sidecar at all.';
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('missing_scene_sidecar');
		expect(result.fallbackMessage).toContain('sidecar');
	});

	it('flags missing_scene_prose when only the sidecar block is present', () => {
		const raw = `\`\`\`json\n${JSON.stringify(validSidecar)}\n\`\`\``;
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('missing_scene_prose');
	});

	it('flags missing_required_fields when sidecar lacks sceneId', () => {
		const incomplete = { ...validSidecar, sceneId: '   ' };
		const raw = `prose body\n\n\`\`\`json\n${JSON.stringify(incomplete)}\n\`\`\``;
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('missing_required_fields');
		expect(result.error.details.join(' ')).toContain('sceneId');
	});

	it('allows missing povCharacterId and normalizes to null', () => {
		const incomplete: Record<string, unknown> = { ...validSidecar };
		delete incomplete.povCharacterId;
		const raw = `prose body\n\n\`\`\`json\n${JSON.stringify(incomplete)}\n\`\`\``;
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		const payload = result.payload as AuthorSceneDraftPayload;
		expect(payload.sidecar.povCharacterId).toBeNull();
	});

	it('flags invalid_json_object when the sidecar fence holds bad JSON', () => {
		const raw = 'prose body\n\n```json\n{ not real json\n```';
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.error.code).toBe('invalid_json_object');
	});

	it('uses the last fenced block when prose itself contains a json fence', () => {
		const decoy = `\`\`\`json\n{"not": "the sidecar"}\n\`\`\``;
		const raw = `Iri spoke: "The map is wrong."\n${decoy}\nShe kept reading.\n\n\`\`\`json\n${JSON.stringify(validSidecar)}\n\`\`\``;
		const result = parseAuthorOutput(PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT, raw);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		const payload = result.payload as AuthorSceneDraftPayload;
		expect(payload.sidecar.sceneId).toBe('sc-1');
		expect(payload.prose).toContain('"The map is wrong."');
	});
});

describe('Orchestrator.runAuthorPipeline', () => {
	it('wraps a parsed author premise in a pipeline artifact envelope', () => {
		const orchestrator = new Orchestrator();
		const taskDef = resolvePipelineAction(`pipeline:${PIPELINE_TASK_KEYS.AUTHOR_PREMISE}`);
		expect(taskDef).not.toBeNull();
		if (!taskDef) throw new Error('expected task def');

		const raw = JSON.stringify({
			bookHook: 'h',
			protagonist: { name: 'n', role: 'r', want: 'w', need: 'ne', problem: 'p' },
			antagonistForce: 'a',
			coreConflict: 'c',
			stakes: 's',
			pivotPromise: 'pp',
			targetLength: '90k',
			comps: ['x'],
			whyThisBook: 'because',
		});

		const result = orchestrator.runAuthorPipeline({
			task: {
				key: taskDef.key,
				family: taskDef.family,
				stage: taskDef.stage,
				outputFormat: taskDef.outputFormat,
				role: taskDef.role,
				contextPolicy: taskDef.contextPolicy,
			},
			rawOutput: raw,
		});

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected success');
		expect(result.artifact.taskKey).toBe(PIPELINE_TASK_KEYS.AUTHOR_PREMISE);
		expect(result.artifact.pipeline).toBe('vibe-author');
		expect(result.artifact.payload).toMatchObject({ bookHook: 'h' });
	});

	it('returns parse failure when scene-draft sidecar is missing', () => {
		const orchestrator = new Orchestrator();
		const taskDef = resolvePipelineAction(
			`pipeline:${PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT}`,
		);
		if (!taskDef) throw new Error('expected task def');

		const result = orchestrator.runAuthorPipeline({
			task: {
				key: taskDef.key,
				family: taskDef.family,
				stage: taskDef.stage,
				outputFormat: taskDef.outputFormat,
				role: taskDef.role,
				contextPolicy: taskDef.contextPolicy,
			},
			rawOutput: 'just prose, no sidecar',
		});

		expect(result.ok).toBe(false);
		if (result.ok) throw new Error('expected failure');
		expect(result.parse.error.code).toBe('missing_scene_sidecar');
	});
});
