/**
 * Frontend client for the BYOK credential service.
 *
 * The browser is intentionally **not allowed** to hold the raw API key
 * in any persistent storage. All operations go through the SvelteKit
 * routes that land in plan-017 stage-005 phase-004 (`/api/settings/ai-key`
 * and `/api/settings/ai-status`). The server is the only owner of the
 * secret material.
 *
 * The single, transitional exception is {@link migrateLegacyLocalStorage},
 * which performs a one-shot upload of an older `localStorage` key and
 * then removes it.
 */

export interface ProviderStatus {
	providerId: string;
	configured: boolean;
	lastVerifiedAt: string | null;
	maskedHint: string | null;
	savedAt: string | null;
}

export interface TestKeyResult {
	ok: boolean;
	reason?: 'invalid' | 'rate_limited' | 'network_error' | 'unknown';
	message?: string;
	verifiedAt?: string;
}

const LEGACY_LOCALSTORAGE_KEY = 'novellum_openrouter_key';
const MIGRATION_FLAG_KEY = 'novellum.credentialMigration.openrouter.attempted';

interface CredentialServiceOptions {
	fetch?: typeof fetch;
}

function fetchOrGlobal(opts?: CredentialServiceOptions): typeof fetch {
	return opts?.fetch ?? globalThis.fetch.bind(globalThis);
}

async function readJson<T>(response: Response): Promise<T> {
	if (!response.ok) {
		let message = `${response.status}`;
		try {
			const body = (await response.json()) as { error?: { message?: string } };
			if (body?.error?.message) message = body.error.message;
		} catch {
			/* ignore */
		}
		throw new Error(`credential service request failed: ${message}`);
	}
	return (await response.json()) as T;
}

export async function getStatus(
	providerId = 'openrouter',
	opts?: CredentialServiceOptions,
): Promise<ProviderStatus> {
	const f = fetchOrGlobal(opts);
	const res = await f(`/api/settings/ai-status?providerId=${encodeURIComponent(providerId)}`);
	return readJson<ProviderStatus>(res);
}

export async function saveKey(
	providerId: string,
	apiKey: string,
	opts?: CredentialServiceOptions,
): Promise<ProviderStatus> {
	const f = fetchOrGlobal(opts);
	const res = await f('/api/settings/ai-key', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ providerId, apiKey, action: 'save' }),
	});
	return readJson<ProviderStatus>(res);
}

export async function deleteKey(
	providerId: string,
	opts?: CredentialServiceOptions,
): Promise<void> {
	const f = fetchOrGlobal(opts);
	const res = await f('/api/settings/ai-key', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ providerId, action: 'delete' }),
	});
	await readJson<{ ok: true }>(res);
}

export async function testKey(
	providerId: string,
	opts?: CredentialServiceOptions,
): Promise<TestKeyResult> {
	const f = fetchOrGlobal(opts);
	const res = await f('/api/settings/ai-key', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ providerId, action: 'test' }),
	});
	return readJson<TestKeyResult>(res);
}

/**
 * One-shot migration: if a legacy `novellum_openrouter_key` is present in
 * `localStorage`, POST it to the credential service and clear the local
 * copy. A failed POST does not clear the local copy.
 */
export async function migrateLegacyLocalStorage(
	opts?: CredentialServiceOptions & { storage?: Storage },
): Promise<{ migrated: boolean; reason?: string }> {
	const storage = opts && 'storage' in opts ? opts.storage : typeof localStorage !== 'undefined' ? localStorage : null;
	if (!storage) return { migrated: false, reason: 'no_storage' };

	if (storage.getItem(MIGRATION_FLAG_KEY) === 'true') {
		return { migrated: false, reason: 'already_attempted' };
	}

	const legacy = storage.getItem(LEGACY_LOCALSTORAGE_KEY);
	if (!legacy) {
		storage.setItem(MIGRATION_FLAG_KEY, 'true');
		return { migrated: false, reason: 'no_legacy_key' };
	}

	try {
		await saveKey('openrouter', legacy, opts);
		storage.removeItem(LEGACY_LOCALSTORAGE_KEY);
		storage.setItem(MIGRATION_FLAG_KEY, 'true');
		return { migrated: true };
	} catch (err) {
		// Per acceptance criteria: a failed migration must NOT clear the
		// legacy entry. Leave the flag unset so we retry on next launch.
		return {
			migrated: false,
			reason: err instanceof Error ? 'request_failed' : 'unknown',
		};
	}
}

export const LEGACY_LOCALSTORAGE_KEY_NAME = LEGACY_LOCALSTORAGE_KEY;
export const MIGRATION_FLAG_KEY_NAME = MIGRATION_FLAG_KEY;
