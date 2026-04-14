<li class="library-card-skeleton" aria-hidden="true">
	<div class="library-card-skeleton__cover"></div>
	<div class="library-card-skeleton__content">
		<div class="library-card-skeleton__chips">
			<span class="chip"></span>
			<span class="chip"></span>
		</div>
		<div class="line line--title"></div>
		<div class="line line--logline"></div>
		<div class="line line--logline short"></div>
		<div class="line line--meta"></div>
	</div>
</li>

<style>
	.library-card-skeleton {
		list-style: none;
		display: grid;
		grid-template-columns: minmax(128px, 164px) 1fr;
		align-items: stretch;
		gap: var(--space-5);
		padding: var(--space-5);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: linear-gradient(
			145deg,
			var(--color-surface-raised) 0%,
			var(--color-surface-overlay) 100%
		);
	}

	.library-card-skeleton__cover {
		border-radius: var(--radius-md);
		min-height: 228px;
		background: var(--color-surface-elevated);
	}

	.library-card-skeleton__content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-3);
	}

	.library-card-skeleton__chips {
		display: flex;
		gap: var(--space-2);
	}

	.chip {
		display: block;
		width: 76px;
		height: 22px;
		border-radius: var(--radius-full);
		background: var(--color-surface-elevated);
	}

	.line {
		display: block;
		height: 14px;
		border-radius: var(--radius-xs);
		background: var(--color-surface-elevated);
	}

	.line--title {
		height: 32px;
		width: 70%;
	}

	.line--logline {
		width: 100%;
	}

	.line--logline.short {
		width: 68%;
	}

	.line--meta {
		width: 36%;
		height: 12px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.library-card-skeleton {
			animation: skeleton-pulse 1.35s ease-in-out infinite;
		}

		@keyframes skeleton-pulse {
			0%,
			100% {
				opacity: 0.42;
			}
			50% {
				opacity: 0.74;
			}
		}
	}

	@media (max-width: 800px) {
		.library-card-skeleton {
			grid-template-columns: 120px 1fr;
			gap: var(--space-4);
			padding: var(--space-4);
		}

		.library-card-skeleton__cover {
			min-height: 176px;
		}
	}

	@media (max-width: 580px) {
		.library-card-skeleton {
			grid-template-columns: 1fr;
		}

		.library-card-skeleton__cover {
			min-height: 220px;
			max-width: 180px;
		}
	}
</style>
