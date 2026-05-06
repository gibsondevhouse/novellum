import { describe, it, expect } from 'vitest';

describe('APP_VERSION', () => {
	it('is a non-empty string', async () => {
		const { APP_VERSION } = await import('$lib/version.js');
		expect(typeof APP_VERSION).toBe('string');
		expect(APP_VERSION.length).toBeGreaterThan(0);
	});
});
