import { db } from '$lib/server/db/index.js';

/**
 * SQLite-canonical store for project-scoped planning sidecars.
 *
 * Holds JSON blobs keyed by (projectId, scope, ownerId, key). Scopes
 * are 'scene' | 'chapter' | 'project'. Used for:
 *  - scene clarity / quick-intent / outline form fields
 *  - chapter clarity / outline form fields / beat lists
 *
 * Values are JSON-serialized strings; service handles encoding.
 */

export type MetadataScope = 'scene' | 'chapter' | 'project';

interface MetadataRow {
	projectId: string;
	scope: string;
	ownerId: string;
	key: string;
	value: string;
	updatedAt: string;
}

export function getProjectMetadata<T>(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
	key: string,
): T | undefined {
	const row = db
		.prepare<{ projectId: string; scope: string; ownerId: string; key: string }, MetadataRow>(
			'SELECT * FROM project_metadata WHERE projectId = $projectId AND scope = $scope AND ownerId = $ownerId AND key = $key',
		)
		.get({ projectId, scope, ownerId, key });
	if (!row) return undefined;
	try {
		return JSON.parse(row.value) as T;
	} catch {
		return undefined;
	}
}

export function listProjectMetadata(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
): Record<string, unknown> {
	const rows = db
		.prepare<{ projectId: string; scope: string; ownerId: string }, MetadataRow>(
			'SELECT * FROM project_metadata WHERE projectId = $projectId AND scope = $scope AND ownerId = $ownerId',
		)
		.all({ projectId, scope, ownerId });
	const out: Record<string, unknown> = {};
	for (const row of rows) {
		try {
			out[row.key] = JSON.parse(row.value);
		} catch {
			/* skip malformed */
		}
	}
	return out;
}

export function setProjectMetadata<T>(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
	key: string,
	value: T,
): void {
	const updatedAt = new Date().toISOString();
	const encoded = JSON.stringify(value);
	db.prepare(
		`INSERT INTO project_metadata (projectId, scope, ownerId, key, value, updatedAt)
		 VALUES ($projectId, $scope, $ownerId, $key, $value, $updatedAt)
		 ON CONFLICT(projectId, scope, ownerId, key) DO UPDATE SET
			value = excluded.value,
			updatedAt = excluded.updatedAt`,
	).run({ projectId, scope, ownerId, key, value: encoded, updatedAt });
}

export function deleteProjectMetadata(
	projectId: string,
	scope: MetadataScope,
	ownerId: string,
	key: string,
): void {
	db.prepare(
		'DELETE FROM project_metadata WHERE projectId = $projectId AND scope = $scope AND ownerId = $ownerId AND key = $key',
	).run({ projectId, scope, ownerId, key });
}
