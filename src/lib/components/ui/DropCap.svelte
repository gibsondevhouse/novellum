<script lang="ts">
	let {
		letter,
		class: className = '',
	}: {
		letter: string;
		class?: string;
	} = $props();

	const initial = $derived(letter.trim().charAt(0).toUpperCase());
</script>

<span class="dropcap {className}" aria-hidden="true">{initial}</span>

<style>
	.dropcap {
		float: left;
		font-family: var(--font-display);
		font-weight: var(--font-weight-normal);
		color: var(--color-brass);
		font-size: 3.5em;
		line-height: 0.85;
		padding-right: 0.1em;
		padding-top: 0.05em;
		margin-bottom: -0.1em;
	}
</style>
