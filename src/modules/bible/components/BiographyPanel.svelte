<script lang="ts">
	let { character } = $props();
</script>

<section class="dossier-section" aria-labelledby="biography-title">
	<h3 id="biography-title" class="section-title">Biography</h3>
	<p class="biography-text">{character?.biography || 'No biography recorded yet.'}</p>
</section>

<style>
	.dossier-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	.section-title {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.biography-text {
		margin: 0;
		max-width: 76ch;
		line-height: var(--leading-relaxed);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
	}
</style>
