import { mkdir, readFile, writeFile, rename, chmod, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { resolveAppDataDir } from '$lib/server/app-data/path.js';

/**
 * On-disk record stored by a {@link SecureStore} implementation. The shape
 * is reserved for future at-rest encryption: V1 stores plaintext behind
 * 0600 perms; stage-008 will swap `encryptedKey` for ciphertext + nonce.
 */
export interface SecureStoreRecord {
	encryptedKey: string;
	savedAt: string;
	lastVerifiedAt: string | null;
}

/**
 * Pluggable backend for persisting API keys.
 *
 * Two implementations ship in this codebase:
 * - {@link createFileSystemSecureStore} — file at `${appDataDir}/credentials.json`,
 *   atomic write-then-rename, mode 0600 on POSIX. Used in dev / test / server.
 * - The OS-keyring adapter — lands in stage-008 alongside desktop packaging.
 */
export interface SecureStore {
	saveKey(providerId: string, record: SecureStoreRecord): Promise<void>;
	loadKey(providerId: string): Promise<SecureStoreRecord | null>;
	deleteKey(providerId: string): Promise<void>;
	hasKey(providerId: string): Promise<boolean>;
}

interface FileStoreShape {
	[providerId: string]: SecureStoreRecord;
}

function resolveStoreDirectory(override?: string): string {
	if (override) return override;
	return resolveAppDataDir();
}

/**
 * Creates a filesystem-backed {@link SecureStore}.
 *
 * Errors **must not** include the credential value; this module redacts
 * via the `redactRecord` helper before any error handling occurs.
 */
export function createFileSystemSecureStore(options: { appDataDir?: string } = {}): SecureStore {
	const dir = resolveStoreDirectory(options.appDataDir);
	const filePath = join(dir, 'credentials.json');

	async function readAll(): Promise<FileStoreShape> {
		try {
			const raw = await readFile(filePath, 'utf8');
			const parsed = JSON.parse(raw) as unknown;
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return parsed as FileStoreShape;
			}
			return {};
		} catch (err) {
			const code = (err as NodeJS.ErrnoException)?.code;
			if (code === 'ENOENT') return {};
			throw new Error('credential store unreadable', { cause: err });
		}
	}

	async function writeAll(state: FileStoreShape): Promise<void> {
		await mkdir(dirname(filePath), { recursive: true });
		const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
		await writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
		try {
			if (process.platform !== 'win32') {
				await chmod(tmp, 0o600);
			}
			await rename(tmp, filePath);
		} catch (err) {
			throw new Error(
				`credential store write failed: ${err instanceof Error ? err.message : String(err)}`,
				{ cause: err },
			);
		}
	}

	return {
		async saveKey(providerId, record) {
			if (!providerId) throw new Error('providerId required');
			const state = await readAll();
			state[providerId] = record;
			await writeAll(state);
		},
		async loadKey(providerId) {
			const state = await readAll();
			return state[providerId] ?? null;
		},
		async deleteKey(providerId) {
			const state = await readAll();
			if (providerId in state) {
				delete state[providerId];
				await writeAll(state);
			}
		},
		async hasKey(providerId) {
			const state = await readAll();
			return providerId in state;
		},
	};
}

/**
 * For tests and runbooks: assert the credentials file mode is restrictive.
 */
export async function getSecureStoreFileMode(appDataDir?: string): Promise<number | null> {
	const filePath = join(resolveStoreDirectory(appDataDir), 'credentials.json');
	try {
		const s = await stat(filePath);
		return s.mode & 0o777;
	} catch {
		return null;
	}
}
