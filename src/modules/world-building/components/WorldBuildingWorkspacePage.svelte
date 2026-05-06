<script lang="ts">
	import type { Snippet } from 'svelte';
	import IndividualsWorkspaceShell from '$modules/world-building/components/IndividualsWorkspaceShell.svelte';
	import WorldBuildingSubheaderNav from '$modules/world-building/components/WorldBuildingSubheaderNav.svelte';
	import type { WorldBuildingTopSectionId } from '$modules/world-building/worldbuilding-navigation.js';

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
		dossier?: Snippet;
		empty?: Snippet;
	} = $props();
</script>

<div class="worldbuilding-section-view">
	<WorldBuildingSubheaderNav {projectId} {topSection} {activeId} {ariaLabel} />

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
	</IndividualsWorkspaceShell>
</div>

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
