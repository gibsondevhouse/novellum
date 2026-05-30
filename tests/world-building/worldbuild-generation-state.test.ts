import { describe, expect, it, beforeEach } from 'vitest';
import {
	getState,
	transition,
	resetState,
	getMissingContextReason,
	evaluateReadiness,
} from '../../src/modules/world-building/stores/worldbuilding-generation-state.svelte.js';
import type { WorldbuildingDomainId } from '../../src/modules/world-building/worldbuilding-workflow.js';

const ALL_DOMAINS: WorldbuildingDomainId[] = ['personae', 'atlas', 'archive', 'threads', 'chronicles'];

function allCounts(value: number): Record<WorldbuildingDomainId, number> {
	return { personae: value, atlas: value, archive: value, threads: value, chronicles: value };
}

beforeEach(() => {
	for (const d of ALL_DOMAINS) resetState(d);
});

describe('initial state', () => {
	it('all domains start as idle', () => {
		for (const d of ALL_DOMAINS) {
			expect(getState(d)).toBe('idle');
		}
	});

	it('no missing-context reasons on start', () => {
		for (const d of ALL_DOMAINS) {
			expect(getMissingContextReason(d)).toBeNull();
		}
	});
});

describe('legal transitions from idle', () => {
	it('idle → missing-context', () => {
		transition('personae', 'missing-context');
		expect(getState('personae')).toBe('missing-context');
	});

	it('idle → queued', () => {
		transition('personae', 'queued');
		expect(getState('personae')).toBe('queued');
	});
});

describe('legal transitions from missing-context', () => {
	it('missing-context → idle', () => {
		transition('personae', 'missing-context');
		transition('personae', 'idle');
		expect(getState('personae')).toBe('idle');
	});

	it('missing-context → queued', () => {
		transition('personae', 'missing-context');
		transition('personae', 'queued');
		expect(getState('personae')).toBe('queued');
	});
});

describe('legal transitions from queued', () => {
	it('queued → running', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		expect(getState('personae')).toBe('running');
	});

	it('queued → failed', () => {
		transition('personae', 'queued');
		transition('personae', 'failed');
		expect(getState('personae')).toBe('failed');
	});

	it('queued → idle', () => {
		transition('personae', 'queued');
		transition('personae', 'idle');
		expect(getState('personae')).toBe('idle');
	});
});

describe('legal transitions from running', () => {
	it('running → review-ready', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'review-ready');
		expect(getState('personae')).toBe('review-ready');
	});

	it('running → failed', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'failed');
		expect(getState('personae')).toBe('failed');
	});

	it('running → idle (abort)', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'idle');
		expect(getState('personae')).toBe('idle');
	});
});

describe('legal transitions from review-ready', () => {
	function toReviewReady(d: WorldbuildingDomainId) {
		transition(d, 'queued');
		transition(d, 'running');
		transition(d, 'review-ready');
	}

	it('review-ready → accepted', () => {
		toReviewReady('personae');
		transition('personae', 'accepted');
		expect(getState('personae')).toBe('accepted');
	});

	it('review-ready → rejected', () => {
		toReviewReady('personae');
		transition('personae', 'rejected');
		expect(getState('personae')).toBe('rejected');
	});

	it('review-ready → idle (dismiss)', () => {
		toReviewReady('personae');
		transition('personae', 'idle');
		expect(getState('personae')).toBe('idle');
	});
});

describe('legal transitions from terminal states', () => {
	it('accepted → idle (reset)', () => {
		transition('atlas', 'queued');
		transition('atlas', 'running');
		transition('atlas', 'review-ready');
		transition('atlas', 'accepted');
		transition('atlas', 'idle');
		expect(getState('atlas')).toBe('idle');
	});

	it('rejected → idle (reset)', () => {
		transition('atlas', 'queued');
		transition('atlas', 'running');
		transition('atlas', 'review-ready');
		transition('atlas', 'rejected');
		transition('atlas', 'idle');
		expect(getState('atlas')).toBe('idle');
	});

	it('failed → idle (clear error)', () => {
		transition('atlas', 'queued');
		transition('atlas', 'failed');
		transition('atlas', 'idle');
		expect(getState('atlas')).toBe('idle');
	});

	it('failed → queued (retry)', () => {
		transition('atlas', 'queued');
		transition('atlas', 'failed');
		transition('atlas', 'queued');
		expect(getState('atlas')).toBe('queued');
	});
});

