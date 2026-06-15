import { CONTROLLER_JSON_SCHEMAS } from './output-schemas.js';
import type {
	AiControllerWorkflowDefinition,
	AiControllerWorkflowId,
} from './workflow-contracts.js';

const REVIEW_OWNER = 'aiControllerArtifacts.v1';

export const BUILT_IN_CONTROLLER_WORKFLOWS: readonly AiControllerWorkflowDefinition[] = [
	{
		id: 'nova.ask',
		intent: 'nova.ask',
		title: 'Nova Ask',
		description: 'Answer a scoped author question without creating a draft artifact.',
		entrypoint: 'nova.ask',
		permission: { level: 'read_only', reviewGate: false },
		context: { policy: 'project_summary', requiredTargetKinds: [], maxTokens: 4_000 },
		model: {
			profile: 'chat',
			maxOutputTokens: 2_000,
			temperature: 0.4,
			requireJsonSchemaOutput: false,
			allowStreaming: true,
		},
		output: { schemaName: 'text_response', schemaVersion: '1.0.0', responseFormatName: 'text' },
		artifact: { type: 'answer', persist: false, defaultStatus: 'draft', ownerId: REVIEW_OWNER },
		allowedTools: ['read', 'search', 'context'],
	},
	{
		id: 'nova.agent',
		intent: 'nova.agent',
		title: 'Nova Agent',
		description: 'Run one bounded tool-capable Nova agent step.',
		entrypoint: 'nova.agent',
		permission: { level: 'proposal_only', reviewGate: true },
		context: { policy: 'project_summary', requiredTargetKinds: [], maxTokens: 6_000 },
		model: {
			profile: 'agent',
			maxOutputTokens: 2_000,
			temperature: 0.3,
			requireJsonSchemaOutput: false,
			allowStreaming: false,
		},
		output: { schemaName: 'tool_response', schemaVersion: '1.0.0', responseFormatName: 'tool' },
		artifact: { type: 'nova_agent_step', persist: true, defaultStatus: 'review', ownerId: REVIEW_OWNER },
		allowedTools: ['read', 'search', 'draft_artifact'],
	},
	...(['prose.continue', 'prose.rewrite', 'prose.edit', 'prose.style_check'] as const).map(
		(id): AiControllerWorkflowDefinition => ({
			id,
			intent: id,
			title: id.replace('.', ' '),
			description: 'Generate reviewable prose assistance without direct manuscript mutation.',
			entrypoint: id,
			permission: { level: 'proposal_only', reviewGate: true },
			context: { policy: 'scene_plus_adjacent', requiredTargetKinds: [], maxTokens: 5_000 },
			model: {
				profile: 'creative',
				maxOutputTokens: 2_000,
				temperature: 0.6,
				requireJsonSchemaOutput: id !== 'prose.continue',
				allowStreaming: false,
			},
			output: { schemaName: 'text_response', schemaVersion: '1.0.0', responseFormatName: 'text' },
			artifact: { type: 'prose_suggestion', persist: true, defaultStatus: 'review', ownerId: REVIEW_OWNER },
			allowedTools: ['read', 'context', 'draft_artifact'],
		}),
	),
	{
		id: 'continuity.check',
		intent: 'continuity.check',
		title: 'Continuity Check',
		description: 'Analyze scoped story context for continuity issues.',
		entrypoint: 'continuity.check',
		permission: { level: 'read_only', reviewGate: false },
		context: { policy: 'continuity_scope', requiredTargetKinds: [], maxTokens: 6_000 },
		model: {
			profile: 'analytical',
			maxOutputTokens: 2_000,
			temperature: 0.2,
			requireJsonSchemaOutput: true,
			allowStreaming: false,
		},
		output: { schemaName: 'text_response', schemaVersion: '1.0.0', responseFormatName: 'continuity' },
		artifact: { type: 'continuity_report', persist: false, defaultStatus: 'draft', ownerId: REVIEW_OWNER },
		allowedTools: ['read', 'context'],
	},
	{
		id: 'outline.generate',
		intent: 'outline.generate',
		title: 'Outline Generation',
		description: 'Generate a review-gated outline checkpoint from scoped project context.',
		entrypoint: 'outline.generate',
		permission: { level: 'proposal_only', reviewGate: true },
		context: { policy: 'outline_scope', requiredTargetKinds: ['project'], maxTokens: 8_000 },
		model: {
			profile: 'structured',
			maxOutputTokens: 6_000,
			temperature: 0.35,
			requireJsonSchemaOutput: true,
			allowStreaming: false,
		},
		output: { schemaName: 'artifact_ref', schemaVersion: '1.0.0', responseFormatName: 'artifact_ref' },
		artifact: { type: 'outline_checkpoint', persist: true, defaultStatus: 'review', ownerId: REVIEW_OWNER },
		allowedTools: ['read', 'context', 'draft_artifact'],
	},
	{
		id: 'author_draft.generate',
		intent: 'author_draft.generate',
		title: 'Author Draft Generation',
		description: 'Generate a review-gated scene draft checkpoint.',
		entrypoint: 'author-draft.generate',
		permission: { level: 'proposal_only', reviewGate: true },
		context: { policy: 'outline_scope', requiredTargetKinds: ['scene'], maxTokens: 8_000 },
		model: {
			profile: 'creative',
			maxOutputTokens: 2_000,
			temperature: 0.6,
			requireJsonSchemaOutput: true,
			allowStreaming: false,
		},
		output: { schemaName: 'artifact_ref', schemaVersion: '1.0.0', responseFormatName: 'artifact_ref' },
		artifact: { type: 'author_draft_checkpoint', persist: true, defaultStatus: 'review', ownerId: REVIEW_OWNER },
		allowedTools: ['read', 'context', 'draft_artifact'],
	},
	{
		id: 'worldbuilding.scan',
		intent: 'worldbuilding.scan',
		title: 'Worldbuilding Scan',
		description: 'Generate reviewable worldbuilding proposals.',
		entrypoint: 'worldbuilding.scan',
		permission: { level: 'proposal_only', reviewGate: true },
		context: { policy: 'worldbuilding_scope', requiredTargetKinds: ['worldbuilding_entity'], maxTokens: 8_000 },
		model: {
			profile: 'structured',
			maxOutputTokens: 3_500,
			temperature: 0.35,
			requireJsonSchemaOutput: true,
			allowStreaming: false,
		},
		output: { schemaName: 'proposal_list', schemaVersion: '1.0.0', responseFormatName: 'proposal_list' },
		artifact: { type: 'worldbuilding_proposals', persist: true, defaultStatus: 'review', ownerId: REVIEW_OWNER },
		allowedTools: ['read', 'context', 'draft_artifact'],
	},
	{
		id: 'worldbuilding.generate',
		intent: 'worldbuilding.generate',
		title: 'Worldbuilding Draft Generation',
		description: 'Generate reviewable worldbuilding entity drafts.',
		entrypoint: 'worldbuilding.generate',
		permission: { level: 'proposal_only', reviewGate: true },
		context: { policy: 'worldbuilding_scope', requiredTargetKinds: ['worldbuilding_entity'], maxTokens: 6_000 },
		model: {
			profile: 'structured',
			maxOutputTokens: 4_000,
			temperature: 0.5,
			requireJsonSchemaOutput: true,
			allowStreaming: false,
		},
		output: { schemaName: 'draft_list', schemaVersion: '1.0.0', responseFormatName: 'draft_list' },
		artifact: { type: 'worldbuilding_drafts', persist: true, defaultStatus: 'review', ownerId: REVIEW_OWNER },
		allowedTools: ['read', 'context', 'draft_artifact'],
	},
	...(['artifact.accept', 'artifact.reject'] as const).map(
		(id): AiControllerWorkflowDefinition => ({
			id,
			intent: id,
			title: id === 'artifact.accept' ? 'Accept Artifact' : 'Reject Artifact',
			description: 'Apply a human review decision to a governed controller artifact.',
			entrypoint: id,
			permission: { level: 'review_decision', reviewGate: false },
			context: { policy: 'project_summary', requiredTargetKinds: ['pipeline'], maxTokens: 1_000 },
			model: {
				profile: 'analytical',
				maxOutputTokens: 0,
				temperature: 0,
				requireJsonSchemaOutput: false,
				allowStreaming: false,
			},
			output: { schemaName: 'artifact_ref', schemaVersion: '1.0.0', responseFormatName: 'artifact_ref' },
			artifact: { type: 'review_decision', persist: true, defaultStatus: 'draft', ownerId: REVIEW_OWNER },
			allowedTools: ['review_decision'],
		}),
	),
];

export interface AiControllerWorkflowRegistry {
	get(id: AiControllerWorkflowId): AiControllerWorkflowDefinition | null;
	list(): AiControllerWorkflowDefinition[];
	responseFormatFor(workflow: AiControllerWorkflowDefinition):
		| {
				type: 'json_schema';
				jsonSchema: { name: string; strict: true; schema: Record<string, unknown> };
		  }
		| undefined;
}

export function createControllerWorkflowRegistry(
	workflows: readonly AiControllerWorkflowDefinition[] = BUILT_IN_CONTROLLER_WORKFLOWS,
): AiControllerWorkflowRegistry {
	const byId = new Map(workflows.map((workflow) => [workflow.id, workflow]));
	return {
		get(id) {
			return byId.get(id) ?? null;
		},
		list() {
			return [...byId.values()];
		},
		responseFormatFor(workflow) {
			const schema = CONTROLLER_JSON_SCHEMAS[workflow.output.schemaName];
			if (!schema || !workflow.model.requireJsonSchemaOutput) return undefined;
			return {
				type: 'json_schema',
				jsonSchema: {
					name: workflow.output.responseFormatName,
					strict: true,
					schema,
				},
			};
		},
	};
}
