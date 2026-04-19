<div class="character-dossier-shell">
	<div class="dossier-header">
		<slot name="header" />
	</div>
	<div class="dossier-flow" aria-label="Character dossier sections">
		<slot />
	</div>
</div>

<style>
	.character-dossier-shell {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		max-width: 920px;
		width: 100%;
		padding-right: var(--space-6);
	}

	.dossier-flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	@media (max-width: 768px) {
		.character-dossier-shell {
			padding-right: 0;
		}
	}
</style>