describe('illegal transitions throw descriptive errors', () => {
	it('idle → running is illegal', () => {
		expect(() => transition('personae', 'running')).toThrow(/idle.*running|running/i);
	});

	it('idle → review-ready is illegal', () => {
		expect(() => transition('personae', 'review-ready')).toThrow(/idle|review-ready/i);
	});

	it('accepted → review-ready is illegal', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'review-ready');
		transition('personae', 'accepted');
		expect(() => transition('personae', 'review-ready')).toThrow(/accepted|review-ready/i);
	});

	it('accepted → rejected is illegal', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'review-ready');
		transition('personae', 'accepted');
		expect(() => transition('personae', 'rejected')).toThrow(/accepted.*rejected|rejected/i);
	});

	it('rejected → accepted is illegal', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'review-ready');
		transition('personae', 'rejected');
		expect(() => transition('personae', 'accepted')).toThrow(/rejected.*accepted|accepted/i);
	});
});

describe('evaluateReadiness', () => {
	it('sets missing-context for atlas when personae count is 0', () => {
		evaluateReadiness('atlas', { personae: 0, atlas: 0, archive: 0, threads: 0, chronicles: 0 });
		expect(getState('atlas')).toBe('missing-context');
		expect(getMissingContextReason('atlas')).toContain('Personae');
	});

	it('sets missing-context for threads when personae and atlas counts are 0', () => {
		evaluateReadiness('threads', allCounts(0));
		expect(getState('threads')).toBe('missing-context');
		expect(getMissingContextReason('threads')).toBeTruthy();
	});

	it('sets missing-context for chronicles when any dependency is missing', () => {
		evaluateReadiness('chronicles', { personae: 1, atlas: 1, archive: 0, threads: 1, chronicles: 0 });
		expect(getState('chronicles')).toBe('missing-context');
	});

	it('allows personae to stay idle when no deps required', () => {
		evaluateReadiness('personae', allCounts(0));
		expect(getState('personae')).toBe('idle');
	});

	it('clears missing-context and returns to idle when deps satisfied', () => {
		evaluateReadiness('atlas', allCounts(0));
		expect(getState('atlas')).toBe('missing-context');
		evaluateReadiness('atlas', { personae: 3, atlas: 0, archive: 0, threads: 0, chronicles: 0 });
		expect(getState('atlas')).toBe('idle');
		expect(getMissingContextReason('atlas')).toBeNull();
	});

	it('does not change state when already in a non-idle/missing-context state', () => {
		transition('atlas', 'queued');
		evaluateReadiness('atlas', allCounts(0));
		expect(getState('atlas')).toBe('queued');
	});
});

describe('resetState', () => {
	it('resets any state to idle', () => {
		transition('personae', 'queued');
		transition('personae', 'running');
		transition('personae', 'review-ready');
		resetState('personae');
		expect(getState('personae')).toBe('idle');
	});

	it('clears missing-context reason on reset', () => {
		evaluateReadiness('atlas', allCounts(0));
		expect(getMissingContextReason('atlas')).toBeTruthy();
		resetState('atlas');
		expect(getMissingContextReason('atlas')).toBeNull();
	});

	it('resetting one domain does not affect others', () => {
		transition('atlas', 'queued');
		transition('archive', 'queued');
		resetState('atlas');
		expect(getState('atlas')).toBe('idle');
		expect(getState('archive')).toBe('queued');
	});
});

describe('per-domain isolation', () => {
	it('state changes on one domain do not affect siblings', () => {
		transition('personae', 'queued');
		for (const d of ALL_DOMAINS.filter((x) => x !== 'personae')) {
			expect(getState(d)).toBe('idle');
		}
	});
});
