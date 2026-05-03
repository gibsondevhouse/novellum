<script lang="ts">
	import { GhostButton, SectionHeader } from '$lib/components/ui/index.js';

	type StateField = 'currentStatus' | 'activeObjective' | 'currentPressure' | 'latestMajorMove' | 'lastSeenIn' | 'nextExpectedMove';
	let { faction, onFieldChange }: { faction: Record<string, unknown> | null; onFieldChange: (field: StateField, value: string) => void } = $props();
	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-label="Current State">
	<SectionHeader title="Current State" class="dossier-section-header">
		{#snippet actions()}
			<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="faction-state-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</GhostButton>
		{/snippet}
	</SectionHeader>
	{#if !isCollapsed}
		<div id="faction-state-content" class="field-grid">
			<label><span>Current Status</span><input class="input-inline" type="text" value={(faction?.currentStatus as string) || ''} oninput={(e) => onFieldChange('currentStatus', (e.currentTarget as HTMLInputElement).value)} /></label>
			<label><span>Active Objective</span><textarea rows="2" class="input-inline" value={(faction?.activeObjective as string) || ''} oninput={(e) => onFieldChange('activeObjective', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Current Pressure / Threat</span><textarea rows="2" class="input-inline" value={(faction?.currentPressure as string) || ''} oninput={(e) => onFieldChange('currentPressure', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Latest Major Move</span><textarea rows="2" class="input-inline" value={(faction?.latestMajorMove as string) || ''} oninput={(e) => onFieldChange('latestMajorMove', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
			<label><span>Last Seen In</span><input class="input-inline" type="text" value={(faction?.lastSeenIn as string) || ''} oninput={(e) => onFieldChange('lastSeenIn', (e.currentTarget as HTMLInputElement).value)} /></label>
			<label><span>Next Expected Move</span><textarea rows="2" class="input-inline" value={(faction?.nextExpectedMove as string) || ''} oninput={(e) => onFieldChange('nextExpectedMove', (e.currentTarget as HTMLTextAreaElement).value)}></textarea></label>
		</div>
	{/if}
</section>

<style>
	.dossier-section { display: flex; flex-direction: column; gap: var(--space-4); padding-top: var(--space-4); border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent); }
	:global(.dossier-section-header .title) { font-size: var(--text-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
	:global(.collapse-toggle) { border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent); background: transparent; color: var(--color-text-muted); padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); font-size: var(--text-xs); cursor: pointer; }
	.field-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4) var(--space-5); }
	label { display: flex; flex-direction: column; gap: 0.35rem; }
	label span { font-size: var(--text-xs); letter-spacing: 0.03em; color: var(--color-text-muted); }
	.input-inline { width: 100%; border: 1px solid transparent; background: transparent; color: inherit; padding: 0.2rem 0.25rem; border-radius: var(--radius-sm); }
	.input-inline:hover { border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent); }
	.input-inline:focus { outline: none; border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default)); background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent); }
	@media (max-width: 768px) { .field-grid { grid-template-columns: 1fr; } }
</style>
