<script lang="ts">
	let {
		glyph = '❦',
		label = 'Section ornament',
		class: className = '',
	}: {
		glyph?: string;
		label?: string;
		class?: string;
	} = $props();
</script>

<div class="ornament {className}" role="separator" aria-label={label}>
	<span class="ornament__rule" aria-hidden="true"></span>
	<span class="ornament__glyph" aria-hidden="true">{glyph}</span>
	<span class="ornament__rule" aria-hidden="true"></span>
</div>

<style>
	.ornament {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-brass);
		margin: var(--space-6) auto;
		max-width: 24ch;
	}

	.ornament__rule {
		flex: 1;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			color-mix(in srgb, var(--color-brass) 50%, transparent) 50%,
			transparent 100%
		);
	}

	.ornament__glyph {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		line-height: 1;
	}
</style>
