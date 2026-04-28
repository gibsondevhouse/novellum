import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Regression guardrail for plan-017 stage-005 phase-004 part-002.
 *
 * The previous ApiSettings component held the OpenRouter key in
 * `localStorage` under `novellum_openrouter_key`. After the BYOK refactor
 * the only allowed reference is the legacy migration constant inside
 * `src/lib/ai/credential-service.ts` (the *one-shot* migration helper).
 * Anything else is a regression and a credential leakage risk.
 */

const COMPONENT_PATH = resolve(
	__dirname,
	'..',
	'..',
	'src',
	'modules',
	'settings',
	'components',
	'ApiSettings.svelte',
);

describe('ApiSettings component — credential boundary', () => {
	const source = readFileSync(COMPONENT_PATH, 'utf8');

	it('contains no localStorage read or write of the legacy key', () => {
		expect(source).not.toMatch(/localStorage\s*\.\s*getItem/);
		expect(source).not.toMatch(/localStorage\s*\.\s*setItem/);
		expect(source).not.toMatch(/localStorage\s*\.\s*removeItem/);
		expect(source).not.toContain('novellum_openrouter_key');
	});

	it('imports the credential service helpers exactly', () => {
		expect(source).toContain("from '$lib/ai/credential-service.js'");
		expect(source).toContain('saveKey');
		expect(source).toContain('deleteKey');
		expect(source).toContain('getStatus');
	});

	it('renders the masked hint and verified timestamp when configured', () => {
		expect(source).toContain('status.maskedHint');
		expect(source).toContain('lastVerifiedAt');
	});

	it('uses an autocomplete=off password input', () => {
		expect(source).toMatch(/autocomplete="off"/);
		expect(source).toMatch(/spellcheck=\{false\}/);
		expect(source).toMatch(/type="password"/);
	});

	it('runs the legacy migration helper on mount', () => {
		expect(source).toContain('migrateLegacyLocalStorage');
	});
});
