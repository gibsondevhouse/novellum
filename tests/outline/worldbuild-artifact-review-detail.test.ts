import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PAGE_PATH = resolve(
	process.cwd(),
	'src/routes/projects/[id]/outline/+page.svelte',
);
const WB_STORE_PATH = resolve(
	process.cwd(),
	'src/modules/world-building/stores/world-building-store.svelte.ts',
);

const pageSource = readFileSync(PAGE_PATH, 'utf-8');
const wbStoreSource = readFileSync(WB_STORE_PATH, 'utf-8');

describe('artifact review detail — content and metadata', () => {
	it('page renders checkpoint detail section when a review checkpoint is selected', () => {
		expect(pageSource).toContain('checkpoint-detail');
		expect(pageSource).toContain('selectedReviewCheckpoint');
		expect(pageSource).toContain('Artifact Review');
	});

	it('detail panel shows artifact id, task key, lifecycle, and version', () => {
		expect(pageSource).toContain('selectedReviewCheckpoint.id');
		expect(pageSource).toContain('selectedReviewCheckpoint.taskKey');
		expect(pageSource).toContain('selectedReviewCheckpoint.lifecycle');
		expect(pageSource).toContain('selectedReviewCheckpoint.version');
	});

	it('detail panel shows parser version and produced timestamp', () => {
		expect(pageSource).toContain('selectedReviewCheckpoint.artifact.parserVersion');
		expect(pageSource).toContain('selectedReviewCheckpoint.artifact.producedAt');
	});

	it('detail panel shows full hierarchy path references', () => {
		expect(pageSource).toContain('checkpoint-detail__hierarchy');
		expect(pageSource).toContain('selectedReviewCheckpoint.artifact.hierarchy.references');
	});

	it('detail panel shows pipeline and stage key', () => {
		expect(pageSource).toContain('selectedReviewCheckpoint.artifact.pipeline');
		expect(pageSource).toContain('selectedReviewCheckpoint.artifact.stage');
	});
});

describe('artifact review detail — validation and provenance', () => {
	it('detail panel renders artifact notes when present', () => {
		expect(pageSource).toContain('selectedReviewCheckpoint.artifact.notes');
		expect(pageSource).toContain('checkpoint-detail__notes');
	});

	it('detail panel renders review state when present', () => {
		expect(pageSource).toContain('selectedReviewCheckpoint.review');
		expect(pageSource).toContain('checkpoint-detail__review-state');
	});

	it('detail panel renders rejection state when present', () => {
		expect(pageSource).toContain('selectedReviewCheckpoint.rejection');
		expect(pageSource).toContain('checkpoint-detail__rejection');
	});

	it('detail panel renders acceptance state when present', () => {
		expect(pageSource).toContain('selectedReviewCheckpoint.acceptance');
		expect(pageSource).toContain('checkpoint-detail__acceptance');
		expect(pageSource).toContain('projectedToCanon');
	});

	it('artifact payload is available in a collapsible details element', () => {
		expect(pageSource).toContain('checkpoint-detail__payload');
		expect(pageSource).toContain('Advanced details');
		expect(pageSource).toContain('JSON.stringify');
	});
});

describe('artifact review detail — empty/missing state handling', () => {
	it('detail section only renders when selectedReviewCheckpoint is truthy', () => {
		expect(pageSource).toContain('{#if selectedReviewCheckpoint}');
	});

	it('close button deselects review checkpoint', () => {
		expect(pageSource).toContain('handleSelectCheckpointForReview(null)');
	});

	it('store getSelectedReviewCheckpoint returns undefined when no selection', () => {
		expect(wbStoreSource).toContain('if (!selectedReviewCheckpointId) return undefined');
	});
});
