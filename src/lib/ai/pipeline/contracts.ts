import type { ContextPolicy } from '../types.js';

export const OUTLINE_HIERARCHY = [
	'arcs',
	'acts',
	'milestones',
	'chapters',
	'scenes',
	'beats',
	'stages',
] as const;

export type OutlineLayer = (typeof OUTLINE_HIERARCHY)[number];

export type StageLifecycleStatus = 'planned' | 'in_progress' | 'completed';
export type ArtifactLifecycleStatus = 'draft' | 'review' | 'accepted' | 'rejected';
export type PipelineFamily =
	| 'vibe-worldbuild'
	| 'vibe-worldbuild-domain'
	| 'vibe-author'
	| 'vibe-outline';

export interface PipelineTaskContract {
	key: string;
	family: PipelineFamily;
	stage: string;
	role: string;
	contextPolicy: ContextPolicy;
	outputFormat: string;
}

export interface OutlineHierarchyReferences {
	arcs: string[];
	acts: string[];
	milestones: string[];
	chapters: string[];
	scenes: string[];
	beats: string[];
	stages: string[];
}

export interface OutlineHierarchySemantics {
	order: readonly OutlineLayer[];
	references: OutlineHierarchyReferences;
	stageStatusById: Record<string, StageLifecycleStatus>;
}

export interface PipelineArtifactEnvelope<TPayload = unknown> {
	id: string;
	taskKey: string;
	pipeline: PipelineFamily;
	stage: string;
	model: string | null;
	lifecycle: ArtifactLifecycleStatus;
	parserVersion: string;
	producedAt: string;
	hierarchy: OutlineHierarchySemantics;
	payload: TPayload;
	notes: string[];
}

export interface PipelineRunRequest<TPayload = unknown> {
	task: PipelineTaskContract;
	payload: TPayload;
	model?: string | null;
	producedAt?: string;
	lifecycle?: ArtifactLifecycleStatus;
	parserVersion?: string;
	hierarchyReferences?: Partial<Record<OutlineLayer, string[]>>;
	stageStatusById?: Record<string, StageLifecycleStatus>;
	notes?: string[];
}

export function createDefaultHierarchyReferences(
	overrides: Partial<Record<OutlineLayer, string[]>> = {},
): OutlineHierarchyReferences {
	return {
		arcs: [...(overrides.arcs ?? [])],
		acts: [...(overrides.acts ?? [])],
		milestones: [...(overrides.milestones ?? [])],
		chapters: [...(overrides.chapters ?? [])],
		scenes: [...(overrides.scenes ?? [])],
		beats: [...(overrides.beats ?? [])],
		stages: [...(overrides.stages ?? [])],
	};
}

export function createPipelineArtifactEnvelope<TPayload>(
	request: PipelineRunRequest<TPayload>,
): PipelineArtifactEnvelope<TPayload> {
	const producedAt = request.producedAt ?? new Date().toISOString();
	const idBase = request.task.key.replace(/[^a-z0-9_.-]/gi, '-');
	const uniqueId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

	return {
		id: `${idBase}:${uniqueId}`,
		taskKey: request.task.key,
		pipeline: request.task.family,
		stage: request.task.stage,
		model: request.model ?? null,
		lifecycle: request.lifecycle ?? 'draft',
		parserVersion: request.parserVersion ?? '1.0.0',
		producedAt,
		hierarchy: {
			order: OUTLINE_HIERARCHY,
			references: createDefaultHierarchyReferences(request.hierarchyReferences),
			stageStatusById: { ...(request.stageStatusById ?? {}) },
		},
		payload: request.payload,
		notes: [...(request.notes ?? [])],
	};
}
