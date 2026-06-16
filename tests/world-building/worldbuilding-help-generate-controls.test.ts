import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	canGenerateDomain,
	getWorldbuildingGenerateControlState,
} from '../../src/modules/world-building/worldbuilding-generate-actions.js';
import type { WorldbuildingDomainId } from '../../src/modules/world-building/worldbuilding-workflow.js';

const HELP_ROUTE_SOURCE = 'src/routes/projects/[id]/world-building/help/+page.svelte';

function allCounts(value: number): Record<WorldbuildingDomainId, number> {
	return { personae: value, atlas: value, archive: value, threads: value, chronicles: value };
}

describe('worldbuilding help generate controls', () => {
	it('uses the shared generation control state contract', () => {
		const guard = canGenerateDomain('atlas', {
			projectId: 'project-help-001',
			domainCounts: allCounts(0),
		});

		const state = getWorldbuildingGenerateControlState({
			domainLabel: 'Atlas',
			guard,
			state: 'missing-context',
		});

		expect(state.disabled).toBe(true);
		expect(state.ariaLabel).toContain('Generate Atlas: Requires Personae');
		expect(state.title).toContain('Requires Personae');
	});

	it('threads the help route through the shared service and draft review surface', () => {
		const source = readFileSync(HELP_ROUTE_SOURCE, 'utf8');

		expect(source).toContain('getWorldbuildingGenerateControlState');
		expect(source).toContain('getState as getDomainGenerationState');
		expect(source).toContain('getPhase as getDraftGenerationPhase');
		expect(source).toContain('resetState as resetDomainGenerationState');
		expect(source).toContain('handleGenerateDomain');
		expect(source).toContain('onReviewReady={focusGeneratedDraftReview}');
		expect(source).toContain('<GeneratedEntityModal hideErrorPhase />');
		expect(source).not.toContain('PROMPT_SEEDS');
		expect(source).not.toContain('openWithPrompt');
	});
});
