<script lang="ts">
	type CultureField = 'inheritedTraits' | 'customsTraditions' | 'ritesRituals' | 'taboos' | 'symbolsHeraldry' | 'namingConventions' | 'generationalExpectations' | 'commonSayings' | 'culturalIdentitySummary';
	let { lineage, onFieldChange }: { lineage: Record<string, unknown> | null; onFieldChange: (field: CultureField, value: string) => void } = $props();
	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="lineage-culture-title">
	<div class="section-header"><h3 id="lineage-culture-title" class="section-title">Inheritance &amp; Culture</h3><button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="lineage-culture-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</button></div>
	{#if !isCollapsed}
		<div id="lineage-culture-content" class="field-grid">
			<label><span>Inherited Traits</span><textarea rows="2" class="input-inline" value={(lineage?.inheritedTraits as string) || ''} oninput={(e) => onFieldChange('inheritedTraits', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Customs / Traditions</span><textarea rows="2" class="input-inline" value={(lineage?.customsTraditions as string) || ''} oninput={(e) => onFieldChange('customsTraditions', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Rites / Rituals</span><textarea rows="2" class="input-inline" value={(lineage?.ritesRituals as string) || ''} oninput={(e) => onFieldChange('ritesRituals', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Taboos</span><textarea rows="2" class="input-inline" value={(lineage?.taboos as string) || ''} oninput={(e) => onFieldChange('taboos', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Symbols / Heraldry</span><textarea rows="2" class="input-inline" value={(lineage?.symbolsHeraldry as string) || ''} oninput={(e) => onFieldChange('symbolsHeraldry', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Naming Conventions</span><textarea rows="2" class="input-inline" value={(lineage?.namingConventions as string) || ''} oninput={(e) => onFieldChange('namingConventions', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Generational Expectations</span><textarea rows="2" class="input-inline" value={(lineage?.generationalExpectations as string) || ''} oninput={(e) => onFieldChange('generationalExpectations', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Common Sayings / Ancestral Language</span><textarea rows="2" class="input-inline" value={(lineage?.commonSayings as string) || ''} oninput={(e) => onFieldChange('commonSayings', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label class="full"><span>Cultural Identity Summary</span><textarea rows="3" class="input-inline" value={(lineage?.culturalIdentitySummary as string) || ''} oninput={(e) => onFieldChange('culturalIdentitySummary', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
		</div>
	{/if}
</section>

<style>
	.dossier-section{display:flex;flex-direction:column;gap:var(--space-4);padding-top:var(--space-4);border-top:1px solid color-mix(in srgb,var(--color-border-subtle) 65%,transparent)}
	.section-header{display:flex;justify-content:space-between;align-items:center;gap:var(--space-3)}
	.section-title{margin:0;font-size:var(--text-xs);font-weight:var(--font-weight-semibold);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.08em}
	.collapse-toggle{border:1px solid color-mix(in srgb,var(--color-border-subtle) 70%,transparent);background:transparent;color:var(--color-text-muted);padding:.15rem .45rem;border-radius:var(--radius-sm);font-size:var(--text-xs);cursor:pointer}
	.field-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-4) var(--space-5)}
	label{display:flex;flex-direction:column;gap:.35rem}
	label span{font-size:var(--text-xs);letter-spacing:.03em;color:var(--color-text-muted)}
	label.full{grid-column:1/-1}
	.input-inline{width:100%;border:1px solid transparent;background:transparent;color:inherit;padding:.2rem .25rem;border-radius:var(--radius-sm)}
	.input-inline:hover{border-color:color-mix(in srgb,var(--color-border-subtle) 75%,transparent)}
	.input-inline:focus{outline:none;border-color:color-mix(in srgb,var(--color-nova-blue) 45%,var(--color-border-default));background:color-mix(in srgb,var(--color-surface-overlay) 35%,transparent)}
	@media (max-width:768px){.field-grid{grid-template-columns:1fr}}
</style>
