<li class="project-card-skeleton" aria-hidden="true">
	<div class="skeleton-cover"></div>
	<div class="skeleton-body">
		<div class="skeleton-block skeleton-genre"></div>
		<div class="skeleton-block skeleton-title"></div>
		<div class="skeleton-block skeleton-logline"></div>
		<div class="skeleton-block skeleton-meta"></div>
	</div>
</li>

<style>
	.project-card-skeleton {
		background-color: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		list-style: none;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.skeleton-cover {
		aspect-ratio: 2 / 3;
		width: 100%;
		background-color: var(--color-surface-elevated);
		flex-shrink: 0;
	}

	.skeleton-body {
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.skeleton-block {
		background-color: var(--color-surface-elevated);
		border-radius: var(--radius-xs);
	}

	.skeleton-genre {
		width: 60px;
		height: 10px;
	}

	.skeleton-title {
		width: 80%;
		height: 20px;
	}

	.skeleton-logline {
		width: 100%;
		height: 32px;
	}

	.skeleton-meta {
		width: 48%;
		height: 10px;
		margin-top: var(--space-1);
	}

	/* Pulse animation */
	@media (prefers-reduced-motion: no-preference) {
		.project-card-skeleton {
			--_dur: 1.4s;
			animation: skeleton-pulse var(--_dur) var(--ease-standard) infinite;
		}

		@keyframes skeleton-pulse {
			0%,
			100% {
				opacity: 0.4;
			}
			50% {
				opacity: 0.7;
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-card-skeleton {
			opacity: 0.5;
		}
	}
</style>
