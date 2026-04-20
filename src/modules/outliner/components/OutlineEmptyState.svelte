<script lang="ts">
	let { onAddFirstAct } = $props<{
		onAddFirstAct: () => void;
	}>();
</script>

<div class="empty-state" role="region" aria-label="Outline empty state">
	<div class="empty-structure" aria-hidden="true">
		<div class="struct-chapter">
			<span class="struct-bar struct-bar--chapter"></span>
			<div class="struct-scenes">
				<span class="struct-bar struct-bar--scene"></span>
				<span class="struct-bar struct-bar--scene"></span>
			</div>
		</div>
	</div>
	<div class="empty-text">
		<h2 class="empty-heading">Begin your story structure</h2>
		<p class="empty-body">
			Create acts to shape the high-level flow,<br />
			then add chapters and scenes inside each act.
		</p>
	</div>
	<button class="btn-cta" onclick={onAddFirstAct}> Add First Act </button>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-5);
		padding: var(--space-12) var(--space-8) var(--space-10);
		text-align: center;
	}

	/* ── Abstract structure illustration ── */
	.empty-structure {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		opacity: 0.35;
	}

	.struct-chapter {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.struct-scenes {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-left: var(--space-5);
	}

	.struct-bar {
		display: block;
		border-radius: var(--radius-full);
		background: var(--color-text-muted);
	}

	.struct-bar--chapter {
		width: 160px;
		height: 8px;
	}

	.struct-bar--scene {
		width: 120px;
		height: 5px;
		opacity: 0.7;
	}

	/* ── Text content ── */
	.empty-text {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.empty-heading {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.empty-body {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	/* ── CTA ── */
	.btn-cta {
		padding: var(--space-3) var(--space-6);
		background: var(--color-nova-blue);
		color: var(--color-text-on-dark);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.btn-cta:hover {
		opacity: 0.85;
	}

	.btn-cta:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
