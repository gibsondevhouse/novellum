<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PromptInput from './PromptInput.svelte';

	const { Story } = defineMeta({
		title: 'AI/PromptInput',
		component: PromptInput,
		tags: ['autodocs'],
	});
</script>

<Story
	name="Default"
	args={{
		value: 'How can I tighten this chapter ending?',
		placeholder: 'Help me fix this error ...',
		onsubmit: () => {}
	}}
/>

<Story
	name="With Context Chips"
	args={{
		value: 'Check continuity against attached context.',
		contextItems: [
			{ id: 'project:p1', kind: 'project', projectId: 'p1', label: 'The River Protocol' },
			{ id: 'file:f1', kind: 'file', name: 'timeline.md', mimeType: 'text/markdown', sizeBytes: 1280, text: '- Event A\n- Event B' }
		],
		contextWarnings: ['Attached context was shortened to fit token budget.'],
		onsubmit: () => {},
		onremovecontext: () => {}
	}}
/>
