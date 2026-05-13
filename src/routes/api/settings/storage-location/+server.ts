import { json } from '@sveltejs/kit';
import { statfs } from 'node:fs/promises';
import type { RequestHandler } from './$types';
import { describeDatabaseLocation } from '$lib/server/db/path.js';
import { describeAppDataLocation } from '$lib/server/app-data/path.js';

interface DiskSpace {
	bytesFree: number;
	bytesTotal: number;
}

/**
 * Best-effort free-space estimate. `fs.statfs` is supported on macOS,
 * Linux, and Windows in Node 18.15+, but can fail on unusual mounts
 * (e.g. tmpfs in CI). The route is read-only and never raises — it
 * returns `null` for the disk-space block instead.
 */
async function readDiskSpace(path: string): Promise<DiskSpace | null> {
	try {
		const s = await statfs(path);
		const bytesTotal = s.blocks * s.bsize;
		const bytesFree = s.bavail * s.bsize;
		return { bytesFree, bytesTotal };
	} catch {
		return null;
	}
}

export const GET: RequestHandler = async () => {
	const dbInfo = describeDatabaseLocation();
	const dirInfo = describeAppDataLocation();

	// `:memory:` has no filesystem location; the app-data dir is the
	// useful probe in every mode (its parent volume is what fills up
	// when projects, backups, and snapshots grow).
	const diskSpace = await readDiskSpace(dirInfo.appDataDir);

	return json({
		mode: dirInfo.mode,
		databasePath: dbInfo.databasePath,
		appDataDirectory: dirInfo.appDataDir,
		backupDirectory: dirInfo.backupDirectory,
		logDirectory: dirInfo.logDirectory,
		diskSpace,
	});
};
