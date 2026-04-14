<script lang="ts">
	import { onMount } from 'svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';

	let open = $state(false);

	onMount(() => {
		const hasSeen = localStorage.getItem('novellum:seen_onboarding');
		if (!hasSeen) {
			open = true;
		}
	});

	function dismiss() {
		localStorage.setItem('novellum:seen_onboarding', 'true');
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			dismiss();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="modal-backdrop" onclick={dismiss} role="presentation">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="modal-content"
			role="dialog"
			aria-labelledby="onboarding-title"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
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
		background: rgba(0, 0, 0, 0.6);
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
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
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
</style>