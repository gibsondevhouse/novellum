import { describe, it, expect } from 'vitest';
import { sha256, buildChecksumsFile } from '$lib/server/backup/checksums.js';

describe('sha256', () => {
	it('matches a known SHA-256 hex digest for an empty string', () => {
		expect(sha256('')).toBe(
			'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		);
	});

	it('produces identical digests for identical inputs', () => {
		expect(sha256('hello')).toBe(sha256('hello'));
		expect(sha256(new Uint8Array([1, 2, 3]))).toBe(sha256(new Uint8Array([1, 2, 3])));
	});

	it('changes when one byte changes', () => {
		expect(sha256('hello')).not.toBe(sha256('hellp'));
	});
});

describe('buildChecksumsFile', () => {
	it('sorts keys lexicographically', () => {
		const file = buildChecksumsFile({
			'db/zebra.json': 'z',
			'db/apple.json': 'a',
			'manifest.json': 'm',
		});
		const parsed = JSON.parse(file.json) as Record<string, string>;
		expect(Object.keys(parsed)).toEqual(['db/apple.json', 'db/zebra.json', 'manifest.json']);
	});

	it('is deterministic for identical inputs', () => {
		const a = buildChecksumsFile({ 'a.json': 'one', 'b.json': 'two' });
		const b = buildChecksumsFile({ 'b.json': 'two', 'a.json': 'one' });
		expect(a.json).toBe(b.json);
		expect(a.sha256).toBe(b.sha256);
	});

	it('changes when a single byte of input changes', () => {
		const a = buildChecksumsFile({ 'a.json': 'one' });
		const b = buildChecksumsFile({ 'a.json': 'onE' });
		expect(a.sha256).not.toBe(b.sha256);
	});

	it('produces parseable JSON whose hash equals the reported sha256', () => {
		const file = buildChecksumsFile({ 'a.json': 'one' });
		expect(() => JSON.parse(file.json)).not.toThrow();
		expect(sha256(file.json)).toBe(file.sha256);
	});
});
