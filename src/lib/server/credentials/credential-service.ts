import { createFileSystemSecureStore, type SecureStore, type SecureStoreRecord } from './secure-store.js';

/**
 * Public API surface for the credential service.
 *
 * The frontend never speaks to {@link SecureStore} directly. Routes under
 * `src/routes/api/settings/ai-key/` and `src/routes/api/settings/ai-status/`
 * call into this module, which is responsible for redacting any returned
 * payload before it leaves the server.
 */
export interface ProviderStatus {
	providerId: string;
	configured: boolean;
	lastVerifiedAt: string | null;
	maskedHint: string | null;
	savedAt: string | null;
}

export interface CredentialService {
	saveProviderKey(
		providerId: string,
		apiKey: string,
		options?: { lastVerifiedAt?: string | null },
	): Promise<ProviderStatus>;
	loadProviderKey(providerId: string): Promise<string | null>;
	deleteProviderKey(providerId: string): Promise<void>;
	getProviderStatus(providerId: string): Promise<ProviderStatus>;
	markVerified(providerId: string, verifiedAt: string): Promise<void>;
}

/**
 * Returns a 4-character suffix hint, e.g. `***wx12`.
 *
 * Less than 8 characters → returns `***` so we never echo a useful
 * fragment of a short / accidentally-typed value.
 */
export function maskKey(apiKey: string | null | undefined): string | null {
	if (!apiKey) return null;
	if (apiKey.length < 8) return '***';
	return `***${apiKey.slice(-4)}`;
}

function statusFromRecord(providerId: string, record: SecureStoreRecord | null): ProviderStatus {
	if (!record) {
		return {
			providerId,
			configured: false,
			lastVerifiedAt: null,
			maskedHint: null,
			savedAt: null,
		};
	}
	return {
		providerId,
		configured: true,
		lastVerifiedAt: record.lastVerifiedAt,
		maskedHint: maskKey(record.encryptedKey),
		savedAt: record.savedAt,
	};
}

export function createCredentialService(store: SecureStore = createFileSystemSecureStore()): CredentialService {
	return {
		async saveProviderKey(providerId, apiKey, options) {
			if (!providerId) throw new Error('providerId required');
			if (!apiKey || apiKey.length < 16) {
				throw new Error('apiKey too short');
			}
			const record: SecureStoreRecord = {
				encryptedKey: apiKey,
				savedAt: new Date().toISOString(),
				lastVerifiedAt: options?.lastVerifiedAt ?? null,
			};
			await store.saveKey(providerId, record);
			return statusFromRecord(providerId, record);
		},

		async loadProviderKey(providerId) {
			const record = await store.loadKey(providerId);
			return record?.encryptedKey ?? null;
		},

		async deleteProviderKey(providerId) {
			await store.deleteKey(providerId);
		},

		async getProviderStatus(providerId) {
			const record = await store.loadKey(providerId);
			return statusFromRecord(providerId, record);
		},

		async markVerified(providerId, verifiedAt) {
			const record = await store.loadKey(providerId);
			if (!record) return;
			await store.saveKey(providerId, { ...record, lastVerifiedAt: verifiedAt });
		},
	};
}
