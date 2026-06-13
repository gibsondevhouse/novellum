<script lang="ts">
	import type {
		WorldbuildProposalDuplicateCandidate,
		WorldbuildProposalRecord,
	} from '$lib/ai/pipeline/worldbuild-proposal-schema.js';
	import type {
		WorldbuildCanonDiff,
		WorldbuildCanonDuplicateCandidate,
		WorldbuildCanonLinkDiff,
		WorldbuildCanonReviewEvidence,
	} from '$lib/ai/pipeline/worldbuild-canon-diff-schema.js';

	interface Props {
		proposal: WorldbuildProposalRecord;
		maxPayloadFields?: number;
	}

	type ReviewCandidate = {
		displayName: string;
		matchKind: string;
		score: number;
		evidence: string[];
	};

	let { proposal, maxPayloadFields = 6 }: Props = $props();

	const diff = $derived(proposal.canonDiff ?? null);
	const payloadEntries = $derived(Object.entries(proposal.payload).slice(0, maxPayloadFields));
	const reviewCandidates = $derived(collectReviewCandidates(proposal, diff));

	function decisionLabel(diffRecord: WorldbuildCanonDiff | null): string {
		if (!diffRecord) return 'Create proposal';
		switch (diffRecord.decision) {
			case 'create':
				return 'Create canon record';
			case 'update':
				return 'Update existing canon';
			case 'merge':
				return 'Merge with existing canon';
			case 'link':
				return 'Link existing canon';
			case 'no_op':
				return 'No canon change';
		}
	}

	function formatFieldLabel(path: string): string {
		return path
			.replace(/\./g, ' ')
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (value) => value.toUpperCase())
			.trim();
	}

	function formatValue(value: unknown): string {
		if (value === null || value === undefined || value === '') return 'Empty';
		if (Array.isArray(value)) {
			if (value.length === 0) return 'None';
			return value.map((item) => formatValue(item)).join(', ');
		}
		if (typeof value === 'object') {
			const serialized = JSON.stringify(value);
			return truncate(serialized ?? String(value), 180);
		}
		return truncate(String(value), 180);
	}

	function truncate(value: string, limit: number): string {
		if (value.length <= limit) return value;
		return `${value.slice(0, limit - 1)}...`;
	}

	function formatScore(score: number): string {
		return `${Math.round(score * 100)}%`;
	}

	function evidenceLabels(evidence: WorldbuildCanonReviewEvidence[]): string[] {
		return evidence.map((item) => item.label);
	}

	function collectReviewCandidates(
		proposalRecord: WorldbuildProposalRecord,
		diffRecord: WorldbuildCanonDiff | null,
	): ReviewCandidate[] {
		const proposalCandidates = proposalRecord.duplicateCandidates ?? [];
		if (proposalCandidates.length > 0) {
			return proposalCandidates.map((candidate: WorldbuildProposalDuplicateCandidate) => ({
				displayName: candidate.displayName,
				matchKind: candidate.matchKind,
				score: candidate.score,
				evidence: candidate.evidence.map((item) => item.label),
			}));
		}

		return (diffRecord?.duplicateCandidates ?? []).map(
			(candidate: WorldbuildCanonDuplicateCandidate) => ({
				displayName: candidate.target.displayName,
				matchKind: candidate.matchKind,
				score: candidate.score,
				evidence: evidenceLabels(candidate.evidence),
			}),
		);
	}

	function formatLink(link: WorldbuildCanonLinkDiff): string {
		const description = link.description ? ` - ${link.description}` : '';
		return `${link.source.displayName} -> ${link.target.displayName}${description}`;
	}
</script>

