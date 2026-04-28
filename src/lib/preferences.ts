/**
 * Client-side helper for the SQLite-backed app_preferences store.
 *
 * Use this instead of `localStorage` for any app-level UI/UX state.
 *
 * - `getPreference<T>(key, defaultValue)` returns the stored value or the
 *   default if the key is missing or the request fails.
 * - `setPreference<T>(key, value)` persists a JSON-serializable value.
 * - `deletePreference(key)` removes a preference.
 *
 * SSR-safe: during server rendering, all calls short-circuit to the
 * default (or `undefined`) without throwing.
 */

const PREF_PATH = '/api/db/preferences';

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof fetch !== 'undefined';
}

export async function getPreference<T>(key: string, defaultValue: T): Promise<T> {
	if (!isBrowser()) return defaultValue;
	try {
		const res = await fetch(`${PREF_PATH}/${encodeURIComponent(key)}`, { method: 'GET' });
		if (!res.ok) return defaultValue;
		const body = (await res.json()) as { value: unknown };
		if (body.value === null || body.value === undefined) return defaultValue;
		return body.value as T;
	} catch {
		return defaultValue;
	}
}

export async function setPreference<T>(key: string, value: T): Promise<void> {
	if (!isBrowser()) return;
	try {
		await fetch(`${PREF_PATH}/${encodeURIComponent(key)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ value }),
		});
	} catch {
		/* swallow — preferences are best-effort; failures must never block UX */
	}
}

export async function deletePreference(key: string): Promise<void> {
	if (!isBrowser()) return;
	try {
		await fetch(`${PREF_PATH}/${encodeURIComponent(key)}`, { method: 'DELETE' });
	} catch {
		/* swallow */
	}
}
