import type { WorldbuildProposalRecord } from '$lib/ai/pipeline/worldbuild-proposal-schema.js';
import {
	refreshSuggestions,
	upsertSuggestionLocal,
} from '../stores/worldbuild-suggestion-state.svelte.js';
import {
	acceptProposal,
	rejectProposal,
	type ProposalAcceptResult,
	type ProposalRejectResult,
} from './worldbuilding-proposal-service.js';

type ProposalMutationResult = ProposalAcceptResult | ProposalRejectResult;

export type WorldbuildProposalReviewAction = 'accepted' | 'rejected';
export type WorldbuildProposalActionFailureKind = 'conflict' | 'failed';

export type WorldbuildProposalActionResult =
	| {
			ok: true;
			action: WorldbuildProposalReviewAction;
			message: string;
			proposal: WorldbuildProposalRecord | null;
	  }
	| {
			ok: false;
			kind: WorldbuildProposalActionFailureKind;
			error: string;
			status?: number;
			code?: string;
	  };

function classifyFailure(status: number | undefined): WorldbuildProposalActionFailureKind {
	if (status === 409 || status === 422) return 'conflict';
	return 'failed';
}

async function applySuccessfulMutation(
	projectId: string,
	result: ProposalMutationResult,
	action: WorldbuildProposalReviewAction,
): Promise<WorldbuildProposalActionResult> {
	if (result.proposal) {
		upsertSuggestionLocal(result.proposal);
	} else {
		await refreshSuggestions(projectId);
	}

	return {
		ok: true,
		action,
		message:
			action === 'accepted'
				? 'Suggestion accepted and projected to canon.'
				: 'Suggestion rejected.',
		proposal: result.proposal ?? null,
	};
}

function failedActionResult(
	action: WorldbuildProposalReviewAction,
	error: unknown,
	status?: number,
	code?: string,
): WorldbuildProposalActionResult {
	const fallback =
		action === 'accepted'
			? 'Could not accept this suggestion.'
			: 'Could not reject this suggestion.';
	const message =
		error instanceof Error
			? error.message
			: typeof error === 'string' && error.trim()
				? error
				: fallback;

	return {
		ok: false,
		kind: classifyFailure(status),
		error: message,
		status,
		code,
	};
}

async function runMutation(
	projectId: string,
	action: WorldbuildProposalReviewAction,
	mutate: () => Promise<ProposalMutationResult>,
): Promise<WorldbuildProposalActionResult> {
	try {
		const result = await mutate();
		if (!result.ok) {
			return failedActionResult(action, result.error, result.status, result.code);
		}
		return await applySuccessfulMutation(projectId, result, action);
	} catch (error) {
		return failedActionResult(action, error);
	}
}

export function acceptWorldbuildProposalForReview(
	projectId: string,
	proposalId: string,
): Promise<WorldbuildProposalActionResult> {
	return runMutation(projectId, 'accepted', () => acceptProposal(projectId, proposalId));
}

export function rejectWorldbuildProposalForReview(
	projectId: string,
	proposalId: string,
	reason: string,
): Promise<WorldbuildProposalActionResult> {
	return runMutation(projectId, 'rejected', () => rejectProposal(projectId, proposalId, reason));
}