<div class="proposal-diff" data-testid="proposal-diff-view">
	<div class="proposal-diff__summary">
		<span class="proposal-diff__decision">{decisionLabel(diff)}</span>
		<p>{diff?.summary ?? proposal.reasoningSummary}</p>
	</div>

	{#if diff?.target}
		<dl class="proposal-diff__target" aria-label="Merge target">
			<div>
				<dt>Target</dt>
				<dd>{diff.target.displayName}</dd>
			</div>
		</dl>
	{/if}

	{#if diff && diff.fields.length > 0}
		<div class="proposal-diff__fields" aria-label="Field changes">
			{#each diff.fields as field (field.fieldPath)}
				<div class="proposal-diff__field-row">
					<div class="proposal-diff__field-name">
						<span>{field.label ?? formatFieldLabel(field.fieldPath)}</span>
						<small>{field.operation.replace('_', ' ')}</small>
					</div>
					<div class="proposal-diff__field-values">
						<div>
							<span>Current</span>
							<p>{formatValue(field.before)}</p>
						</div>
						<div>
							<span>Proposed</span>
							<p>{formatValue(field.after)}</p>
						</div>
					</div>
					{#if (field.evidence ?? []).length > 0}
						<ul class="proposal-diff__evidence">
							{#each field.evidence ?? [] as evidence (evidence.label)}
								<li>{evidence.label}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	{:else if payloadEntries.length > 0}
		<dl class="proposal-diff__payload" aria-label="Proposal fields">
			{#each payloadEntries as [key, value] (key)}
				<div>
					<dt>{formatFieldLabel(key)}</dt>
					<dd>{formatValue(value)}</dd>
				</div>
			{/each}
		</dl>
	{/if}

	{#if diff && (diff.links ?? []).length > 0}
		<div class="proposal-diff__links" aria-label="Canon links">
			{#each diff.links ?? [] as link (link.linkType + link.target.displayName)}
				<div class="proposal-diff__link-row">
					<span>{link.linkType.replace(/_/g, ' ')}</span>
					<p>{formatLink(link)}</p>
				</div>
			{/each}
		</div>
	{/if}

	{#if reviewCandidates.length > 0}
		<div class="proposal-diff__duplicates" aria-label="Duplicate candidates">
			<span class="proposal-diff__section-label">Possible duplicate</span>
			{#each reviewCandidates as candidate (candidate.displayName + candidate.matchKind)}
				<div class="proposal-diff__candidate">
					<div>
						<strong>{candidate.displayName}</strong>
						<small>{candidate.matchKind.replace('_', ' ')} · {formatScore(candidate.score)}</small>
					</div>
					{#if candidate.evidence.length > 0}
						<p>{candidate.evidence.join(' ')}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.proposal-diff {
		display: grid;
		gap: var(--space-3);
		border-top: 1px solid var(--color-border-subtle);
		padding-top: var(--space-3);
	}

	.proposal-diff__summary {
		display: grid;
		gap: var(--space-1);
	}

	.proposal-diff__summary p,
	.proposal-diff__candidate p,
	.proposal-diff__field-values p,
	.proposal-diff__link-row p {
		margin: 0;
	}

	.proposal-diff__decision,
	.proposal-diff__section-label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.proposal-diff__target,
	.proposal-diff__payload {
		display: grid;
		gap: var(--space-2);
		margin: 0;
	}

	.proposal-diff__target div,
	.proposal-diff__payload div {
		display: grid;
		grid-template-columns: minmax(7rem, 0.4fr) 1fr;
		gap: var(--space-3);
	}

	.proposal-diff dt,
	.proposal-diff__field-values span {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: capitalize;
	}

	.proposal-diff dd {
		margin: 0;
		color: var(--color-text-primary);
		word-break: break-word;
	}

	.proposal-diff__fields,
	.proposal-diff__links,
	.proposal-diff__duplicates {
		display: grid;
		gap: var(--space-2);
	}

	.proposal-diff__field-row,
	.proposal-diff__candidate,
	.proposal-diff__link-row {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-3) 0;
		border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	.proposal-diff__field-name,
	.proposal-diff__candidate > div {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.proposal-diff__field-name small,
	.proposal-diff__candidate small {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		text-transform: capitalize;
	}

	.proposal-diff__field-values {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.proposal-diff__field-values div {
		display: grid;
		gap: var(--space-1);
		min-width: 0;
	}

	.proposal-diff__field-values p,
	.proposal-diff__candidate p,
	.proposal-diff__link-row p {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		word-break: break-word;
	}

	.proposal-diff__evidence {
		margin: 0;
		padding-left: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}
</style>
