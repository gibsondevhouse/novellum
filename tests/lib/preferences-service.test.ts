import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('$lib/server/db/index.js', () => {
	type Row = { key: string; value: string; updatedAt: string };
	const store = new Map<string, Row>();
	const db = {
		prepare(sql: string) {
			const trimmed = sql.replace(/\s+/g, ' ').trim();
			return {
				get(params: { key: string }) {
					return store.get(params.key);
				},
				run(params: { key?: string; value?: string; updatedAt?: string }) {
					if (trimmed.startsWith('INSERT INTO app_preferences')) {
						store.set(params.key as string, {
							key: params.key as string,
							value: params.value as string,
							updatedAt: params.updatedAt as string,
						});
					} else if (trimmed.startsWith('DELETE FROM app_preferences')) {
						store.delete(params.key as string);
					}
					return { changes: 1, lastInsertRowid: 0 };
				},
			};
		},
		__store: store,
	};
	return { db };
});

import {
	getPreference,
	setPreference,
	deletePreference,
} from '$lib/server/preferences/preferences-service.js';

describe('preferences-service', () => {
	beforeEach(async () => {
		const mod = (await import('$lib/server/db/index.js')) as unknown as {
			db: { __store: Map<string, unknown> };
		};
		mod.db.__store.clear();
	});

	it('returns undefined for a missing key', () => {
		expect(getPreference<string>('missing')).toBeUndefined();
	});

	it('round-trips a string value', () => {
		setPreference('theme', 'dark');
		expect(getPreference<string>('theme')).toBe('dark');
	});

	it('round-trips a structured value', () => {
		const payload = { fontSize: 16, paragraphSpacing: 1.4 };
		setPreference('reader-mode', payload);
		expect(getPreference<typeof payload>('reader-mode')).toEqual(payload);
	});

	it('overwrites an existing value', () => {
		setPreference('model', 'old');
		setPreference('model', 'new');
		expect(getPreference<string>('model')).toBe('new');
	});

	it('deletes a key', () => {
		setPreference('flag', true);
		deletePreference('flag');
		expect(getPreference<boolean>('flag')).toBeUndefined();
	});

	it('returns undefined when stored value is malformed', async () => {
		const mod = (await import('$lib/server/db/index.js')) as unknown as {
			db: { __store: Map<string, { key: string; value: string; updatedAt: string }> };
		};
		mod.db.__store.set('bad', { key: 'bad', value: '{not-json', updatedAt: '' });
		expect(getPreference<unknown>('bad')).toBeUndefined();
	});
});
