<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AppHeader from './AppHeader.svelte';

	const { Story } = defineMeta({
		title: 'App/AppHeader',
		component: AppHeader,
		tags: ['autodocs'],
	});
</script>

<Story name="Default" />
