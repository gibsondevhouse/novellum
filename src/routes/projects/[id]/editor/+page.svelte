<script lang="ts">
	import { onMount } from 'svelte';
	import EditorShell from '$modules/editor/components/EditorShell.svelte';
	import { appearance } from '$lib/stores/appearance.svelte.js';

	let { data } = $props();

	onMount(() => {
		void appearance.hydrate();
	});
</script>

<svelte:head><title>Editor — Novellum</title></svelte:head>

<EditorShell {data} />
