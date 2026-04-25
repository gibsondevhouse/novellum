<script lang="ts">
	import { GhostButton, SectionHeader } from '$lib/components/ui/index.js';

	type ContinuityField = 'immutableFacts' | 'bloodlineMarkers' | 'successionRules' | 'majorBranches' | 'knownDescendants' | 'secrets' | 'outsiderKnowledge' | 'lastMajorChange' | 'timelineMarkers';
	let { lineage, onFieldChange }: { lineage: Record<string, unknown> | null; onFieldChange: (field: ContinuityField, value: string) => void } = $props();
	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-label="Continuity">
	<SectionHeader title="Continuity" class="dossier-section-header">
		{#snippet actions()}
			<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="lineage-continuity-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</GhostButton>
		{/snippet}
	</SectionHeader>
	{#if !isCollapsed}
		<div id="lineage-continuity-content" class="field-grid">
			<label><span>Immutable Facts</span><textarea rows="2" class="input-inline" value={(lineage?.immutableFacts as string) || ''} oninput={(e) => onFieldChange('immutableFacts', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Bloodline Markers</span><textarea rows="2" class="input-inline" value={(lineage?.bloodlineMarkers as string) || ''} oninput={(e) => onFieldChange('bloodlineMarkers', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Succession Rules</span><textarea rows="2" class="input-inline" value={(lineage?.successionRules as string) || ''} oninput={(e) => onFieldChange('successionRules', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Major Branches</span><textarea rows="2" class="input-inline" value={(lineage?.majorBranches as string) || ''} oninput={(e) => onFieldChange('majorBranches', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Known Descendants</span><textarea rows="2" class="input-inline" value={(lineage?.knownDescendants as string) || ''} oninput={(e) => onFieldChange('knownDescendants', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Secrets</span><textarea rows="2" class="input-inline" value={(lineage?.secrets as string) || ''} oninput={(e) => onFieldChange('secrets', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>What Outsiders Know</span><textarea rows="2" class="input-inline" value={(lineage?.outsiderKnowledge as string) || ''} oninput={(e) => onFieldChange('outsiderKnowledge', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Last Major Change</span><textarea rows="2" class="input-inline" value={(lineage?.lastMajorChange as string) || ''} oninput={(e) => onFieldChange('lastMajorChange', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label class="full"><span>Timeline Markers</span><textarea rows="3" class="input-inline" value={(lineage?.timelineMarkers as string) || ''} oninput={(e) => onFieldChange('timelineMarkers', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
		</div>
	{/if}
</section>

<style>
	.dossier-section{display:flex;flex-direction:column;gap:var(--space-4);padding-top:var(--space-4);border-top:1px solid color-mix(in srgb,var(--color-border-subtle) 65%,transparent)}
	:global(.dossier-section-header .title){font-size:var(--text-xs);font-weight:var(--font-weight-semibold);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.08em}
	:global(.collapse-toggle){border:1px solid color-mix(in srgb,var(--color-border-subtle) 70%,transparent);background:transparent;color:var(--color-text-muted);padding:.15rem .45rem;border-radius:var(--radius-sm);font-size:var(--text-xs);cursor:pointer}
	.field-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-4) var(--space-5)}
	label{display:flex;flex-direction:column;gap:.35rem}
	label span{font-size:var(--text-xs);letter-spacing:.03em;color:var(--color-text-muted)}
	label.full{grid-column:1/-1}
	.input-inline{width:100%;border:1px solid transparent;background:transparent;color:inherit;padding:.2rem .25rem;border-radius:var(--radius-sm)}
	.input-inline:hover{border-color:color-mix(in srgb,var(--color-border-subtle) 75%,transparent)}
	.input-inline:focus{outline:none;border-color:color-mix(in srgb,var(--color-nova-blue) 45%,var(--color-border-default));background:color-mix(in srgb,var(--color-surface-overlay) 35%,transparent)}
	@media (max-width:768px){.field-grid{grid-template-columns:1fr}}
</style>
