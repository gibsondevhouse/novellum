import type { OutlineDraftCheckpointRecord } from '$lib/ai/pipeline/outline-draft-contract.js';
import { listOutlineCheckpoints } from '$lib/project-metadata.js';
import {
	createOutlineGenerationRunner,
	type OutlineGenerationRunner,
	type OutlineGenerationRunnerError,
	type OutlineGenerationRunnerFailure,
	type OutlineGenerationRunnerResult,
	type OutlineGenerationRunnerState,
	type OutlineGenerationRunnerSuccess,
} from '../services/outline-generation-runner.js';

export type OutlineGenerationStateStatus =
	| 'idle'
	| 'loading'
	| 'running'
	| 'review-ready'
	| 'accepted'
	| 'rejected'
	| 'failed'
	| 'cancelled';

export interface OutlineGenerationStateDeps {
	runner?: OutlineGenerationRunner;
	listCheckpoints?: (projectId: string) => Promise<Record<string, OutlineDraftCheckpointRecord>>;
}

const INITIAL_RUNNER_STATE: OutlineGenerationRunnerState = {
	status: 'idle',
	active: false,
	lastInput: null,
	result: null,
	error: null,
};

function normalizeProjectId(projectId: string | null | undefined): string | null {
	return projectId?.trim() || null;
}

