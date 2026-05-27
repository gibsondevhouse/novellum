import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RUNNER_PATH = resolve(
	process.cwd(),
	'src/modules/outline/services/worldbuild-pipeline-runner.ts',
);
const PAGE_PATH = resolve(
	process.cwd(),
	'src/routes/projects/[id]/outline/+page.svelte',
);
const WB_STORE_PATH = resolve(
	process.cwd(),
	'src/modules/world-building/stores/world-building-store.svelte.ts',
);
const CONTEXT_HOOKS_PATH = resolve(
	process.cwd(),
	'src/modules/nova/services/context-hooks.ts',
);

const runnerSource = readFileSync(RUNNER_PATH, 'utf-8');
const pageSource = readFileSync(PAGE_PATH, 'utf-8');
const wbStoreSource = readFileSync(WB_STORE_PATH, 'utf-8');
const contextHooksSource = readFileSync(CONTEXT_HOOKS_PATH, 'utf-8');

describe('worldbuild checkpoint staging — draft lifecycle', () => {
	it('runner stages artifact as draft checkpoint on successful run', () => {
		expect(runnerSource).toContain("lifecycle: 'draft'");
		expect(runnerSource).toContain('upsertWorldbuildCheckpoint');
		expect(runnerSource).toContain('WORLDBUILD_CHECKPOINT_OWNER_ID');
	});

	it('page tracks last staged checkpoint id from run result', () => {
		expect(pageSource).toContain('lastStagedCheckpointId');
		expect(pageSource).toContain('result.checkpoint.id');
	});

	it('page transitions to completed_pending_checkpoint after staging', () => {
		expect(pageSource).toContain('transitionToCompleted');
		expect(pageSource).toContain("runtimeState === 'completed_pending_checkpoint'");
	});

	it('page refreshes worldbuild checkpoints after successful run', () => {
		expect(pageSource).toContain('refreshWorldbuildCheckpoints(projectId)');
	});
});

describe('worldbuild checkpoint staging — review transition', () => {
	it('page wires handleSendToReview that calls sendWorldbuildCheckpointToReview', () => {
		expect(pageSource).toContain('async function handleSendToReview');
		expect(pageSource).toContain('sendWorldbuildCheckpointToReview(checkpointId)');
	});

	it('page falls back to latestDraftCheckpoint when lastStagedCheckpointId is null', () => {
		expect(pageSource).toContain('lastStagedCheckpointId ?? latestDraftCheckpoint?.id');
	});

	it('page resets stage run state after successful review transition', () => {
		expect(pageSource).toContain('resetStageRunState()');
	});

	it('page captures review transition errors for UI display', () => {
		expect(pageSource).toContain('reviewTransitionError');
		expect(pageSource).toContain('Review transition failed');
	});

	it('template renders Send to Review button in completed_pending_checkpoint state', () => {
		expect(pageSource).toContain('Send to Review');
		expect(pageSource).toContain('handleSendToReview');
	});

	it('template shows review error with dismiss button when transition fails', () => {
		expect(pageSource).toContain('{#if reviewTransitionError}');
		expect(pageSource).toContain('handleRetryOrReset');
	});
});

describe('worldbuild checkpoint staging — lifecycle metadata exposure', () => {
	it('world-building store exposes getCheckpointsByLifecycle filter', () => {
		expect(wbStoreSource).toContain('export function getCheckpointsByLifecycle');
		expect(wbStoreSource).toContain('c.lifecycle === lifecycle');
	});

	it('world-building store exposes getCheckpointById lookup', () => {
		expect(wbStoreSource).toContain('export function getCheckpointById');
		expect(wbStoreSource).toContain('c.id === checkpointId');
	});

	it('world-building store exposes getLatestCheckpointByLifecycle', () => {
		expect(wbStoreSource).toContain('export function getLatestCheckpointByLifecycle');
	});

	it('context-hooks exposes listWorldbuildCheckpointsByLifecycle for multi-lifecycle queries', () => {
		expect(contextHooksSource).toContain('export async function listWorldbuildCheckpointsByLifecycle');
		expect(contextHooksSource).toContain('allowed.has(record.lifecycle)');
	});

	it('context-hooks delegates listAcceptedWorldbuildCheckpointContext to lifecycle query', () => {
		expect(contextHooksSource).toContain('listWorldbuildCheckpointsByLifecycle');
		expect(contextHooksSource).toContain("['accepted']");
	});
});

describe('worldbuild checkpoint staging — no canonical writes', () => {
	it('runner does not import or call any entity table write functions', () => {
		expect(runnerSource).not.toContain('updateCharacter');
		expect(runnerSource).not.toContain('updateLocation');
		expect(runnerSource).not.toContain('updateLoreEntry');
		expect(runnerSource).not.toContain('insertCharacter');
		expect(runnerSource).not.toContain('insertLocation');
	});

	it('runner only writes to pipeline checkpoint scope, not entity tables', () => {
		expect(runnerSource).toContain('upsertWorldbuildCheckpoint');
		expect(runnerSource).not.toContain('$lib/server/');
		expect(runnerSource).not.toContain('better-sqlite3');
	});

	it('page does not directly write to entity stores during run or review', () => {
		expect(pageSource).not.toContain('updateCharacter');
		expect(pageSource).not.toContain('insertCharacter');
		expect(pageSource).not.toContain('updateLocation');
	});
});
