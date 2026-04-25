<script lang="ts">
	import { GhostButton, SectionHeader } from '$lib/components/ui/index.js';

	type MembersField = 'founder' | 'notableAncestors' | 'currentHeirs' | 'claimants' | 'disputedMembers' | 'legacyFigures';
	let { lineage, onFieldChange }: { lineage: Record<string, unknown> | null; onFieldChange: (field: MembersField, value: string) => void } = $props();
	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-label="Members, Descendants, and Notable Figures">
	<SectionHeader title="Members / Descendants / Notable Figures" class="dossier-section-header">
		{#snippet actions()}
			<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="lineage-members-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</GhostButton>
		{/snippet}
	</SectionHeader>
	{#if !isCollapsed}
		<div id="lineage-members-content" class="field-grid">
			<label><span>Founder</span><input class="input-inline" type="text" value={(lineage?.founder as string) || ''} oninput={(e) => onFieldChange('founder', (e.currentTarget as HTMLInputElement).value)} /></label>
			<label><span>Notable Ancestors</span><textarea rows="2" class="input-inline" value={(lineage?.notableAncestors as string) || ''} oninput={(e) => onFieldChange('notableAncestors', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Current Heirs / Descendants</span><textarea rows="2" class="input-inline" value={(lineage?.currentHeirs as string) || ''} oninput={(e) => onFieldChange('currentHeirs', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Claimant(s)</span><textarea rows="2" class="input-inline" value={(lineage?.claimants as string) || ''} oninput={(e) => onFieldChange('claimants', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Disputed Members</span><textarea rows="2" class="input-inline" value={(lineage?.disputedMembers as string) || ''} oninput={(e) => onFieldChange('disputedMembers', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Legacy Figures</span><textarea rows="2" class="input-inline" value={(lineage?.legacyFigures as string) || ''} oninput={(e) => onFieldChange('legacyFigures', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
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
	.input-inline{width:100%;border:1px solid transparent;background:transparent;color:inherit;padding:.2rem .25rem;border-radius:var(--radius-sm)}
	.input-inline:hover{border-color:color-mix(in srgb,var(--color-border-subtle) 75%,transparent)}
	.input-inline:focus{outline:none;border-color:color-mix(in srgb,var(--color-nova-blue) 45%,var(--color-border-default));background:color-mix(in srgb,var(--color-surface-overlay) 35%,transparent)}
	@media (max-width:768px){.field-grid{grid-template-columns:1fr}}
</style>
