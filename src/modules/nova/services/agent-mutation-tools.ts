/**
 * plan-045 — Nova Agent mutation command registrations.
 *
 * These tools model trusted app/UI commands, not model-callable tools.
 * `listModelCallableTools()` excludes `mutation_command` definitions and
 * `dispatchTool()` rejects them by default so an unadvertised model tool
 * call cannot apply or reject author-review artifacts.
 */

import { registerTool } from './tool-registry.js';
import type { ToolInvocation } from '../types.js';
import {
	acceptSceneDraftCheckpoint,
	rejectSceneDraftCheckpoint,
} from './author-draft-api.js';

registerTool(
	{
		id: 'authorDraft.accept_checkpoint',
		description:
			'Accept a checkpoint and apply its prose to the target scene. This updates scenes.content only after validation gates pass.',
		capability: 'mutation_command',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
				checkpointId: { type: 'string', description: 'The checkpoint ID.' },
				sceneId: { type: 'string', description: 'The scene ID to apply into.' },
				forceOverwrite: { type: 'boolean', description: 'If true, override stale-target protection.' },
			},
			required: ['projectId', 'checkpointId', 'sceneId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId, checkpointId, sceneId, forceOverwrite } = invocation.input as {
			projectId: string;
			checkpointId: string;
			sceneId: string;
			forceOverwrite?: boolean;
		};
		try {
			const result = await acceptSceneDraftCheckpoint(projectId, checkpointId, sceneId, {
				forceOverwrite: forceOverwrite === true,
			});
			return { status: 'success', output: result.checkpoint };
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Accept failed.' };
		}
	},
);

registerTool(
	{
		id: 'authorDraft.reject_checkpoint',
		description: 'Reject a checkpoint with a reason. The checkpoint is retained for audit and review history.',
		capability: 'mutation_command',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
				checkpointId: { type: 'string', description: 'The checkpoint ID.' },
				reason: { type: 'string', description: 'Why the draft was rejected.' },
			},
			required: ['projectId', 'checkpointId', 'reason'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId, checkpointId, reason } = invocation.input as {
			projectId: string;
			checkpointId: string;
			reason: string;
		};
		try {
			const result = await rejectSceneDraftCheckpoint(projectId, checkpointId, reason);
			return { status: 'success', output: result.checkpoint };
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Reject failed.' };
		}
	},
);

export function registerAgentMutationTools(): void {
	// Side-effect-free export marker. Mutation command registrations run at
	// module load via the top-level registerTool() calls above.
}
