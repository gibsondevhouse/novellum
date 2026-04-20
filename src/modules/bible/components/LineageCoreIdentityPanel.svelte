<script lang="ts">
	type CoreField = 'foundingOrigin' | 'inheritedValues' | 'definingContradiction' | 'publicReputation' | 'internalTruth' | 'greatestStrength' | 'greatestVulnerability' | 'distinctiveMark';
	let { lineage, onFieldChange }: { lineage: Record<string, unknown> | null; onFieldChange: (field: CoreField, value: string) => void } = $props();
	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="lineage-core-title">
	<div class="section-header"><h3 id="lineage-core-title" class="section-title">Core Identity</h3><button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="lineage-core-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</button></div>
	{#if !isCollapsed}
		<div id="lineage-core-content" class="field-grid">
			<label><span>Founding Origin</span><textarea rows="2" class="input-inline" value={(lineage?.foundingOrigin as string) || ''} oninput={(e) => onFieldChange('foundingOrigin', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Inherited Ideology / Values</span><textarea rows="2" class="input-inline" value={(lineage?.inheritedValues as string) || ''} oninput={(e) => onFieldChange('inheritedValues', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Defining Contradiction</span><textarea rows="2" class="input-inline" value={(lineage?.definingContradiction as string) || ''} oninput={(e) => onFieldChange('definingContradiction', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Public Reputation</span><textarea rows="2" class="input-inline" value={(lineage?.publicReputation as string) || ''} oninput={(e) => onFieldChange('publicReputation', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Internal Truth</span><textarea rows="2" class="input-inline" value={(lineage?.internalTruth as string) || ''} oninput={(e) => onFieldChange('internalTruth', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Greatest Strength</span><textarea rows="2" class="input-inline" value={(lineage?.greatestStrength as string) || ''} oninput={(e) => onFieldChange('greatestStrength', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Greatest Vulnerability</span><textarea rows="2" class="input-inline" value={(lineage?.greatestVulnerability as string) || ''} oninput={(e) => onFieldChange('greatestVulnerability', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>What Sets This Lineage Apart</span><textarea rows="2" class="input-inline" value={(lineage?.distinctiveMark as string) || ''} oninput={(e) => onFieldChange('distinctiveMark', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
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
	.input-inline{width:100%;border:1px solid transparent;background:transparent;color:inherit;padding:.2rem .25rem;border-radius:var(--radius-sm)}
	.input-inline:hover{border-color:color-mix(in srgb,var(--color-border-subtle) 75%,transparent)}
	.input-inline:focus{outline:none;border-color:color-mix(in srgb,var(--color-nova-blue) 45%,var(--color-border-default));background:color-mix(in srgb,var(--color-surface-overlay) 35%,transparent)}
	@media (max-width:768px){.field-grid{grid-template-columns:1fr}}
</style>
