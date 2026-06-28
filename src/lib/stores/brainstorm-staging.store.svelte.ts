import type {
	BrainstormProposal,
	BrainstormProposalCategory,
	BrainstormWorldbuildSeedTarget,
} from '$lib/ai/types.js';

export type BrainstormSeedDecision = 'idle' | 'accepted' | 'rejected';

export type BrainstormPrefillEntityKind =
	| 'character'
	| 'faction'
	| 'lineage'
	| 'realm'
	| 'landmark'
	| 'lore-entry'
	| 'plot-thread'
	| 'timeline-event';

export interface BrainstormStagedSeed {
	proposal: BrainstormProposal;
	sessionSeedIdea: string;
	acceptedAt: string;
	seedTarget: BrainstormWorldbuildSeedTarget;
	entityKind: BrainstormPrefillEntityKind;
}

interface AddSeedOptions {
	sessionSeedIdea?: string;
	acceptedAt?: string;
}

export interface BrainstormGenerationContext {
	note?: string;
	hints?: Array<{
		name: string;
		intent: 'target' | 'avoid' | 'neutral';
		source: 'brainstorm';
	}>;
}

const TARGET_ENTITY_KIND: Record<BrainstormWorldbuildSeedTarget, BrainstormPrefillEntityKind> = {
	premise_note: 'lore-entry',
	character_seed: 'character',
	location_seed: 'realm',
	faction_seed: 'faction',
	lore_seed: 'lore-entry',
	plot_thread_seed: 'plot-thread',
	theme_seed: 'lore-entry',
};

const CATEGORY_FALLBACK_TARGET: Record<BrainstormProposalCategory, BrainstormWorldbuildSeedTarget> =
	{
		premise_variant: 'premise_note',
		thematic_thread: 'theme_seed',
		genre_hook: 'theme_seed',
		protagonist_sketch: 'character_seed',
	};

function normalizeTitle(value: string): string {
	return value.trim().toLowerCase();
}

function compactText(value: string, maxLength: number): string {
	const trimmed = value.trim();
	if (trimmed.length <= maxLength) return trimmed;
	return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function inferSeedTarget(proposal: BrainstormProposal): BrainstormWorldbuildSeedTarget {
	return proposal.worldbuildSeedTarget ?? CATEGORY_FALLBACK_TARGET[proposal.category];
}

function buildSeedNote(seed: BrainstormStagedSeed): string {
	const question = seed.proposal.storyQuestion
		? ` Question: ${compactText(seed.proposal.storyQuestion, 180)}`
		: '';
	return `${seed.proposal.title}: ${compactText(seed.proposal.description, 220)}${question}`;
}

class BrainstormStagingStore {
	acceptedSeeds = $state<BrainstormStagedSeed[]>([]);
	rejectedProposalIds = $state<string[]>([]);

	addSeed(proposal: BrainstormProposal, options: AddSeedOptions = {}): void {
		const seedTarget = inferSeedTarget(proposal);
		const staged: BrainstormStagedSeed = {
			proposal,
			sessionSeedIdea: options.sessionSeedIdea?.trim() ?? '',
			acceptedAt: options.acceptedAt ?? new Date().toISOString(),
			seedTarget,
			entityKind: TARGET_ENTITY_KIND[seedTarget],
		};

		this.acceptedSeeds = [
			...this.acceptedSeeds.filter((seed) => seed.proposal.id !== proposal.id),
			staged,
		];
		this.rejectedProposalIds = this.rejectedProposalIds.filter((id) => id !== proposal.id);
	}

	rejectSeed(proposalId: string): void {
		this.acceptedSeeds = this.acceptedSeeds.filter((seed) => seed.proposal.id !== proposalId);
		if (!this.rejectedProposalIds.includes(proposalId)) {
			this.rejectedProposalIds = [...this.rejectedProposalIds, proposalId];
		}
	}

	removeSeed(proposalId: string): void {
		this.acceptedSeeds = this.acceptedSeeds.filter((seed) => seed.proposal.id !== proposalId);
		this.rejectedProposalIds = this.rejectedProposalIds.filter((id) => id !== proposalId);
	}

	clear(): void {
		this.acceptedSeeds = [];
		this.rejectedProposalIds = [];
	}

	clearEntitySeeds(entityKind: BrainstormPrefillEntityKind): void {
		const removedIds = new Set(
			this.acceptedSeeds
				.filter((seed) => seed.entityKind === entityKind)
				.map((seed) => seed.proposal.id),
		);
		this.acceptedSeeds = this.acceptedSeeds.filter((seed) => seed.entityKind !== entityKind);
		this.rejectedProposalIds = this.rejectedProposalIds.filter((id) => !removedIds.has(id));
	}

	getDecision(proposalId: string): BrainstormSeedDecision {
		if (this.acceptedSeeds.some((seed) => seed.proposal.id === proposalId)) return 'accepted';
		if (this.rejectedProposalIds.includes(proposalId)) return 'rejected';
		return 'idle';
	}

	getSeedsForEntityKind(entityKind: BrainstormPrefillEntityKind): BrainstormStagedSeed[] {
		return this.acceptedSeeds.filter((seed) => seed.entityKind === entityKind);
	}

	getDuplicateTitlesForEntityKind(
		entityKind: BrainstormPrefillEntityKind,
		existingNames: readonly string[],
	): string[] {
		const existing = new Set(existingNames.map(normalizeTitle).filter(Boolean));
		return this.getSeedsForEntityKind(entityKind)
			.map((seed) => seed.proposal.title.trim())
			.filter((title) => existing.has(normalizeTitle(title)));
	}

	buildGenerationContext(
		entityKind: BrainstormPrefillEntityKind,
	): BrainstormGenerationContext | undefined {
		const seeds = this.getSeedsForEntityKind(entityKind);
		if (seeds.length === 0) return undefined;

		const noteLines = [
			'Accepted Brainstorm seeds are staged context only; do not treat them as canon unless the author saves a reviewed worldbuilding draft.',
			...seeds.map((seed) => `- ${buildSeedNote(seed)}`),
		];

		return {
			note: compactText(noteLines.join('\n'), 1200),
			hints: seeds.map((seed) => ({
				name: compactText(seed.proposal.title, 120),
				intent: 'target' as const,
				source: 'brainstorm' as const,
			})),
		};
	}
}

export const brainstormStaging = new BrainstormStagingStore();
