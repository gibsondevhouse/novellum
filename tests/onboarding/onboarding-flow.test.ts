import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Mock the client-side preferences module so the onboarding store can be
// imported without triggering browser fetch calls.
vi.mock('$lib/preferences.js', () => ({
	getPreference: vi.fn(),
	setPreference: vi.fn().mockResolvedValue(undefined),
}));

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'novellum-onboarding-guard-'));
	process.env.NOVELLUM_APP_DATA_DIR = dir;
	vi.resetModules();
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
	delete process.env.NOVELLUM_APP_DATA_DIR;
	vi.resetModules();
});

function makeEvent(url: string, acceptHeader = 'text/html,application/xhtml+xml') {
	return {
		url: new URL(url),
		request: new Request(url, {
			method: 'GET',
			headers: { accept: acceptHeader },
		}),
	} as unknown as Parameters<(typeof import('../../src/hooks.server.js'))['handle']>[0]['event'];
}

describe('onboarding guard', () => {
	it('redirects to /onboarding when app.onboarding.completed is absent', async () => {
		const { handle } = await import('../../src/hooks.server.js');
		const resolve = vi.fn(async () => new Response('OK'));
		const event = makeEvent('http://localhost/');
		const response = await handle({ event, resolve });
		expect(response.status).toBe(302);
		expect(response.headers.get('location')).toBe('http://localhost/onboarding');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('does not redirect when app.onboarding.completed is true', async () => {
		const { setPreference } = await import(
			'../../src/lib/server/preferences/preferences-service.js'
		);
		setPreference('app.onboarding.completed', true);

		const { handle } = await import('../../src/hooks.server.js');
		const resolve = vi.fn(async () => new Response('OK'));
		const event = makeEvent('http://localhost/');
		const response = await handle({ event, resolve });
		expect(resolve).toHaveBeenCalled();
		expect(response.status).toBe(200);
	});

	it('does not redirect requests to /onboarding', async () => {
		const { handle } = await import('../../src/hooks.server.js');
		const resolve = vi.fn(async () => new Response('OK'));
		const event = makeEvent('http://localhost/onboarding');
		const response = await handle({ event, resolve });
		expect(resolve).toHaveBeenCalled();
		expect(response.status).not.toBe(302);
	});

	it('does not redirect API requests', async () => {
		const { handle } = await import('../../src/hooks.server.js');
		const resolve = vi.fn(async () => new Response('{}'));
		const event = makeEvent('http://localhost/api/db/projects', 'application/json');
		const response = await handle({ event, resolve });
		expect(resolve).toHaveBeenCalled();
		expect(response.status).not.toBe(302);
	});

	it('does not redirect static asset requests', async () => {
		const { handle } = await import('../../src/hooks.server.js');
		const resolve = vi.fn(async () => new Response('body'));
		const event = makeEvent('http://localhost/favicon.svg', 'image/svg+xml');
		const response = await handle({ event, resolve });
		expect(resolve).toHaveBeenCalled();
		expect(response.status).not.toBe(302);
	});
});

describe('AiKeyStep skip behavior (store level)', () => {
	it('skip advances to CreateProjectStep (last step) without persisting', async () => {
		const { onboarding, ONBOARDING_STEPS } = await import(
			'../../src/lib/stores/onboarding.svelte.js'
		);
		// Advance to ai-key step (index 4)
		onboarding.currentStep = ONBOARDING_STEPS.indexOf('ai-key');
		// skipToEnd() is what the shell calls on AiKeyStep's onSkip
		onboarding.skipToEnd();
		expect(onboarding.currentStep).toBe(ONBOARDING_STEPS.length - 1);
		expect(onboarding.stepId).toBe('create-project');
		// completed should still be false — only complete() persists
		expect(onboarding.completed).toBe(false);
	});
});
