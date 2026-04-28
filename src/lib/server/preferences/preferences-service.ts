import { db } from '$lib/server/db/index.js';

/**
 * Server-side typed key/value preferences store backed by the `app_preferences`
 * SQLite table. Values are JSON-encoded so callers can store any
 * serializable shape without per-key plumbing.
 *
 * Used for app-level UI/UX state (theme, last-opened project, model
 * selection, reader-mode, onboarding flag). NOT for credentials —
 * see plan-017 stage-005 for the secure credential service.
 */

interface PreferenceRow {
	key: string;
	value: string;
	updatedAt: string;
}

export function getPreference<T>(key: string): T | undefined {
	const row = db
		.prepare<{ key: string }, PreferenceRow>('SELECT key, value, updatedAt FROM app_preferences WHERE key = $key')
		.get({ key });
	if (!row) return undefined;
	try {
		return JSON.parse(row.value) as T;
	} catch {
		return undefined;
	}
}

export function setPreference<T>(key: string, value: T): void {
	const updatedAt = new Date().toISOString();
	const encoded = JSON.stringify(value);
	db.prepare(
		`INSERT INTO app_preferences (key, value, updatedAt)
		 VALUES ($key, $value, $updatedAt)
		 ON CONFLICT(key) DO UPDATE SET
			value = excluded.value,
			updatedAt = excluded.updatedAt`,
	).run({ key, value: encoded, updatedAt });
}

export function deletePreference(key: string): void {
	db.prepare('DELETE FROM app_preferences WHERE key = $key').run({ key });
}
