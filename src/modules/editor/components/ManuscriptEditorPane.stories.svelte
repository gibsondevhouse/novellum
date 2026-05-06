<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ManuscriptEditorPane from './ManuscriptEditorPane.svelte';

	const { Story } = defineMeta({
		title: 'Editor/ManuscriptEditorPane',
		component: ManuscriptEditorPane,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story
	name="Drafting State"
	args={{
		content: '<p>The city woke under a wire-thin rain.</p><p>Every streetlight hummed like an old machine refusing sleep.</p>',
		onContentChange: () => {}
	}}
/>
