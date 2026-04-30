/**
 * OS-keyring backend for {@link SecureStore}.
 *
 * Used in the desktop shell (Tauri sidecar process) where API keys
 * must live in macOS Keychain / Windows Credential Manager / Linux
 * libsecret rather than on a regular filesystem path. Web / dev /
 * server deployments continue to use the filesystem store from
 * `secure-store.ts`.
 *
 * Selection happens in `select-secure-store.ts` based on the
 * `NOVELLUM_DESKTOP=1` env var the Tauri sidecar spawn injects.
 */

import type { SecureStore, SecureStoreRecord } from './secure-store.js';

/** Minimum surface we use from the keyring backend. */
export interface KeyringEntry {
	getPassword(): string | null;
	setPassword(value: string): void;
	deletePassword(): boolean;
}

/** Factory shape: `(service, account) => KeyringEntry`. */
export type KeyringEntryFactory = (service: string, account: string) => KeyringEntry;

/**
 * Default factory: resolves the real `@napi-rs/keyring` Entry class
 * lazily so unit tests can inject a fake without paying the native-
 * module import cost.
 */
async function defaultKeyringFactory(): Promise<KeyringEntryFactory> {
	const mod = await import('@napi-rs/keyring');
	return (service, account) => new mod.Entry(service, account);
}

interface KeyringSecureStoreOptions {
	/** Service name used in the OS keyring. Defaults to `Novellum`. */
	serviceName?: string;
	/** For tests: inject a fake factory instead of the native one. */
	keyringFactory?: KeyringEntryFactory | (() => Promise<KeyringEntryFactory>);
}

/**
 * Creates a {@link SecureStore} backed by the OS keyring. The
 * `SecureStoreRecord` (with `savedAt` / `lastVerifiedAt`) is JSON-
 * encoded and stored as the password value, keyed by `providerId`
 * inside the configured service.
 */
export function createKeyringSecureStore(options: KeyringSecureStoreOptions = {}): SecureStore {
	const serviceName = options.serviceName ?? 'Novellum';
	let factoryPromise: Promise<KeyringEntryFactory> | null = null;

	function resolveFactory(): Promise<KeyringEntryFactory> {
		if (factoryPromise) return factoryPromise;
		const provided = options.keyringFactory;
		if (typeof provided === 'function') {
			// Could be either the factory itself or a thunk returning one.
			// Detect by arity: real factory takes 2 args, thunk takes 0.
			if (provided.length >= 2) {
				factoryPromise = Promise.resolve(provided as KeyringEntryFactory);
			} else {
				factoryPromise = (provided as () => Promise<KeyringEntryFactory>)();
			}
		} else {
			factoryPromise = defaultKeyringFactory();
		}
		return factoryPromise;
	}

	async function entryFor(providerId: string): Promise<KeyringEntry> {
		if (!providerId) throw new Error('providerId required');
		const factory = await resolveFactory();
		return factory(serviceName, providerId);
	}

	return {
		async saveKey(providerId, record) {
			const entry = await entryFor(providerId);
			entry.setPassword(JSON.stringify(record));
		},
		async loadKey(providerId) {
			const entry = await entryFor(providerId);
			const raw = entry.getPassword();
			if (raw == null) return null;
			try {
				const parsed = JSON.parse(raw) as SecureStoreRecord;
				return parsed;
			} catch {
				// Corrupted entry; treat as missing rather than throwing
				// the raw payload (which would leak the secret).
				return null;
			}
		},
		async deleteKey(providerId) {
			const entry = await entryFor(providerId);
			entry.deletePassword();
		},
		async hasKey(providerId) {
			const entry = await entryFor(providerId);
			return entry.getPassword() != null;
		},
	};
}
