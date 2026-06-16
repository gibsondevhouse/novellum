import { checkDomainReadiness } from '../worldbuilding-readiness.js';
import type { WorldbuildingDomainId } from '../worldbuilding-workflow.js';
import {
	getDrafts,
	getErrorMessage,
	getPhase as getDraftGenerationPhase,
	startGeneration,
} from '../stores/generation-draft.svelte.js';
import {
	getState,
	markGenerationFailed,
	markMissingContext,
	normalizeGenerationFailureReason,
	transition,
	type WorldbuildingGenerationStateValue,
} from '../stores/worldbuilding-generation-state.svelte.js';
import type { EntityKind } from './worldbuilding-generation-service.js';
import type { GenerationContextPayload } from './generation-context.js';

export interface GenerateGuardContext {
	projectId: string;
	domainCounts: Record<WorldbuildingDomainId, number>;
}

export interface GenerateGuardResult {
	allowed: boolean;
	reason: string | null;
}

export interface WorldbuildingGenerationActionParams extends GenerateGuardContext {
	domainId: WorldbuildingDomainId;
	count?: 1 | 3 | 5;
	context?: string;
	generationContext?: GenerationContextPayload;
}

export type WorldbuildingGenerationActionResult =
	| {
			ok: true;
			state: 'review-ready';
			domainId: WorldbuildingDomainId;
			entityKind: EntityKind;
			draftCount: number;
	  }
	| {
			ok: false;
			state: 'missing-context' | 'failed' | 'blocked';
			domainId: WorldbuildingDomainId;
			entityKind: EntityKind;
			reason: string;
	  };

const DOMAIN_ENTITY_KIND: Record<WorldbuildingDomainId, EntityKind> = {
	personae: 'character',
	atlas: 'realm',
	archive: 'lore-entry',
	threads: 'plot-thread',
	chronicles: 'timeline-event',
};

export function getGenerationEntityKindForDomain(domainId: WorldbuildingDomainId): EntityKind {
	return DOMAIN_ENTITY_KIND[domainId];
}

export function canGenerateDomain(
	domainId: WorldbuildingDomainId,
	context: GenerateGuardContext,
): GenerateGuardResult {
	if (!context.projectId) {
		return { allowed: false, reason: 'No project loaded' };
	}

	const readiness = checkDomainReadiness(domainId, context.domainCounts);
	if (!readiness.allowed) {
		const missing = readiness.missingDeps.join(', ');
		return { allowed: false, reason: `Requires ${missing} to have at least one record` };
	}

	return { allowed: true, reason: null };
}

function isStartableState(state: WorldbuildingGenerationStateValue): boolean {
	return state === 'idle' || state === 'missing-context' || state === 'failed';
}

function blockedResult(
	domainId: WorldbuildingDomainId,
	entityKind: EntityKind,
	reason: string,
): WorldbuildingGenerationActionResult {
	return {
		ok: false,
		state: 'blocked',
		domainId,
		entityKind,
		reason,
	};
}

function failResult(
	domainId: WorldbuildingDomainId,
	entityKind: EntityKind,
	reason: string,
): WorldbuildingGenerationActionResult {
	return {
		ok: false,
		state: 'failed',
		domainId,
		entityKind,
		reason,
	};
}

export async function runWorldbuildingDomainGeneration(
	params: WorldbuildingGenerationActionParams,
): Promise<WorldbuildingGenerationActionResult> {
	const { projectId, domainId, domainCounts, count = 3, context, generationContext } = params;
	const entityKind = getGenerationEntityKindForDomain(domainId);
	const guard = canGenerateDomain(domainId, { projectId, domainCounts });

	if (!guard.allowed) {
		const reason = guard.reason ?? 'Missing required context';
		markMissingContext(domainId, reason);
		return {
			ok: false,
			state: 'missing-context',
			domainId,
			entityKind,
			reason,
		};
	}

	const currentState = getState(domainId);
	if (!isStartableState(currentState)) {
		return blockedResult(
			domainId,
			entityKind,
			currentState === 'review-ready'
				? 'Review the current generated drafts before starting another generation.'
				: 'Generation is already in progress for this domain.',
		);
	}

	transition(domainId, 'queued');
	transition(domainId, 'running');

	try {
		await startGeneration(projectId, entityKind, count, context, generationContext);
	} catch (error) {
		const reason = normalizeGenerationFailureReason(error);
		markGenerationFailed(domainId, reason);
		return failResult(domainId, entityKind, reason);
	}

	const phase = getDraftGenerationPhase();
	if (phase === 'reviewing') {
		transition(domainId, 'review-ready');
		return {
			ok: true,
			state: 'review-ready',
			domainId,
			entityKind,
			draftCount: getDrafts().length,
		};
	}

	if (phase === 'idle') {
		transition(domainId, 'idle');
		return blockedResult(domainId, entityKind, 'Generation was cancelled before drafts were created.');
	}

	const reason = normalizeGenerationFailureReason(
		getErrorMessage() ?? 'Generation failed. Please try again.',
	);
	markGenerationFailed(domainId, reason);
	return failResult(domainId, entityKind, reason);
}
