<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ManuscriptSurface from './ManuscriptSurface.svelte';

	const { Story } = defineMeta({
		title: 'Editor/ManuscriptSurface',
		component: ManuscriptSurface,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story
	name="Drafting State"
	args={{
		title: 'Chapter One',
		content: '<p>The city woke under a wire-thin rain.</p><p>Every streetlight hummed like an old machine refusing sleep.</p>',
		onContentChange: () => {},
		onTitleChange: () => {}
	}}
/>
