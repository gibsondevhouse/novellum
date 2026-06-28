import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	OUTLINE_DRAFT_ARTIFACT_TYPE,
	OUTLINE_DRAFT_ARTIFACT_VERSION,
	OUTLINE_DRAFT_SCHEMA_VERSION,
	type OutlineDraft,
} from '../../../src/lib/ai/pipeline/outline-draft-contract.js';
import {
	OutlineMaterializationMapError,
	buildOutlineMaterializationMap,
} from '../../../src/lib/server/outline/outline-materialization-map.js';

const now = '2026-06-04T15:00:00.000Z';

function createDraft(): OutlineDraft {
	return {
		type: OUTLINE_DRAFT_ARTIFACT_TYPE,
		version: OUTLINE_DRAFT_ARTIFACT_VERSION,
		schemaVersion: OUTLINE_DRAFT_SCHEMA_VERSION,
		id: 'outline-draft-1',
		projectId: 'project-1',
		slug: 'outline-draft-1',
		title: 'Storm Ledger Outline',
		sourceContext: {
			summary: 'Generated from current worldbuilding context.',
			includedDomains: ['characters', 'plotThreads'],
			entityCounts: { characters: 2, plotThreads: 1 },
			contextHash: 'ctx-123',
			promptVersion: 'outline-generation-prompt.v1',
		},
		arcs: [
			{
				id: 'arc-late',
				slug: 'arc-late',
				title: 'Late Arc',
				order: 1,
				summary: 'Second structural arc.',
				purpose: 'Resolve the ledger conspiracy.',
				acts: [
					{
						id: 'act-late',
						slug: 'act-late',
						title: 'Act Late',
						order: 0,
						summary: 'The city reacts.',
						chapters: [
							{
								id: 'chapter-late',
								slug: 'chapter-late',
								title: 'Chapter Late',
								order: 0,
								summary: 'The aftermath starts.',
								scenes: [
									{
										id: 'scene-late',
										slug: 'scene-late',
										title: 'Scene Late',
										order: 0,
										summary: 'A later scene.',
										intent: {
											goal: 'Protect the ledger witness.',
											conflict: 'The guild cuts off every safe route.',
											turn: 'The witness names the wrong courier.',
											outcome: 'The protagonist must bargain with a rival.',
										},
										characterIds: ['char-2'],
										locationIds: ['location-2'],
										plotThreadIds: ['thread-1'],
									},
								],
							},
						],
					},
				],
			},
			{
				id: 'arc-early',
				slug: 'arc-early',
				title: 'Early Arc',
				order: 0,
				summary: 'First structural arc.',
				purpose: 'Establish the loyalty fracture.',
				acts: [
					{
						id: 'act-two',
						slug: 'act-two',
						title: 'Act Two',
						order: 1,
						summary: 'Pressure rises.',
						chapters: [
							{
								id: 'chapter-two',
								slug: 'chapter-two',
								title: 'Chapter Two',
								order: 0,
								summary: 'A second chapter.',
								scenes: [
									{
										id: 'scene-two',
										slug: 'scene-two',
										title: 'Scene Two',
										order: 0,
										summary: 'A second scene.',
										intent: {
											goal: 'Hide the ledger map.',
											conflict: 'A patrol searches the archive.',
											turn: 'The map ink reacts to the patrol lantern.',
											outcome: 'The protagonist exposes a coded route.',
										},
										characterIds: ['char-1'],
										locationIds: [],
										plotThreadIds: ['thread-1'],
									},
								],
							},
						],
					},
					{
						id: 'act-one',
						slug: 'act-one',
						title: 'Act One',
						order: 0,
						summary: 'The ledger surfaces.',
						chapters: [
							{
								id: 'chapter-one',
								slug: 'chapter-one',
								title: 'Chapter One',
								order: 0,
								summary: 'A courier accepts the wrong job.',
								scenes: [
									{
										id: 'scene-one',
										slug: 'scene-one',
										title: 'The Archive Door',
										order: 0,
										summary: 'Iri reaches the locked weather archive.',
										intent: {
											goal: 'Recover the weather ledger before the guild patrol arrives.',
											conflict: 'The archive keeper refuses entry without a dead courier token.',
											turn: 'The keeper recognizes Iri from the ledger index.',
											outcome: 'Iri escapes with a partial map and a public accusation.',
										},
										povCharacterId: 'char-1',
										characterIds: ['char-1'],
										locationIds: ['archive'],
										plotThreadIds: ['ledger'],
										targetWordCount: 1400,
									},
								],
							},
						],
					},
				],
			},
		],
	};
}

