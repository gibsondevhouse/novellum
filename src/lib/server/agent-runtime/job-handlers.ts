import {
	createJobQueueRepository,
	type EnqueueJobInput,
	type JobQueueRepository,
} from './job-queue.js';
import {
	createRunLedgerRepository,
	type CreateRunInput,
	type RunLedgerRepository,
} from './run-ledger.js';
import type { AgentJobRecord, AgentRunRecord } from './types.js';

export const KNOWN_AGENT_JOB_TYPES = {
	outlineGenerate: 'outline.generate',
	authorDraftGenerate: 'author-draft.generate',
	worldbuildingScan: 'worldbuilding.scan',
	novaAgentLoop: 'nova.agent-loop',
} as const;

export type KnownAgentJobType =
	(typeof KNOWN_AGENT_JOB_TYPES)[keyof typeof KNOWN_AGENT_JOB_TYPES];

export interface AgentJobHandlerContext {
	job: AgentJobRecord;
	run: AgentRunRecord | null;
	payload: unknown;
	ledger: RunLedgerRepository;
	queue: JobQueueRepository;
	signal?: AbortSignal;
	heartbeat: (progress?: {
		current?: number;
		total?: number;
		label?: string;
	}) => AgentJobRecord;
}

export interface AgentJobHandlerResult {
	runStatus?: 'completed' | 'waiting_for_review';
	resultArtifactId?: string | null;
	progressCurrent?: number;
	progressTotal?: number;
	progressLabel?: string;
	statusReason?: string;
}

export type AgentJobHandler = (
	context: AgentJobHandlerContext,
) => AgentJobHandlerResult | Promise<AgentJobHandlerResult>;

export interface AgentJobHandlerRegistry {
	register(jobType: string, handler: AgentJobHandler): void;
	get(jobType: string): AgentJobHandler | null;
	has(jobType: string): boolean;
	listJobTypes(): string[];
}

class MapAgentJobHandlerRegistry implements AgentJobHandlerRegistry {
	private readonly handlers = new Map<string, AgentJobHandler>();

	constructor(entries: Record<string, AgentJobHandler> = {}) {
		for (const [jobType, handler] of Object.entries(entries)) {
			this.register(jobType, handler);
		}
	}

	register(jobType: string, handler: AgentJobHandler): void {
		this.handlers.set(jobType, handler);
	}

	get(jobType: string): AgentJobHandler | null {
		return this.handlers.get(jobType) ?? null;
	}

	has(jobType: string): boolean {
		return this.handlers.has(jobType);
	}

	listJobTypes(): string[] {
		return [...this.handlers.keys()].sort();
	}
}

export function createAgentJobHandlerRegistry(
	entries: Record<string, AgentJobHandler> = {},
): AgentJobHandlerRegistry {
	return new MapAgentJobHandlerRegistry(entries);
}

export function isQueuedExecutionRequest(body: {
	defer?: unknown;
	executionMode?: unknown;
}): boolean {
	return body.defer === true || body.executionMode === 'queued';
}

export interface EnqueueKnownAgentJobInput {
	jobType: KnownAgentJobType;
	projectId?: string | null;
	family: string;
	entrypoint: string;
	targetKind?: string;
	targetId?: string;
	targetJson?: unknown;
	requestedBy?: string;
	payload?: unknown;
	payloadRedactedJson?: unknown;
	payloadHash?: string;
	priority?: number;
	maxAttempts?: number;
	run?: Partial<CreateRunInput>;
	job?: Partial<EnqueueJobInput>;
}

export interface EnqueueKnownAgentJobResult {
	queued: true;
	run: AgentRunRecord;
	job: AgentJobRecord;
}

export function enqueueKnownAgentJob(
	input: EnqueueKnownAgentJobInput,
	deps: {
		ledger?: RunLedgerRepository;
		queue?: JobQueueRepository;
	} = {},
): EnqueueKnownAgentJobResult {
	const ledger = deps.ledger ?? createRunLedgerRepository();
	const queue = deps.queue ?? createJobQueueRepository();
	const run = ledger.createRun({
		projectId: input.projectId ?? null,
		family: input.family,
		entrypoint: input.entrypoint,
		status: 'pending',
		requestedBy: input.requestedBy ?? 'user',
		targetKind: input.targetKind ?? '',
		targetId: input.targetId ?? '',
		targetJson: input.targetJson ?? {},
		...input.run,
	});
	const job = queue.enqueueJob({
		runId: run.id,
		projectId: run.projectId,
		jobType: input.jobType,
		priority: input.priority ?? 0,
		payload: input.payload,
		payloadRedactedJson: input.payloadRedactedJson,
		payloadHash: input.payloadHash,
		maxAttempts: input.maxAttempts ?? 3,
		...input.job,
	});
	return { queued: true, run, job };
}
