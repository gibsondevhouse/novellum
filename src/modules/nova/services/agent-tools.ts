/**
 * plan-031 stage-004 phase-002 + phase-003 — Nova Agent-mode tool registrations.
 *
 * Phase 002: Read-only project tools — pure data queries over existing
 * /api/db/* routes. No DB writes, no session mutation.
 *
 * Phase 003: Proposal-only tools — generate text proposals via the AI
 * proxy and return a ProposalEnvelope. Tools never auto-apply content;
 * all output requires explicit user acceptance.
 *
 * All handlers run client-side and fetch from server routes that hold
 * credentials. No key ever reaches this module.
 *
 * Source-contract constraint: this file must NOT import from
 * editor/manuscript mutation paths (enforced by tests/nova/agent-source-contracts.test.ts).
 */

import { registerTool } from './tool-registry.js';
import type { ToolInvocation } from '../types.js';
import {
	generateSceneDraftCheckpoint,
	getSceneDraftContext,
	listAuthorDraftCheckpoints,
} from './author-draft-api.js';

// --------------------------------------------------------------------------
// Phase 002 — Read-Only Project Tools
// --------------------------------------------------------------------------

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
	return res.json() as Promise<T>;
}

registerTool(
	{
		id: 'project.get_summary',
		description: 'Get the project title, genre, logline, and synopsis. Use this first to understand what the project is about.',
		capability: 'read_only',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
			},
			required: ['projectId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId } = invocation.input as { projectId: string };
		try {
			const project = await fetchJson<{
				id?: string;
				title?: string;
				genre?: string;
				logline?: string;
				synopsis?: string;
				targetWordCount?: number;
				status?: string;
			}>(`/api/db/projects/${encodeURIComponent(projectId)}`);
			return {
				status: 'success',
				output: {
					id: project.id,
					title: project.title ?? 'Untitled',
					genre: project.genre ?? '',
					logline: project.logline ?? '',
					synopsis: project.synopsis ?? '',
					targetWordCount: project.targetWordCount ?? 0,
					status: project.status ?? 'planning',
				},
			};
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Failed to load project.' };
		}
	},
);

registerTool(
	{
		id: 'project.list_scenes',
		description: 'List all scenes in the project with their titles, summaries, and chapter grouping. Use to understand the current scene structure.',
		capability: 'read_only',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
			},
			required: ['projectId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId } = invocation.input as { projectId: string };
		try {
			const scenes = await fetchJson<Array<{
				id?: string;
				title?: string;
				summary?: string;
				chapterId?: string;
				order?: number;
			}>>(`/api/db/scenes?projectId=${encodeURIComponent(projectId)}`);
			return {
				status: 'success',
				output: {
					count: scenes.length,
					scenes: scenes.map((s) => ({
						id: s.id,
						title: s.title ?? 'Untitled scene',
						summary: s.summary ?? '',
						chapterId: s.chapterId,
						order: s.order ?? 0,
					})),
				},
			};
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Failed to list scenes.' };
		}
	},
);

registerTool(
	{
		id: 'project.list_characters',
		description: 'List all characters in the project with their names and summaries.',
		capability: 'read_only',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
			},
			required: ['projectId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId } = invocation.input as { projectId: string };
		try {
			const chars = await fetchJson<Array<{
				id?: string;
				name?: string;
				summary?: string;
			}>>(`/api/db/characters?projectId=${encodeURIComponent(projectId)}`);
			return {
				status: 'success',
				output: {
					count: chars.length,
					characters: chars.map((c) => ({
						id: c.id,
						name: c.name ?? 'Unnamed',
						summary: c.summary ?? '',
					})),
				},
			};
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Failed to list characters.' };
		}
	},
);

