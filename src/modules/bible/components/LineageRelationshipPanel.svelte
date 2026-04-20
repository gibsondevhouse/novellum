<script lang="ts">
	import CharacterSelect from '$modules/bible/components/CharacterSelect.svelte';
	type LineageOption = { id: string; name: string; role?: string; summary?: string };
	type Relationship = { id: string; targetLineageId: string; relationshipType?: string; status?: string; notes?: string };
	type RelationshipField = 'targetLineageId' | 'relationshipType' | 'status' | 'notes';

	let {
		lineage,
		lineages,
		currentLineageId,
		onRelationshipFieldChange,
		onAddRelationship,
		onRemoveRelationship,
	}: {
		lineage: { relationships?: Relationship[] } | null;
		lineages: LineageOption[];
		currentLineageId: string;
		onRelationshipFieldChange: (index: number, field: RelationshipField, value: string) => void;
		onAddRelationship: (relationship: Omit<Relationship, 'id'>) => void;
		onRemoveRelationship: (index: number) => void;
	} = $props();

	let isCollapsed = $state(false);
	let isCreating = $state(false);
	let newTargetLineageId = $state('');
	let newRelationshipType = $state('');
	let newStatus = $state('');
	let newNotes = $state('');
	let formError = $state('');

	const relationshipTypeSuggestions = ['Allied House', 'Rival Bloodline', 'Subordinate Branch', 'Predecessor', 'Splinter Branch', 'Marriage-Bound', 'Ancestral Enemy', 'Disputed Kinship'];
	const statusSuggestions = ['Stable', 'Tense', 'Fragile', 'Hidden', 'Broken', 'Contested'];
	const availableTargets = $derived(lineages.filter((option) => option.id !== currentLineageId));

	function beginCreate() { isCreating = true; formError = ''; }
	function cancelCreate() { isCreating = false; newTargetLineageId = ''; newRelationshipType = ''; newStatus = ''; newNotes = ''; formError = ''; }
	function saveNewRelationship() {
		if (!newTargetLineageId) { formError = 'Select a target lineage first.'; return; }
		if (!newRelationshipType.trim()) { formError = 'Add a relationship type.'; return; }
		onAddRelationship({ targetLineageId: newTargetLineageId, relationshipType: newRelationshipType, status: newStatus, notes: newNotes });
		cancelCreate();
	}
</script>

