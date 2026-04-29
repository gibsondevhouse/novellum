import { describe, it, expect } from 'vitest';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import {
	describeDatabaseLocation,
	resolveAppDataDirectory,
	resolveDatabasePath,
} from '../../src/lib/server/db/path.js';

/**
 * plan-017 stage-006 phase-001: the database path resolver must be a
 * pure function of the environment. These tests pin its behaviour
 * across every documented mode so client.ts can rely on it.
 */

describe('resolveDatabasePath', () => {
	it('honours an explicit NOVELLUM_DB_PATH override above all else', () => {
		const path = resolveDatabasePath({
			NOVELLUM_DB_PATH: '/tmp/forced.db',
			NODE_ENV: 'production',
			NOVELLUM_PACKAGING_MODE: 'desktop',
			VITEST: 'true',
		});
		expect(path).toBe('/tmp/forced.db');
	});

	it('returns :memory: in test mode (VITEST=true)', () => {
		const path = resolveDatabasePath({ VITEST: 'true' });
		expect(path).toBe(':memory:');
	});

	it('returns :memory: when NODE_ENV=test', () => {
		const path = resolveDatabasePath({ NODE_ENV: 'test' });
		expect(path).toBe(':memory:');
	});

	it('falls back to ./novellum.db in dev mode', () => {
		const path = resolveDatabasePath({ NODE_ENV: 'development' });
		expect(path).toBe('./novellum.db');
	});

	it('uses the OS-conventional location in desktop mode', () => {
		const path = resolveDatabasePath({ NOVELLUM_PACKAGING_MODE: 'desktop' });
		const expected = join(resolveAppDataDirectory({ NOVELLUM_PACKAGING_MODE: 'desktop' }), 'novellum.db');
		expect(path).toBe(expected);
	});

	it('treats NODE_ENV=production as desktop when no explicit mode is set', () => {
		const path = resolveDatabasePath({ NODE_ENV: 'production' });
		const expected = join(resolveAppDataDirectory({ NODE_ENV: 'production' }), 'novellum.db');
		expect(path).toBe(expected);
	});
});

describe('resolveAppDataDirectory', () => {
	it('honours NOVELLUM_APP_DATA_DIR above all else', () => {
		expect(resolveAppDataDirectory({ NOVELLUM_APP_DATA_DIR: '/custom/dir' })).toBe('/custom/dir');
	});

	it('matches the current platform convention when no override is set', () => {
		const dir = resolveAppDataDirectory({});
		const home = homedir();

		switch (platform()) {
			case 'darwin':
				expect(dir).toBe(join(home, 'Library', 'Application Support', 'Novellum'));
				break;
			case 'win32':
				// APPDATA is normally set on Windows; the fallback path is asserted in
				// the next test.
				expect(dir.endsWith(join('Novellum'))).toBe(true);
				break;
			default:
				expect(dir).toBe(join(home, '.local', 'share', 'Novellum'));
		}
	});

	it('falls back to ~/AppData/Roaming on Windows when APPDATA is unset', () => {
		if (platform() !== 'win32') return;
		const dir = resolveAppDataDirectory({ APPDATA: '' });
		expect(dir).toBe(join(homedir(), 'AppData', 'Roaming', 'Novellum'));
	});

	it('honours XDG_DATA_HOME on Linux when set', () => {
		if (platform() === 'darwin' || platform() === 'win32') return;
		const dir = resolveAppDataDirectory({ XDG_DATA_HOME: '/xdg/share' });
		expect(dir).toBe(join('/xdg/share', 'Novellum'));
	});
});

describe('describeDatabaseLocation', () => {
	it('reports override mode when NOVELLUM_DB_PATH is set', () => {
		const info = describeDatabaseLocation({ NOVELLUM_DB_PATH: '/tmp/x.db' });
		expect(info.mode).toBe('override');
		expect(info.databasePath).toBe('/tmp/x.db');
	});

	it('reports test, desktop, and dev modes accurately', () => {
		expect(describeDatabaseLocation({ VITEST: 'true' }).mode).toBe('test');
		expect(describeDatabaseLocation({ NOVELLUM_PACKAGING_MODE: 'desktop' }).mode).toBe('desktop');
		expect(describeDatabaseLocation({ NODE_ENV: 'development' }).mode).toBe('dev');
	});
});
