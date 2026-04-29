import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { chmod, mkdir, stat } from 'node:fs/promises';
import { resolveAppDataDirectory } from '$lib/server/db/path.js';

/**
 * Active application data directory for the current process.
 *
 * Resolution order — keep in sync with `resolveDatabasePath` in
 * `src/lib/server/db/path.ts`:
 *
 *   1. Explicit `NOVELLUM_APP_DATA_DIR` override.
 *   2. Test mode (`VITEST=true` or `NODE_ENV=test`) → a stable temp
 *      directory under `os.tmpdir()`. Tests that need isolation
 *      should still pass an explicit override per case.
 *   3. Desktop mode (`NOVELLUM_PACKAGING_MODE=desktop` or
 *      `NODE_ENV=production`) → `resolveAppDataDirectory(env)`
 *      (OS-conventional path).
 *   4. Dev fallback → `${homedir()}/.novellum` (preserves the V0
 *      secure-store location so an existing `credentials.json`
 *      keeps loading after this refactor).
 *
 * The resolver is pure — no I/O happens here. Use
 * {@link ensureAppDataDirectory} when the caller actually needs the
 * directory to exist on disk.
 */

type Env = NodeJS.ProcessEnv;

const TEST_DIR_BASENAME = 'novellum-tests';
const DEV_DIR_BASENAME = '.novellum';

function isTestMode(env: Env): boolean {
	return env.VITEST === 'true' || env.NODE_ENV === 'test';
}

function isDesktopMode(env: Env): boolean {
	if (env.NOVELLUM_PACKAGING_MODE === 'desktop') return true;
	return env.NODE_ENV === 'production';
}

export function resolveAppDataDir(env: Env = process.env): string {
	if (env.NOVELLUM_APP_DATA_DIR && env.NOVELLUM_APP_DATA_DIR.length > 0) {
		return env.NOVELLUM_APP_DATA_DIR;
	}
	if (isTestMode(env)) {
		return join(tmpdir(), TEST_DIR_BASENAME);
	}
	if (isDesktopMode(env)) {
		return resolveAppDataDirectory(env);
	}
	return join(homedir(), DEV_DIR_BASENAME);
}

export function resolveBackupDirectory(env: Env = process.env): string {
	return join(resolveAppDataDir(env), 'backups');
}

export function resolveLogDirectory(env: Env = process.env): string {
	return join(resolveAppDataDir(env), 'logs');
}

/**
 * Creates the active app-data directory if it does not already exist
 * and applies 0700 permissions on POSIX. Idempotent — safe to call on
 * every server boot.
 */
export async function ensureAppDataDirectory(env: Env = process.env): Promise<string> {
	const dir = resolveAppDataDir(env);
	await mkdir(dir, { recursive: true });
	if (process.platform !== 'win32') {
		try {
			await chmod(dir, 0o700);
		} catch {
			// chmod can fail on shared CI volumes (e.g. tmpfs); don't surface
			// a hard error from a best-effort security tightening.
		}
	}
	return dir;
}

/**
 * Returns the active POSIX mode of the resolved app-data directory, or
 * `null` if the directory does not yet exist. Useful for runbooks and
 * the storage-location settings readout.
 */
export async function getAppDataDirectoryMode(env: Env = process.env): Promise<number | null> {
	try {
		const s = await stat(resolveAppDataDir(env));
		return s.mode & 0o777;
	} catch {
		return null;
	}
}

/**
 * Inspect helper — used by the storage-location settings route. Mirrors
 * `describeDatabaseLocation` so the UI can show one cohesive panel.
 */
export function describeAppDataLocation(env: Env = process.env): {
	mode: 'override' | 'test' | 'desktop' | 'dev';
	appDataDir: string;
	backupDirectory: string;
	logDirectory: string;
} {
	let mode: 'override' | 'test' | 'desktop' | 'dev';
	if (env.NOVELLUM_APP_DATA_DIR && env.NOVELLUM_APP_DATA_DIR.length > 0) mode = 'override';
	else if (isTestMode(env)) mode = 'test';
	else if (isDesktopMode(env)) mode = 'desktop';
	else mode = 'dev';

	return {
		mode,
		appDataDir: resolveAppDataDir(env),
		backupDirectory: resolveBackupDirectory(env),
		logDirectory: resolveLogDirectory(env),
	};
}
