<script lang="ts">
	type CoreField =
		| 'foundingPurpose'
		| 'ideology'
		| 'contradiction'
		| 'operatingTemperament'
		| 'publicFace'
		| 'privateReality'
		| 'greatestStrength'
		| 'greatestVulnerability';

	let {
		faction,
		onFieldChange,
	}: {
		faction: Record<string, unknown> | null;
		onFieldChange: (field: CoreField, value: string) => void;
	} = $props();

	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="faction-core-title">
	<div class="section-header">
		<h3 id="faction-core-title" class="section-title">Core Identity</h3>
		<button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="faction-core-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</button>
	</div>
	{#if !isCollapsed}
		<div id="faction-core-content" class="section-content">
			<div class="field-grid">
				<label><span>Founding Purpose</span><textarea rows="2" class="input-inline" value={(faction?.foundingPurpose as string) || ''} oninput={(e) => onFieldChange('foundingPurpose', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
				<label><span>Ideology / Belief System</span><textarea rows="2" class="input-inline" value={(faction?.ideology as string) || ''} oninput={(e) => onFieldChange('ideology', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
				<label><span>Contradiction</span><textarea rows="2" class="input-inline" value={(faction?.contradiction as string) || ''} oninput={(e) => onFieldChange('contradiction', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
				<label><span>Operating Temperament</span><textarea rows="2" class="input-inline" value={(faction?.operatingTemperament as string) || ''} oninput={(e) => onFieldChange('operatingTemperament', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
				<label><span>Public Face</span><textarea rows="2" class="input-inline" value={(faction?.publicFace as string) || ''} oninput={(e) => onFieldChange('publicFace', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
				<label><span>Private Reality</span><textarea rows="2" class="input-inline" value={(faction?.privateReality as string) || ''} oninput={(e) => onFieldChange('privateReality', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
				<label><span>Greatest Strength</span><textarea rows="2" class="input-inline" value={(faction?.greatestStrength as string) || ''} oninput={(e) => onFieldChange('greatestStrength', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
				<label><span>Greatest Vulnerability</span><textarea rows="2" class="input-inline" value={(faction?.greatestVulnerability as string) || ''} oninput={(e) => onFieldChange('greatestVulnerability', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			</div>
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
