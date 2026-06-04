import { describe, expect, it } from 'vitest';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	OUTLINE_DRAFT_TASK_KEY,
	OUTLINE_SCENE_INTENT_MAX_LENGTH,
	outlineDraftCheckpointSchema,
	outlineDraftSchema,
	validateOutlineDraft,
	validateOutlineDraftCheckpoint,
	type OutlineDraft,
} from '$lib/ai/pipeline/index.js';

function createValidDraft(overrides: Partial<OutlineDraft> = {}): OutlineDraft {
	const draft = {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: 'outline-1',
		projectId: 'proj-1',
		slug: 'signal-fire-outline',
		title: 'Signal Fire Outline',
		sourceContext: {
			summary: 'Worldbuilding includes the central cast, city factions, and open plot threads.',
			includedDomains: ['characters', 'factions', 'plot-threads'],
			entityCounts: {
				characters: 4,
				factions: 2,
				plotThreads: 3,
			},
			contextHash: 'ctx-123',
			promptVersion: 'outline-draft-v1',
		},
		arcs: [
			{
				id: 'arc-1',
				slug: 'memory-embargo',
				title: 'Memory Embargo',
				order: 0,
				summary: 'A courier confronts a city-wide memory blockade.',
				purpose: 'Main plot arc',
				acts: [
					{
						id: 'act-1',
						slug: 'act-one',
						title: 'Act One',
						order: 0,
						summary: 'The embargo breaks ordinary life.',
						chapters: [
							{
								id: 'chapter-1',
								slug: 'chapter-one',
								title: 'Chapter One',
								order: 0,
								summary: 'The courier receives the wrong package.',
								scenes: [
									{
										id: 'scene-1',
										slug: 'wrong-package',
										title: 'Wrong Package',
										order: 0,
										summary: 'A delivery exposes the embargo.',
										intent: {
											goal: 'Deliver the sealed memory packet.',
											conflict: 'The checkpoint guard recognizes the sender seal.',
											turn: 'The packet opens and broadcasts a forbidden archive.',
											outcome: 'The courier becomes the target of both factions.',
										},
										povCharacterId: null,
										characterIds: ['char-1'],
										locationIds: ['loc-1'],
										plotThreadIds: ['thread-1'],
										targetWordCount: 1800,
									},
								],
							},
						],
					},
				],
			},
		],
	} satisfies OutlineDraft;

	return {
		...draft,
		...overrides,
	};
}

describe('outlineDraftSchema', () => {
	it('validates a canonical OutlineDraft shape', () => {
		const parsed = outlineDraftSchema.parse(createValidDraft());

		expect(parsed.type).toBe(OUTLINE_DRAFT_ARTIFACT_TYPE);
		expect(parsed.version).toBe(OUTLINE_DRAFT_ARTIFACT_VERSION);
		expect(parsed.sourceContext.entityCounts.characters).toBe(4);
		expect(parsed.arcs[0]?.acts[0]?.chapters[0]?.scenes[0]?.intent.goal).toContain(
			'Deliver',
		);
	});

	it('returns field-level diagnostics when a scene intent field is missing', () => {
		const draft = createValidDraft();
		const scene = draft.arcs[0]!.acts[0]!.chapters[0]!.scenes[0]!;
		const invalid = {
			...draft,
			arcs: [
				{
					...draft.arcs[0]!,
					acts: [
						{
							...draft.arcs[0]!.acts[0]!,
							chapters: [
								{
									...draft.arcs[0]!.acts[0]!.chapters[0]!,
									scenes: [
										{
											...scene,
											intent: {
												goal: scene.intent.goal,
												conflict: scene.intent.conflict,
												outcome: scene.intent.outcome,
											},
										},
									],
								},
							],
						},
					],
				},
			],
		};

		const result = validateOutlineDraft(invalid);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: '$.arcs[0].acts[0].chapters[0].scenes[0].intent.turn',
					}),
				]),
			);
		}
	});

	it('fails when any outline node reuses an id', () => {
		const draft = createValidDraft();
		draft.arcs[0]!.acts[0]!.id = draft.arcs[0]!.id;

		const result = validateOutlineDraft(draft);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: '$.arcs[0].acts[0].id',
						message: expect.stringContaining('Duplicate outline id'),
					}),
				]),
			);
		}
	});

	it('fails when the structure is empty or too shallow', () => {
		const emptyResult = validateOutlineDraft({ ...createValidDraft(), arcs: [] });
		expect(emptyResult.ok).toBe(false);
		if (!emptyResult.ok) {
			expect(emptyResult.issues[0]?.path).toBe('$.arcs');
		}

		const shallow = createValidDraft();
		shallow.arcs[0]!.acts[0]!.chapters[0]!.scenes = [];

		const shallowResult = validateOutlineDraft(shallow);
		expect(shallowResult.ok).toBe(false);
		if (!shallowResult.ok) {
			expect(shallowResult.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: '$.arcs[0].acts[0].chapters[0].scenes',
					}),
				]),
			);
		}
	});

	it('rejects markdown or other non-JSON model payload strings without leaking raw text', () => {
		const result = validateOutlineDraft('```json\n{"arcs":[]}\n```');

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.issues).toEqual([
				{
					path: '$',
					message: 'Outline draft payload must be valid JSON.',
					code: 'invalid_json',
				},
			]);
		}
	});

	it('bounds scene intent length for downstream draft context', () => {
		const draft = createValidDraft();
		draft.arcs[0]!.acts[0]!.chapters[0]!.scenes[0]!.intent.goal =
			'x'.repeat(OUTLINE_SCENE_INTENT_MAX_LENGTH + 1);

		const result = validateOutlineDraft(draft);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: '$.arcs[0].acts[0].chapters[0].scenes[0].intent.goal',
					}),
				]),
			);
		}
	});
});

describe('outlineDraftCheckpointSchema', () => {
	it('validates a review-gated OutlineDraftCheckpointRecord shape', () => {
		const now = new Date().toISOString();
		const checkpoint = {
			id: 'checkpoint-1',
			projectId: 'proj-1',
			ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
			taskKey: OUTLINE_DRAFT_TASK_KEY,
			version: OUTLINE_DRAFT_SCHEMA_VERSION,
			lifecycle: 'review',
			draft: createValidDraft(),
			createdAt: now,
			updatedAt: now,
			review: {
				reviewedAt: now,
				reviewer: 'author',
				note: 'Ready for review.',
			},
			acceptance: null,
			rejection: null,
		};

		const parsed = outlineDraftCheckpointSchema.parse(checkpoint);

		expect(parsed.ownerId).toBe(OUTLINE_DRAFT_CHECKPOINT_OWNER_ID);
		expect(parsed.lifecycle).toBe('review');
		expect(parsed.draft.arcs[0]?.acts[0]?.chapters[0]?.scenes).toHaveLength(1);
	});

	it('rejects unknown lifecycle values with diagnostics', () => {
		const now = new Date().toISOString();
		const result = validateOutlineDraftCheckpoint({
			id: 'checkpoint-1',
			projectId: 'proj-1',
			ownerId: OUTLINE_DRAFT_CHECKPOINT_OWNER_ID,
			taskKey: OUTLINE_DRAFT_TASK_KEY,
			version: OUTLINE_DRAFT_SCHEMA_VERSION,
			lifecycle: 'queued',
			draft: createValidDraft(),
			createdAt: now,
			updatedAt: now,
			review: null,
			acceptance: null,
			rejection: null,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: '$.lifecycle',
					}),
				]),
			);
		}
	});
});
