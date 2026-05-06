<script lang="ts">
	import { goto } from '$app/navigation';
	import { onboarding, ONBOARDING_STEPS } from '$lib/stores/onboarding.svelte.js';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import WelcomeStep from './steps/WelcomeStep.svelte';
	import LocalFirstStep from './steps/LocalFirstStep.svelte';
	import StorageStep from './steps/StorageStep.svelte';
	import BackupStep from './steps/BackupStep.svelte';
	import AiKeyStep from './steps/AiKeyStep.svelte';
	import CreateProjectStep from './steps/CreateProjectStep.svelte';

	const stepId = $derived(onboarding.stepId);
	const currentStep = $derived(onboarding.currentStep);
	const isFirst = $derived(onboarding.isFirst);
	const isLast = $derived(onboarding.isLast);

	function handleNext(): void {
		onboarding.next();
	}
	function handlePrev(): void {
		onboarding.prev();
	}
	async function handleSkipAll(): Promise<void> {
		await onboarding.complete();
		await goto('/');
	}
</script>

<div class="onboarding-shell">
	<div class="onboarding-card">
		<div class="onboarding-header">
			<Stepper steps={ONBOARDING_STEPS.length} current={currentStep} />
			<button class="skip-all-link" onclick={handleSkipAll}>Skip all</button>
		</div>

		<div class="onboarding-step">
			{#if stepId === 'welcome'}
				<WelcomeStep onNext={handleNext} />
			{:else if stepId === 'local-first'}
				<LocalFirstStep onNext={handleNext} />
			{:else if stepId === 'storage'}
				<StorageStep onNext={handleNext} />
			{:else if stepId === 'backup'}
				<BackupStep onNext={handleNext} />
			{:else if stepId === 'ai-key'}
				<AiKeyStep onNext={handleNext} onSkip={() => onboarding.skipToEnd()} />
			{:else if stepId === 'create-project'}
				<CreateProjectStep onNext={() => goto('/')} />
			{/if}
		</div>

		<div class="onboarding-nav">
			{#if !isFirst}
				<button class="nav-btn nav-btn--prev" onclick={handlePrev}>← Back</button>
			{:else}
				<span></span>
			{/if}
			{#if !isLast && stepId !== 'ai-key'}
				<button class="nav-btn nav-btn--skip" onclick={() => onboarding.skipToEnd()}>
					Skip setup
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.onboarding-shell {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--color-surface-ground);
	}
	.onboarding-card {
		width: 100%;
		max-width: 480px;
		padding: var(--space-8);
		background: var(--color-surface-base);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.onboarding-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.skip-all-link {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.skip-all-link:hover {
		color: var(--color-text-secondary);
	}
	.onboarding-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.nav-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		padding: 0;
	}
	.nav-btn:hover {
		color: var(--color-text-secondary);
	}
</style>
