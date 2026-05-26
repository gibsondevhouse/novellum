import { request } from '@playwright/test';

/**
 * Playwright global setup — runs once before any spec.
 *
 * Marks onboarding as complete in the preferences store so navigation
 * tests don't get redirected to `/onboarding`. The dev/local SQLite
 * usually already has this flag set, but a fresh CI runner does not.
 *
 * Without this, every visual + e2e test that visits `/projects/...`,
 * `/books/...`, `/stories`, etc. would land on the onboarding page
 * instead of the target route. Discovered while closing CI3 of the
 * V1 DoD checklist (plan-024 stage-001).
 */
export default async function globalSetup(): Promise<void> {
	const baseURL = process.env.BASE_URL || 'http://localhost:4173';
	const ctx = await request.newContext({ baseURL });
	try {
		const res = await ctx.put('/api/db/preferences/app.onboarding.completed', {
			data: { value: true },
		});
		if (!res.ok()) {
			throw new Error(
				`Failed to mark onboarding complete (status ${res.status()}): ${await res.text()}`,
			);
		}
	} finally {
		await ctx.dispose();
	}
}