describe('buildOutlineMaterializationMap', () => {
	it('deterministically maps outline nodes into canonical hierarchy rows', () => {
		const first = buildOutlineMaterializationMap(createDraft(), { nowIso: now });
		const second = buildOutlineMaterializationMap(createDraft(), { nowIso: now });

		expect(first).toEqual(second);
		expect(first.arcs.map((row) => row.id)).toEqual(['arc-early', 'arc-late']);
		expect(first.acts.map((row) => row.id)).toEqual(['act-one', 'act-two', 'act-late']);
		expect(first.chapters.map((row) => row.actId)).toEqual(['act-one', 'act-two', 'act-late']);
		expect(first.scenes.map((row) => row.chapterId)).toEqual([
			'chapter-one',
			'chapter-two',
			'chapter-late',
		]);
		expect(first.milestones.map((row) => row.id)).toEqual([
			'milestone:act-one',
			'milestone:act-two',
			'milestone:act-late',
		]);
		expect(first.beats).toEqual([]);
		expect(first.stages).toEqual([]);
		expect(first.counts).toMatchObject({
			arcs: 2,
			acts: 3,
			milestones: 3,
			chapters: 3,
			scenes: 3,
			beats: 0,
			stages: 0,
		});
	});

	it('maps scene beat plans into beat and stage rows', () => {
		const draft = createDraft();
		const scene = draft.arcs[1]!.acts[1]!.chapters[0]!.scenes[0]!;
		scene.beats = [
			{
				order: 1,
				title: 'Reversal',
				type: 'reversal',
				summary: 'The keeper recognizes Iri.',
				purpose: 'Turn a locked-door problem into a public accusation.',
				stages: [
					{
						order: 1,
						title: 'Public accusation',
						purpose: 'Force Iri to flee with incomplete proof.',
						status: 'in_progress',
					},
					{
						order: 0,
						title: 'Recognition',
						purpose: 'Reveal that the keeper knows Iri from the ledger.',
						status: 'planned',
					},
				],
			},
			{
				order: 0,
				title: 'Archive lock',
				type: 'obstacle',
				summary: 'The archive door blocks the first tactic.',
				purpose: 'Establish the immediate barrier.',
				stages: [
					{
						order: 0,
						title: 'Token demand',
						purpose: 'Make the access rule concrete.',
						status: 'planned',
					},
				],
			},
		];

		const map = buildOutlineMaterializationMap(draft, { nowIso: now });

		expect(map.beats.map((beat) => beat.id)).toEqual(['beat:scene-one:0', 'beat:scene-one:1']);
		expect(map.beats[0]).toMatchObject({
			sceneId: 'scene-one',
			arcId: 'arc-early',
			projectId: 'project-1',
			title: 'Archive lock',
			type: 'obstacle',
			order: 0,
			notes: 'The archive door blocks the first tactic.\n\nPurpose: Establish the immediate barrier.',
		});
		expect(map.stages.map((stage) => stage.id)).toEqual([
			'stage:beat:scene-one:0:0',
			'stage:beat:scene-one:1:0',
			'stage:beat:scene-one:1:1',
		]);
		expect(map.stages[2]).toMatchObject({
			beatId: 'beat:scene-one:1',
			title: 'Public accusation',
			status: 'in_progress',
		});
		expect(map.counts).toMatchObject({ beats: 2, stages: 3 });
	});

	it('emits scene intent metadata for plan-038 draft context compatibility', () => {
		const map = buildOutlineMaterializationMap(createDraft(), { nowIso: now });
		const sceneRows = map.sceneIntentMetadata.filter((row) => row.ownerId === 'scene-one');

		expect(sceneRows.map((row) => row.key)).toEqual(['quickIntent', 'quick-intent', 'clarity']);
		expect(sceneRows.find((row) => row.key === 'quickIntent')?.value).toMatchObject({
			goal: 'Recover the weather ledger before the guild patrol arrives.',
			obstacle: 'The archive keeper refuses entry without a dead courier token.',
			conflict: 'The archive keeper refuses entry without a dead courier token.',
			turn: 'The keeper recognizes Iri from the ledger index.',
			outcome: 'Iri escapes with a partial map and a public accusation.',
		});
		expect(sceneRows.find((row) => row.key === 'clarity')?.value).toMatchObject({
			sceneGoal: 'Recover the weather ledger before the guild patrol arrives.',
			immediateObstacle: 'The archive keeper refuses entry without a dead courier token.',
			turningPoint: 'The keeper recognizes Iri from the ledger index.',
			outcome: 'Iri escapes with a partial map and a public accusation.',
		});
		expect(map.counts.sceneIntentMetadata).toBe(9);
	});

	it('rejects duplicate ids even when a malformed draft bypasses schema validation', () => {
		const draft = createDraft();
		draft.arcs[0]!.acts[0]!.chapters[0]!.scenes[0]!.id = 'arc-late';

		expect(() => buildOutlineMaterializationMap(draft, { nowIso: now })).toThrow(
			OutlineMaterializationMapError,
		);
		expect(() => buildOutlineMaterializationMap(draft, { nowIso: now })).toThrow(
			'Duplicate outline id "arc-late"',
		);
	});

	it('rejects empty child collections that would create orphaned hierarchy rows', () => {
		const draft = createDraft();
		draft.arcs[1]!.acts[0]!.chapters[0]!.scenes = [];

		expect(() => buildOutlineMaterializationMap(draft, { nowIso: now })).toThrow(
			'Chapter chapter-two must include at least one scene.',
		);
	});
});

describe('outline materialization map source contract', () => {
	const source = readFileSync(
		resolve(process.cwd(), 'src/lib/server/outline/outline-materialization-map.ts'),
		'utf-8',
	);

	it('does not perform database writes', () => {
		expect(source).not.toContain('$lib/server/db');
		expect(source).not.toContain('better-sqlite3');
		expect(source).not.toMatch(/\b(?:INSERT|UPDATE|DELETE)\b/);
		expect(source).not.toContain('.prepare(');
	});
});
