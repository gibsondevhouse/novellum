import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatPendingSuggestionLabel } from '../../src/modules/world-building/worldbuilding-workflow.js';

const ROUTE_SOURCES = [
	'src/routes/projects/[id]/world-building/+page.svelte',
	'src/routes/projects/[id]/world-building/help/+page.svelte',
];

describe('worldbuild pending proposal badges', () => {
	it('formats accessible pending suggestion labels without raw status keys', () => {
		expect(formatPendingSuggestionLabel(1, 'Personae')).toBe('1 pending suggestion for Personae');
		expect(formatPendingSuggestionLabel(3, 'Atlas')).toBe('3 pending suggestions for Atlas');
		expect(formatPendingSuggestionLabel(-1, 'Threads')).toBe('0 pending suggestions for Threads');
	});

	it('renders pending badges only when route category counts are positive', () => {
		for (const routeSource of ROUTE_SOURCES) {
			const source = readFileSync(routeSource, 'utf8');

			expect(source).toContain('getPendingWorldbuildSuggestionCountForCategory');
			expect(source).toContain('{#if pendingCount > 0}');
			expect(source).toContain('WorldbuildingNotificationBadge count={pendingCount}');
			expect(source).toContain('Pending suggestions');
			expect(source).toContain('formatPendingSuggestionLabel(pendingCount, section.label)');
			expect(source).not.toContain('pending_review');
		}
	});
});
