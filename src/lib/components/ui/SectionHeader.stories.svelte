<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SectionHeader from './SectionHeader.svelte';

	const { Story } = defineMeta({
		title: 'UI/SectionHeader',
		component: SectionHeader,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Default"
	args={{
		title: 'World Building',
		description: 'Build continuity-first world systems with stable terminology and causal pressure.'
	}}
/>
