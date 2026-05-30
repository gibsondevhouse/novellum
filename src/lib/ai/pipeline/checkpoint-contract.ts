import { PIPELINE_TASK_KEYS } from './task-catalog.js';
import type { WorldbuildDomainTaskKey } from './task-catalog.js';
import type { PipelineArtifactEnvelope } from './contracts.js';
import type {
	WorldbuildPayload,
	WorldbuildPopulatedBiblePayload,
	WorldbuildPopulatedBibleTableWrites,
	WorldbuildTaskKey,
} from './worldbuild-agent.js';

export type AnyWorldbuildTaskKey = WorldbuildTaskKey | WorldbuildDomainTaskKey;

export interface WorldbuildProvenance {
	model: string;
	generationId: string;
	createdAt: string;
	sourceContextSummary: string;
}

export const PIPELINE_CHECKPOINT_SCHEMA_VERSION = '1.0.0' as const;
export const PIPELINE_METADATA_SCOPE = 'pipeline' as const;
export const WORLDBUILD_CHECKPOINT_OWNER_ID = 'vibe-worldbuild' as const;

export type CheckpointLifecycle = 'draft' | 'review' | 'accepted' | 'rejected';

export interface CheckpointReviewState {
	reviewedAt: string;
	reviewer: string | null;
	note: string;
}

export interface CheckpointAcceptanceState {
	acceptedAt: string;
	acceptedBy: string | null;
	note: string;
	projectionMode: 'atomic';
	projectedToCanon: boolean;
	entityCounts: Partial<Record<keyof WorldbuildPopulatedBibleTableWrites, number>>;
}

export interface CheckpointRejectionState {
	rejectedAt: string;
	rejectedBy: string | null;
	reason: string;
}

export interface WorldbuildCheckpointRecord {
	id: string;
	projectId: string;
	ownerId: string;
	version: string;
	lifecycle: CheckpointLifecycle;
	taskKey: AnyWorldbuildTaskKey;
	artifact: PipelineArtifactEnvelope<WorldbuildPayload>;
	createdAt: string;
	updatedAt: string;
	review: CheckpointReviewState | null;
	acceptance: CheckpointAcceptanceState | null;
	rejection: CheckpointRejectionState | null;
}

export interface PopulatedBibleCheckpointRecord extends Omit<WorldbuildCheckpointRecord, 'taskKey' | 'artifact'> {
	taskKey: typeof PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE;
	artifact: PipelineArtifactEnvelope<WorldbuildPopulatedBiblePayload>;
}

export interface WorldbuildDomainCheckpointRecord extends Omit<WorldbuildCheckpointRecord, 'taskKey'> {
	taskKey: WorldbuildDomainTaskKey;
	provenance: WorldbuildProvenance;
}

export const CHECKPOINT_LIFECYCLE_ORDER: readonly CheckpointLifecycle[] = [
	'draft',
	'review',
	'accepted',
	'rejected',
] as const;

export function isCheckpointLifecycle(value: unknown): value is CheckpointLifecycle {
	return typeof value === 'string' && CHECKPOINT_LIFECYCLE_ORDER.includes(value as CheckpointLifecycle);
}

export function isSupportedCheckpointVersion(version: string): boolean {
	return version === PIPELINE_CHECKPOINT_SCHEMA_VERSION;
}

export function hasPopulatedBibleProjection(
	record: WorldbuildCheckpointRecord,
): record is PopulatedBibleCheckpointRecord {
	if (record.taskKey !== PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE) {
		return false;
	}

	const payload = record.artifact.payload as WorldbuildPayload;
	if (typeof payload !== 'object' || payload === null) {
		return false;
	}

	const tableWrites = (payload as { tableWrites?: unknown }).tableWrites;
	if (typeof tableWrites !== 'object' || tableWrites === null) {
		return false;
	}

	const requiredLists: Array<keyof WorldbuildPopulatedBibleTableWrites> = [
		'characters',
		'locations',
		'factions',
		'themes',
		'glossary_terms',
		'lore_entries',
		'plot_threads',
		'timeline_events',
	];

	return requiredLists.every((key) => Array.isArray((tableWrites as Record<string, unknown>)[key]));
}

export function checkpointMetadataKeyForArtifact(artifactId: string): string {
	return artifactId;
}
