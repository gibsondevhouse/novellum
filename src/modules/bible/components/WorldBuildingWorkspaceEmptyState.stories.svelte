<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorldBuildingWorkspaceEmptyState from './WorldBuildingWorkspaceEmptyState.svelte';

	const { Story } = defineMeta({
		title: 'Worldbuilding/WorkspaceEmptyState',
		component: WorldBuildingWorkspaceEmptyState,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Default"
	args={{
		title: 'No traditions yet.',
		description: 'Add practices that appear in scenes and carry consequences.',
		actionLabel: '+ Add first tradition',
		onAction: () => {}
	}}
/>
