/**
 * Category-scoped pending suggestion state for the agentic worldbuild scan.
 *
 * Tracks WorldbuildProposalRecord[] for the active project and derives
 * per-domain pending counts. State rehydrates from the project_metadata
 * store on each explicit refresh — not from transient component memory —
 * so it survives navigation and page reload.
 *
 * All proposals are non-canonical until the author explicitly accepts.
 */

import { listProjectMetadata } from '$lib/project-metadata.js';
import { WORLDBUILD_PROPOSAL_OWNER_ID } from '$lib/ai/pipeline/checkpoint-contract.js';
import type { WorldbuildingDomainId } from '../worldbuilding-workflow.js';
import { WORLDBUILDING_DOMAIN_SEQUENCE } from '../worldbuilding-workflow.js';
import type {
	WorldbuildProposalRecord,
	WorldbuildProposalStatus,
} from '$lib/ai/pipeline/worldbuild-proposal-schema.js';
import { isWorldbuildProposalStatus } from '$lib/ai/pipeline/worldbuild-proposal-schema.js';

// ---------------------------------------------------------------------------
// Type narrowing
// ---------------------------------------------------------------------------

function isProposalRecord(value: unknown): value is WorldbuildProposalRecord {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Partial<WorldbuildProposalRecord>;
	return (
		typeof v.proposalId === 'string' &&
		typeof v.projectId === 'string' &&
		typeof v.categoryId === 'string' &&
		typeof v.entityKind === 'string' &&
		isWorldbuildProposalStatus(v.status)
	);
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const ALL_DOMAIN_IDS: readonly WorldbuildingDomainId[] = WORLDBUILDING_DOMAIN_SEQUENCE.map(
	(d) => d.id,
);

function makeZeroCounts(): Record<WorldbuildingDomainId, number> {
	return Object.fromEntries(ALL_DOMAIN_IDS.map((id) => [id, 0])) as Record<
		WorldbuildingDomainId,
		number
	>;
}

let suggestions: WorldbuildProposalRecord[] = $state([]);
let suggestionLoadError: string | null = $state(null);
let isLoadingSuggestions: boolean = $state(false);

/**
 * Per-category count of `pending_review` proposals.
 * Derived reactively from `suggestions`; recomputed on any change.
 */
const pendingCountByCategory: Record<WorldbuildingDomainId, number> = $derived(
	suggestions.reduce(
		(acc, p) => {
			if (p.status === 'pending_review') {
				acc[p.categoryId as WorldbuildingDomainId] =
					(acc[p.categoryId as WorldbuildingDomainId] ?? 0) + 1;
			}
			return acc;
		},
		makeZeroCounts(),
	),
);

// ---------------------------------------------------------------------------
// Refresh — rehydrates from persisted project_metadata store
// ---------------------------------------------------------------------------

/**
 * Load all scan proposals for a project from the project_metadata store.
 *
 * This is the canonical rehydration path. Call on project load and after
 * accept/reject mutations to keep notification state consistent.
 */
export async function refreshSuggestions(projectId: string | null): Promise<void> {
	if (!projectId) {
		suggestions = [];
		suggestionLoadError = null;
		return;
	}

	isLoadingSuggestions = true;
	try {
		const entries = await listProjectMetadata(projectId, 'pipeline', WORLDBUILD_PROPOSAL_OWNER_ID);
		const parsed = Object.values(entries)
			.filter(isProposalRecord)
			.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
		suggestions = parsed;
		suggestionLoadError = null;
	} catch (err) {
		suggestionLoadError =
			err instanceof Error ? err.message : 'Failed to load worldbuild suggestions.';
	} finally {
		isLoadingSuggestions = false;
	}
}

/**
 * Call after accept or reject mutations to recompute pending state.
 * Accepts an optional updated proposal to upsert before recomputing,
 * avoiding a full network round-trip in hot paths.
 */
export function upsertSuggestionLocal(updated: WorldbuildProposalRecord): void {
	const next = [...suggestions.filter((p) => p.proposalId !== updated.proposalId), updated];
	next.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
	suggestions = next;
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function getSuggestions(): WorldbuildProposalRecord[] {
	return suggestions;
}

export function getSuggestionLoadError(): string | null {
	return suggestionLoadError;
}

export function getIsLoadingSuggestions(): boolean {
	return isLoadingSuggestions;
}

/** Count of pending_review proposals for a specific domain category. */
export function getPendingCountForCategory(categoryId: WorldbuildingDomainId): number {
	return pendingCountByCategory[categoryId] ?? 0;
}

/** True if there is at least one pending_review proposal for the given category. */
export function hasPendingForCategory(categoryId: WorldbuildingDomainId): boolean {
	return getPendingCountForCategory(categoryId) > 0;
}

/** Total pending_review proposal count across all categories. */
export function getTotalPendingCount(): number {
	return suggestions.filter((p) => p.status === 'pending_review').length;
}

/** All proposals filtered to a specific status. */
export function getSuggestionsByStatus(status: WorldbuildProposalStatus): WorldbuildProposalRecord[] {
	return suggestions.filter((p) => p.status === status);
}

/** Proposals for a specific category, optionally filtered by status. */
export function getSuggestionsByCategory(
	categoryId: WorldbuildingDomainId,
	status?: WorldbuildProposalStatus,
): WorldbuildProposalRecord[] {
	return suggestions.filter(
		(p) => p.categoryId === categoryId && (status === undefined || p.status === status),
	);
}
