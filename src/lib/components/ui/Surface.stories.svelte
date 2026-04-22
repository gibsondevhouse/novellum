<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SurfaceCard from './SurfaceCard.svelte';
	import SurfacePanel from './SurfacePanel.svelte';

	const { Story } = defineMeta({
		title: 'UI/Surfaces',
		tags: ['autodocs'],
	});
</script>

<Story name="Panel">
	<SurfacePanel>
		<h3 style="margin:0 0 var(--space-2);">Panel Title</h3>
		<p style="margin:0; color: var(--color-text-secondary);">Shared container for grouped controls and context.</p>
	</SurfacePanel>
</Story>

<Story name="Cards">
	<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3);">
		<SurfaceCard variant="elevated">Elevated Card</SurfaceCard>
		<SurfaceCard variant="flat">Flat Card</SurfaceCard>
		<SurfaceCard variant="inset">Inset Card</SurfaceCard>
	</div>
</Story>
