import type { PipelineHierarchyPath } from './seven-layer-outline.js';
import type { WorldbuildTaskKey, WorldbuildPayload } from '$lib/ai/pipeline/worldbuild-agent.js';
import type { PipelineArtifactEnvelope } from '$lib/ai/pipeline/contracts.js';
import {
	PIPELINE_CHECKPOINT_SCHEMA_VERSION,
	WORLDBUILD_CHECKPOINT_OWNER_ID,
	type WorldbuildCheckpointRecord,
} from '$lib/ai/pipeline/checkpoint-contract.js';
import {
	createWorldbuildArtifactFromModelOutput,
	isWorldbuildTaskKey,
} from '$lib/ai/pipeline/worldbuild-agent.js';
import {
	getPipelineTaskDefinition,
	PIPELINE_ACTION_PREFIX,
} from '$lib/ai/pipeline/task-catalog.js';
import { upsertWorldbuildCheckpoint } from '$lib/project-metadata.js';

export type WorldbuildRunStatus =
	| 'idle'
	| 'ready'
	| 'running'
	| 'completed_pending_checkpoint'
	| 'failed';

export type WorldbuildRunErrorReason =
	| 'invalid_task'
	| 'invalid_path'
	| 'parse_failed'
	| 'transport_failed'
	| 'checkpoint_staging_failed'
	| 'duplicate_run';

export interface WorldbuildRunInput {
	taskKey: WorldbuildTaskKey;
	projectId: string;
	hierarchyPath: PipelineHierarchyPath;
	instruction?: string;
	options?: Record<string, unknown>;
}

export type WorldbuildRunResult =
	| {
			ok: true;
			artifact: PipelineArtifactEnvelope<WorldbuildPayload>;
			checkpoint: WorldbuildCheckpointRecord;
	  }
	| {
			ok: false;
			reason: WorldbuildRunErrorReason;
			error: string;
	  };

let activeRunKey: string | null = null;

function runKey(input: WorldbuildRunInput): string {
	return `${input.projectId}:${input.taskKey}:${input.hierarchyPath.stageId ?? 'none'}`;
}

export function isRunning(): boolean {
	return activeRunKey !== null;
}

export function validateRunInput(input: WorldbuildRunInput): WorldbuildRunResult | null {
	if (!isWorldbuildTaskKey(input.taskKey)) {
		return {
			ok: false,
			reason: 'invalid_task',
			error: `Task key ${input.taskKey} is not a worldbuild pipeline stage.`,
		};
	}

	if (input.hierarchyPath.stageId === undefined || input.hierarchyPath.stageId === null) {
		return {
			ok: false,
			reason: 'invalid_path',
			error: 'A valid stageId is required to run a worldbuild pipeline task.',
		};
	}

	if (input.hierarchyPath.arcId === undefined || input.hierarchyPath.arcId === null) {
		return {
			ok: false,
			reason: 'invalid_path',
			error: 'A valid arcId is required in the hierarchy path.',
		};
	}

	if (activeRunKey !== null) {
		return {
			ok: false,
			reason: 'duplicate_run',
			error: 'A worldbuild pipeline run is already in progress.',
		};
	}

	return null;
}

export function buildRunPayload(input: WorldbuildRunInput): {
	action: string;
	projectId: string;
	uiContext: {
		activeProjectId: string;
		activeSceneId: null;
		activeBeatId: null;
		activeChapterId: null;
	};
} {
	return {
		action: `${PIPELINE_ACTION_PREFIX}${input.taskKey}`,
		projectId: input.projectId,
		uiContext: {
			activeProjectId: input.projectId,
			activeSceneId: null,
			activeBeatId: null,
			activeChapterId: null,
		},
	};
}

function buildHierarchyReferences(
	path: PipelineHierarchyPath,
): Record<string, string[]> {
	const refs: Record<string, string[]> = {};
	if (path.arcId) refs.arcs = [path.arcId];
	if (path.actId) refs.acts = [path.actId];
	if (path.milestoneId) refs.milestones = [path.milestoneId];
	if (path.chapterId) refs.chapters = [path.chapterId];
	if (path.sceneId) refs.scenes = [path.sceneId];
	if (path.beatId) refs.beats = [path.beatId];
	if (path.stageId) refs.stages = [path.stageId];
	return refs;
}

export async function runWorldbuildPipelineTask(
	input: WorldbuildRunInput,
): Promise<WorldbuildRunResult> {
	const validationError = validateRunInput(input);
	if (validationError) return validationError;

	const key = runKey(input);
	activeRunKey = key;

	try {
		const taskDef = getPipelineTaskDefinition(input.taskKey);
		if (!taskDef) {
			return {
				ok: false,
				reason: 'invalid_task',
				error: `No pipeline task definition found for ${input.taskKey}.`,
			};
		}

		const payload = buildRunPayload(input);

		let rawOutput: string;
		try {
			const res = await fetch('/api/ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as {
					error?: { message?: string; code?: string };
				};
				const message = body.error?.message ?? `API returned ${res.status}`;
				return { ok: false, reason: 'transport_failed', error: message };
			}

			const body = (await res.json()) as { content?: string };
			rawOutput = body.content ?? '';
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown transport error';
			return { ok: false, reason: 'transport_failed', error: message };
		}

		const artifactResult = createWorldbuildArtifactFromModelOutput({
			task: {
				key: taskDef.key,
				family: taskDef.family,
				stage: taskDef.stage,
				outputFormat: taskDef.outputFormat,
				role: taskDef.role,
				contextPolicy: taskDef.contextPolicy,
			},
			rawOutput,
			hierarchyReferences: buildHierarchyReferences(input.hierarchyPath),
		});

		if (!artifactResult.ok) {
			return {
				ok: false,
				reason: 'parse_failed',
				error: artifactResult.parse.fallbackMessage,
			};
		}

		const createdAt = new Date().toISOString();
		const draftCheckpoint: WorldbuildCheckpointRecord = {
			id: artifactResult.artifact.id,
			projectId: input.projectId,
			ownerId: WORLDBUILD_CHECKPOINT_OWNER_ID,
			version: PIPELINE_CHECKPOINT_SCHEMA_VERSION,
			lifecycle: 'draft',
			taskKey: artifactResult.artifact.taskKey as WorldbuildTaskKey,
			artifact: { ...artifactResult.artifact, lifecycle: 'draft' },
			createdAt,
			updatedAt: createdAt,
			review: null,
			acceptance: null,
			rejection: null,
		};

		let checkpoint: WorldbuildCheckpointRecord;
		try {
			checkpoint = await upsertWorldbuildCheckpoint(
				input.projectId,
				draftCheckpoint.id,
				{ artifact: draftCheckpoint.artifact, version: draftCheckpoint.version },
			);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown checkpoint staging error';
			return { ok: false, reason: 'checkpoint_staging_failed', error: message };
		}

		return {
			ok: true,
			artifact: artifactResult.artifact,
			checkpoint,
		};
	} finally {
		if (activeRunKey === key) {
			activeRunKey = null;
		}
	}
}
