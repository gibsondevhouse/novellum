<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EmptyStatePanel from './EmptyStatePanel.svelte';
	import PrimaryButton from './PrimaryButton.svelte';

	const { Story } = defineMeta({
		title: 'UI/EmptyStatePanel',
		component: EmptyStatePanel,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Default"
	args={{
		title: 'No records yet.',
		description: 'Start by adding your first entry to initialize this workspace.'
	}}
/>

<Story name="With Action" args={{ title: 'No myths yet.', description: 'Create a belief system entry to start the archive.' }}>
	{#snippet actions()}
		<PrimaryButton>Add first myth</PrimaryButton>
	{/snippet}
</Story>
