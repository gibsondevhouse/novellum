#!/usr/bin/env node
/**
 * Built-server smoke test.
 *
 * Boots `build/index.js` (the SvelteKit Node adapter output that the
 * packaged Tauri sidecar runs) on a random local port and probes a
 * focused set of routes that every shipped flow hits at least once.
 *
 * The goal is to catch bundling regressions — ESM/CJS interop,
 * missing native deps, broken adapter output — *before* they reach
 * a `pnpm desktop:build` run or a user. `pnpm test` (vitest) runs
 * source files in Node/jsdom, which would not have flagged the
 * `ERR_REQUIRE_ESM` failure that took out `/api/settings/ai-key` in
 * the packaged sidecar on 2026-05-12.
 *
 * Probes:
 *   - GET  /api/settings/about        — sanity: server boots, simple GET works
 *   - GET  /api/settings/ai-status    — credential service loads in this runtime
 *   - POST /api/settings/ai-key       — action=test with no creds → 400 path
 *   - POST /api/ai (NOVELLUM_AI_MOCK) — Nova proxy + SSR closure compiles
 *   - POST /api/local-files/normalize — scratchpad/world-building module bundles
 *   - GET  /api/ai/models             — model list route compiles (no creds → 401)
 *   - GET  /api/settings/storage-location — app-data path + statfs work
 *
 * Runtime considerations:
 *   - Uses a temp `XDG_DATA_HOME` so the filesystem credential store
 *     never touches the developer's real `~/Library/Application Support/`.
 *   - Does NOT set `NOVELLUM_DESKTOP=1`, so the keyring backend is not
 *     exercised (that requires the bundled `.app`; see plan-024).
 *   - Exits non-zero on the first failed probe with a diagnostic line.
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, '..');
const SERVER_ENTRY = join(PROJECT_ROOT, 'build', 'index.js');
const READY_TIMEOUT_MS = 15_000;
const PROBE_TIMEOUT_MS = 10_000;

function fatal(message) {
	process.stderr.write(`smoke: ${message}\n`);
	process.exit(1);
}

if (!existsSync(SERVER_ENTRY)) {
	fatal(`build/index.js not found — run \`pnpm build\` first.`);
}

/**
 * Resolve the Node binary the packaged Tauri sidecar will use.
 *
 * The bundled `better-sqlite3` prebuild is compiled against the
 * bundled Node's `NODE_MODULE_VERSION` (127 = Node 22.x). Booting
 * `build/index.js` with the developer's system Node (often v25 →
 * NODE_MODULE_VERSION 141) hits `ERR_DLOPEN_FAILED` immediately,
 * which would mask the bundling regressions this script exists to
 * catch. Falling back to `process.execPath` keeps the script
 * usable on CI environments without the bundled binary fetched.
 */
function resolveSidecarNode() {
	const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64';
	let triple = null;
	if (process.platform === 'darwin') triple = `${arch}-apple-darwin`;
	else if (process.platform === 'linux') triple = `${arch}-unknown-linux-gnu`;
	else if (process.platform === 'win32') triple = `${arch}-pc-windows-msvc`;
	if (!triple) return process.execPath;
	const ext = process.platform === 'win32' ? '.exe' : '';
	const bundled = join(PROJECT_ROOT, 'src-tauri', 'binaries', `node-${triple}${ext}`);
	if (existsSync(bundled)) return bundled;
	process.stdout.write(
		`smoke: bundled sidecar Node not found at ${bundled}; falling back to ${process.execPath}\n`,
	);
	return process.execPath;
}

const NODE_BIN = resolveSidecarNode();
const tempDataDir = mkdtempSync(join(tmpdir(), 'novellum-smoke-'));

function pickPort() {
	// Range chosen to avoid collisions with common dev servers.
	return 4000 + Math.floor(Math.random() * 1000);
}

const port = pickPort();
const baseUrl = `http://127.0.0.1:${port}`;

const child = spawn(NODE_BIN, [SERVER_ENTRY], {
	cwd: PROJECT_ROOT,
	env: {
		...process.env,
		PORT: String(port),
		HOST: '127.0.0.1',
		NODE_ENV: 'production',
		// Mock mode so /api/ai does not need a real OpenRouter key but
		// still exercises every module the real path touches at import time.
		NOVELLUM_AI_MOCK: '1',
		// Isolate the filesystem credential store from the user's real
		// app-data dir on every supported platform.
		XDG_DATA_HOME: tempDataDir,
		APPDATA: tempDataDir,
		HOME: tempDataDir,
	},
	stdio: ['ignore', 'pipe', 'pipe'],
});

const serverLog = [];
child.stdout.on('data', (chunk) => serverLog.push(chunk.toString()));
child.stderr.on('data', (chunk) => serverLog.push(chunk.toString()));

