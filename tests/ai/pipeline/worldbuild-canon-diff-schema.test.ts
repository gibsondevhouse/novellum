import { describe, expect, it } from 'vitest';
import {
	parseWorldbuildCanonDiff,
	worldbuildCanonDiffSchema,
	type WorldbuildCanonDiff,
} from '$lib/ai/pipeline/worldbuild-canon-diff-schema.js';

const base = {
	diffId: 'diff-1',
	proposalId: 'proposal-1',
	projectId: 'project-1',
	categoryId: 'personae',
	entityKind: 'character',
	family: 'character',
	generatedAt: '2026-06-12T18:00:00.000Z',
	summary: 'Create Ari Quill as a new character.',
	confidence: 0.82,
} as const;

const target = {
	family: 'character',
	id: 'character-1',
	displayName: 'Ari Quill',
	table: 'characters',
	projectId: 'project-1',
} as const;

const fieldDiff = {
	fieldPath: 'bio',
	label: 'Bio',
	valueType: 'string',
	operation: 'replace',
	before: '',
	after: 'A memory courier navigating state collapse.',
	evidence: [
		{
			kind: 'empty_field',
			label: 'Current bio is empty.',
			score: 0.9,
			target,
		},
	],
} as const;

describe('worldbuildCanonDiffSchema', () => {
	it('validates create decisions with field-level values and review evidence', () => {
		const parsed = worldbuildCanonDiffSchema.parse({
			...base,
			decision: 'create',
			target: null,
			fields: [
				{
					...fieldDiff,
					operation: 'add',
					before: null,
				},
			],
			evidence: [
				{
					kind: 'manual_review',
					label: 'No duplicate candidate was selected.',
				},
			],
		});

		expect(parsed.decision).toBe('create');
		expect(parsed.fields[0].before).toBeNull();
	});

	it('validates update decisions with a target and JSON array values', () => {
		const parsed = worldbuildCanonDiffSchema.parse({
			...base,
			diffId: 'diff-update',
			decision: 'update',
			target,
			fields: [
				fieldDiff,
				{
					fieldPath: 'traits',
					valueType: 'array',
					operation: 'append',
					before: ['precise'],
					after: ['precise', 'restless'],
					proposed: ['restless'],
				},
			],
		});

		expect(parsed.decision).toBe('update');
		expect(parsed.fields).toHaveLength(2);
	});

	it('validates merge decisions only when duplicate evidence is present', () => {
		const parsed = worldbuildCanonDiffSchema.parse({
			...base,
			diffId: 'diff-merge',
			decision: 'merge',
			target,
			fields: [fieldDiff],
			duplicateCandidates: [
				{
					target,
					matchKind: 'normalized_name',
					score: 0.94,
					evidence: [
						{
							kind: 'normalized_name',
							label: 'Names match after normalization.',
							target,
							score: 0.94,
						},
					],
				},
			],
		});

		expect(parsed.decision).toBe('merge');
		expect(parsed.duplicateCandidates[0].score).toBe(0.94);
	});

	it('validates link-only decisions without requiring field changes', () => {
		const parsed = worldbuildCanonDiffSchema.parse({
			...base,
			diffId: 'diff-link',
			decision: 'link',
			target,
			links: [
				{
					linkType: 'faction_membership',
					source: target,
					target: {
						family: 'faction',
						id: 'faction-1',
						displayName: 'Clock Syndicate',
						table: 'factions',
						projectId: 'project-1',
					},
					description: 'Character faction text resolves to an existing faction row.',
				},
			],
		});

		expect(parsed.decision).toBe('link');
		expect(parsed.links[0].linkType).toBe('faction_membership');
	});

	it('validates no-op decisions with an audit reason and evidence', () => {
		const parsed = worldbuildCanonDiffSchema.parse({
			...base,
			diffId: 'diff-noop',
			decision: 'no_op',
			target,
			summary: 'Proposal duplicates an existing accepted character.',
			reason: 'No canon mutation needed.',
			evidence: [
				{
					kind: 'exact_key',
					label: 'Existing canon already has this exact normalized name.',
					score: 1,
					target,
				},
			],
		});

		expect(parsed.decision).toBe('no_op');
		if (parsed.decision !== 'no_op') throw new Error('Expected no-op diff.');
		expect(parsed.reason).toBe('No canon mutation needed.');
	});

	it('fails malformed diffs safely', () => {
		const result = parseWorldbuildCanonDiff({
			...base,
			decision: 'update',
			fields: [fieldDiff],
			confidence: 1.5,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.code).toBe('invalid_canon_diff');
			expect(result.details.some((detail) => detail.includes('target'))).toBe(true);
			expect(result.details.some((detail) => detail.includes('confidence'))).toBe(true);
		}
	});

	it('rejects merge decisions without duplicate candidates', () => {
		const result = worldbuildCanonDiffSchema.safeParse({
			...base,
			diffId: 'diff-bad-merge',
			decision: 'merge',
			target,
			fields: [fieldDiff],
			duplicateCandidates: [],
		});

		expect(result.success).toBe(false);
	});
});

const _typeCheck: WorldbuildCanonDiff = worldbuildCanonDiffSchema.parse({
	...base,
	decision: 'create',
	target: null,
	fields: [
		{
			fieldPath: 'name',
			valueType: 'string',
			operation: 'add',
			before: null,
			after: 'Ari Quill',
		},
	],
});

void _typeCheck;
