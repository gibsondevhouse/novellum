import type { AiControllerRequest } from './contracts.js';
import {
	AI_CONTROLLER_INTENT_METADATA,
	isAiControllerIntent,
	type AiControllerIntent,
} from './intents.js';
import type { AiControllerWorkflowId } from './workflow-contracts.js';

export interface ResolvedControllerIntent {
	intent: AiControllerIntent;
	workflowId: AiControllerWorkflowId | null;
	confidence: 'exact' | 'inferred' | 'fallback';
	reasons: string[];
	unsupportedAction?: string;
}

const ACTION_ALIASES: Record<string, AiControllerIntent> = {
	ask: 'nova.ask',
	chat: 'nova.ask',
	agent: 'nova.agent',
	continue: 'prose.continue',
	write: 'prose.continue',
	rewrite: 'prose.rewrite',
	edit: 'prose.edit',
	style_check: 'prose.style_check',
	style: 'prose.style_check',
	continuity_check: 'continuity.check',
	continuity: 'continuity.check',
	'outline.generate': 'outline.generate',
	'author-draft.generate': 'author_draft.generate',
	'authorDraft.generate_scene_draft_checkpoint': 'author_draft.generate',
	'worldbuilding.scan': 'worldbuilding.scan',
	'worldbuilding.generate': 'worldbuilding.generate',
	accept: 'artifact.accept',
	reject: 'artifact.reject',
};

const WORKFLOW_BY_INTENT: Record<Exclude<AiControllerIntent, 'unsupported'>, AiControllerWorkflowId> = {
	'nova.ask': 'nova.ask',
	'nova.agent': 'nova.agent',
	'prose.continue': 'prose.continue',
	'prose.rewrite': 'prose.rewrite',
	'prose.edit': 'prose.edit',
	'prose.style_check': 'prose.style_check',
	'continuity.check': 'continuity.check',
	'outline.generate': 'outline.generate',
	'author_draft.generate': 'author_draft.generate',
	'worldbuilding.scan': 'worldbuilding.scan',
	'worldbuilding.generate': 'worldbuilding.generate',
	'artifact.accept': 'artifact.accept',
	'artifact.reject': 'artifact.reject',
};

function normalizeAction(value: string): string {
	return value.trim().replace(/^pipeline:/, '').replace(/\s+/g, '_');
}

function intentFromAction(actionId: string): AiControllerIntent | null {
	const normalized = normalizeAction(actionId);
	if (isAiControllerIntent(normalized)) return normalized;
	if (ACTION_ALIASES[normalized]) return ACTION_ALIASES[normalized];
	if (normalized.includes('outline')) return 'outline.generate';
	if (normalized.includes('authorDraft') || normalized.includes('author-draft')) {
		return 'author_draft.generate';
	}
	if (normalized.includes('worldbuilding.scan')) return 'worldbuilding.scan';
	if (normalized.includes('worldbuilding.generate')) return 'worldbuilding.generate';
	if (normalized.includes('rewrite')) return 'prose.rewrite';
	if (normalized.includes('edit')) return 'prose.edit';
	if (normalized.includes('style')) return 'prose.style_check';
	if (normalized.includes('continuity')) return 'continuity.check';
	return null;
}

export function resolveControllerIntent(request: AiControllerRequest): ResolvedControllerIntent {
	const actionId = request.action.id;
	const exactIntent = intentFromAction(actionId);
	const reasons: string[] = [`action:${actionId}`, `source:${request.action.source}`];

	if (!exactIntent || exactIntent === 'unsupported') {
		return {
			intent: 'unsupported',
			workflowId: null,
			confidence: 'fallback',
			reasons: [...reasons, 'No deterministic intent match.'],
			unsupportedAction: actionId,
		};
	}

	const metadata = AI_CONTROLLER_INTENT_METADATA[exactIntent];
	if (!metadata.allowedSources.includes(request.action.source)) {
		return {
			intent: 'unsupported',
			workflowId: null,
			confidence: 'fallback',
			reasons: [
				...reasons,
				`Source ${request.action.source} is not allowed for ${exactIntent}.`,
			],
			unsupportedAction: actionId,
		};
	}

	return {
		intent: exactIntent,
		workflowId: WORKFLOW_BY_INTENT[exactIntent],
		confidence: isAiControllerIntent(actionId) || ACTION_ALIASES[normalizeAction(actionId)]
			? 'exact'
			: 'inferred',
		reasons,
	};
}
