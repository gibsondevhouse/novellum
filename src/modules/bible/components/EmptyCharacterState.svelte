<script lang="ts">
</script>

<div class="empty-state-wrapper">
	<div class="empty-state-content">
		<h2>Character Workspace</h2>
		<p>
			Select a character from the list to view their full profile, story function, voice, relationships, and continuity tracking.
		</p>
		<p class="empty-note">
			The Individuals view helps you develop characters deeply, track their narrative arc, maintain continuity, and write them consistently across scenes.
		</p>
		<p class="hint">Start by selecting one of the names on the left, or click <strong>new +</strong> to create a new character.</p>
	</div>
</div>

<style>
	.empty-state-wrapper {
		display: grid;
		place-items: center;
		min-height: 60vh;
		padding: var(--space-8);
		text-align: center;
	}

	.empty-state-content {
		max-width: 60ch;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.empty-state-content h2 {
		margin: 0;
		font-size: var(--text-2xl);
		color: var(--color-text-primary);
	}

	.empty-state-content p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	.empty-note {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}

	.hint {
		margin-top: var(--space-2);
		padding: var(--space-3);
		border-left: 2px solid var(--color-nova-blue);
		background: color-mix(in srgb, var(--color-nova-blue) 5%, transparent);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
	}

	.hint strong {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}
</style>
