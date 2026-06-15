import type { AiControllerJsonValue, AiControllerRequest } from './contracts.js';
import { getPermissionMetadata } from './permissions.js';
import type { ResolvedControllerIntent } from './intent-resolver.js';
import type { AiControllerWorkflowDefinition } from './workflow-contracts.js';

export type AiControllerPolicyDecision =
	| {
			ok: true;
			decision: 'allow' | 'allow_with_review';
			reviewRequired: boolean;
			reasons: string[];
	  }
	| {
			ok: false;
			decision: 'block';
			code: 'unsupported_intent' | 'policy_denied' | 'missing_context';
			message: string;
			reasons: string[];
	  };

function jsonObject(value: AiControllerJsonValue | undefined): Record<string, unknown> {
	return value && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function hasHumanApproval(request: AiControllerRequest): boolean {
	const metadata = jsonObject(request.metadata);
	const payload = jsonObject(request.action.payload);
	return metadata.humanApproved === true || payload.humanApproved === true;
}

export function evaluateControllerPolicy(input: {
	request: AiControllerRequest;
	intent: ResolvedControllerIntent;
	workflow: AiControllerWorkflowDefinition | null;
}): AiControllerPolicyDecision {
	const { request, intent, workflow } = input;
	const reasons = [`requestedBy:${request.requestedBy}`];

	if (intent.intent === 'unsupported' || !workflow) {
		return {
			ok: false,
			decision: 'block',
			code: 'unsupported_intent',
			message: 'This AI action is not supported by the governed controller.',
			reasons: [...reasons, 'Unsupported intent or missing workflow.'],
		};
	}

	const permission = getPermissionMetadata(workflow.permission.level);
	reasons.push(`permission:${permission.level}`);

	if (permission.level === 'mutation') {
		return {
			ok: false,
			decision: 'block',
			code: 'policy_denied',
			message: 'Direct mutation workflows are blocked by the AI controller.',
			reasons,
		};
	}

	if (permission.level === 'review_decision') {
		if (request.requestedBy !== 'user' || !hasHumanApproval(request)) {
			return {
				ok: false,
				decision: 'block',
				code: 'policy_denied',
				message: 'Review decisions require explicit user approval.',
				reasons: [...reasons, 'Missing explicit user approval.'],
			};
		}
		return {
			ok: true,
			decision: 'allow',
			reviewRequired: false,
			reasons: [...reasons, 'Explicit review approval present.'],
		};
	}

	if (workflow.context.requiredTargetKinds.length > 0 && !request.target.id) {
		return {
			ok: false,
			decision: 'block',
			code: 'missing_context',
			message: 'This workflow requires a concrete target.',
			reasons: [...reasons, 'Target id is missing.'],
		};
	}

	if (permission.level === 'proposal_only') {
		return {
			ok: true,
			decision: 'allow_with_review',
			reviewRequired: true,
			reasons: [...reasons, 'Model output must be persisted as a review artifact.'],
		};
	}

	return {
		ok: true,
		decision: 'allow',
		reviewRequired: false,
		reasons,
	};
}
