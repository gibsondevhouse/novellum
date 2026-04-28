import { describe, it, expect, vi } from 'vitest';
import {
	deleteKey,
	getStatus,
	migrateLegacyLocalStorage,
	saveKey,
	testKey,
	LEGACY_LOCALSTORAGE_KEY_NAME,
	MIGRATION_FLAG_KEY_NAME,
} from '../../src/lib/ai/credential-service.js';

const SENTINEL = 'sk-or-v1-TEST-SENTINEL-12345678';

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

class MemoryStorage implements Storage {
	private map = new Map<string, string>();
	get length() {
		return this.map.size;
	}
	clear() {
		this.map.clear();
	}
	key(i: number) {
		return Array.from(this.map.keys())[i] ?? null;
	}
	getItem(k: string) {
		return this.map.get(k) ?? null;
	}
	setItem(k: string, v: string) {
		this.map.set(k, v);
	}
	removeItem(k: string) {
		this.map.delete(k);
	}
}

describe('frontend credential-service client', () => {
	describe('getStatus', () => {
		it('GETs /api/settings/ai-status with providerId query', async () => {
			const f = vi.fn().mockResolvedValue(
				jsonResponse({
					providerId: 'openrouter',
					configured: true,
					lastVerifiedAt: null,
					maskedHint: '***5678',
					savedAt: '2026-04-28T00:00:00Z',
				}),
			);
			const status = await getStatus('openrouter', { fetch: f });
			expect(status.maskedHint).toBe('***5678');
			expect(f.mock.calls[0][0]).toBe('/api/settings/ai-status?providerId=openrouter');
		});

		it('throws on non-2xx', async () => {
			const f = vi
				.fn()
				.mockResolvedValue(jsonResponse({ error: { message: 'boom' } }, 500));
			await expect(getStatus('openrouter', { fetch: f })).rejects.toThrow(/boom/);
		});
	});

	describe('saveKey', () => {
		it('POSTs action=save with providerId and apiKey', async () => {
			const f = vi.fn().mockResolvedValue(
				jsonResponse({
					providerId: 'openrouter',
					configured: true,
					maskedHint: '***5678',
					lastVerifiedAt: null,
					savedAt: '2026-04-28',
				}),
			);
			const status = await saveKey('openrouter', SENTINEL, { fetch: f });
			expect(status.configured).toBe(true);
			const init = f.mock.calls[0][1];
			expect(init.method).toBe('POST');
			expect(JSON.parse(init.body)).toEqual({
				providerId: 'openrouter',
				apiKey: SENTINEL,
				action: 'save',
			});
		});
	});

	describe('deleteKey', () => {
		it('POSTs action=delete', async () => {
			const f = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
			await deleteKey('openrouter', { fetch: f });
			expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({
				providerId: 'openrouter',
				action: 'delete',
			});
		});
	});

	describe('testKey', () => {
		it('POSTs action=test and returns the result body', async () => {
			const f = vi.fn().mockResolvedValue(jsonResponse({ ok: true, verifiedAt: '2026-04-28' }));
			const result = await testKey('openrouter', { fetch: f });
			expect(result).toEqual({ ok: true, verifiedAt: '2026-04-28' });
		});
	});

	describe('migrateLegacyLocalStorage', () => {
		it('returns no_storage when no Storage available', async () => {
			const result = await migrateLegacyLocalStorage({ storage: undefined as unknown as Storage });
			expect(result.migrated).toBe(false);
		});

		it('skips when migration already attempted', async () => {
			const storage = new MemoryStorage();
			storage.setItem(MIGRATION_FLAG_KEY_NAME, 'true');
			storage.setItem(LEGACY_LOCALSTORAGE_KEY_NAME, SENTINEL);
			const f = vi.fn();
			const result = await migrateLegacyLocalStorage({ storage, fetch: f });
			expect(result).toEqual({ migrated: false, reason: 'already_attempted' });
			expect(f).not.toHaveBeenCalled();
			expect(storage.getItem(LEGACY_LOCALSTORAGE_KEY_NAME)).toBe(SENTINEL);
		});

		it('marks attempted and returns no_legacy_key when nothing to migrate', async () => {
			const storage = new MemoryStorage();
			const f = vi.fn();
			const result = await migrateLegacyLocalStorage({ storage, fetch: f });
			expect(result).toEqual({ migrated: false, reason: 'no_legacy_key' });
			expect(storage.getItem(MIGRATION_FLAG_KEY_NAME)).toBe('true');
			expect(f).not.toHaveBeenCalled();
		});

		it('uploads key, clears legacy entry, sets migration flag', async () => {
			const storage = new MemoryStorage();
			storage.setItem(LEGACY_LOCALSTORAGE_KEY_NAME, SENTINEL);
			const f = vi.fn().mockResolvedValue(
				jsonResponse({
					providerId: 'openrouter',
					configured: true,
					maskedHint: '***5678',
					lastVerifiedAt: null,
					savedAt: '2026-04-28',
				}),
			);

			const result = await migrateLegacyLocalStorage({ storage, fetch: f });

			expect(result).toEqual({ migrated: true });
			expect(storage.getItem(LEGACY_LOCALSTORAGE_KEY_NAME)).toBeNull();
			expect(storage.getItem(MIGRATION_FLAG_KEY_NAME)).toBe('true');
			const body = JSON.parse(f.mock.calls[0][1].body);
			expect(body.apiKey).toBe(SENTINEL);
		});

		it('does NOT clear the legacy key on a failed POST', async () => {
			const storage = new MemoryStorage();
			storage.setItem(LEGACY_LOCALSTORAGE_KEY_NAME, SENTINEL);
			const f = vi.fn().mockResolvedValue(jsonResponse({ error: { message: 'down' } }, 500));

			const result = await migrateLegacyLocalStorage({ storage, fetch: f });

			expect(result.migrated).toBe(false);
			expect(storage.getItem(LEGACY_LOCALSTORAGE_KEY_NAME)).toBe(SENTINEL);
			expect(storage.getItem(MIGRATION_FLAG_KEY_NAME)).toBeNull();
		});
	});
});
