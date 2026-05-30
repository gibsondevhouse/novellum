import type { PipelineTaskContract } from './contracts.js';

export const PIPELINE_ACTION_PREFIX = 'pipeline:';

export const PIPELINE_TASK_KEYS = {
	WORLDBUILD_PREMISE: 'vibe-worldbuild.premise',
	WORLDBUILD_WORLDSPEC: 'vibe-worldbuild.worldspec',
	WORLDBUILD_RESEARCH: 'vibe-worldbuild.research',
	WORLDBUILD_WORLD_BIBLE: 'vibe-worldbuild.populated-world-bible',
	WORLDBUILD_DOMAIN_PERSONAE: 'vibe-worldbuild.domain.personae',
	WORLDBUILD_DOMAIN_ATLAS: 'vibe-worldbuild.domain.atlas',
	WORLDBUILD_DOMAIN_ARCHIVE: 'vibe-worldbuild.domain.archive',
	WORLDBUILD_DOMAIN_THREADS: 'vibe-worldbuild.domain.threads',
	WORLDBUILD_DOMAIN_CHRONICLES: 'vibe-worldbuild.domain.chronicles',
	AUTHOR_PREMISE: 'vibe-author.premise',
	AUTHOR_OUTLINE: 'vibe-author.outline',
	AUTHOR_SCENE_DRAFT: 'vibe-author.scene-draft',
	AUTHOR_REVISION_PACK: 'vibe-author.revision-pack',
} as const;

export type PipelineTaskKey = (typeof PIPELINE_TASK_KEYS)[keyof typeof PIPELINE_TASK_KEYS];
export type PipelineTaskTarget = 'project' | 'chapter' | 'scene';

export interface PipelineTaskDefinition extends PipelineTaskContract {
	target: PipelineTaskTarget;
}

export const PIPELINE_TASK_CATALOG: Readonly<Record<PipelineTaskKey, PipelineTaskDefinition>> = {
	[PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE,
		family: 'vibe-worldbuild',
		stage: 'premise',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_premise',
		role: 'You are the Novellum Vibe-Worldbuild Premise Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_WORLDSPEC]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_WORLDSPEC,
		family: 'vibe-worldbuild',
		stage: 'worldspec',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_worldspec',
		role: 'You are the Novellum Vibe-Worldbuild Worldspec Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH,
		family: 'vibe-worldbuild',
		stage: 'research',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_research_briefs',
		role: 'You are the Novellum Vibe-Worldbuild Research Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE,
		family: 'vibe-worldbuild',
		stage: 'populated-world-bible',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_populated_bible',
		role: 'You are the Novellum Vibe-Worldbuild Population Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE,
		family: 'vibe-worldbuild-domain',
		stage: 'domain-personae',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_domain_personae',
		role: 'You are the Novellum Worldbuilding Personae Domain Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ATLAS]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ATLAS,
		family: 'vibe-worldbuild-domain',
		stage: 'domain-atlas',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_domain_atlas',
		role: 'You are the Novellum Worldbuilding Atlas Domain Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ARCHIVE]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ARCHIVE,
		family: 'vibe-worldbuild-domain',
		stage: 'domain-archive',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_domain_archive',
		role: 'You are the Novellum Worldbuilding Archive Domain Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS,
		family: 'vibe-worldbuild-domain',
		stage: 'domain-threads',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_domain_threads',
		role: 'You are the Novellum Worldbuilding Threads Domain Agent.',
	},
	[PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_CHRONICLES]: {
		key: PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_CHRONICLES,
		family: 'vibe-worldbuild-domain',
		stage: 'domain-chronicles',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_worldbuild_domain_chronicles',
		role: 'You are the Novellum Worldbuilding Chronicles Domain Agent.',
	},
	[PIPELINE_TASK_KEYS.AUTHOR_PREMISE]: {
		key: PIPELINE_TASK_KEYS.AUTHOR_PREMISE,
		family: 'vibe-author',
		stage: 'premise',
		target: 'project',
		contextPolicy: 'continuity_scope',
		outputFormat: 'json_author_premise',
		role: 'You are the Novellum Vibe-Author Premise Agent.',
	},
	[PIPELINE_TASK_KEYS.AUTHOR_OUTLINE]: {
		key: PIPELINE_TASK_KEYS.AUTHOR_OUTLINE,
		family: 'vibe-author',
		stage: 'outline',
		target: 'project',
		contextPolicy: 'outline_scope',
		outputFormat: 'json_author_outline',
		role: 'You are the Novellum Vibe-Author Outline Agent.',
	},
	[PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT]: {
		key: PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT,
		family: 'vibe-author',
		stage: 'scene-draft',
		target: 'scene',
		contextPolicy: 'scene_plus_adjacent',
		outputFormat: 'prose_plus_scene_sidecar',
		role: 'You are the Novellum Vibe-Author Scene Draft Agent.',
	},
	[PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK]: {
		key: PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK,
		family: 'vibe-author',
		stage: 'revision-pack',
		target: 'scene',
		contextPolicy: 'chapter_scope',
		outputFormat: 'json_author_revision_pack',
		role: 'You are the Novellum Vibe-Author Revision Pack Agent.',
	},
};

export const WORLDBUILD_DOMAIN_PIPELINE_KEYS = [
	PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE,
	PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ATLAS,
	PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ARCHIVE,
	PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS,
	PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_CHRONICLES,
] as const;

export type WorldbuildDomainTaskKey = (typeof WORLDBUILD_DOMAIN_PIPELINE_KEYS)[number];

export function isWorldbuildDomainTaskKey(key: string): key is WorldbuildDomainTaskKey {
	return WORLDBUILD_DOMAIN_PIPELINE_KEYS.includes(key as WorldbuildDomainTaskKey);
}

export const PIPELINE_TASK_FAMILIES = {
	'vibe-worldbuild': [
		PIPELINE_TASK_KEYS.WORLDBUILD_PREMISE,
		PIPELINE_TASK_KEYS.WORLDBUILD_WORLDSPEC,
		PIPELINE_TASK_KEYS.WORLDBUILD_RESEARCH,
		PIPELINE_TASK_KEYS.WORLDBUILD_WORLD_BIBLE,
	] as const,
	'vibe-worldbuild-domain': [
		PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_PERSONAE,
		PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ATLAS,
		PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_ARCHIVE,
		PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_THREADS,
		PIPELINE_TASK_KEYS.WORLDBUILD_DOMAIN_CHRONICLES,
	] as const,
	'vibe-author': [
		PIPELINE_TASK_KEYS.AUTHOR_PREMISE,
		PIPELINE_TASK_KEYS.AUTHOR_OUTLINE,
		PIPELINE_TASK_KEYS.AUTHOR_SCENE_DRAFT,
		PIPELINE_TASK_KEYS.AUTHOR_REVISION_PACK,
	] as const,
} as const;

export function getPipelineTaskDefinition(key: string): PipelineTaskDefinition | null {
	return (PIPELINE_TASK_CATALOG as Record<string, PipelineTaskDefinition>)[key] ?? null;
}

export function resolvePipelineAction(action: string): PipelineTaskDefinition | null {
	if (!action.startsWith(PIPELINE_ACTION_PREFIX)) return null;
	const key = action.slice(PIPELINE_ACTION_PREFIX.length).trim();
	const task = getPipelineTaskDefinition(key);
	if (task) return task;

	const known = Object.values(PIPELINE_TASK_CATALOG)
		.map((entry) => entry.key)
		.sort()
		.join(', ');
	throw new Error(`Unknown pipeline stage key "${key}". Known keys: ${known}`);
}
