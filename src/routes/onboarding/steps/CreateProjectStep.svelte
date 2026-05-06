<script lang="ts">
	import { goto } from '$app/navigation';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { onboarding } from '$lib/stores/onboarding.svelte.js';

	interface Props {
		onNext: () => void;
	}
	let { onNext }: Props = $props();

	let projectTitle = $state('');
	let creating = $state(false);
	let errorMsg = $state('');

	async function handleCreate() {
		const title = projectTitle.trim();
		if (!title) {
			errorMsg = 'Please enter a project title.';
			return;
		}
		creating = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/db/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title }),
			});
			if (res.ok) {
				const project = (await res.json()) as { id: string };
				await onboarding.complete();
				onNext();
				await goto(`/projects/${project.id}`);
			} else {
				const data = (await res.json()) as { error?: string };
				errorMsg = data.error ?? 'Failed to create project. Please try again.';
			}
		} catch {
			errorMsg = 'Could not reach the server. Please try again.';
		} finally {
			creating = false;
		}
	}
</script>

<div class="step">
	<h2 class="step-heading">Create your first project</h2>
	<p class="step-body">Give your story a working title. You can change it later.</p>
	<div class="step-field">
		<Input
			id="project-title-input"
			label="Project title"
			type="text"
			placeholder="Untitled novel"
			bind:value={projectTitle}
		/>
	</div>
	{#if errorMsg}
		<p class="step-feedback step-feedback--error" role="alert">{errorMsg}</p>
	{/if}
	<div class="step-actions">
		<PrimaryButton onclick={handleCreate} disabled={creating}>
			{creating ? 'Creating…' : 'Create project'}
		</PrimaryButton>
	</div>
</div>

<style>
	.step {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.step-heading {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--color-text-primary);
		margin: 0;
	}
	.step-body {
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin: 0;
	}
	.step-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.step-feedback {
		font-size: var(--text-sm);
		margin: 0;
	}
	.step-feedback--error {
		color: var(--color-error, var(--color-danger));
	}
	.step-actions {
		margin-top: var(--space-2);
	}
</style>
