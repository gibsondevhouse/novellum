<script lang="ts">
	import CharacterSelect from '$modules/bible/components/CharacterSelect.svelte';
	import { GhostButton, SectionHeader } from '$lib/components/ui/index.js';
	type FactionOption = { id: string; name: string; role?: string; summary?: string };
	type Relationship = { id: string; targetFactionId: string; relationshipType?: string; status?: string; notes?: string };
	type RelationshipField = 'targetFactionId' | 'relationshipType' | 'status' | 'notes';

	let {
		faction,
		factions,
		currentFactionId,
		onRelationshipFieldChange,
		onAddRelationship,
		onRemoveRelationship,
	}: {
		faction: { relationships?: Relationship[] } | null;
		factions: FactionOption[];
		currentFactionId: string;
		onRelationshipFieldChange: (index: number, field: RelationshipField, value: string) => void;
		onAddRelationship: (relationship: Omit<Relationship, 'id'>) => void;
		onRemoveRelationship: (index: number) => void;
	} = $props();

	let isCollapsed = $state(false);
	let isCreating = $state(false);
	let newTargetFactionId = $state('');
	let newRelationshipType = $state('');
	let newStatus = $state('');
	let newNotes = $state('');
	let formError = $state('');

	const relationshipTypeSuggestions = ['Alliance', 'Rivalry', 'Vassal', 'Trade Partner', 'Enemy', 'Uneasy Truce'];
	const statusSuggestions = ['Stable', 'Tense', 'Fragile', 'Hidden', 'Broken', 'Volatile'];
	const availableTargets = $derived(factions.filter((option) => option.id !== currentFactionId));

	function resolveFactionName(id: string) { return factions.find((f) => f.id === id)?.name || 'Unknown faction'; }
	function beginCreate() { isCreating = true; formError = ''; }
	function cancelCreate() { isCreating = false; newTargetFactionId = ''; newRelationshipType = ''; newStatus = ''; newNotes = ''; formError = ''; }
	function saveNewRelationship() {
		if (!newTargetFactionId) { formError = 'Select a target faction first.'; return; }
		if (!newRelationshipType.trim()) { formError = 'Add a relationship type.'; return; }
		onAddRelationship({ targetFactionId: newTargetFactionId, relationshipType: newRelationshipType, status: newStatus, notes: newNotes });
		cancelCreate();
	}
</script>

<section class="dossier-section" aria-label="Relationships">
	<SectionHeader title="Relationships" class="dossier-section-header">
		{#snippet actions()}
			<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="faction-relationships-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</GhostButton>
		{/snippet}
	</SectionHeader>
	{#if !isCollapsed}
		<div id="faction-relationships-content">
			{#if availableTargets.length === 0}
				<p class="empty-state">Create more factions to start linking relationships.</p>
			{:else}
				<div class="create-row">
					{#if !isCreating}
						<GhostButton type="button" class="create-button" onclick={beginCreate}>Add Relationship</GhostButton>
					{:else}
						<div class="create-form">
							<CharacterSelect id="new-faction-target" label="Target faction" value={newTargetFactionId} options={factions} excludeId={currentFactionId} onChange={(id) => (newTargetFactionId = id)} />
							<input class="input-inline" type="text" list="faction-relationship-types" value={newRelationshipType} oninput={(e) => (newRelationshipType = (e.currentTarget as HTMLInputElement).value)} placeholder="Relationship type" />
							<input class="input-inline" type="text" list="faction-relationship-status" value={newStatus} oninput={(e) => (newStatus = (e.currentTarget as HTMLInputElement).value)} placeholder="Status" />
							<textarea class="input-inline" rows="2" value={newNotes} oninput={(e) => (newNotes = (e.currentTarget as HTMLTextAreaElement).value)} placeholder="Notes"></textarea>
							{#if formError}<p class="form-error">{formError}</p>{/if}
							<div class="create-actions"><GhostButton type="button" class="create-button" onclick={saveNewRelationship}>Save</GhostButton><GhostButton type="button" class="secondary-button" onclick={cancelCreate}>Cancel</GhostButton></div>
						</div>
					{/if}
				</div>
			{/if}

			<datalist id="faction-relationship-types">{#each relationshipTypeSuggestions as s (s)}<option value={s}></option>{/each}</datalist>
			<datalist id="faction-relationship-status">{#each statusSuggestions as s (s)}<option value={s}></option>{/each}</datalist>

			{#if faction?.relationships && faction.relationships.length > 0}
				<div class="relationships-list">
					{#each faction.relationships as rel, index (rel.id)}
						<div class="relationship-item">
							<div class="rel-header">
								<CharacterSelect id={`faction-target-${rel.id}`} label="Target faction" value={rel.targetFactionId || ''} options={factions} excludeId={currentFactionId} onChange={(id) => onRelationshipFieldChange(index, 'targetFactionId', id)} />
								<input class="input-inline" type="text" list="faction-relationship-types" value={rel.relationshipType || ''} oninput={(e) => onRelationshipFieldChange(index, 'relationshipType', (e.currentTarget as HTMLInputElement).value)} placeholder="Relationship type" />
								<input class="input-inline" type="text" list="faction-relationship-status" value={rel.status || ''} oninput={(e) => onRelationshipFieldChange(index, 'status', (e.currentTarget as HTMLInputElement).value)} placeholder="Status" />
								<GhostButton type="button" class="secondary-button" aria-label={`Remove relationship with ${resolveFactionName(rel.targetFactionId)}`} onclick={() => onRemoveRelationship(index)}>Remove</GhostButton>
							</div>
							<textarea class="input-inline" rows="2" value={rel.notes || ''} oninput={(e) => onRelationshipFieldChange(index, 'notes', (e.currentTarget as HTMLTextAreaElement).value)} placeholder="Relationship note"></textarea>
						</div>
					{/each}
				</div>
			{:else if availableTargets.length > 0}
				<p class="empty-state">No faction relationships recorded yet.</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	.dossier-section { display: flex; flex-direction: column; gap: var(--space-4); padding-top: var(--space-4); border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent); }
	:global(.dossier-section-header .title) { font-size: var(--text-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
	:global(.collapse-toggle) { border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent); background: transparent; color: var(--color-text-muted); padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); font-size: var(--text-xs); cursor: pointer; }
	.create-row { margin-bottom: var(--space-4); }
	.create-form { display: flex; flex-direction: column; gap: var(--space-3); }
	.create-actions { display: flex; gap: var(--space-2); }
	:global(.create-button),:global(.secondary-button) { border: 1px solid color-mix(in srgb, var(--color-border-default) 75%, transparent); background: transparent; padding: 0.25rem 0.6rem; font-size: var(--text-xs); border-radius: var(--radius-sm); cursor: pointer; color: var(--color-text-primary); }
	:global(.secondary-button) { color: var(--color-text-muted); }
	.relationships-list { display: flex; flex-direction: column; gap: var(--space-2); }
	.relationship-item { padding: var(--space-2) 0; border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent); }
	.rel-header { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-3); align-items: flex-end; }
	.input-inline { border: 1px solid transparent; background: transparent; color: inherit; padding: 0.15rem 0.2rem; border-radius: var(--radius-sm); }
	.input-inline:hover { border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent); }
	.input-inline:focus { outline: none; border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default)); background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent); }
	.form-error { margin: 0; font-size: var(--text-xs); color: var(--color-semantic-error-fg); }
	.empty-state { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); }
</style>
