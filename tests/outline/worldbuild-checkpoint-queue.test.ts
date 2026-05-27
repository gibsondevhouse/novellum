import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const WB_STORE_PATH = resolve(
	process.cwd(),
	'src/modules/world-building/stores/world-building-store.svelte.ts',
);
const PAGE_PATH = resolve(
	process.cwd(),
	'src/routes/projects/[id]/outline/+page.svelte',
);

const wbStoreSource = readFileSync(WB_STORE_PATH, 'utf-8');
const pageSource = readFileSync(PAGE_PATH, 'utf-8');

describe('checkpoint queue — store filter state', () => {
	it('exports CheckpointQueueFilter type with expected values', () => {
		expect(wbStoreSource).toContain("export type CheckpointQueueFilter = 'all' | 'pending' | 'accepted' | 'rejected'");
	});

	it('exports setCheckpointQueueFilter and getCheckpointQueueFilter', () => {
		expect(wbStoreSource).toContain('export function setCheckpointQueueFilter');
		expect(wbStoreSource).toContain('export function getCheckpointQueueFilter');
	});

	it('exports getFilteredCheckpoints that filters by active queue filter', () => {
		expect(wbStoreSource).toContain('export function getFilteredCheckpoints');
		expect(wbStoreSource).toContain("checkpointQueueFilter === 'all'");
		expect(wbStoreSource).toContain("checkpointQueueFilter === 'pending'");
	});

	it('pending filter includes both draft and review lifecycles', () => {
		expect(wbStoreSource).toContain("PENDING_LIFECYCLES");
		expect(wbStoreSource).toContain("'draft'");
		expect(wbStoreSource).toContain("'review'");
	});

	it('exports getCheckpointQueueCounts for all filter categories', () => {
		expect(wbStoreSource).toContain('export function getCheckpointQueueCounts');
		expect(wbStoreSource).toContain('Record<CheckpointQueueFilter, number>');
	});
});

describe('checkpoint queue — selected review checkpoint', () => {
	it('exports setSelectedReviewCheckpoint and getSelectedReviewCheckpoint', () => {
		expect(wbStoreSource).toContain('export function setSelectedReviewCheckpoint');
		expect(wbStoreSource).toContain('export function getSelectedReviewCheckpoint');
	});

	it('exports getSelectedReviewCheckpointId for id-only access', () => {
		expect(wbStoreSource).toContain('export function getSelectedReviewCheckpointId');
	});
});

describe('checkpoint queue — page integration', () => {
	it('page derives filteredCheckpoints from store', () => {
		expect(pageSource).toContain('getFilteredCheckpoints');
		expect(pageSource).toContain('filteredCheckpoints');
	});

	it('page derives queue counts for filter badges', () => {
		expect(pageSource).toContain('getCheckpointQueueCounts');
		expect(pageSource).toContain('queueCounts');
	});

	it('page renders filter tab buttons', () => {
		expect(pageSource).toContain('QUEUE_FILTERS');
		expect(pageSource).toContain('checkpoint-queue__filter');
		expect(pageSource).toContain('handleSelectQueueFilter');
	});

	it('page renders queue list with lifecycle badge, task key, and timestamp', () => {
		expect(pageSource).toContain('checkpoint-queue__lifecycle');
		expect(pageSource).toContain('checkpoint-queue__task');
		expect(pageSource).toContain('checkpoint-queue__time');
	});

	it('page shows empty state when no checkpoints match filter', () => {
		expect(pageSource).toContain('checkpoint-queue__empty');
		expect(pageSource).toContain('No checkpoints yet');
	});

	it('page highlights selected queue item', () => {
		expect(pageSource).toContain('checkpoint-queue__item--selected');
		expect(pageSource).toContain('handleSelectCheckpointForReview');
	});

	it('page refreshes checkpoints on project load', () => {
		expect(pageSource).toContain('refreshWorldbuildCheckpoints(projectId)');
	});
});
