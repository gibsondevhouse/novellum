import { describe, expect, it } from 'vitest';
import {
	checkScanContextSufficiency,
	buildScanProjectContext,
	SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS,
} from '../../src/modules/world-building/services/worldbuild-scan-contract.js';

const FULL_PROJECT = {
	id: 'proj-1',
	title: 'Signal Fire',
	genre: 'fantasy',
	logline: 'A courier must outrun a civil war.',
	synopsis: 'Elara Voss, a courier in the failing Tal Empire...',
};

describe('checkScanContextSufficiency', () => {
	it('returns sufficient: true when title, logline, and synopsis are all present', () => {
		const result = checkScanContextSufficiency({
			projectId: 'p1',
			title: 'My Novel',
			genre: 'sci-fi',
			logline: 'A scientist discovers she can rewrite history.',
			synopsis: 'Dr. Mara Chen discovers a way to rewrite...',
		});
		expect(result.sufficient).toBe(true);
	});

	it('returns sufficient: false with missing: [title] when title is empty', () => {
		const result = checkScanContextSufficiency({
			projectId: 'p1',
			title: '',
			genre: 'fantasy',
			logline: 'A logline.',
			synopsis: 'A synopsis.',
		});
		expect(result.sufficient).toBe(false);
		if (result.sufficient) return;
		expect(result.missing).toContain('title');
	});

	it('returns sufficient: false with missing: [logline] when logline is empty', () => {
		const result = checkScanContextSufficiency({
			projectId: 'p1',
			title: 'My Novel',
			genre: 'fantasy',
			logline: '',
			synopsis: 'A synopsis.',
		});
		expect(result.sufficient).toBe(false);
		if (result.sufficient) return;
		expect(result.missing).toContain('logline');
	});

	it('returns sufficient: false with missing: [synopsis] when synopsis is empty', () => {
		const result = checkScanContextSufficiency({
			projectId: 'p1',
			title: 'My Novel',
			genre: 'fantasy',
			logline: 'A logline.',
			synopsis: '',
		});
		expect(result.sufficient).toBe(false);
		if (result.sufficient) return;
		expect(result.missing).toContain('synopsis');
	});

	it('returns all three missing fields when all are empty', () => {
		const result = checkScanContextSufficiency({
			projectId: 'p1',
			title: '',
			genre: '',
			logline: '',
			synopsis: '',
		});
		expect(result.sufficient).toBe(false);
		if (result.sufficient) return;
		expect(result.missing).toHaveLength(3);
		expect(result.missing).toContain('title');
		expect(result.missing).toContain('logline');
		expect(result.missing).toContain('synopsis');
	});

	it('treats whitespace-only fields as missing', () => {
		const result = checkScanContextSufficiency({
			projectId: 'p1',
			title: '   ',
			genre: 'fantasy',
			logline: 'A logline.',
			synopsis: 'A synopsis.',
		});
		expect(result.sufficient).toBe(false);
		if (result.sufficient) return;
		expect(result.missing).toContain('title');
	});
});

describe('buildScanProjectContext', () => {
	it('includes only the allowed fields', () => {
		const context = buildScanProjectContext(FULL_PROJECT);
		expect(Object.keys(context)).toEqual(
			expect.arrayContaining(['projectId', 'title', 'genre', 'logline', 'synopsis']),
		);
		expect(Object.keys(context)).toHaveLength(5);
	});

	it('maps project.id to projectId', () => {
		const context = buildScanProjectContext(FULL_PROJECT);
		expect(context.projectId).toBe(FULL_PROJECT.id);
	});

	it('does not include forbidden fields', () => {
		const projectWithForbidden = {
			...FULL_PROJECT,
			systemPrompt: 'You are a helpful assistant.',
			negativePrompt: 'Avoid violence.',
			coverUrl: 'https://example.com/cover.png',
			targetWordCount: 90000,
			status: 'drafting',
			stylePresetId: 'preset-1',
			projectType: 'novel',
			lastOpenedAt: new Date().toISOString(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const context = buildScanProjectContext(projectWithForbidden);
		for (const forbidden of SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS) {
			expect(context).not.toHaveProperty(forbidden);
		}
	});
});

describe('SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS', () => {
	it('includes systemPrompt and negativePrompt', () => {
		expect(SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS).toContain('systemPrompt');
		expect(SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS).toContain('negativePrompt');
	});

	it('includes sensitive metadata fields', () => {
		expect(SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS).toContain('coverUrl');
		expect(SCAN_CONTEXT_FORBIDDEN_PROJECT_FIELDS).toContain('targetWordCount');
	});
});
