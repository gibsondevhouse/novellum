import { describe, it, expect } from 'vitest';
import { load as bibleLoad } from '../../src/routes/projects/[id]/bible/+page.ts';
import { load as hubRedirectLoad } from '../../src/routes/projects/[id]/+page.ts';
import { load as consistencyLoad } from '../../src/routes/projects/[id]/consistency/+page.ts';

describe('Route Redirects', () => {
	it('redirects /bible to /world-building with a 307 status', () => {
		try {
			// @ts-expect-error - mocking PageLoadEvent
			bibleLoad({ params: { id: 'test-project-2' } });
			expect.fail('Expected redirect to be thrown');
		} catch (e: unknown) {
			const redirect = e as { status: number; location: string };
			expect(redirect.status).toBe(307);
			expect(redirect.location).toBe('/projects/test-project-2/world-building');
		}
	});

	it('redirects /projects/[id] to /projects/[id]/hub with a 307 status', () => {
		try {
			// @ts-expect-error - mocking PageLoadEvent
			hubRedirectLoad({ params: { id: 'test-project' } });
			expect.fail('Expected redirect to be thrown');
		} catch (e: unknown) {
			const redirect = e as { status: number; location: string };
			expect(redirect.status).toBe(307);
			expect(redirect.location).toBe('/projects/test-project/hub');
		}
	});

	it('redirects /consistency to /continuity with a 307 status', () => {
		try {
			// @ts-expect-error - mocking PageLoadEvent
			consistencyLoad({ params: { id: 'test-project' } });
			expect.fail('Expected redirect to be thrown');
		} catch (e: unknown) {
			const redirect = e as { status: number; location: string };
			expect(redirect.status).toBe(307);
			expect(redirect.location).toBe('/projects/test-project/continuity');
		}
	});
});