registerTool(
	{
		id: 'project.list_locations',
		description: 'List all locations in the project with their names and summaries.',
		capability: 'read_only',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
			},
			required: ['projectId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId } = invocation.input as { projectId: string };
		try {
			const locs = await fetchJson<Array<{
				id?: string;
				name?: string;
				summary?: string;
			}>>(`/api/db/locations?projectId=${encodeURIComponent(projectId)}`);
			return {
				status: 'success',
				output: {
					count: locs.length,
					locations: locs.map((l) => ({
						id: l.id,
						name: l.name ?? 'Unnamed',
						summary: l.summary ?? '',
					})),
				},
			};
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Failed to list locations.' };
		}
	},
);

registerTool(
	{
		id: 'project.get_scene',
		description: 'Get the full content and details of a specific scene by its ID.',
		capability: 'read_only',
		inputSchema: {
			type: 'object',
			properties: {
				sceneId: { type: 'string', description: 'The scene ID to retrieve.' },
			},
			required: ['sceneId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { sceneId } = invocation.input as { sceneId: string };
		try {
			const scene = await fetchJson<{
				id?: string;
				title?: string;
				summary?: string;
				content?: string;
				wordCount?: number;
				notes?: string;
			}>(`/api/db/scenes/${encodeURIComponent(sceneId)}`);
			return {
				status: 'success',
				output: {
					id: scene.id,
					title: scene.title ?? 'Untitled scene',
					summary: scene.summary ?? '',
					content: scene.content ?? '',
					wordCount: scene.wordCount ?? 0,
					notes: scene.notes ?? '',
				},
			};
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Failed to load scene.' };
		}
	},
);

// --------------------------------------------------------------------------
// Phase 003 — Proposal-Only Tools
// --------------------------------------------------------------------------

/** ProposalEnvelope returned by mutation-like tools. Never auto-applied. */
export interface ProposalEnvelope {
	kind: 'agent-proposal';
	proposalType: 'outline' | 'scene-draft' | 'revision';
	content: string;
	metadata: Record<string, unknown>;
}

async function generateProposal(
	instruction: string,
	projectContext: string,
	outputType: string,
): Promise<string> {
	const systemPrompt = [
		'You are a creative writing assistant generating a detailed proposal.',
		`Generate a ${outputType} proposal based on the project context and instruction provided.`,
		'Return ONLY the proposal content — no preamble, no explanations, no markdown meta-commentary.',
		'The proposal will be reviewed by the author before any content is applied.',
	].join('\n');

	const res = await fetch('/api/ai', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: 'openai/gpt-4o-mini',
			messages: [
				{ role: 'system', content: systemPrompt },
				{
					role: 'user',
					content: `## Project Context\n\n${projectContext}\n\n## Instruction\n\n${instruction}`,
				},
			],
		}),
	});

	if (!res.ok) throw new Error(`AI proxy error: ${res.status}`);
	const data = (await res.json()) as { text?: string; error?: { message?: string } };
	if (data.error) throw new Error(data.error.message ?? 'AI error');
	return data.text ?? '';
}

registerTool(
	{
		id: 'propose.outline',
		description:
			'Generate a structured outline proposal for the project. Returns a detailed chapter and scene breakdown. ' +
			'The proposal is NOT automatically applied — it requires explicit author acceptance.',
		capability: 'review_artifact_generation',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
				instruction: { type: 'string', description: 'Outline requirements and story direction.' },
				projectContext: {
					type: 'string',
					description: 'Project logline and synopsis for grounding the proposal.',
				},
			},
			required: ['projectId', 'instruction', 'projectContext'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { instruction, projectContext } = invocation.input as {
			projectId: string;
			instruction: string;
			projectContext: string;
		};
		try {
			const content = await generateProposal(instruction, projectContext, 'story outline');
			const envelope: ProposalEnvelope = {
				kind: 'agent-proposal',
				proposalType: 'outline',
				content,
				metadata: { instruction },
			};
			return { status: 'success', output: envelope };
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Proposal generation failed.' };
		}
	},
);

