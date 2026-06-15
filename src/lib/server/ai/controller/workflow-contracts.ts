import type { ContextPolicy } from '$lib/ai/types.js';
import type { AiControllerIntent } from './intents.js';
import type { AiControllerPermissionLevel } from './permissions.js';
import type { ControllerOutputSchemaName } from './output-schemas.js';

export const AI_CONTROLLER_WORKFLOW_IDS = [
	'nova.ask',
	'nova.agent',
	'prose.continue',
	'prose.rewrite',
	'prose.edit',
	'prose.style_check',
	'continuity.check',
	'outline.generate',
	'author_draft.generate',
	'worldbuilding.scan',
	'worldbuilding.generate',
	'artifact.accept',
	'artifact.reject',
] as const;

export type AiControllerWorkflowId = (typeof AI_CONTROLLER_WORKFLOW_IDS)[number];

export interface AiControllerWorkflowDefinition {
	id: AiControllerWorkflowId;
	intent: Exclude<AiControllerIntent, 'unsupported'>;
	title: string;
	description: string;
	entrypoint: string;
	permission: {
		level: AiControllerPermissionLevel;
		reviewGate: boolean;
	};
	context: {
		policy: ContextPolicy;
		requiredTargetKinds: readonly string[];
		maxTokens: number;
	};
	model: {
		profile: 'chat' | 'agent' | 'creative' | 'analytical' | 'structured';
		defaultModel?: string;
		maxOutputTokens: number;
		temperature: number;
		requireJsonSchemaOutput: boolean;
		allowStreaming: boolean;
	};
	output: {
		schemaName: ControllerOutputSchemaName;
		schemaVersion: string;
		responseFormatName: string;
	};
	artifact: {
		type: string;
		persist: boolean;
		defaultStatus: 'draft' | 'review';
		ownerId: string;
	};
	allowedTools: readonly string[];
}
