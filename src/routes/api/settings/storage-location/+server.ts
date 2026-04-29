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

	// `:memory:` has no filesystem location; prefer the app-data dir
	// for the free-space probe so the answer is still useful in test
	// mode.
	const probe = dbInfo.databasePath === ':memory:' ? dirInfo.appDataDir : dirInfo.appDataDir;
	const diskSpace = await readDiskSpace(probe);

	return json({
		mode: dirInfo.mode,
		databasePath: dbInfo.databasePath,
		appDataDirectory: dirInfo.appDataDir,
		backupDirectory: dirInfo.backupDirectory,
		logDirectory: dirInfo.logDirectory,
		diskSpace,
	});
};
