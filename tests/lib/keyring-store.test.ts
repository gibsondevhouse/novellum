import { describe, it, expect } from 'vitest';
import {
	createKeyringSecureStore,
	type KeyringEntry,
	type KeyringEntryFactory,
} from '$lib/server/credentials/keyring-store.js';
import type { SecureStoreRecord } from '$lib/server/credentials/secure-store.js';

/**
 * Build a fake keyring factory backed by a Map. Mirrors the shape of
 * `@napi-rs/keyring`'s Entry: per (service, account) pair we hand
 * out an object with `getPassword`/`setPassword`/`deletePassword`
 * that mutates a shared store.
 */
function fakeKeyringFactory(): { factory: KeyringEntryFactory; store: Map<string, string> } {
	const store = new Map<string, string>();
	const factory: KeyringEntryFactory = (service, account) => {
		const key = `${service}::${account}`;
		const entry: KeyringEntry = {
			getPassword() {
				return store.get(key) ?? null;
			},
			setPassword(value: string) {
				store.set(key, value);
			},
			deletePassword() {
				return store.delete(key);
			},
		};
		return entry;
	};
	return { factory, store };
}

const sampleRecord: SecureStoreRecord = {
	encryptedKey: 'sk-test-1234',
	savedAt: '2026-04-30T00:00:00.000Z',
	lastVerifiedAt: '2026-04-30T00:00:01.000Z',
};

describe('keyring secure store', () => {
	it('round-trips a record through the keyring', async () => {
		const { factory, store } = fakeKeyringFactory();
		const sut = createKeyringSecureStore({ keyringFactory: factory, serviceName: 'NovellumTest' });

		await sut.saveKey('openrouter', sampleRecord);
		// The fake store holds JSON-encoded payload keyed by service::account.
		expect(store.get('NovellumTest::openrouter')).toBe(JSON.stringify(sampleRecord));

		const loaded = await sut.loadKey('openrouter');
		expect(loaded).toEqual(sampleRecord);

		expect(await sut.hasKey('openrouter')).toBe(true);
	});

	it('returns null when the entry is missing', async () => {
		const { factory } = fakeKeyringFactory();
		const sut = createKeyringSecureStore({ keyringFactory: factory });
		expect(await sut.loadKey('absent')).toBeNull();
		expect(await sut.hasKey('absent')).toBe(false);
	});

	it('deletes entries', async () => {
		const { factory, store } = fakeKeyringFactory();
		const sut = createKeyringSecureStore({ keyringFactory: factory });
		await sut.saveKey('openrouter', sampleRecord);
		expect(store.size).toBe(1);
		await sut.deleteKey('openrouter');
		expect(store.size).toBe(0);
		expect(await sut.hasKey('openrouter')).toBe(false);
	});

	it('treats a corrupted payload as missing rather than leaking it', async () => {
		const { factory, store } = fakeKeyringFactory();
		const sut = createKeyringSecureStore({ keyringFactory: factory });
		// Inject a malformed JSON payload directly into the store.
		store.set('Novellum::poisoned', '{this is not json');
		expect(await sut.loadKey('poisoned')).toBeNull();
	});

	it('rejects empty providerId', async () => {
		const { factory } = fakeKeyringFactory();
		const sut = createKeyringSecureStore({ keyringFactory: factory });
		await expect(sut.saveKey('', sampleRecord)).rejects.toThrow(/providerId/);
	});

	it('uses the custom serviceName as the keyring service', async () => {
		const { factory, store } = fakeKeyringFactory();
		const sut = createKeyringSecureStore({
			keyringFactory: factory,
			serviceName: 'CustomService',
		});
		await sut.saveKey('openrouter', sampleRecord);
		expect([...store.keys()]).toEqual(['CustomService::openrouter']);
	});
});
