import { describe, expect, it } from 'vitest';
import {
	getWorldbuildCanonMergeFieldMode,
	getWorldbuildCanonMergePolicy,
	WORLDBUILD_CANON_MERGE_POLICIES,
} from '$lib/ai/pipeline/checkpoint-service.js';

describe('worldbuild canon merge policy', () => {
	it('selects character and location as bounded initial merge families', () => {
		expect(getWorldbuildCanonMergePolicy('character')?.mergeEnabled).toBe(true);
		expect(getWorldbuildCanonMergePolicy('location')?.mergeEnabled).toBe(true);
		expect(getWorldbuildCanonMergePolicy('faction')?.mergeEnabled).toBe(false);
		expect(getWorldbuildCanonMergePolicy('theme')).toBeUndefined();
	});

	it('allows safe empty-field fills for generated character fields', () => {
		expect(getWorldbuildCanonMergeFieldMode('character', 'coreDesire')).toBe('replace_if_empty');
		expect(getWorldbuildCanonMergeFieldMode('character', 'voiceSummary')).toBe('replace_if_empty');
		expect(getWorldbuildCanonMergeFieldMode('character', 'bio')).toBe('replace_if_empty');
	});

	it('requires append-only semantics for list fields', () => {
		expect(getWorldbuildCanonMergeFieldMode('character', 'traits')).toBe('append_unique');
		expect(getWorldbuildCanonMergeFieldMode('location', 'tags')).toBe('append_unique');
		expect(getWorldbuildCanonMergeFieldMode('location', 'characterIds')).toBe('append_unique');
	});

	it('treats link fields and protected fields conservatively', () => {
		expect(getWorldbuildCanonMergeFieldMode('character', 'factionId')).toBe('link_only');
		expect(getWorldbuildCanonMergeFieldMode('location', 'realmId')).toBe('link_only');
		expect(getWorldbuildCanonMergeFieldMode('character', 'id')).toBe('never');
		expect(getWorldbuildCanonMergeFieldMode('location', 'updatedAt')).toBe('never');
	});

	it('routes unknown or unsupported fields to manual review instead of overwrite', () => {
		expect(getWorldbuildCanonMergeFieldMode('character', 'name')).toBe('manual_review');
		expect(getWorldbuildCanonMergeFieldMode('location', 'name')).toBe('manual_review');
		expect(getWorldbuildCanonMergeFieldMode('theme', 'description')).toBe('manual_review');
	});

	it('keeps policy data immutable enough for review display', () => {
		expect(WORLDBUILD_CANON_MERGE_POLICIES.character?.label).toBe('Character');
		expect(WORLDBUILD_CANON_MERGE_POLICIES.location?.replaceIfEmptyFields).toContain(
			'conflictPressure',
		);
	});
});
