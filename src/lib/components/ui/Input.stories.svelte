<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Input from './Input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Input',
		component: Input,
		tags: ['autodocs'],
	});
</script>

<Story name="Default" args={{ id: 'story-input-default', label: 'Project Title', placeholder: 'Enter a title' }} />
<Story name="Error" args={{ id: 'story-input-error', label: 'Project Title', value: 'Bad value', error: 'Title is required.' }} />
<Story name="Disabled" args={{ id: 'story-input-disabled', label: 'Project Title', value: 'Read-only', disabled: true }} />
