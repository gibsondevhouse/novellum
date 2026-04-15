<script lang="ts">
	import ThemeSelector from '$modules/settings/components/ThemeSelector.svelte';
	import SurfacePanel from '$lib/components/ui/SurfacePanel.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import type { WritingStyle, SystemPrompt, ChatInstruction, Template } from '$lib/db/types';

	let { data } = $props<{
		data: {
			styles: WritingStyle[];
			systemPrompts: SystemPrompt[];
			instructions: ChatInstruction[];
			templates: Template[];
		};
	}>();

	let styles = $derived(data.styles || []);
	let systemPrompts = $derived(data.systemPrompts || []);
	let instructions = $derived(data.instructions || []);
	let templates = $derived(data.templates || []);

</script>

<svelte:head>
	<title>Styles & Settings — Novellum</title>
</svelte:head>

<div class="styles-page">
	<div class="styles-header">
		<span class="styles-header__icon" aria-hidden="true">🎨</span>
		<h1 class="styles-header__title">Styles & Settings</h1>
		<p class="styles-header__description">
			Configure your workspace appearance and customize AI behaviors.
		</p>
	</div>

	<div class="styles-content">
		<SurfacePanel>
			<SectionHeader
				title="Workspace Appearance"
				description="Manage your theme and visual preferences."
			/>
			<ThemeSelector />
		</SurfacePanel>

		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="Writing Styles"
					description="Define tone, pacing, and formatting rules for Nova's generated prose."
				/>
				<PrimaryButton onclick={() => {}}>New Style</PrimaryButton>
			</div>
			
			<div class="settings-list">
				{#each styles as style (style.id)}
					<div class="settings-item">
						<div class="settings-item__info">
							<span class="settings-item__name">{style.title}</span>
							{#if style.description}
								<span class="settings-item__desc">{style.description}</span>
							{/if}
						</div>
						<div class="settings-item__actions">
							<GhostButton onclick={() => {}}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="settings-item settings-item--empty">No custom writing styles defined.</div>
				{/each}
			</div>
		</SurfacePanel>

		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="System Prompts"
					description="Core instructions that guide Nova's overarching behavior per project or globally."
				/>
				<PrimaryButton onclick={() => {}}>New Prompt</PrimaryButton>
			</div>
			
			<div class="settings-list">
				{#each systemPrompts as prompt (prompt.id)}
					<div class="settings-item">
						<div class="settings-item__info">
							<span class="settings-item__name">{prompt.name}</span>
							<span class="settings-item__desc">{prompt.content.slice(0, 50)}...</span>
						</div>
						<div class="settings-item__actions">
							<GhostButton onclick={() => {}}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="settings-item settings-item--empty">No system prompts defined.</div>
				{/each}
			</div>
		</SurfacePanel>

		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="Chat Instructions"
					description="Specific rules and constraints for interactive chat sessions with Nova."
				/>
				<PrimaryButton onclick={() => {}}>New Instruction</PrimaryButton>
			</div>
			
			<div class="settings-list">
				{#each instructions as instruction (instruction.id)}
					<div class="settings-item">
						<div class="settings-item__info">
							<span class="settings-item__name">{instruction.name}</span>
							<span class="settings-item__desc">{instruction.content.slice(0, 50)}...</span>
						</div>
						<div class="settings-item__actions">
							<GhostButton onclick={() => {}}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="settings-item settings-item--empty">No chat instructions defined.</div>
				{/each}
			</div>
		</SurfacePanel>
		
		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="Templates"
					description="Reusable blueprints for scenes, characters, or structural units."
				/>
				<PrimaryButton onclick={() => {}}>New Template</PrimaryButton>
			</div>
			
			<div class="settings-list">
				{#each templates as template (template.id)}
					<div class="settings-item">
						<div class="settings-item__info">
							<span class="settings-item__name">{template.name}</span>
							{#if template.description}
								<span class="settings-item__desc">{template.description}</span>
							{/if}
						</div>
						<div class="settings-item__actions">
							<GhostButton onclick={() => {}}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="settings-item settings-item--empty">No templates defined.</div>
				{/each}
			</div>
		</SurfacePanel>
	</div>
</div>

<style>
	.styles-page {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
	}

	.styles-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-4);
	}

	.styles-header__icon {
		font-size: var(--text-4xl);
	}

	.styles-header__title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		margin: 0;
		color: var(--color-text-primary);
	}

	.styles-header__description {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		max-width: 500px;
		margin: 0;
	}

	.styles-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.panel-header-actions {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4);
	}

	.settings-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-4);
		border-top: 1px solid var(--color-border-default);
		padding-top: var(--space-4);
	}

	.settings-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
	}

	.settings-item--empty {
		color: var(--color-text-muted);
		font-style: italic;
		justify-content: center;
		background: transparent;
		border-style: dashed;
	}

	.settings-item__info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.settings-item__name {
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.settings-item__desc {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}
	
	.settings-item__actions {
		display: flex;
		gap: var(--space-2);
	}
</style>
