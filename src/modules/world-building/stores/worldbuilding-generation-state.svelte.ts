import { checkDomainReadiness } from '../worldbuilding-readiness.js';
import type { WorldbuildingDomainId } from '../worldbuilding-workflow.js';
import { WORLDBUILDING_DOMAIN_SEQUENCE } from '../worldbuilding-workflow.js';

export type WorldbuildingGenerationStateValue =
	| 'idle'
	| 'missing-context'
	| 'queued'
	| 'running'
	| 'review-ready'
	| 'accepted'
	| 'rejected'
	| 'failed';

const LEGAL_TRANSITIONS: Record<WorldbuildingGenerationStateValue, WorldbuildingGenerationStateValue[]> = {
	idle: ['missing-context', 'queued'],
	'missing-context': ['idle', 'queued'],
	queued: ['running', 'failed', 'idle'],
	running: ['review-ready', 'failed', 'idle'],
	'review-ready': ['accepted', 'rejected', 'idle'],
	accepted: ['idle'],
	rejected: ['idle'],
	failed: ['idle', 'queued'],
};

const ALL_DOMAIN_IDS = WORLDBUILDING_DOMAIN_SEQUENCE.map((d) => d.id);

function makeInitialState(): Record<WorldbuildingDomainId, WorldbuildingGenerationStateValue> {
	return Object.fromEntries(ALL_DOMAIN_IDS.map((id) => [id, 'idle'])) as Record<
		WorldbuildingDomainId,
		WorldbuildingGenerationStateValue
	>;
}

function makeInitialReasons(): Record<WorldbuildingDomainId, string | null> {
	return Object.fromEntries(ALL_DOMAIN_IDS.map((id) => [id, null])) as Record<
		WorldbuildingDomainId,
		string | null
	>;
}

const states = $state<Record<WorldbuildingDomainId, WorldbuildingGenerationStateValue>>(makeInitialState());
const missingContextReasons = $state<Record<WorldbuildingDomainId, string | null>>(makeInitialReasons());
const failureReasons = $state<Record<WorldbuildingDomainId, string | null>>(makeInitialReasons());

export function normalizeGenerationFailureReason(error: unknown): string {
	const raw =
		error instanceof Error
			? error.message
			: typeof error === 'string'
				? error
				: 'Generation failed. Please try again.';
	const message = raw.trim();

	if (!message) return 'Generation failed. Please try again.';
	if (/no ai provider credentials|missing.*credential|api key/i.test(message)) {
		return 'Add AI provider credentials in Settings, then retry generation.';
	}
	if (/unexpected format|parse_failed|validation_failed|validat/i.test(message)) {
		return 'The generated draft could not be validated. Try again.';
	}
	if (/failed to fetch|network|econnrefused|offline/i.test(message)) {
		return 'Could not reach the generation service. Check your connection and retry.';
	}

	return message.length > 180 ? `${message.slice(0, 177)}...` : message;
}

export function getState(domainId: WorldbuildingDomainId): WorldbuildingGenerationStateValue {
	return states[domainId];
}

export function transition(
	domainId: WorldbuildingDomainId,
	newState: WorldbuildingGenerationStateValue,
): void {
	const current = states[domainId];
	const allowed = LEGAL_TRANSITIONS[current];
	if (!allowed.includes(newState)) {
		throw new Error(
			`Illegal worldbuilding state transition for "${domainId}": ${current} → ${newState}. ` +
				`Allowed: ${allowed.join(', ')}`,
		);
	}
	states[domainId] = newState;
	if (newState !== 'missing-context') {
		missingContextReasons[domainId] = null;
	}
	if (newState !== 'failed') {
		failureReasons[domainId] = null;
	}
}

export function resetState(domainId: WorldbuildingDomainId): void {
	states[domainId] = 'idle';
	missingContextReasons[domainId] = null;
	failureReasons[domainId] = null;
}

export function getMissingContextReason(domainId: WorldbuildingDomainId): string | null {
	return missingContextReasons[domainId];
}

export function getGenerationFailureReason(domainId: WorldbuildingDomainId): string | null {
	return failureReasons[domainId];
}

export function markMissingContext(domainId: WorldbuildingDomainId, reason: string): void {
	const current = states[domainId];
	if (current !== 'idle' && current !== 'missing-context') return;
	states[domainId] = 'missing-context';
	missingContextReasons[domainId] = reason;
	failureReasons[domainId] = null;
}

export function markGenerationFailed(domainId: WorldbuildingDomainId, reason: unknown): void {
	const current = states[domainId];
	if (current !== 'failed') {
		const allowed = LEGAL_TRANSITIONS[current];
		if (!allowed.includes('failed')) return;
		transition(domainId, 'failed');
	}
	failureReasons[domainId] = normalizeGenerationFailureReason(reason);
}

export function evaluateReadiness(
	domainId: WorldbuildingDomainId,
	domainCounts: Record<WorldbuildingDomainId, number>,
): void {
	const result = checkDomainReadiness(domainId, domainCounts);
	const current = states[domainId];

	if (!result.allowed) {
		if (current === 'idle' || current === 'missing-context') {
			states[domainId] = 'missing-context';
			missingContextReasons[domainId] =
				result.missingDeps.length > 0
					? `Requires ${result.missingDeps.join(', ')}`
					: 'Missing required context';
		}
	} else {
		if (current === 'missing-context') {
			states[domainId] = 'idle';
			missingContextReasons[domainId] = null;
		}
	}
}
