import { describe, it, expect } from 'vitest';
import { encodeJson, decodeJson } from '$lib/server/db/serialize.js';

describe('encodeJson', () => {
	it('encodes null to empty array string', () => {
		expect(encodeJson(null)).toBe('[]');
	});

	it('encodes undefined to empty array string', () => {
		expect(encodeJson(undefined)).toBe('[]');
	});

	it('encodes an array of strings', () => {
		expect(encodeJson(['a', 'b', 'c'])).toBe('["a","b","c"]');
	});

	it('encodes an empty array', () => {
		expect(encodeJson([])).toBe('[]');
	});

	it('encodes an array of objects (ArcRef)', () => {
		const arcRefs = [{ arcId: '1', role: 'primary' }];
		expect(encodeJson(arcRefs)).toBe('[{"arcId":"1","role":"primary"}]');
	});
});

describe('decodeJson', () => {
	it('decodes null to empty array', () => {
		expect(decodeJson(null)).toEqual([]);
	});

	it('decodes undefined to empty array', () => {
		expect(decodeJson(undefined)).toEqual([]);
	});

	it('decodes empty string to empty array', () => {
		expect(decodeJson('')).toEqual([]);
	});

	it('decodes a JSON array string', () => {
		expect(decodeJson<string[]>('["a","b"]')).toEqual(['a', 'b']);
	});

	it('decodes an array of objects', () => {
		const json = '[{"arcId":"1","role":"primary"}]';
		expect(decodeJson(json)).toEqual([{ arcId: '1', role: 'primary' }]);
	});

	it('round-trips with encodeJson', () => {
		const original = ['trait1', 'trait2', 'trait3'];
		const encoded = encodeJson(original);
		const decoded = decodeJson<string[]>(encoded);
		expect(decoded).toEqual(original);
	});
});
