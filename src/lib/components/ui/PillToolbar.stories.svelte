<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PillToolbar from './PillToolbar.svelte';

	const { Story } = defineMeta({
		title: 'UI/PillToolbar',
		component: PillToolbar,
		tags: ['autodocs'],
	});

	const noop = () => {};
</script>

<Story
	name="Editor Toolbar"
	args={{
		ariaLabel: 'Editor formatting toolbar',
		items: [
			{ kind: 'button', id: 'bold', label: 'Bold', icon: 'B', pressed: true, onSelect: noop },
			{ kind: 'button', id: 'italic', label: 'Italic', icon: 'I', onSelect: noop },
			{ kind: 'button', id: 'underline', label: 'Underline', icon: 'U', onSelect: noop },
			{ kind: 'button', id: 'strike', label: 'Strikethrough', icon: 'S', onSelect: noop },
			{ kind: 'divider', id: 'd1' },
			{ kind: 'button', id: 'h1', label: 'Heading 1', icon: 'H1', onSelect: noop },
			{ kind: 'button', id: 'h2', label: 'Heading 2', icon: 'H2', onSelect: noop },
			{ kind: 'button', id: 'ul', label: 'Bullet list', icon: '•', onSelect: noop },
			{ kind: 'button', id: 'ol', label: 'Ordered list', icon: '1.', onSelect: noop },
			{ kind: 'button', id: 'quote', label: 'Blockquote', icon: '“', onSelect: noop },
			{ kind: 'divider', id: 'd2' },
			{
				kind: 'menu',
				id: 'insert',
				label: 'Insert',
				icon: '+',
				items: [
					{ id: 'image', label: 'Image…', onSelect: noop },
					{ id: 'table', label: 'Table 3 × 3', onSelect: noop },
				],
			},
			{ kind: 'divider', id: 'd3' },
			{
				kind: 'button',
				id: 'spellcheck',
				label: 'Spellcheck',
				icon: '✓',
				pressed: true,
				onSelect: noop,
			},
		],
	}}
/>
