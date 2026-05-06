<script lang="ts">
	import CharacterSelect from '$modules/world-building/components/CharacterSelect.svelte';
	import { GhostButton, SectionHeader } from '$lib/components/ui/index.js';

	type CharacterOption = {
		id: string;
		name: string;
		role?: string;
		summary?: string;
	};

	type RelationshipField = 'targetCharacterId' | 'relationshipType' | 'status' | 'notes';

	type Relationship = {
		id: string;
		targetCharacterId: string;
		relationshipType?: string;
		status?: string;
		notes?: string;
	};

	let {
		character,
		characters,
		currentCharacterId,
		onRelationshipFieldChange,
		onAddRelationship,
		onRemoveRelationship,
	}: {
		character: { relationships?: Relationship[] } | null;
		characters: CharacterOption[];
		currentCharacterId: string;
		onRelationshipFieldChange: (index: number, field: RelationshipField, value: string) => void;
		onAddRelationship: (relationship: Omit<Relationship, 'id'>) => void;
		onRemoveRelationship: (index: number) => void;
	} = $props();

	let isCollapsed = $state(false);
	let isCreating = $state(false);
	let newTargetCharacterId = $state('');
	let newRelationshipType = $state('');
	let newStatus = $state('');
	let newNotes = $state('');
	let formError = $state('');

	const relationshipTypeSuggestions = ['Ally', 'Rival', 'Family', 'Mentor', 'Student', 'Romantic', 'Political Rival', 'Former Friend', 'Enemy', 'Unknown Connection'];
	const statusSuggestions = ['Stable', 'Tense', 'Fragile', 'Hidden', 'Broken', 'Guarded', 'Volatile'];

	const availableTargets = $derived(characters.filter((option) => option.id !== currentCharacterId));

	function resolveCharacterName(id: string) {
		return characters.find((characterOption) => characterOption.id === id)?.name || 'Unknown character';
	}

	function beginCreate() {
		isCreating = true;
		formError = '';
	}

	function cancelCreate() {
		isCreating = false;
		newTargetCharacterId = '';
		newRelationshipType = '';
		newStatus = '';
		newNotes = '';
		formError = '';
	}

	function hasDuplicateLink(targetCharacterId: string, relationshipType: string) {
		const normalizedType = relationshipType.trim().toLowerCase();
		return (character?.relationships || []).some(
			(relationship) =>
				relationship.targetCharacterId === targetCharacterId &&
				(relationship.relationshipType || '').trim().toLowerCase() === normalizedType,
		);
	}

	function saveNewRelationship() {
		formError = '';
		if (!newTargetCharacterId) {
			formError = 'Select a related character first.';
			return;
		}
		if (newTargetCharacterId === currentCharacterId) {
			formError = 'A character cannot be related to themselves.';
			return;
		}
		if (!newRelationshipType.trim()) {
			formError = 'Add a relationship type.';
			return;
		}
		if (hasDuplicateLink(newTargetCharacterId, newRelationshipType)) {
			formError = 'That relationship link already exists.';
			return;
		}

		onAddRelationship({
			targetCharacterId: newTargetCharacterId,
			relationshipType: newRelationshipType,
			status: newStatus,
			notes: newNotes,
		});
		cancelCreate();
	}
</script>

