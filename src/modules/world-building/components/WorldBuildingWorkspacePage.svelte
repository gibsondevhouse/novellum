<script lang="ts">
	import type { Snippet } from 'svelte';
	import IndividualsWorkspaceShell from '$modules/world-building/components/IndividualsWorkspaceShell.svelte';
	import GenerateButton from '$modules/world-building/components/GenerateButton.svelte';
	import GeneratedEntityModal from '$modules/world-building/components/GeneratedEntityModal.svelte';
	import type { WorldBuildingTopSectionId } from '$modules/world-building/worldbuilding-navigation.js';
	import type { EntityKind } from '$modules/world-building/services/worldbuilding-generation-service.js';

	type WorkspaceOption = {
		id: string;
		name: string;
		subtitle?: string;
		meta?: string;
	};

	let {
		projectId,
		topSection,
		activeId,
		ariaLabel,
		options,
		selectedId,
		onSelect,
		onCreate,
		hasSelection,
		listAriaLabel = 'Records',
		createLabel = 'new +',
		/**
		 * When provided, a "✦ Suggest 3" generate button is shown in the sidebar
		 * and GeneratedEntityModal is mounted on this page.
		 */
		generateEntityKind,
		dossier: dossierContent,
		empty: emptyContent,
	}: {
		projectId: string;
		topSection: WorldBuildingTopSectionId;
		activeId: string;
		ariaLabel: string;
		options: WorkspaceOption[];
		selectedId: string | null;
		onSelect: (id: string) => void;
		onCreate: () => void | Promise<void>;
		hasSelection: boolean;
		listAriaLabel?: string;
		createLabel?: string;
		generateEntityKind?: EntityKind;
		dossier?: Snippet;
		empty?: Snippet;
	} = $props();
</script>

<div class="worldbuilding-section-view">
	<IndividualsWorkspaceShell
		characterOptions={options}
		selectedCharacterId={selectedId}
		onSelectCharacter={onSelect}
		onCreateCharacter={onCreate}
		{hasSelection}
		{listAriaLabel}
		{createLabel}
	>
		{#snippet dossier()}
			{@render dossierContent?.()}
		{/snippet}
		{#snippet empty()}
			{@render emptyContent?.()}
		{/snippet}
		{#snippet generateActions()}
			{#if generateEntityKind}
				<GenerateButton {projectId} entityKind={generateEntityKind} count={3} />
			{/if}
		{/snippet}
	</IndividualsWorkspaceShell>
</div>

<!-- Mount modal once per workspace page; it reads from the generation-draft store -->
{#if generateEntityKind}
	<GeneratedEntityModal />
{/if}

<style>
	.worldbuilding-section-view {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
		min-height: 0;
		overflow: hidden;
		overscroll-behavior: none;
	}

	@media (max-width: 768px) {
		.worldbuilding-section-view {
			height: auto;
			overflow: visible;
		}
	}
</style>
