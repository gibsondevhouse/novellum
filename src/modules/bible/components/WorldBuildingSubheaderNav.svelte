<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale, translator } from '$lib/i18n';
	import PillNav from '$lib/components/ui/PillNav.svelte';
	import type { PillNavItem } from '$lib/components/ui/PillNav.svelte';
	import {
		buildWorldBuildingSubItems,
		type WorldBuildingTopSectionId,
	} from '$modules/bible/worldbuilding-navigation.js';

	let { projectId, topSection, activeId, ariaLabel } = $props<{
		projectId: string;
		topSection: WorldBuildingTopSectionId;
		activeId: string;
		ariaLabel?: string;
	}>();

	const currentTopSection = $derived(topSection as WorldBuildingTopSectionId);
	const currentItems = $derived(buildWorldBuildingSubItems(currentTopSection, $locale));
	const fallbackAriaLabel = $derived.by(() => {
		switch (currentTopSection) {
			case 'characters':
				return $translator('worldbuilding.aria.personaeSections');
			case 'locations':
				return $translator('worldbuilding.aria.atlasSections');
			case 'lore':
				return $translator('worldbuilding.aria.archiveSections');
			case 'plot-threads':
				return $translator('worldbuilding.aria.threadsSections');
			case 'timeline':
				return $translator('worldbuilding.aria.chroniclesSections');
			default:
				return $translator('worldbuilding.aria.personaeSections');
		}
	});
	const navAriaLabel = $derived(
		ariaLabel ?? fallbackAriaLabel,
	);

	const items = $derived<PillNavItem[]>(
		currentItems.map((item) => ({ id: item.id, label: item.label })),
	);

	function handleSelect(id: string) {
		const target = currentItems.find((item) => item.id === id);
		if (!target) return;
		void goto(`/projects/${projectId}/world-building/${target.path}`);
	}
</script>

<div class="worldbuilding-subheader-nav" aria-label={navAriaLabel}>
	<PillNav items={items} activeId={activeId} onSelect={handleSelect} ariaLabel={navAriaLabel} />
</div>

<style>
	.worldbuilding-subheader-nav {
		position: sticky;
		top: 0;
		z-index: 12;
		flex-shrink: 0;
		padding: 0 var(--space-6) var(--space-2);
		display: flex;
		justify-content: center;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
		background: var(--color-surface-ground);
	}

	.worldbuilding-subheader-nav::-webkit-scrollbar {
		display: none;
	}

	.worldbuilding-subheader-nav :global(.pill-nav) {
		flex: 0 0 auto;
		min-width: max-content;
	}

	@media (max-width: 640px) {
		.worldbuilding-subheader-nav {
			padding: 0 var(--space-4) var(--space-2);
			justify-content: flex-start;
		}
	}
</style>