<section class="dossier-section" aria-label="Relationships">
	<SectionHeader title="Relationships" class="dossier-section-header">
		{#snippet actions()}
			<GhostButton type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="relationships-content" onclick={() => (isCollapsed = !isCollapsed)}>
				{isCollapsed ? 'Expand' : 'Collapse'}
			</GhostButton>
		{/snippet}
	</SectionHeader>
	{#if !isCollapsed}
		<div id="relationships-content">
			{#if availableTargets.length === 0}
				<p class="empty-state">Create more individuals to start defining relationships.</p>
			{:else}
				<div class="create-row">
					{#if !isCreating}
						<GhostButton type="button" class="create-button" onclick={beginCreate}
							>Add Relationship</GhostButton
						>
					{:else}
						<div class="create-form">
							<CharacterSelect
								id="new-relationship-target"
								label="Character"
								value={newTargetCharacterId}
								options={characters}
								excludeId={currentCharacterId}
								onChange={(id) => {
									newTargetCharacterId = id;
									formError = '';
								}}
							/>
							<div class="field-pair">
								<span class="field-label">Relationship Type</span>
								<input class="input-inline" type="text" list="relationship-type-options" value={newRelationshipType} oninput={(event) => (newRelationshipType = (event.currentTarget as HTMLInputElement).value)} placeholder="Relationship type" />
							</div>
							<div class="field-pair">
								<span class="field-label">Status / Tension</span>
								<input class="input-inline" type="text" list="relationship-status-options" value={newStatus} oninput={(event) => (newStatus = (event.currentTarget as HTMLInputElement).value)} placeholder="Status" />
							</div>
							<div class="field-pair">
								<span class="field-label">Notes</span>
								<textarea class="input-inline rel-note" rows="2" value={newNotes} oninput={(event) => (newNotes = (event.currentTarget as HTMLTextAreaElement).value)} placeholder="Short context note"></textarea>
							</div>
							{#if formError}
								<p class="form-error">{formError}</p>
							{/if}
							<div class="create-actions">
								<GhostButton type="button" class="create-button" onclick={saveNewRelationship}
									>Save</GhostButton
								>
								<GhostButton type="button" class="secondary-button" onclick={cancelCreate}
									>Cancel</GhostButton
								>
							</div>
						</div>
					{/if}
				</div>

				<datalist id="relationship-type-options">
					{#each relationshipTypeSuggestions as suggestion (suggestion)}
						<option value={suggestion}></option>
					{/each}
				</datalist>

				<datalist id="relationship-status-options">
					{#each statusSuggestions as suggestion (suggestion)}
						<option value={suggestion}></option>
					{/each}
				</datalist>
			{/if}

			{#if character?.relationships && character.relationships.length > 0}
				<div class="relationships-list">
					{#each character.relationships as rel, index (rel.id)}
						<div class="relationship-item">
							<div class="rel-header">
								<CharacterSelect
									id={`relationship-target-${rel.id}`}
									label="Character"
									value={rel.targetCharacterId || ''}
									options={characters}
									excludeId={currentCharacterId}
									onChange={(id) => onRelationshipFieldChange(index, 'targetCharacterId', id)}
								/>
								<input class="rel-type input-inline" type="text" list="relationship-type-options" value={rel.relationshipType || ''} oninput={(event) => onRelationshipFieldChange(index, 'relationshipType', (event.currentTarget as HTMLInputElement).value)} placeholder="Relationship type" />
								<input class="rel-status input-inline" type="text" list="relationship-status-options" value={rel.status || ''} oninput={(event) => onRelationshipFieldChange(index, 'status', (event.currentTarget as HTMLInputElement).value)} placeholder="Status" />
								<GhostButton type="button" class="secondary-button" aria-label={`Remove relationship with ${resolveCharacterName(rel.targetCharacterId)}`} onclick={() => onRemoveRelationship(index)}
									>Remove</GhostButton
								>
							</div>
							<textarea class="rel-note input-inline" rows="2" value={rel.notes || ''} oninput={(event) => onRelationshipFieldChange(index, 'notes', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="Relationship note"></textarea>
						</div>
					{/each}
				</div>
			{:else if availableTargets.length > 0}
				<p class="empty-state">No relationships recorded yet.</p>
			{/if}
		</div>
	{/if}
</section>

<style>
	.dossier-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	:global(.dossier-section-header .title) {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	:global(.collapse-toggle) {
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent);
		background: transparent;
		color: var(--color-text-muted);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.relationships-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.relationship-item {
		padding: var(--space-2) 0;
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	.create-row {
		margin-bottom: var(--space-4);
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.create-actions {
		display: flex;
		gap: var(--space-2);
	}

	:global(.create-button),
	:global(.secondary-button) {
		border: 1px solid color-mix(in srgb, var(--color-border-default) 75%, transparent);
		background: transparent;
		padding: 0.25rem 0.6rem;
		font-size: var(--text-xs);
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--color-text-primary);
	}

	:global(.secondary-button) {
		color: var(--color-text-muted);
	}

	.form-error {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-semantic-error-fg);
	}

	.rel-header {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-3);
		align-items: flex-end;
	}

	.rel-type {
		font-size: var(--text-xs);
		letter-spacing: 0.03em;
		color: var(--color-text-muted);
	}

	.rel-status {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.rel-note {
		margin: var(--space-1) 0 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		width: 100%;
		resize: vertical;
	}

	.input-inline {
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		padding: 0.15rem 0.2rem;
		border-radius: var(--radius-sm);
	}

	.input-inline:hover {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.input-inline:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
	}

	.empty-state {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
