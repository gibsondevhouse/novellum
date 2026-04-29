import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import {
	describeAppDataLocation,
	ensureAppDataDirectory,
	getAppDataDirectoryMode,
	resolveAppDataDir,
	resolveBackupDirectory,
	resolveLogDirectory,
} from '../../src/lib/server/app-data/path.js';

/**
 * plan-017 stage-006 phase-002 — active app data directory resolver.
 */

const cleanups: string[] = [];

function makeDir() {
	const dir = mkdtempSync(join(tmpdir(), 'novellum-appdata-'));
	cleanups.push(dir);
	return dir;
}

afterEach(() => {
	while (cleanups.length) {
		const dir = cleanups.pop();
		if (dir) rmSync(dir, { recursive: true, force: true });
	}
});

describe('resolveAppDataDir', () => {
	it('honours an explicit NOVELLUM_APP_DATA_DIR override above all else', () => {
		expect(
			resolveAppDataDir({
				NOVELLUM_APP_DATA_DIR: '/forced',
				NODE_ENV: 'production',
				NOVELLUM_PACKAGING_MODE: 'desktop',
				VITEST: 'true',
			}),
		).toBe('/forced');
	});

	it('returns a stable temp path in test mode', () => {
		const dir = resolveAppDataDir({ VITEST: 'true' });
		expect(dir).toBe(join(tmpdir(), 'novellum-tests'));
	});

	it('falls back to ~/.novellum in dev mode', () => {
		expect(resolveAppDataDir({ NODE_ENV: 'development' })).toBe(join(homedir(), '.novellum'));
	});

	it('uses the OS-conventional location in desktop mode', () => {
		const dir = resolveAppDataDir({ NOVELLUM_PACKAGING_MODE: 'desktop', HOME: homedir() });
		expect(dir.endsWith('Novellum')).toBe(true);
	});
});

describe('resolveBackupDirectory / resolveLogDirectory', () => {
	it('returns the appData/backups subfolder', () => {
		expect(resolveBackupDirectory({ NOVELLUM_APP_DATA_DIR: '/x' })).toBe(join('/x', 'backups'));
	});
	it('returns the appData/logs subfolder', () => {
		expect(resolveLogDirectory({ NOVELLUM_APP_DATA_DIR: '/x' })).toBe(join('/x', 'logs'));
	});
});

describe('ensureAppDataDirectory', () => {
	it('creates the directory if it does not exist', async () => {
		const root = makeDir();
		const target = join(root, 'nested', 'app');
		await ensureAppDataDirectory({ NOVELLUM_APP_DATA_DIR: target });
		expect(statSync(target).isDirectory()).toBe(true);
	});

	it('applies 0700 perms on POSIX', async () => {
		if (process.platform === 'win32') return;
		const target = join(makeDir(), 'app');
		await ensureAppDataDirectory({ NOVELLUM_APP_DATA_DIR: target });
		const mode = await getAppDataDirectoryMode({ NOVELLUM_APP_DATA_DIR: target });
		expect(mode).toBe(0o700);
	});

	it('is idempotent — calling twice does not throw', async () => {
		const target = join(makeDir(), 'app');
		await ensureAppDataDirectory({ NOVELLUM_APP_DATA_DIR: target });
		await ensureAppDataDirectory({ NOVELLUM_APP_DATA_DIR: target });
		expect(statSync(target).isDirectory()).toBe(true);
	});

	it('returns null mode when the directory does not exist', async () => {
		const target = join(makeDir(), 'never-created');
		expect(await getAppDataDirectoryMode({ NOVELLUM_APP_DATA_DIR: target })).toBeNull();
	});
});

describe('describeAppDataLocation', () => {
	it('reports each mode accurately', () => {
		expect(describeAppDataLocation({ NOVELLUM_APP_DATA_DIR: '/x' }).mode).toBe('override');
		expect(describeAppDataLocation({ VITEST: 'true' }).mode).toBe('test');
		expect(describeAppDataLocation({ NOVELLUM_PACKAGING_MODE: 'desktop' }).mode).toBe('desktop');
		expect(describeAppDataLocation({ NODE_ENV: 'development' }).mode).toBe('dev');
	});

	it('returns matching subfolders alongside the active directory', () => {
		const info = describeAppDataLocation({ NOVELLUM_APP_DATA_DIR: '/x' });
		expect(info.appDataDir).toBe('/x');
		expect(info.backupDirectory).toBe(join('/x', 'backups'));
		expect(info.logDirectory).toBe(join('/x', 'logs'));
	});
});
