import type { AiControllerRequestSource, AiControllerTargetKind } from './contracts.js';

export const AI_CONTROLLER_INTENTS = [
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
	'unsupported',
] as const;

export type AiControllerIntent = (typeof AI_CONTROLLER_INTENTS)[number];

export interface AiControllerIntentMetadata {
	intent: AiControllerIntent;
	label: string;
	category: 'read' | 'generate' | 'review_decision' | 'agentic' | 'unsupported';
	defaultTargetKind: AiControllerTargetKind;
	allowedSources: readonly AiControllerRequestSource[];
}

export const AI_CONTROLLER_INTENT_METADATA: Record<
	AiControllerIntent,
	AiControllerIntentMetadata
> = {
	'nova.ask': {
		intent: 'nova.ask',
		label: 'Nova Ask',
		category: 'read',
		defaultTargetKind: 'project',
		allowedSources: ['nova', 'api'],
	},
	'nova.agent': {
		intent: 'nova.agent',
		label: 'Nova Agent',
		category: 'agentic',
		defaultTargetKind: 'project',
		allowedSources: ['nova', 'api'],
	},
	'prose.continue': {
		intent: 'prose.continue',
		label: 'Continue Prose',
		category: 'generate',
		defaultTargetKind: 'scene',
		allowedSources: ['editor', 'nova', 'api'],
	},
	'prose.rewrite': {
		intent: 'prose.rewrite',
		label: 'Rewrite Prose',
		category: 'generate',
		defaultTargetKind: 'selection',
		allowedSources: ['editor', 'nova', 'api'],
	},
	'prose.edit': {
		intent: 'prose.edit',
		label: 'Edit Prose',
		category: 'generate',
		defaultTargetKind: 'selection',
		allowedSources: ['editor', 'nova', 'api'],
	},
	'prose.style_check': {
		intent: 'prose.style_check',
		label: 'Style Check',
		category: 'generate',
		defaultTargetKind: 'selection',
		allowedSources: ['editor', 'nova', 'api'],
	},
	'continuity.check': {
		intent: 'continuity.check',
		label: 'Continuity Check',
		category: 'read',
		defaultTargetKind: 'scene',
		allowedSources: ['editor', 'nova', 'api'],
	},
	'outline.generate': {
		intent: 'outline.generate',
		label: 'Generate Outline',
		category: 'generate',
		defaultTargetKind: 'project',
		allowedSources: ['outline', 'nova', 'api'],
	},
	'author_draft.generate': {
		intent: 'author_draft.generate',
		label: 'Generate Author Draft',
		category: 'generate',
		defaultTargetKind: 'scene',
		allowedSources: ['nova', 'editor', 'api'],
	},
	'worldbuilding.scan': {
		intent: 'worldbuilding.scan',
		label: 'Worldbuilding Scan',
		category: 'generate',
		defaultTargetKind: 'worldbuilding_entity',
		allowedSources: ['worldbuilding', 'nova', 'api'],
	},
	'worldbuilding.generate': {
		intent: 'worldbuilding.generate',
		label: 'Worldbuilding Draft Generation',
		category: 'generate',
		defaultTargetKind: 'worldbuilding_entity',
		allowedSources: ['worldbuilding', 'nova', 'api'],
	},
	'artifact.accept': {
		intent: 'artifact.accept',
		label: 'Accept AI Artifact',
		category: 'review_decision',
		defaultTargetKind: 'pipeline',
		allowedSources: ['nova', 'outline', 'worldbuilding', 'api'],
	},
	'artifact.reject': {
		intent: 'artifact.reject',
		label: 'Reject AI Artifact',
		category: 'review_decision',
		defaultTargetKind: 'pipeline',
		allowedSources: ['nova', 'outline', 'worldbuilding', 'api'],
	},
	unsupported: {
		intent: 'unsupported',
		label: 'Unsupported',
		category: 'unsupported',
		defaultTargetKind: 'unknown',
		allowedSources: ['nova', 'editor', 'outline', 'worldbuilding', 'api', 'system'],
	},
};

export function isAiControllerIntent(value: string): value is AiControllerIntent {
	return (AI_CONTROLLER_INTENTS as readonly string[]).includes(value);
}
