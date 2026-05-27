import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const OUTLINE_STORE_PATH = resolve(
	process.cwd(),
	'src/modules/outline/stores/outline-store.svelte.ts',
);
const SUMMARY_BAR_PATH = resolve(
	process.cwd(),
	'src/modules/outline/components/OutlineSummaryBar.svelte',
);
const OUTLINE_PAGE_PATH = resolve(
	process.cwd(),
	'src/routes/projects/[id]/outline/+page.svelte',
);

const storeSource = readFileSync(OUTLINE_STORE_PATH, 'utf-8');
const summaryBarSource = readFileSync(SUMMARY_BAR_PATH, 'utf-8');
const pageSource = readFileSync(OUTLINE_PAGE_PATH, 'utf-8');

describe('stage runtime state machine source contract', () => {
	it('exports all plan-locked runtime states', () => {
		expect(storeSource).toContain('export type StageRuntimeState');
		for (const state of [
			"'idle'",
			"'ready'",
			"'queued'",
			"'running'",
			"'completed_pending_checkpoint'",
			"'failed'",
			"'cancelled'",
		]) {
			expect(storeSource).toContain(state);
		}
	});

	it('exports readiness computation with disabled reason', () => {
		expect(storeSource).toContain('export interface StageRunReadiness');
		expect(storeSource).toContain('canRun: boolean');
		expect(storeSource).toContain('disabledReason: string | null');
		expect(storeSource).toContain('export function computeStageRunReadiness');
	});

	it('returns disabled reason for missing stageId', () => {
		expect(storeSource).toContain('Select a stage to run the pipeline.');
	});

	it('returns disabled reason for missing arcId', () => {
		expect(storeSource).toContain('Arc selection is required.');
	});

	it('returns disabled reason when run is in progress', () => {
		expect(storeSource).toContain('A pipeline run is already in progress.');
	});

	it('exports deterministic state transition functions', () => {
		expect(storeSource).toContain('export function transitionToQueued');
		expect(storeSource).toContain('export function transitionToRunning');
		expect(storeSource).toContain('export function transitionToCompleted');
		expect(storeSource).toContain('export function transitionToFailed');
		expect(storeSource).toContain('export function transitionToCancelled');
		expect(storeSource).toContain('export function resetStageRunState');
	});

	it('exports runtime state getters for components', () => {
		expect(storeSource).toContain('export function getStageRuntimeState');
		expect(storeSource).toContain('export function getStageRunError');
		expect(storeSource).toContain('export function getStageRunButtonLabel');
		expect(storeSource).toContain('export function isStageRunActive');
	});

	it('derives button label from runtime state', () => {
		expect(storeSource).toContain("'Queuing…'");
		expect(storeSource).toContain("'Running…'");
		expect(storeSource).toContain("'Retry Stage Pipeline'");
		expect(storeSource).toContain("'Run Stage Pipeline'");
	});

	it('skips re-derive when state machine is in active or terminal state', () => {
		expect(storeSource).toContain('export function deriveStageRuntimeState');
		expect(storeSource).toContain("stageRuntimeState === 'queued'");
		expect(storeSource).toContain("stageRuntimeState === 'running'");
		expect(storeSource).toContain("stageRuntimeState === 'completed_pending_checkpoint'");
		expect(storeSource).toContain("stageRuntimeState === 'failed'");
	});
});

describe('OutlineSummaryBar disabled state contract', () => {
	it('accepts disabled and reason props for run button', () => {
		expect(summaryBarSource).toContain('stageRunDisabled');
		expect(summaryBarSource).toContain('stageRunDisabledReason');
		expect(summaryBarSource).toContain('stageRunButtonLabel');
	});

	it('renders disabled attribute and reason text when disabled', () => {
		expect(summaryBarSource).toContain('disabled={stageRunDisabled}');
		expect(summaryBarSource).toContain('{stageRunDisabledReason}');
		expect(summaryBarSource).toContain('scope-summary__run--disabled');
	});
});

describe('outline page state machine wiring', () => {
	it('freezes selection path before submitting run', () => {
		expect(pageSource).toContain('const frozenPath = { ...selectionPath }');
		expect(pageSource).toContain('hierarchyPath: frozenPath');
	});

	it('transitions through queued → running → completed/failed', () => {
		expect(pageSource).toContain('transitionToQueued()');
		expect(pageSource).toContain('transitionToRunning()');
		expect(pageSource).toContain('transitionToCompleted()');
		expect(pageSource).toContain('transitionToFailed(result.error, result.reason)');
	});

	it('derives runtime state reactively from selection path changes', () => {
		expect(pageSource).toContain('deriveStageRuntimeState()');
		expect(pageSource).toContain('const runtimeState = $derived(getStageRuntimeState())');
	});

	it('passes state machine props to OutlineSummaryBar', () => {
		expect(pageSource).toContain('stageRunButtonLabel={stageRunButtonLabel}');
		expect(pageSource).toContain('stageRunDisabled={!stageReadiness.canRun}');
		expect(pageSource).toContain('stageRunDisabledReason={stageReadiness.disabledReason}');
	});

	it('exposes retry/reset handler for failed state', () => {
		expect(pageSource).toContain('function handleRetryOrReset');
		expect(pageSource).toContain('resetStageRunState()');
		expect(pageSource).toContain('Dismiss & Retry');
	});

	it('clears review transition error on retry/reset', () => {
		expect(pageSource).toContain('reviewTransitionError = null');
	});

	it('stores error reason from failed runs', () => {
		expect(storeSource).toContain('export function getStageRunErrorReason');
	});
});
