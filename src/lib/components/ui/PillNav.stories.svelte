<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PillNav from './PillNav.svelte';

	const { Story } = defineMeta({
		title: 'UI/PillNav',
		component: PillNav,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Worldbuilding Sections"
	args={{
		ariaLabel: 'Worldbuilding sections',
		activeId: 'characters',
		items: [
			{ id: 'characters', label: 'Personae' },
			{ id: 'locations', label: 'Atlas' },
			{ id: 'lore', label: 'The Archive' },
			{ id: 'plot-threads', label: 'Threads' },
			{ id: 'timeline', label: 'Chronicles' }
		]
	}}
/>
