<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LibraryHeroCard from './LibraryHeroCard.svelte';
	import type { Project } from '$lib/db/types.js';

	const project: Project = {
		id: 'storybook-project-1',
		title: 'The River Protocol',
		coverUrl: '',
		genre: 'Speculative, Mystery',
		logline: 'A memory cartographer exposes a buried civic conspiracy through mapped dreams.',
		synopsis: '',
		targetWordCount: 90000,
		status: 'planning',
		systemPrompt: '',
		negativePrompt: '',
		projectType: 'novel',
		lastOpenedAt: new Date().toISOString(),
		stylePresetId: '',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	const { Story } = defineMeta({
		title: 'Project/LibraryHeroCard',
		component: LibraryHeroCard,
		tags: ['autodocs'],
	});
</script>

<Story name="Hub Destination" args={{ project, cardIndex: 0, destination: 'hub' }} />
