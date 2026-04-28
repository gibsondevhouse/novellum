import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * plan-017 stage-005 phase-005 part-002 — STAGE EXIT GATE.
 *
 * A single sentinel API key is fed through every credential surface
 * (save → status → test → models → delete) and we assert the literal
 * value never appears in:
 *
 *  1. Any `/api/ai/**` or `/api/settings/**` JSON response body.
 *  2. The on-disk credential file (full key is stored, but never
 *     reflected back to the client).
 *  3. Captured `console.*` output during the round-trip.
 *  4. The error path that smuggles the key into a provider 502.
 *
 * If this suite fails the BYOK security stage cannot ship.
 */

const SENTINEL = 'sk-or-v1-TEST-SENTINEL-12345678';

const validateKey = vi.fn();
const listModels = vi.fn();
vi.mock('$lib/ai/providers/openrouter-provider.js', () => ({
	createOpenRouterProvider: () => ({
		providerId: 'openrouter',
		displayName: 'OpenRouter',
		validateKey,
		listModels,
		complete: vi.fn(),
		stream: vi.fn(),
	}),
}));

let appDataDir: string;
let consoleSpies: ReturnType<typeof spyAllConsole>;

function spyAllConsole() {
	return {
		log: vi.spyOn(console, 'log').mockImplementation(() => {}),
		info: vi.spyOn(console, 'info').mockImplementation(() => {}),
		warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
		error: vi.spyOn(console, 'error').mockImplementation(() => {}),
		debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
	};
}

function consoleHaystack(): string {
	return Object.values(consoleSpies)
		.flatMap((s) => s.mock.calls.flat())
		.map((arg) => {
			if (typeof arg === 'string') return arg;
			try {
				return JSON.stringify(arg);
			} catch {
				return String(arg);
			}
		})
		.join('\n');
}

function assertSentinelAbsent(label: string, haystack: string) {
	expect(haystack, `${label} must not contain the sentinel API key`).not.toContain(SENTINEL);
	expect(haystack, `${label} must not contain Bearer-prefixed sentinel`).not.toContain(
		`Bearer ${SENTINEL}`,
	);
}

beforeEach(() => {
	appDataDir = mkdtempSync(join(tmpdir(), 'novellum-redaction-'));
	process.env.NOVELLUM_APP_DATA_DIR = appDataDir;
	validateKey.mockReset();
	listModels.mockReset();
	consoleSpies = spyAllConsole();
});

afterEach(() => {
	rmSync(appDataDir, { recursive: true, force: true });
	delete process.env.NOVELLUM_APP_DATA_DIR;
	vi.restoreAllMocks();
});

async function postKey(action: 'save' | 'delete' | 'test', apiKey?: string) {
	const mod = await import('../../src/routes/api/settings/ai-key/+server.js');
	const body: Record<string, unknown> = { providerId: 'openrouter', action };
	if (apiKey !== undefined) body.apiKey = apiKey;
	const res = await mod.POST({
		request: new Request('http://localhost/api/settings/ai-key', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}),
	} as Parameters<typeof mod.POST>[0]);
	return { res, text: await res.clone().text() };
}

async function getStatus() {
	const mod = await import('../../src/routes/api/settings/ai-status/+server.js');
	const res = await mod.GET({
		url: new URL('http://localhost/api/settings/ai-status'),
	} as Parameters<typeof mod.GET>[0]);
	return { res, text: await res.clone().text() };
}

async function getModels() {
	const mod = await import('../../src/routes/api/ai/models/+server.js');
	mod.__clearModelsCacheForTests();
	const res = await mod.GET({
		url: new URL('http://localhost/api/ai/models'),
	} as Parameters<typeof mod.GET>[0]);
	return { res, text: await res.clone().text() };
}

describe('credential redaction — stage-005 exit gate', () => {
	it('sentinel never appears in any /api/settings or /api/ai response body', async () => {
		validateKey.mockResolvedValue({ ok: true });
		listModels.mockResolvedValue([
			{ id: 'gemini-3.1-flash-lite-preview', name: 'Gemini' },
		]);

		const responses: { label: string; text: string }[] = [];

		const save = await postKey('save', SENTINEL);
		responses.push({ label: 'POST ai-key save', text: save.text });

		const status = await getStatus();
		responses.push({ label: 'GET ai-status', text: status.text });

		const test = await postKey('test');
		responses.push({ label: 'POST ai-key test (stored)', text: test.text });

		const testWithSupplied = await postKey('test', SENTINEL);
		responses.push({ label: 'POST ai-key test (supplied)', text: testWithSupplied.text });

		const models = await getModels();
		responses.push({ label: 'GET ai-models', text: models.text });

		const del = await postKey('delete');
		responses.push({ label: 'POST ai-key delete', text: del.text });

		for (const { label, text } of responses) {
			assertSentinelAbsent(label, text);
		}
	});

	it('sentinel never appears in console output during a full round-trip', async () => {
		validateKey.mockResolvedValue({ ok: true });
		listModels.mockResolvedValue([{ id: 'gemini', name: 'g' }]);

		await postKey('save', SENTINEL);
		await getStatus();
		await postKey('test');
		await getModels();
		await postKey('delete');

		assertSentinelAbsent('console.*', consoleHaystack());
	});

	it('sentinel never leaks via a provider error message that echoes the key', async () => {
		// Save a valid sentinel first.
		validateKey.mockResolvedValueOnce({ ok: true });
		await postKey('save', SENTINEL);

		// Provider then fails with an error message that contains the key
		// (simulating an upstream that reflects credentials in errors).
		listModels.mockRejectedValueOnce(new Error(`upstream rejected ${SENTINEL}`));
		const { text } = await getModels();

		assertSentinelAbsent('GET ai-models error body', text);
		assertSentinelAbsent('console after provider leak', consoleHaystack());
	});

	it('sentinel does not appear in any non-credential file under the app data dir', async () => {
		validateKey.mockResolvedValue({ ok: true });
		await postKey('save', SENTINEL);

		// The credential file itself does store the full key (by design;
		// it is the source of truth, mode 0600). Every *other* artefact
		// — logs, telemetry, etc. — must be sentinel-free.
		const entries = readdirSync(appDataDir);
		for (const name of entries) {
			if (name === 'credentials.json') continue;
			const full = join(appDataDir, name);
			if (!statSync(full).isFile()) continue;
			const content = readFileSync(full, 'utf8');
			assertSentinelAbsent(`appDataDir/${name}`, content);
		}
	});
});