function sortCheckpoints(
	checkpoints: ReadonlyArray<OutlineDraftCheckpointRecord>,
): OutlineDraftCheckpointRecord[] {
	return [...checkpoints].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function upsertCheckpoint(
	checkpoints: ReadonlyArray<OutlineDraftCheckpointRecord>,
	checkpoint: OutlineDraftCheckpointRecord,
): OutlineDraftCheckpointRecord[] {
	const index = checkpoints.findIndex((item) => item.id === checkpoint.id);
	if (index < 0) return sortCheckpoints([checkpoint, ...checkpoints]);
	const next = [...checkpoints];
	next[index] = checkpoint;
	return sortCheckpoints(next);
}

function failureResult(error: OutlineGenerationRunnerError): OutlineGenerationRunnerFailure {
	return {
		ok: false,
		status: 'failed',
		error,
	};
}

export class OutlineGenerationStateStore {
	projectId = $state<string | null>(null);
	status = $state<OutlineGenerationStateStatus>('idle');
	checkpoint = $state<OutlineDraftCheckpointRecord | null>(null);
	checkpoints = $state<OutlineDraftCheckpointRecord[]>([]);
	error = $state<OutlineGenerationRunnerError | null>(null);
	runnerState = $state<OutlineGenerationRunnerState>(INITIAL_RUNNER_STATE);
	loadingCheckpoints = $state(false);

	#runner: OutlineGenerationRunner;
	#listCheckpoints: (projectId: string) => Promise<Record<string, OutlineDraftCheckpointRecord>>;
	#loadRequestId = 0;

	constructor(deps: OutlineGenerationStateDeps = {}) {
		this.#runner = deps.runner ?? createOutlineGenerationRunner();
		this.#listCheckpoints = deps.listCheckpoints ?? listOutlineCheckpoints;
	}

	get active(): boolean {
		return this.status === 'running' || this.runnerState.active;
	}

	get canRetry(): boolean {
		return Boolean(this.runnerState.lastInput || this.projectId);
	}

	setProject(projectId: string | null | undefined): void {
		const normalized = normalizeProjectId(projectId);
		if (normalized === this.projectId) return;
		if (this.active) {
			this.#runner.cancel('Project changed during outline generation.');
		}
		this.projectId = normalized;
		this.status = 'idle';
		this.checkpoint = null;
		this.checkpoints = [];
		this.error = null;
		this.runnerState = INITIAL_RUNNER_STATE;
		this.loadingCheckpoints = false;
		this.#loadRequestId += 1;
	}

	async loadPendingCheckpoints(projectId: string | null | undefined = this.projectId): Promise<void> {
		const normalized = normalizeProjectId(projectId);
		if (normalized !== this.projectId) this.setProject(normalized);
		if (!normalized) {
			this.checkpoints = [];
			this.checkpoint = null;
			this.loadingCheckpoints = false;
			return;
		}

		const requestId = ++this.#loadRequestId;
		this.loadingCheckpoints = true;
		try {
			const records = await this.#listCheckpoints(normalized);
			if (requestId !== this.#loadRequestId || normalized !== this.projectId) return;
			const pending = sortCheckpoints(
				Object.values(records).filter((checkpoint) => checkpoint.lifecycle === 'review'),
			);
			this.checkpoints = pending;
			this.checkpoint = pending[0] ?? null;
			if (!this.active) {
				this.status = this.checkpoint ? 'review-ready' : 'idle';
				if (this.checkpoint) this.error = null;
			}
		} catch (err) {
			if (requestId !== this.#loadRequestId || normalized !== this.projectId) return;
			this.error = {
				code: 'checkpoint_load_failed',
				message: err instanceof Error ? err.message : 'Failed to load outline checkpoints.',
			};
			if (!this.active) this.status = 'failed';
		} finally {
			if (requestId === this.#loadRequestId && normalized === this.projectId) {
				this.loadingCheckpoints = false;
			}
		}
	}

	async generate(projectId: string | null | undefined = this.projectId): Promise<OutlineGenerationRunnerResult> {
		const normalized = normalizeProjectId(projectId);
		if (normalized !== this.projectId) this.setProject(normalized);
		if (!normalized) {
			const error = {
				code: 'invalid_request',
				message: 'Open a project before generating an outline.',
			};
			this.error = error;
			this.status = 'failed';
			this.checkpoint = null;
			return failureResult(error);
		}

		this.error = null;
		this.checkpoint = null;
		this.#runner.prepare({ projectId: normalized, confirmContextReady: true });
		this.#syncRunnerState();
		const promise = this.#runner.run();
		this.status = 'running';
		this.#syncRunnerState();
		const result = await promise;
		if (this.projectId === normalized) this.#applyResult(result);
		return result;
	}

	async retry(): Promise<OutlineGenerationRunnerResult> {
		if (!this.runnerState.lastInput) return this.generate(this.projectId);
		const runProjectId = this.runnerState.lastInput.projectId;
		this.error = null;
		this.checkpoint = null;
		const promise = this.#runner.retry();
		this.status = 'running';
		this.#syncRunnerState();
		const result = await promise;
		if (this.projectId === runProjectId) this.#applyResult(result);
		return result;
	}

	cancel(message = 'Outline generation cancelled.'): void {
		if (!this.active) return;
		this.#runner.cancel(message);
		this.#syncRunnerState();
		this.status = 'cancelled';
		this.error = this.runnerState.error;
		this.checkpoint = null;
	}

	applyCheckpointActionResult(checkpoint: OutlineDraftCheckpointRecord): void {
		if (this.projectId && checkpoint.projectId !== this.projectId) return;
		if (!this.projectId) this.projectId = checkpoint.projectId;
		this.checkpoint = checkpoint;
		this.checkpoints = upsertCheckpoint(this.checkpoints, checkpoint);
		this.error = null;
		if (checkpoint.lifecycle === 'accepted') {
			this.status = 'accepted';
		} else if (checkpoint.lifecycle === 'rejected') {
			this.status = 'rejected';
		} else if (checkpoint.lifecycle === 'review') {
			this.status = 'review-ready';
		} else {
			this.status = 'idle';
		}
	}

	__resetForTests(): void {
		if (this.active) this.#runner.cancel('Reset outline generation state.');
		this.projectId = null;
		this.status = 'idle';
		this.checkpoint = null;
		this.checkpoints = [];
		this.error = null;
		this.runnerState = INITIAL_RUNNER_STATE;
		this.loadingCheckpoints = false;
		this.#loadRequestId = 0;
	}

	#syncRunnerState(): void {
		this.runnerState = this.#runner.state;
	}

	#applyResult(result: OutlineGenerationRunnerResult): void {
		this.#syncRunnerState();
		if (result.ok) {
			this.#applySuccess(result);
			return;
		}

		this.checkpoint = null;
		this.error = result.error;
		this.status = result.status === 'cancelled' ? 'cancelled' : 'failed';
	}

	#applySuccess(result: OutlineGenerationRunnerSuccess): void {
		this.checkpoint = result.checkpoint;
		this.checkpoints = upsertCheckpoint(this.checkpoints, result.checkpoint);
		this.error = null;
		this.status = 'review-ready';
	}
}

export const outlineGenerationState = new OutlineGenerationStateStore();