function shutdown(code) {
	child.kill('SIGTERM');
	try {
		rmSync(tempDataDir, { recursive: true, force: true });
	} catch {
		// Best-effort cleanup; tmpdir() entries are reaped by the OS.
	}
	process.exit(code);
}

process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(143));

child.on('exit', (code, signal) => {
	if (code !== 0 && code !== null) {
		process.stderr.write(serverLog.join(''));
		fatal(`server exited unexpectedly (code=${code}, signal=${signal ?? 'none'})`);
	}
});

async function waitForReady() {
	const deadline = Date.now() + READY_TIMEOUT_MS;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(`${baseUrl}/api/settings/about`, {
				signal: AbortSignal.timeout(1_000),
			});
			if (res.ok) return;
		} catch {
			// Server not up yet; retry.
		}
		await new Promise((r) => setTimeout(r, 200));
	}
	process.stderr.write(serverLog.join(''));
	fatal(`server did not become ready on ${baseUrl} within ${READY_TIMEOUT_MS}ms`);
}

let failures = 0;

async function probe(label, run) {
	try {
		await run();
		process.stdout.write(`  ✓ ${label}\n`);
	} catch (err) {
		failures += 1;
		const message = err instanceof Error ? err.message : String(err);
		process.stdout.write(`  ✗ ${label} — ${message}\n`);
	}
}

function expect(condition, message) {
	if (!condition) throw new Error(message);
}

async function fetchJson(path, init = {}) {
	const res = await fetch(`${baseUrl}${path}`, {
		...init,
		signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
	});
	let body = null;
	try {
		body = await res.json();
	} catch {
		// Some routes return non-JSON; that's a probe-specific concern.
	}
	return { res, body };
}

async function main() {
	process.stdout.write(`smoke: booting ${SERVER_ENTRY} on ${baseUrl}\n`);
	await waitForReady();
	process.stdout.write(`smoke: server ready, running probes\n`);

	await probe('GET /api/settings/about → 200 + appName', async () => {
		const { res, body } = await fetchJson('/api/settings/about');
		expect(res.status === 200, `status ${res.status}`);
		expect(body?.appName === 'Novellum', `unexpected body ${JSON.stringify(body)}`);
	});

	await probe('GET /api/settings/ai-status → 200 + configured field', async () => {
		const { res, body } = await fetchJson(
			'/api/settings/ai-status?providerId=openrouter',
		);
		expect(res.status === 200, `status ${res.status}`);
		expect(typeof body?.configured === 'boolean', `bad body ${JSON.stringify(body)}`);
	});

	await probe('POST /api/settings/ai-key action=test, no creds → 400 no_credentials_to_test', async () => {
		const { res, body } = await fetchJson('/api/settings/ai-key', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ providerId: 'openrouter', action: 'test' }),
		});
		expect(res.status === 400, `status ${res.status}`);
		expect(
			body?.error?.code === 'no_credentials_to_test',
			`unexpected body ${JSON.stringify(body)}`,
		);
	});

	await probe('POST /api/ai (mock proxy) → 200 + mock text', async () => {
		const { res, body } = await fetchJson('/api/ai', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				model: 'openrouter/auto',
				messages: [{ role: 'user', content: 'smoke' }],
			}),
		});
		expect(res.status === 200, `status ${res.status}`);
		expect(typeof body?.text === 'string', `unexpected body ${JSON.stringify(body)}`);
	});

	await probe('POST /api/local-files/normalize → 200 + normalized path', async () => {
		const { res, body } = await fetchJson('/api/local-files/normalize', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ path: 'scratchpads/characters/foo.md' }),
		});
		expect(res.status === 200, `status ${res.status}`);
		expect(typeof body?.path === 'string', `unexpected body ${JSON.stringify(body)}`);
	});

	await probe('GET /api/ai/models (no creds) → 401 no_credentials', async () => {
		const { res, body } = await fetchJson('/api/ai/models?providerId=openrouter');
		expect(res.status === 401, `status ${res.status}`);
		expect(
			body?.error?.code === 'no_credentials',
			`unexpected body ${JSON.stringify(body)}`,
		);
	});

	await probe('GET /api/settings/storage-location → 200 + appDataDirectory in tmp', async () => {
		const { res, body } = await fetchJson('/api/settings/storage-location');
		expect(res.status === 200, `status ${res.status}`);
		expect(
			typeof body?.appDataDirectory === 'string' && body.appDataDirectory.length > 0,
			`unexpected body ${JSON.stringify(body)}`,
		);
	});

	if (failures > 0) {
		process.stderr.write(`\n--- server log ---\n${serverLog.join('')}--- end log ---\n`);
		fatal(`${failures} probe(s) failed`);
	}

	process.stdout.write(`smoke: all probes passed\n`);
	shutdown(0);
}

main().catch((err) => {
	process.stderr.write(serverLog.join(''));
	fatal(err instanceof Error ? err.stack || err.message : String(err));
});
