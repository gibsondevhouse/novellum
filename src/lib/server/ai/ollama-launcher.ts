/**
 * Ollama daemon launcher.
 *
 * Novellum auto-starts the local Ollama daemon when the user activates
 * the Ollama provider, so the experience is "select Ollama → pick a
 * model → write" — no terminal required.
 *
 * Strategy:
 *   1. If something already answers on `${baseUrl}/api/tags`, do nothing.
 *   2. Otherwise locate the `ollama` binary on PATH or in standard
 *      install locations (Homebrew, Linux package, Windows installer).
 *   3. Spawn `ollama serve` with `OLLAMA_HOST` derived from the
 *      configured base URL.
 *   4. Poll `/api/tags` until the daemon answers (or timeout).
 *
 * Lifecycle: the spawned child is tracked on `globalThis` (so Vite HMR
 * doesn't fork duplicates in dev) and killed on Node `exit` /
 * `SIGINT` / `SIGTERM`. If the user already had `ollama serve` running
 * before launching Novellum, we never spawn anything and won't touch
 * their daemon.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { access, constants } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const READY_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 250;
const PROBE_TIMEOUT_MS = 1_500;

interface LauncherState {
	child: ChildProcess | null;
	inflight: Promise<EnsureResult> | null;
}

const STATE_KEY = '__novellum_ollama_launcher__';

function getState(): LauncherState {
	const g = globalThis as unknown as Record<string, LauncherState | undefined>;
	if (!g[STATE_KEY]) {
		const state: LauncherState = { child: null, inflight: null };
		g[STATE_KEY] = state;
		// Best-effort cleanup on shutdown.
		const kill = () => {
			if (state.child && !state.child.killed) {
				try {
					state.child.kill('SIGTERM');
				} catch {
					/* ignore */
				}
			}
		};
		process.once('exit', kill);
		process.once('SIGINT', () => {
			kill();
			process.exit(130);
		});
		process.once('SIGTERM', () => {
			kill();
			process.exit(143);
		});
	}
	return g[STATE_KEY]!;
}

export type EnsureResult =
	| { ok: true; alreadyRunning: boolean }
	| { ok: false; reason: 'not_installed' | 'spawn_failed' | 'timeout'; message: string };

/**
 * Ensure the Ollama daemon is reachable on `baseUrl`. Idempotent and
 * safe to call repeatedly — concurrent calls share a single in-flight
 * start operation.
 */
export async function ensureOllamaRunning(baseUrl: string): Promise<EnsureResult> {
	const state = getState();

	// Coalesce concurrent callers into a single ensure operation. This
	// must be checked synchronously (no await in front of it) so that
	// two parallel callers can't both race past the gate.
	if (state.inflight) return state.inflight;

	const promise = doEnsure(baseUrl).finally(() => {
		state.inflight = null;
	});
	state.inflight = promise;
	return promise;
}

async function doEnsure(baseUrl: string): Promise<EnsureResult> {
	if (await isReachable(baseUrl)) {
		return { ok: true, alreadyRunning: true };
	}
	return startAndWait(baseUrl);
}

async function startAndWait(baseUrl: string): Promise<EnsureResult> {
	const state = getState();
	const bin = await findOllamaBinary();
	if (!bin) {
		return {
			ok: false,
			reason: 'not_installed',
			message:
				'Could not find the Ollama executable. Install Ollama from https://ollama.com and try again.',
		};
	}

	const host = deriveOllamaHost(baseUrl);
	try {
		const child = spawn(bin, ['serve'], {
			env: { ...process.env, OLLAMA_HOST: host },
			stdio: 'ignore',
			detached: false,
			windowsHide: true,
		});
		child.on('exit', () => {
			if (state.child === child) state.child = null;
		});
		// Don't crash the parent process when the child errors before we
		// finish wiring listeners.
		child.on('error', () => {
			if (state.child === child) state.child = null;
		});
		state.child = child;
	} catch (err) {
		return {
			ok: false,
			reason: 'spawn_failed',
			message: err instanceof Error ? err.message : 'Failed to start Ollama.',
		};
	}

	const deadline = Date.now() + READY_TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (await isReachable(baseUrl)) {
			return { ok: true, alreadyRunning: false };
		}
		// Bail early if the child already died.
		if (state.child?.exitCode !== null && state.child?.exitCode !== undefined) {
			return {
				ok: false,
				reason: 'spawn_failed',
				message: `Ollama exited immediately (code ${state.child.exitCode}).`,
			};
		}
		await delay(POLL_INTERVAL_MS);
	}

	return {
		ok: false,
		reason: 'timeout',
		message: 'Ollama daemon did not become ready in time.',
	};
}

async function isReachable(baseUrl: string): Promise<boolean> {
	try {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
		const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/tags`, {
			signal: ctrl.signal,
		});
		clearTimeout(timer);
		return res.ok;
	} catch {
		return false;
	}
}

function deriveOllamaHost(baseUrl: string): string {
	try {
		const url = new URL(baseUrl);
		const port = url.port || '11434';
		return `${url.hostname}:${port}`;
	} catch {
		return '127.0.0.1:11434';
	}
}

const CANDIDATE_PATHS: string[] = (() => {
	const paths = [
		'/usr/local/bin/ollama',
		'/opt/homebrew/bin/ollama',
		'/usr/bin/ollama',
		'/snap/bin/ollama',
	];
	const home = homedir();
	if (home) {
		paths.push(join(home, '.ollama', 'bin', 'ollama'));
		paths.push(join(home, 'AppData', 'Local', 'Programs', 'Ollama', 'ollama.exe'));
	}
	if (process.platform === 'win32') {
		paths.push('C:\\Program Files\\Ollama\\ollama.exe');
	}
	if (process.platform === 'darwin') {
		paths.push('/Applications/Ollama.app/Contents/Resources/ollama');
		paths.push('/Applications/Ollama.app/Contents/MacOS/ollama');
	}
	return paths;
})();

async function findOllamaBinary(): Promise<string | null> {
	// 1. PATH wins — covers Homebrew (intel/arm), apt, scoop, manual installs.
	const fromPath = await which('ollama');
	if (fromPath) return fromPath;

	// 2. Known install locations.
	for (const candidate of CANDIDATE_PATHS) {
		if (await isExecutable(candidate)) return candidate;
	}
	return null;
}

async function isExecutable(path: string): Promise<boolean> {
	try {
		await access(path, constants.X_OK);
		return true;
	} catch {
		return false;
	}
}

async function which(command: string): Promise<string | null> {
	const pathEnv = process.env.PATH ?? '';
	if (!pathEnv) return null;
	const sep = process.platform === 'win32' ? ';' : ':';
	const exts =
		process.platform === 'win32'
			? (process.env.PATHEXT ?? '.EXE;.BAT;.CMD').split(';')
			: [''];
	for (const dir of pathEnv.split(sep)) {
		if (!dir) continue;
		for (const ext of exts) {
			const candidate = join(dir, `${command}${ext.toLowerCase()}`);
			if (await isExecutable(candidate)) return candidate;
		}
	}
	return null;
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
