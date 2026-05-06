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
