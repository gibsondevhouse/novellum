import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { getPreference } from '$lib/server/preferences/preferences-service.js';

type HomePage = 'library' | 'last-read' | 'last-project';
type ReaderModePref = { mode?: string; lastBookId?: string | null };
type ProjectRow = { id: string };

/**
 * Server-side root-route loader.
 *
 * Honors the user's `app.defaults.homePage` preference and redirects
 * accordingly. Best-effort: if the preferred destination cannot be
 * resolved (DB error, missing record, malformed pref), silently falls
 * back to the library (`/`, no redirect).
 *
 * The sidebar Home button passes `?home=1` to bypass this redirect so
 * clicking Home always lands on the library, regardless of the user's
 * preferred launch destination.
 *
 * NOTE: SvelteKit's `redirect()` works by throwing — the surrounding
 * `try/catch` blocks below isolate **only** the I/O calls, and the
 * `throw redirect(...)` lives outside them.
 */
export const load: ServerLoad = async ({ url }) => {
	// Sidebar Home button explicitly opts out of the launch-time redirect.
	if (url.searchParams.has('home')) return {};

	let pref: HomePage = 'library';
	try {
		const stored = getPreference<HomePage>('app.defaults.homePage');
		if (stored === 'library' || stored === 'last-read' || stored === 'last-project') {
			pref = stored;
		}
	} catch {
		/* swallow — best-effort, fall back to library */
	}

	if (pref === 'library') return {};

	if (pref === 'last-read') {
		let target: string | null = null;
		try {
			const remote = getPreference<ReaderModePref>('app.readerMode');
			if (remote?.lastBookId && typeof remote.lastBookId === 'string') {
				target = remote.lastBookId;
			}
		} catch {
			/* swallow — best-effort, fall back to library */
		}
		if (target) {
			let exists = false;
			try {
				const row = db
					.prepare('SELECT id FROM projects WHERE id = $id LIMIT 1')
					.get({ id: target }) as ProjectRow | undefined;
				exists = Boolean(row?.id);
			} catch {
				/* swallow — best-effort, fall back to library */
			}
			if (exists) throw redirect(307, `/books/${target}`);
		}
		return {};
	}

	if (pref === 'last-project') {
		let target: string | null = null;
		try {
			const row = db
				.prepare(
					"SELECT id FROM projects WHERE lastOpenedAt != '' ORDER BY lastOpenedAt DESC LIMIT 1",
				)
				.get() as ProjectRow | undefined;
			if (row?.id) target = row.id;
		} catch {
			/* swallow — best-effort, fall back to library */
		}
		if (target) throw redirect(307, `/projects/${target}`);
		return {};
	}

	return {};
};
