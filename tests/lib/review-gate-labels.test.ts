import { describe, expect, it } from 'vitest';
import { reviewGateStatusLabel } from '../../src/lib/review-gate-labels.js';

describe('reviewGateStatusLabel', () => {
	it('normalizes review states across pipeline vocabularies', () => {
		expect(reviewGateStatusLabel('review')).toBe('Pending review');
		expect(reviewGateStatusLabel('pending_review')).toBe('Pending review');
		expect(reviewGateStatusLabel('review-ready')).toBe('Pending review');
	});

	it('labels terminal and empty states for review cards', () => {
		expect(reviewGateStatusLabel('accepted')).toBe('Accepted');
		expect(reviewGateStatusLabel('rejected')).toBe('Rejected');
		expect(reviewGateStatusLabel('failed_validation')).toBe('Failed validation');
		expect(reviewGateStatusLabel('none')).toBe('No draft');
	});
});
