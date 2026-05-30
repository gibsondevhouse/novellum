/**
 * plan-023 stage-005 phase-003 — Real RAG context hook.
 *
 * Delegates to module-ai's `ContextEngine` (via `$lib/ai`) to assemble
 * a baseline-first payload for the editor-side Nova chat.
 * Returns an additive shape that preserves stage-004's
 * `RagContextResult` keys while exposing the structured `aiContext`
 * for `buildPrompt`.
 */

import { buildContext } from '$lib/ai/context-engine.js';
import { resolveTask } from '$lib/ai/task-resolver.js';
import type { AiContext } from '$lib/ai/types.js';
import type { WorldbuildCheckpointRecord } from '$lib/ai/pipeline/checkpoint-contract.js';
import { WORLDBUILD_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import { listProjectMetadata } from '$lib/project-metadata.js';
import type { RagContextRequest, RagContextResult } from '../types.js';

function mergeWithProjectBaseline(aiContext: AiContext, baseline: AiContext): AiContext {
	return {
		...aiContext,
		project: aiContext.project ?? baseline.project ?? null,
		projectCounts: aiContext.projectCounts ?? baseline.projectCounts,
		storyFrames:
			aiContext.storyFrames && aiContext.storyFrames.length > 0
				? aiContext.storyFrames
				: (baseline.storyFrames ?? []),
	};
}

function collectMissingProjectFields(aiContext: AiContext): string[] {
	const project = aiContext.project;
	if (!project) return ['project metadata'];
	const missing: string[] = [];
	if (!project.logline?.trim()) missing.push('logline');
	if (!project.synopsis?.trim()) missing.push('synopsis');
	return missing;
}

export async function buildRagContext(
	req: RagContextRequest,
): Promise<RagContextResult> {
	if (!req.projectId) {
		return {
			aiContext: null,
			contextText: '',
			includedScopes: [],
			warnings: ['No project id provided.'],
		};
	}

	const uiContext = {
		activeProjectId: req.projectId,
		activeSceneId: req.activeSceneId,
		activeChapterId: null,
		activeBeatId: null,
	};
	const baselineTask = resolveTask('project_summary', {
		...uiContext,
		activeSceneId: null,
	});
	const baselineContext = await buildContext(baselineTask, req.projectId);
	const warnings: string[] = [];

	let aiContext = baselineContext;
	if (req.policy === 'outline_scope') {
		const outlineTask = resolveTask('pipeline:vibe-author.outline', uiContext);
		const outlineContext = await buildContext(outlineTask, req.projectId);
		aiContext = mergeWithProjectBaseline(outlineContext, baselineContext);
	} else if (req.policy === 'worldbuilding_scope') {
		const worldbuildTask = resolveTask('ask', {
			...uiContext,
			activeSceneId: null,
		});
		const worldbuildContext = await buildContext(worldbuildTask, req.projectId);
		aiContext = mergeWithProjectBaseline(worldbuildContext, baselineContext);
	} else if (req.activeSceneId) {
		const sceneTask = resolveTask('chat', uiContext);
		const sceneContext = await buildContext(sceneTask, req.projectId);
		aiContext = mergeWithProjectBaseline(sceneContext, baselineContext);
	} else {
		warnings.push('No active scene; using project baseline context only.');
	}

	const includedScopes: string[] = [];
	if (aiContext.project) includedScopes.push('project');
	if (aiContext.projectCounts) includedScopes.push('project-summary');
	if (aiContext.storyFrames && aiContext.storyFrames.length > 0) includedScopes.push('story-frame');
	if (aiContext.outlineHierarchy) includedScopes.push('outline');
	if (aiContext.scene) includedScopes.push('scene');
	if (aiContext.adjacentScenes.length > 0) includedScopes.push('adjacent-scenes');
	if (aiContext.characters.length > 0) includedScopes.push('characters');
	if (aiContext.locations.length > 0) includedScopes.push('locations');
	if (aiContext.factions && aiContext.factions.length > 0) includedScopes.push('factions');
	if (aiContext.loreEntries.length > 0) includedScopes.push('lore');
	if (aiContext.plotThreads.length > 0) includedScopes.push('plot-threads');
	if (aiContext.timelineEvents && aiContext.timelineEvents.length > 0) includedScopes.push('timeline');
	if (includedScopes.length === 0) includedScopes.push('no-context');

	const missingFields = collectMissingProjectFields(aiContext);
	if (missingFields.length > 0) {
		warnings.push(`Project context is missing: ${missingFields.join(', ')}.`);
	}

	return {
		aiContext,
		contextText: '',
		includedScopes,
		warnings: [...new Set(warnings)],
	};
}

function isCheckpointRecord(value: unknown): value is WorldbuildCheckpointRecord {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
	const record = value as Partial<WorldbuildCheckpointRecord>;
	return (
		typeof record.id === 'string' &&
		typeof record.lifecycle === 'string' &&
		typeof record.updatedAt === 'string' &&
		typeof record.taskKey === 'string'
	);
}

export async function listAcceptedWorldbuildCheckpointContext(
	projectId: string,
): Promise<WorldbuildCheckpointRecord[]> {
	return listWorldbuildCheckpointsByLifecycle(projectId, ['accepted']);
}

export async function listWorldbuildCheckpointsByLifecycle(
	projectId: string,
	lifecycles: ReadonlyArray<WorldbuildCheckpointRecord['lifecycle']>,
): Promise<WorldbuildCheckpointRecord[]> {
	const data = await listProjectMetadata(projectId, 'pipeline', WORLDBUILD_CHECKPOINT_OWNER_ID);
	const allowed = new Set(lifecycles);
	return Object.values(data)
		.filter((value): value is WorldbuildCheckpointRecord => isCheckpointRecord(value))
		.filter((record) => allowed.has(record.lifecycle))
		.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
