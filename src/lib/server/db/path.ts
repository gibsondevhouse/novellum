import { homedir, platform } from 'node:os';
import { join } from 'node:path';

/**
 * Mode-aware filesystem path resolution for the Novellum SQLite
 * database and the broader app data directory it lives inside.
 *
 * The resolution order is intentionally explicit so dev/test/desktop
 * behaviour is auditable and overridable from a single place.
 *
 * Resolution order:
 *
 *   1. Explicit override via `NOVELLUM_DB_PATH` (always wins).
 *   2. Test mode (`VITEST === 'true'`) → `:memory:`.
 *   3. Desktop mode (`NOVELLUM_PACKAGING_MODE === 'desktop'` or, as a
 *      soft fallback, `NODE_ENV === 'production'`) → OS-conventional
 *      application data directory.
 *   4. Dev fallback → `./novellum.db`.
 *
 * The functions are pure (no I/O at import time). Phase-002 of
 * stage-006 layers directory creation and permission handling on top.
 */

const APP_DIRNAME = 'Novellum';
const DB_FILENAME = 'novellum.db';

type Env = NodeJS.ProcessEnv;

function isTestMode(env: Env): boolean {
	return env.VITEST === 'true' || env.NODE_ENV === 'test';
}

function isDesktopMode(env: Env): boolean {
	if (env.NOVELLUM_PACKAGING_MODE === 'desktop') return true;
	// Soft fallback: production builds with no explicit packaging mode
	// behave as desktop for path resolution. Dev (NODE_ENV !== 'production')
	// keeps the project-relative './novellum.db' for ergonomics.
	return env.NODE_ENV === 'production';
}

/**
 * Resolves the OS-conventional application data directory for desktop
 * mode. Prefers documented platform conventions and falls back to a
 * `~/.<app>` style path when an environment variable is missing.
 */
export function resolveAppDataDirectory(env: Env = process.env): string {
	if (env.NOVELLUM_APP_DATA_DIR) return env.NOVELLUM_APP_DATA_DIR;

	const home = homedir();
	const plat = platform();

	if (plat === 'darwin') {
		return join(home, 'Library', 'Application Support', APP_DIRNAME);
	}

	if (plat === 'win32') {
		const appData = env.APPDATA ?? join(home, 'AppData', 'Roaming');
		return join(appData, APP_DIRNAME);
	}

	// Linux / *BSD / others — XDG default with a sensible fallback.
	const xdg = env.XDG_DATA_HOME && env.XDG_DATA_HOME.trim().length > 0
		? env.XDG_DATA_HOME
		: join(home, '.local', 'share');
	return join(xdg, APP_DIRNAME);
}

/**
 * Resolves the SQLite database path for the current process.
 *
 * The returned string is whatever `better-sqlite3` should be handed
 * directly — it can be `':memory:'`, a project-relative path, or an
 * absolute OS-conventional path.
 */
export function resolveDatabasePath(env: Env = process.env): string {
	if (env.NOVELLUM_DB_PATH && env.NOVELLUM_DB_PATH.length > 0) {
		return env.NOVELLUM_DB_PATH;
	}
	if (isTestMode(env)) {
		return ':memory:';
	}
	if (isDesktopMode(env)) {
		return join(resolveAppDataDirectory(env), DB_FILENAME);
	}
	return './novellum.db';
}

/**
 * Inspect helper for diagnostics and the storage-settings readout
 * (phase-003). Returns the resolved values **and** the mode that
 * produced them so the UI can label "running in dev/test/desktop".
 */
export function describeDatabaseLocation(env: Env = process.env): {
	mode: 'override' | 'test' | 'desktop' | 'dev';
	databasePath: string;
	appDataDirectory: string;
} {
	let mode: 'override' | 'test' | 'desktop' | 'dev';
	if (env.NOVELLUM_DB_PATH && env.NOVELLUM_DB_PATH.length > 0) mode = 'override';
	else if (isTestMode(env)) mode = 'test';
	else if (isDesktopMode(env)) mode = 'desktop';
	else mode = 'dev';

	return {
		mode,
		databasePath: resolveDatabasePath(env),
		appDataDirectory: resolveAppDataDirectory(env),
	};
}
