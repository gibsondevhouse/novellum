import { describe, expect, it } from 'vitest';
import { normalizeNovaContextOverrides } from '$lib/project-metadata.js';

describe('Nova context override metadata helpers', () => {
	it('normalizes override metadata and lets exclusions win over pins', () => {
		expect(
			normalizeNovaContextOverrides({
				pinnedEntityIds: [' char-1 ', 'char-1', 'shared-id', 12],
				excludedEntityIds: ['shared-id', '', ' loc-1 '],
			}),
		).toEqual({
			pinnedEntityIds: ['char-1'],
			excludedEntityIds: ['shared-id', 'loc-1'],
		});
	});

	it('returns empty arrays for malformed metadata', () => {
		expect(normalizeNovaContextOverrides(null)).toEqual({
			pinnedEntityIds: [],
			excludedEntityIds: [],
		});
		expect(normalizeNovaContextOverrides([])).toEqual({
			pinnedEntityIds: [],
			excludedEntityIds: [],
		});
	});
});