<section class="dossier-section" aria-labelledby="lineage-relationships-title">
	<div class="section-header"><h3 id="lineage-relationships-title" class="section-title">Relationships</h3><button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="lineage-relationships-content" onclick={() => (isCollapsed = !isCollapsed)}>{isCollapsed ? 'Expand' : 'Collapse'}</button></div>
	{#if !isCollapsed}
		<div id="lineage-relationships-content">
			{#if availableTargets.length === 0}
				<p class="empty-state">Create more lineages to start linking ancestral relationships.</p>
			{:else}
				{#if !isCreating}
					<button type="button" class="create-button" onclick={beginCreate}>Add Relationship</button>
				{:else}
					<div class="create-form">
						<CharacterSelect id="new-lineage-target" label="Target lineage" value={newTargetLineageId} options={lineages} excludeId={currentLineageId} onChange={(id) => (newTargetLineageId = id)} />
						<input class="input-inline" type="text" list="lineage-relationship-types" value={newRelationshipType} oninput={(e) => (newRelationshipType = (e.currentTarget as HTMLInputElement).value)} placeholder="Relationship type" />
						<input class="input-inline" type="text" list="lineage-relationship-status" value={newStatus} oninput={(e) => (newStatus = (e.currentTarget as HTMLInputElement).value)} placeholder="Status" />
						<textarea class="input-inline" rows="2" value={newNotes} oninput={(e) => (newNotes = (e.currentTarget as HTMLTextAreaElement).value)} placeholder="Notes"></textarea>
						{#if formError}<p class="form-error">{formError}</p>{/if}
						<div class="create-actions"><button type="button" class="create-button" onclick={saveNewRelationship}>Save</button><button type="button" class="secondary-button" onclick={cancelCreate}>Cancel</button></div>
					</div>
				{/if}
			{/if}
			<datalist id="lineage-relationship-types">{#each relationshipTypeSuggestions as s (s)}<option value={s}></option>{/each}</datalist>
			<datalist id="lineage-relationship-status">{#each statusSuggestions as s (s)}<option value={s}></option>{/each}</datalist>

			{#if lineage?.relationships && lineage.relationships.length > 0}
				<div class="relationships-list">
					{#each lineage.relationships as rel, index (rel.id)}
						<div class="relationship-item">
							<div class="rel-header">
								<CharacterSelect id={`lineage-target-${rel.id}`} label="Target lineage" value={rel.targetLineageId || ''} options={lineages} excludeId={currentLineageId} onChange={(id) => onRelationshipFieldChange(index, 'targetLineageId', id)} />
								<input class="input-inline" type="text" list="lineage-relationship-types" value={rel.relationshipType || ''} oninput={(e) => onRelationshipFieldChange(index, 'relationshipType', (e.currentTarget as HTMLInputElement).value)} placeholder="Relationship type" />
								<input class="input-inline" type="text" list="lineage-relationship-status" value={rel.status || ''} oninput={(e) => onRelationshipFieldChange(index, 'status', (e.currentTarget as HTMLInputElement).value)} placeholder="Status" />
								<button type="button" class="secondary-button" onclick={() => onRemoveRelationship(index)}>Remove</button>
							</div>
							<textarea class="input-inline" rows="2" value={rel.notes || ''} oninput={(e) => onRelationshipFieldChange(index, 'notes', (e.currentTarget as HTMLTextAreaElement).value)} placeholder="Relationship note"></textarea>
						</div>
					{/each}
				</div>
			{:else if availableTargets.length > 0}
				<p class="empty-state">No lineage relationships recorded yet.</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	.dossier-section{display:flex;flex-direction:column;gap:var(--space-4);padding-top:var(--space-4);border-top:1px solid color-mix(in srgb,var(--color-border-subtle) 65%,transparent)}
	.section-header{display:flex;justify-content:space-between;align-items:center;gap:var(--space-3)}
	.section-title{margin:0;font-size:var(--text-xs);font-weight:var(--font-weight-semibold);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.08em}
	.collapse-toggle{border:1px solid color-mix(in srgb,var(--color-border-subtle) 70%,transparent);background:transparent;color:var(--color-text-muted);padding:.15rem .45rem;border-radius:var(--radius-sm);font-size:var(--text-xs);cursor:pointer}
	.create-form{display:flex;flex-direction:column;gap:var(--space-3)}
	.create-actions{display:flex;gap:var(--space-2)}
	.create-button,.secondary-button{border:1px solid color-mix(in srgb,var(--color-border-default) 75%,transparent);background:transparent;padding:.25rem .6rem;font-size:var(--text-xs);border-radius:var(--radius-sm);cursor:pointer;color:var(--color-text-primary)}
	.secondary-button{color:var(--color-text-muted)}
	.relationships-list{display:flex;flex-direction:column;gap:var(--space-2)}
	.relationship-item{padding:var(--space-2) 0;border-bottom:1px solid color-mix(in srgb,var(--color-border-subtle) 65%,transparent)}
	.rel-header{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-3);align-items:flex-end}
	.input-inline{border:1px solid transparent;background:transparent;color:inherit;padding:.15rem .2rem;border-radius:var(--radius-sm)}
	.input-inline:hover{border-color:color-mix(in srgb,var(--color-border-subtle) 75%,transparent)}
	.input-inline:focus{outline:none;border-color:color-mix(in srgb,var(--color-nova-blue) 45%,var(--color-border-default));background:color-mix(in srgb,var(--color-surface-overlay) 35%,transparent)}
	.form-error{margin:0;font-size:var(--text-xs);color:var(--color-semantic-error-fg)}
	.empty-state{margin:0;font-size:var(--text-sm);color:var(--color-text-muted)}
</style>
