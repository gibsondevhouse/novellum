import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	createCredentialService,
	createFileSystemSecureStore,
	maskKey,
	getSecureStoreFileMode,
} from '../../src/lib/server/credentials/index.js';

const SENTINEL = 'sk-or-v1-TEST-SENTINEL-12345678';

describe('credential service (filesystem secure store)', () => {
	let dir: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), 'novellum-cred-'));
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	function makeService() {
		return createCredentialService(createFileSystemSecureStore({ appDataDir: dir }));
	}

	describe('saveProviderKey', () => {
		it('persists the key and returns redacted status', async () => {
			const svc = makeService();
			const status = await svc.saveProviderKey('openrouter', SENTINEL);

			expect(status).toMatchObject({
				providerId: 'openrouter',
				configured: true,
				maskedHint: '***5678',
			});
			expect(JSON.stringify(status)).not.toContain(SENTINEL);
		});

		it('writes credentials.json with mode 0600 on POSIX', async () => {
			const svc = makeService();
			await svc.saveProviderKey('openrouter', SENTINEL);

			if (process.platform !== 'win32') {
				const mode = await getSecureStoreFileMode(dir);
				expect(mode).toBe(0o600);
			}
		});

		it('rejects empty providerId or short keys', async () => {
			const svc = makeService();
			await expect(svc.saveProviderKey('', SENTINEL)).rejects.toThrow();
			await expect(svc.saveProviderKey('openrouter', 'short')).rejects.toThrow();
		});
	});

	describe('loadProviderKey', () => {
		it('returns the stored key verbatim', async () => {
			const svc = makeService();
			await svc.saveProviderKey('openrouter', SENTINEL);
			expect(await svc.loadProviderKey('openrouter')).toBe(SENTINEL);
		});

		it('returns null for unknown provider', async () => {
			const svc = makeService();
			expect(await svc.loadProviderKey('openrouter')).toBeNull();
		});
	});

	describe('deleteProviderKey', () => {
		it('removes the key from disk', async () => {
			const svc = makeService();
			await svc.saveProviderKey('openrouter', SENTINEL);
			await svc.deleteProviderKey('openrouter');

			expect(await svc.loadProviderKey('openrouter')).toBeNull();
			const raw = readFileSync(join(dir, 'credentials.json'), 'utf8');
			expect(raw).not.toContain(SENTINEL);
		});

		it('is a no-op on missing provider', async () => {
			const svc = makeService();
			await expect(svc.deleteProviderKey('openrouter')).resolves.toBeUndefined();
		});
	});

	describe('getProviderStatus', () => {
		it('returns configured=false when missing', async () => {
			const svc = makeService();
			const status = await svc.getProviderStatus('openrouter');
			expect(status).toEqual({
				providerId: 'openrouter',
				configured: false,
				lastVerifiedAt: null,
				maskedHint: null,
				savedAt: null,
			});
		});

		it('returns configured=true with hint after save', async () => {
			const svc = makeService();
			await svc.saveProviderKey('openrouter', SENTINEL);
			const status = await svc.getProviderStatus('openrouter');
			expect(status.configured).toBe(true);
			expect(status.maskedHint).toBe('***5678');
			expect(status.savedAt).toBeTruthy();
		});
	});

	describe('markVerified', () => {
		it('updates lastVerifiedAt without altering the key', async () => {
			const svc = makeService();
			await svc.saveProviderKey('openrouter', SENTINEL);
			const verifiedAt = new Date().toISOString();
			await svc.markVerified('openrouter', verifiedAt);

			expect(await svc.loadProviderKey('openrouter')).toBe(SENTINEL);
			const status = await svc.getProviderStatus('openrouter');
			expect(status.lastVerifiedAt).toBe(verifiedAt);
		});

		it('is a no-op when provider not configured', async () => {
			const svc = makeService();
			await expect(svc.markVerified('openrouter', '2026-04-28')).resolves.toBeUndefined();
		});
	});

	describe('maskKey', () => {
		it('returns last 4 chars for normal keys', () => {
			expect(maskKey(SENTINEL)).toBe('***5678');
		});
		it('returns *** for short or missing keys', () => {
			expect(maskKey(null)).toBeNull();
			expect(maskKey('')).toBeNull();
			expect(maskKey('abc')).toBe('***');
		});
	});

	describe('credentials.json file format', () => {
		it('stores keys nested under providerId', async () => {
			const svc = makeService();
			await svc.saveProviderKey('openrouter', SENTINEL);
			const raw = JSON.parse(readFileSync(join(dir, 'credentials.json'), 'utf8'));
			expect(raw.openrouter).toMatchObject({
				encryptedKey: SENTINEL,
				savedAt: expect.any(String),
			});
		});

		it('isolates concurrent providers', async () => {
			const svc = makeService();
			await svc.saveProviderKey('openrouter', SENTINEL);
			await svc.saveProviderKey('other', `${SENTINEL}-other`);
			expect(await svc.loadProviderKey('openrouter')).toBe(SENTINEL);
			expect(await svc.loadProviderKey('other')).toBe(`${SENTINEL}-other`);
		});
	});

	it('honors the NOVELLUM_APP_DATA_DIR env var', async () => {
		const prev = process.env.NOVELLUM_APP_DATA_DIR;
		process.env.NOVELLUM_APP_DATA_DIR = dir;
		try {
			const svc = createCredentialService(createFileSystemSecureStore());
			await svc.saveProviderKey('openrouter', SENTINEL);
			expect(statSync(join(dir, 'credentials.json')).isFile()).toBe(true);
		} finally {
			if (prev === undefined) delete process.env.NOVELLUM_APP_DATA_DIR;
			else process.env.NOVELLUM_APP_DATA_DIR = prev;
		}
	});
});
