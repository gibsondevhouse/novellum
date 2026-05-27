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

describe('checkpoint decision flow — accept', () => {
	it('page wires handleAcceptCheckpoint that calls acceptStagedWorldbuildCheckpoint', () => {
		expect(pageSource).toContain('async function handleAcceptCheckpoint');
		expect(pageSource).toContain('acceptStagedWorldbuildCheckpoint');
	});

	it('accept action triggers only on review lifecycle checkpoints', () => {
		expect(pageSource).toContain("selectedReviewCheckpoint.lifecycle === 'review'");
	});

	it('accept clears selection and refreshes checkpoints on success', () => {
		expect(pageSource).toContain('setSelectedReviewCheckpoint(null)');
		expect(pageSource).toContain('refreshWorldbuildCheckpoints(projectId)');
	});

	it('accept action disables button during in-flight request', () => {
		expect(pageSource).toContain('decisionInFlight');
		expect(pageSource).toContain('disabled={decisionInFlight}');
	});

	it('accept scope disclosure is visible before decision', () => {
		expect(pageSource).toContain('checkpoint-decision__scope');
		expect(pageSource).toContain('Accepting will mark this artifact as canonical');
	});

	it('store exposes acceptStagedWorldbuildCheckpoint for the accept transition', () => {
		expect(wbStoreSource).toContain('export async function acceptStagedWorldbuildCheckpoint');
		expect(wbStoreSource).toContain("acceptWorldbuildCheckpoint");
	});
});

describe('checkpoint decision flow — reject', () => {
	it('page wires handleRejectCheckpoint that calls rejectStagedWorldbuildCheckpoint', () => {
		expect(pageSource).toContain('async function handleRejectCheckpoint');
		expect(pageSource).toContain('rejectStagedWorldbuildCheckpoint');
	});

	it('reject requires non-empty reason', () => {
		expect(pageSource).toContain("!rejectReasonDraft.trim()");
		expect(pageSource).toContain('A reason is required to reject a checkpoint');
	});

	it('reject button disabled when reason is empty or request in flight', () => {
		expect(pageSource).toContain('disabled={decisionInFlight || !rejectReasonDraft.trim()}');
	});

	it('reject clears selection, reason, and refreshes on success', () => {
		expect(pageSource).toContain("rejectReasonDraft = ''");
		expect(pageSource).toContain('setSelectedReviewCheckpoint(null)');
	});

	it('store exposes rejectStagedWorldbuildCheckpoint for the reject transition', () => {
		expect(wbStoreSource).toContain('export async function rejectStagedWorldbuildCheckpoint');
		expect(wbStoreSource).toContain('rejectWorldbuildCheckpoint');
	});
});

describe('checkpoint decision flow — error handling and refresh', () => {
	it('decision errors are captured and displayed', () => {
		expect(pageSource).toContain('decisionError');
		expect(pageSource).toContain('{#if decisionError}');
	});

	it('decision error resets on new checkpoint selection', () => {
		expect(pageSource).toContain("decisionError = null");
	});

	it('decisionInFlight is always cleared in finally block', () => {
		expect(pageSource).toContain('} finally {');
		expect(pageSource).toContain('decisionInFlight = false');
	});

	it('canon data remains unchanged — accept only delegates to checkpoint transition', () => {
		expect(pageSource).not.toContain('updateCharacter');
		expect(pageSource).not.toContain('insertCharacter');
		expect(pageSource).not.toContain('updateLocation');
	});

	it('accept and reject only appear for review lifecycle checkpoints', () => {
		expect(pageSource).toContain("selectedReviewCheckpoint.lifecycle === 'review'");
	});

	it('reject reason draft is cleared after successful rejection', () => {
		expect(pageSource).toContain("rejectReasonDraft = ''");
	});
});
