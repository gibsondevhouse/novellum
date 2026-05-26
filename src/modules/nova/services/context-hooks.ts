/**
 * plan-023 stage-005 phase-003 — Real RAG context hook.
 *
 * Delegates to module-ai's `ContextEngine` (via `$lib/ai`) to assemble
 * a `scene_plus_adjacent` payload for the editor-side Nova chat.
 * Returns an additive shape that preserves stage-004's
 * `RagContextResult` keys while exposing the structured `aiContext`
 * for `buildPrompt`.
 */

import { buildContext } from '$lib/ai/context-engine.js';
import { resolveTask } from '$lib/ai/task-resolver.js';
import type { WorldbuildCheckpointRecord } from '$lib/ai/pipeline/checkpoint-contract.js';
import { WORLDBUILD_CHECKPOINT_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import { listProjectMetadata } from '$lib/project-metadata.js';
import type { RagContextRequest, RagContextResult } from '../types.js';

export async function buildRagContext(
	req: RagContextRequest,
): Promise<RagContextResult> {
	if (!req.projectId || !req.activeSceneId) {
		return {
			aiContext: null,
			contextText: '',
			includedScopes: [],
			warnings: [
				req.activeSceneId
					? 'No project id provided.'
					: 'No active scene; Nova will respond without scene context.',
			],
		};
	}

	const task = resolveTask('continue', {
		activeProjectId: req.projectId,
		activeSceneId: req.activeSceneId,
		activeChapterId: null,
		activeBeatId: null,
	});

	const aiContext = await buildContext(task, req.projectId);

	const includedScopes: string[] = [];
	if (aiContext.scene) includedScopes.push('scene');
	if (aiContext.adjacentScenes.length > 0) includedScopes.push('adjacent-scenes');
	if (aiContext.characters.length > 0) includedScopes.push('characters');
	if (aiContext.locations.length > 0) includedScopes.push('locations');

	return {
		aiContext,
		contextText: '',
		includedScopes,
		warnings: [],
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
	const data = await listProjectMetadata(projectId, 'pipeline', WORLDBUILD_CHECKPOINT_OWNER_ID);
	return Object.values(data)
		.filter((value): value is WorldbuildCheckpointRecord => isCheckpointRecord(value))
		.filter((record) => record.lifecycle === 'accepted')
		.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
