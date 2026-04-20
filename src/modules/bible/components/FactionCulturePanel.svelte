<script lang="ts">
	type CultureField = 'cultureSummary' | 'communicationStyle' | 'ritualsCustoms' | 'symbolsInsignia' | 'recruitmentStyle' | 'disciplineStyle' | 'internalSlogans' | 'publicMessagingSample';
	let { faction, onFieldChange }: { faction: Record<string, unknown> | null; onFieldChange: (field: CultureField, value: string) => void } = $props();
	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="faction-culture-title">
	<div class="section-header"><h3 id="faction-culture-title" class="section-title">Culture &amp; Behavior</h3><button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="faction-culture-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</button></div>
	{#if !isCollapsed}
		<div id="faction-culture-content" class="field-grid">
			<label><span>Faction Culture Summary</span><textarea rows="2" class="input-inline" value={(faction?.cultureSummary as string) || ''} oninput={(e) => onFieldChange('cultureSummary', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Communication Style</span><textarea rows="2" class="input-inline" value={(faction?.communicationStyle as string) || ''} oninput={(e) => onFieldChange('communicationStyle', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Rituals / Customs</span><textarea rows="2" class="input-inline" value={(faction?.ritualsCustoms as string) || ''} oninput={(e) => onFieldChange('ritualsCustoms', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Symbols / Insignia</span><textarea rows="2" class="input-inline" value={(faction?.symbolsInsignia as string) || ''} oninput={(e) => onFieldChange('symbolsInsignia', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Recruitment Style</span><textarea rows="2" class="input-inline" value={(faction?.recruitmentStyle as string) || ''} oninput={(e) => onFieldChange('recruitmentStyle', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Discipline / Enforcement Style</span><textarea rows="2" class="input-inline" value={(faction?.disciplineStyle as string) || ''} oninput={(e) => onFieldChange('disciplineStyle', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Internal Slogans / Phrases</span><textarea rows="2" class="input-inline" value={(faction?.internalSlogans as string) || ''} oninput={(e) => onFieldChange('internalSlogans', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Public Messaging Sample</span><textarea rows="3" class="input-inline" value={(faction?.publicMessagingSample as string) || ''} oninput={(e) => onFieldChange('publicMessagingSample', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
		</div>
	{/if}
</section>

<style>
	.dossier-section { display: flex; flex-direction: column; gap: var(--space-4); padding-top: var(--space-4); border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent); }
	.section-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); }
	.section-title { margin: 0; font-size: var(--text-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
	.collapse-toggle { border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent); background: transparent; color: var(--color-text-muted); padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); font-size: var(--text-xs); cursor: pointer; }
	.field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4) var(--space-5); }
	label { display: flex; flex-direction: column; gap: 0.35rem; }
	label span { font-size: var(--text-xs); letter-spacing: 0.03em; color: var(--color-text-muted); }
	.input-inline { width: 100%; border: 1px solid transparent; background: transparent; color: inherit; padding: 0.2rem 0.25rem; border-radius: var(--radius-sm); }
	.input-inline:hover { border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent); }
	.input-inline:focus { outline: none; border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default)); background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent); }
	@media (max-width: 768px) { .field-grid { grid-template-columns: 1fr; } }
</style>
