import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import WorldbuildingGenerationStatus from '../../src/modules/world-building/components/WorldbuildingGenerationStatus.svelte';
import {
	canGenerateDomain,
	getWorldbuildingGenerateControlState,
} from '../../src/modules/world-building/worldbuilding-generate-actions.js';
import {
	resetState,
	transition,
} from '../../src/modules/world-building/stores/worldbuilding-generation-state.svelte.js';
import type { WorldbuildingGenerationStateValue } from '../../src/modules/world-building/stores/worldbuilding-generation-state.svelte.js';
import type { WorldbuildingDomainId } from '../../src/modules/world-building/worldbuilding-workflow.js';

const MAIN_ROUTE_SOURCE = 'src/routes/projects/[id]/world-building/+page.svelte';
const MAIN_ROUTE_LOAD_SOURCE = 'src/routes/projects/[id]/world-building/+page.ts';
const ALL_DOMAINS: WorldbuildingDomainId[] = ['personae', 'atlas', 'archive', 'threads', 'chronicles'];

let target: HTMLElement;
let component: Record<string, unknown> | undefined;

function allCounts(value: number): Record<WorldbuildingDomainId, number> {
	return { personae: value, atlas: value, archive: value, threads: value, chronicles: value };
}

function controlState(state: WorldbuildingGenerationStateValue) {
	return getWorldbuildingGenerateControlState({
		domainLabel: 'Personae',
		guard: { allowed: true, reason: null },
		state,
	});
}

beforeEach(() => {
	for (const domain of ALL_DOMAINS) resetState(domain);
	target = document.createElement('div');
	document.body.appendChild(target);
});

afterEach(() => {
	if (component) {
		unmount(component);
		component = undefined;
	}
	target.remove();
});

describe('main worldbuilding generate controls', () => {
	it('keeps missing-context clicks disabled with readable guard copy', () => {
		const guard = canGenerateDomain('atlas', {
			projectId: 'project-001',
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

	it('disables queued, running, and review-ready states while preserving retryable failures', () => {
		expect(controlState('idle')).toMatchObject({ disabled: false, label: 'Generate' });
		expect(controlState('queued')).toMatchObject({ disabled: true, label: 'Queued...' });
		expect(controlState('running')).toMatchObject({ disabled: true, label: 'Generating...' });
		expect(controlState('review-ready')).toMatchObject({
			disabled: true,
			label: 'Review draft',
			reviewReady: true,
		});
		expect(controlState('failed')).toMatchObject({ disabled: false, label: 'Generate' });
	});

	it('mounts generated draft review UI and threads the review-ready action on the main route', () => {
		const source = readFileSync(MAIN_ROUTE_SOURCE, 'utf8');
		const loadSource = readFileSync(MAIN_ROUTE_LOAD_SOURCE, 'utf8');

		expect(source).toContain('GeneratedEntityModal');
		expect(source).toContain('<GeneratedEntityModal hideErrorPhase />');
		expect(source).toContain('getWorldbuildingGenerateControlState');
		expect(source).toContain('getState as getDomainGenerationState');
		expect(source).toContain('getPhase as getDraftGenerationPhase');
		expect(source).toContain('resetState as resetDomainGenerationState');
		expect(source).toContain('handleGenerateDomain');
		expect(source).toContain('focusGeneratedDraftReview');
		expect(source).toContain('onReviewReady={focusGeneratedDraftReview}');
		expect(loadSource).toContain('/api/worldbuilding/domain-counts?projectId=');
		expect(loadSource).not.toContain('redirect(');
	});

	it('renders a review-ready action that calls the provided draft review handler', () => {
		const onReviewReady = vi.fn();
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'review-ready');

		component = mount(WorldbuildingGenerationStatus, {
			target,
			props: {
				domainId: 'personae',
				onReviewReady,
			},
		});
		flushSync();

		const reviewButton = target.querySelector('button');
		expect(target.textContent).toContain('Pending review');
		expect(reviewButton?.textContent).toContain('Review draft');

		reviewButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		flushSync();

		expect(onReviewReady).toHaveBeenCalledWith('personae');
	});
});
