/**
 * plan-023 stage-006 phase-003 — feature flag tests.
 *
 * Covers the in-memory override (`setNovaAgenticFlag`) and the env
 * truthiness parser. Uses `vi.stubEnv` to drive `import.meta.env`
 * deterministically across worker boundaries.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	isNovaAgenticEnabled,
	setNovaAgenticFlag,
} from '$modules/nova/services/feature-flags.js';

const ENV_KEY = 'PUBLIC_NOVELLUM_NOVA_AGENTIC';

describe('feature-flags — experimental.nova.agentic', () => {
	beforeEach(() => {
		setNovaAgenticFlag(null);
		vi.unstubAllEnvs();
	});

	afterEach(() => {
		setNovaAgenticFlag(null);
		vi.unstubAllEnvs();
	});

	it('defaults to false when no override and no env value is set', () => {
		expect(isNovaAgenticEnabled()).toBe(false);
	});

	it('setNovaAgenticFlag(true) enables the flag', () => {
		setNovaAgenticFlag(true);
		expect(isNovaAgenticEnabled()).toBe(true);
	});

	it('setNovaAgenticFlag(false) explicitly disables (overrides env)', () => {
		vi.stubEnv(ENV_KEY, '1');
		setNovaAgenticFlag(false);
		expect(isNovaAgenticEnabled()).toBe(false);
	});

	it('setNovaAgenticFlag(null) clears the override and falls back to env', () => {
		setNovaAgenticFlag(true);
		setNovaAgenticFlag(null);
		expect(isNovaAgenticEnabled()).toBe(false);
	});

	it.each(['1', 'true', 'TRUE', 'on', 'On', 'yes', 'YES', '  true  '])(
		'parses truthy env value %j as enabled',
		(raw) => {
			vi.stubEnv(ENV_KEY, raw);
			expect(isNovaAgenticEnabled()).toBe(true);
		},
	);

	it.each(['0', 'false', 'off', 'no', '', 'maybe', 'enabled'])(
		'parses non-truthy env value %j as disabled',
		(raw) => {
			vi.stubEnv(ENV_KEY, raw);
			expect(isNovaAgenticEnabled()).toBe(false);
		},
	);
});
