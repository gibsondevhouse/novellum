<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AppSidebar from './AppSidebar.svelte';

	const { Story } = defineMeta({
		title: 'App/AppSidebar',
		component: AppSidebar,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Default" />
