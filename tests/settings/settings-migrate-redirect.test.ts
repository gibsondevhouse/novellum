import { describe, it, expect } from 'vitest';
import { load } from '../../src/routes/settings/migrate/+page';

describe('settings/migrate/+page.ts redirect', () => {
	it('throws a 307 redirect to /settings/data', () => {
		try {
			(load as () => unknown)();
			throw new Error('Expected load() to throw a redirect');
		} catch (err) {
			const e = err as { status?: number; location?: string };
			expect(e.status).toBe(307);
			expect(e.location).toBe('/settings/data');
		}
	});
});