registerTool(
	{
		id: 'propose.scene_draft',
		description:
			'Generate a scene draft proposal. Returns prose for a specific scene. ' +
			'The draft is NOT automatically applied — it requires explicit author acceptance.',
		capability: 'review_artifact_generation',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
				instruction: {
					type: 'string',
					description: 'Scene requirements: what happens, who is in it, tone, length.',
				},
				projectContext: {
					type: 'string',
					description: 'Project and character context to ground the draft.',
				},
			},
			required: ['projectId', 'instruction', 'projectContext'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { instruction, projectContext } = invocation.input as {
			projectId: string;
			instruction: string;
			projectContext: string;
		};
		try {
			const content = await generateProposal(instruction, projectContext, 'scene draft');
			const envelope: ProposalEnvelope = {
				kind: 'agent-proposal',
				proposalType: 'scene-draft',
				content,
				metadata: { instruction },
			};
			return { status: 'success', output: envelope };
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Scene draft generation failed.' };
		}
	},
);

export function registerAgentTools(): void {
	// Side-effect-free export marker. The registrations run at module-load
	// via the top-level registerTool() calls above. Import this module to
	// register all Agent-mode tools.
}

// --------------------------------------------------------------------------
// Plan-038 — Author Draft Engine model-callable tools
// --------------------------------------------------------------------------

registerTool(
	{
		id: 'authorDraft.get_scene_draft_context',
		description: 'Fetch the scene draft context (project/chapter/scene intent + continuity hints) used for scene drafting.',
		capability: 'read_only',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
				sceneId: { type: 'string', description: 'The scene ID.' },
			},
			required: ['projectId', 'sceneId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId, sceneId } = invocation.input as { projectId: string; sceneId: string };
		try {
			const context = await getSceneDraftContext(projectId, sceneId);
			return { status: 'success', output: context };
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Failed to load scene draft context.' };
		}
	},
);

registerTool(
	{
		id: 'authorDraft.generate_scene_draft_checkpoint',
		description:
			'Generate a persisted scene-draft checkpoint for a scene. This stores a review artifact only; it does not apply content to the manuscript.',
		capability: 'review_artifact_generation',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
				sceneId: { type: 'string', description: 'The scene ID.' },
				forceRegenerate: { type: 'boolean', description: 'If true, supersede any active draft/review checkpoint for this scene.' },
			},
			required: ['projectId', 'sceneId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId, sceneId, forceRegenerate } = invocation.input as {
			projectId: string;
			sceneId: string;
			forceRegenerate?: boolean;
		};
		try {
			const result = await generateSceneDraftCheckpoint(projectId, sceneId, {
				forceRegenerate: forceRegenerate === true,
			});
			return { status: 'success', output: result.checkpoint };
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Checkpoint generation failed.' };
		}
	},
);

registerTool(
	{
		id: 'authorDraft.list_checkpoints',
		description: 'List author-draft checkpoints for a project (optionally filtered by chapter/scene/lifecycle).',
		capability: 'read_only',
		inputSchema: {
			type: 'object',
			properties: {
				projectId: { type: 'string', description: 'The project ID.' },
				chapterId: { type: 'string', description: 'Optional chapter ID filter.' },
				sceneId: { type: 'string', description: 'Optional scene ID filter.' },
				lifecycle: {
					type: 'string',
					description: 'Optional lifecycle filter: review|accepted|rejected.',
					enum: ['review', 'accepted', 'rejected'],
				},
			},
			required: ['projectId'],
		},
	},
	async (invocation: ToolInvocation) => {
		const { projectId, chapterId, sceneId, lifecycle } = invocation.input as {
			projectId: string;
			chapterId?: string;
			sceneId?: string;
			lifecycle?: 'review' | 'accepted' | 'rejected';
		};
		try {
			const checkpoints = await listAuthorDraftCheckpoints(projectId, { chapterId, sceneId, lifecycle });
			return { status: 'success', output: { count: checkpoints.length, checkpoints } };
		} catch (err) {
			return { status: 'error', error: err instanceof Error ? err.message : 'Failed to list checkpoints.' };
		}
	},
);
