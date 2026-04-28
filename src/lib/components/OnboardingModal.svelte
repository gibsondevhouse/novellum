<script lang="ts">
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import { getPreference, setPreference } from '$lib/preferences.js';

	let open = $state(false);
	let modalEl = $state<HTMLElement | null>(null);
	let previouslyFocused = $state<HTMLElement | null>(null);

	$effect(() => {
		const hasSeenLocal = localStorage.getItem('novellum:seen_onboarding');
		if (hasSeenLocal) return;
		// Local cache says "unseen" — confirm with SQLite-canonical store before opening.
		void getPreference<boolean>('app.seenOnboarding', false).then((seen) => {
			if (seen) {
				localStorage.setItem('novellum:seen_onboarding', 'true');
			} else {
				open = true;
			}
		});
	});

	$effect(() => {
		if (open && modalEl) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			// Move focus to first focusable element inside modal
			const firstFocusable = modalEl.querySelector<HTMLElement>(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			firstFocusable?.focus();
		} else if (!open && previouslyFocused) {
			previouslyFocused.focus();
			previouslyFocused = null;
		}
	});

	function dismiss() {
		localStorage.setItem('novellum:seen_onboarding', 'true');
		void setPreference('app.seenOnboarding', true);
		open = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			dismiss();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open || !modalEl) return;

		if (event.key === 'Escape') {
			dismiss();
			return;
		}

		if (event.key === 'Tab') {
			const focusable = Array.from(
				modalEl.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey) {
				if (document.activeElement === first) {
					event.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
		<div
			bind:this={modalEl}
			class="modal-content"
			role="dialog"
			aria-labelledby="onboarding-title"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="modal-header">
				<h2 id="onboarding-title">Welcome to Novellum</h2>
				<p class="subtitle">Your all-in-one workspace for writing your next masterpiece.</p>
			</div>

			<div class="features-grid">
				<div class="feature-card">
					<div class="icon">📝</div>
					<h3>Organize Thoughts</h3>
					<p>Build outlines, characters, and settings naturally.</p>
				</div>
				<div class="feature-card">
					<div class="icon">🔍</div>
					<h3>Stay Consistent</h3>
					<p>AI analyzes your story for timeline and lore accuracy.</p>
				</div>
				<div class="feature-card">
					<div class="icon">✨</div>
					<h3>Write Freely</h3>
					<p>A calm editor focused entirely on your words.</p>
				</div>
			</div>

			<div class="modal-actions">
				<PrimaryButton onclick={dismiss}>Get Started</PrimaryButton>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: color-mix(in srgb, black 60%, transparent);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: var(--space-4);
		animation: fadeIn var(--duration-normal) var(--ease-standard);
	}

	.modal-content {
		background: var(--color-surface-base);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		max-width: 640px;
		width: 100%;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		animation: slideUp var(--duration-normal) var(--ease-standard);
	}

	.modal-header {
		padding: var(--space-6) var(--space-6) 0;
		text-align: center;
	}

	h2 {
		font-family: var(--font-heading);
		font-size: var(--text-3xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2);
	}

	.subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: var(--line-height-relaxed);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-4);
		padding: var(--space-6);
	}

	.feature-card {
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		text-align: center;
		transition: transform var(--duration-fast) var(--ease-standard);
	}

	.feature-card:hover {
		transform: translateY(-2px);
		border-color: var(--color-border-focus);
	}

	.icon {
		font-size: 2rem;
		margin-bottom: var(--space-3);
	}

	.feature-card h3 {
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		margin: 0 0 var(--space-2);
	}

	.feature-card p {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: var(--line-height-normal);
	}

	.modal-actions {
		padding: var(--space-4) var(--space-6);
		background: var(--color-surface-elevated);
		border-top: 1px solid var(--color-border-subtle);
		display: flex;
		justify-content: flex-end;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(16px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (prefers-reduced-motion: reduce) {
		.modal-backdrop {
			animation: none;
		}
		.modal-content {
			animation: none;
		}
	}
</style>