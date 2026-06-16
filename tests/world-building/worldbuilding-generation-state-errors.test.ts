import { beforeEach, describe, expect, it } from 'vitest';
import {
	getGenerationFailureReason,
	getState,
	markGenerationFailed,
	normalizeGenerationFailureReason,
	resetState,
	transition,
} from '../../src/modules/world-building/stores/worldbuilding-generation-state.svelte.js';
import type { WorldbuildingDomainId } from '../../src/modules/world-building/worldbuilding-workflow.js';

const ALL_DOMAINS: WorldbuildingDomainId[] = ['personae', 'atlas', 'archive', 'threads', 'chronicles'];

beforeEach(() => {
	for (const domain of ALL_DOMAINS) resetState(domain);
});

describe('normalizeGenerationFailureReason', () => {
	it('normalizes credential failures to a user-safe action', () => {
		expect(normalizeGenerationFailureReason('No AI provider credentials configured.')).toBe(
			'Add AI provider credentials in Settings, then retry generation.',
		);
	});

	it('normalizes validation and parse failures', () => {
		expect(normalizeGenerationFailureReason('validation_failed: name is required')).toBe(
			'The generated draft could not be validated. Try again.',
		);
		expect(normalizeGenerationFailureReason('The AI returned an unexpected format.')).toBe(
			'The generated draft could not be validated. Try again.',
		);
	});

	it('normalizes network failures', () => {
		expect(normalizeGenerationFailureReason('Failed to fetch')).toBe(
			'Could not reach the generation service. Check your connection and retry.',
		);
	});
});

describe('generation failure state metadata', () => {
	it('records a failure reason from a running state', () => {
		transition('personae', 'queued');
		transition('personae', 'running');

		markGenerationFailed('personae', 'validation_failed: missing name');

		expect(getState('personae')).toBe('failed');
		expect(getGenerationFailureReason('personae')).toBe(
			'The generated draft could not be validated. Try again.',
		);
	});

	it('clears failure reason when retry moves failed to queued', () => {
		transition('personae', 'queued');
		transition('personae', 'failed');
		markGenerationFailed('personae', 'Failed to fetch');

		transition('personae', 'queued');

		expect(getState('personae')).toBe('queued');
		expect(getGenerationFailureReason('personae')).toBeNull();
	});

	it('keeps illegal idle to failed transition guarded', () => {
		expect(() => transition('personae', 'failed')).toThrow(/idle|failed/i);

		markGenerationFailed('personae', 'Failed to fetch');
		expect(getState('personae')).toBe('idle');
		expect(getGenerationFailureReason('personae')).toBeNull();
	});
});
