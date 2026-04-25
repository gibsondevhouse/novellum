<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SurfacePanel from '$lib/components/ui/SurfacePanel.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import PrimaryButton from '$lib/components/ui/PrimaryButton.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import { PageHeader } from '$lib/components/ui/index.js';
	import type { WritingStyle, SystemPrompt, ChatInstruction } from '$lib/db/types';
	import { STYLE_PRESETS } from '$lib/ai/style-presets.js';

	let { data } = $props<{
		data: {
			styles: WritingStyle[];
			systemPrompts: SystemPrompt[];
			instructions: ChatInstruction[];
		};
	}>();

	let isEditing = $state(false);
	let isSaving = $state(false);
	let isEditingPreset = $state(false);
	let errorMessage = $state('');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let editingItem = $state<any>(null);

	let itemName = $state('');
	let itemDesc = $state('');
	let itemContent = $state('');

	let styles = $derived(data.styles || []);
	let systemPrompts = $derived(data.systemPrompts || []);
	let instructions = $derived(data.instructions || []);

	type Tab = 'styles' | 'prompts' | 'instructions';
	let activeTab = $state<Tab>('styles');

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'styles', label: 'Writing Styles' },
		{ id: 'prompts', label: 'System Prompts' },
		{ id: 'instructions', label: 'Chat Instructions' },
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function openEditor(item: any, isPreset = false) {
		editingItem = item;
		isEditingPreset = isPreset;
		if (isPreset) {
			itemName = item?.name || '';
			itemDesc = item?.description || '';
			itemContent = item?.rules ? item.rules.join('\n') : '';
		} else {
			itemName = item?.title || item?.name || '';
			itemDesc = item?.description || '';
			itemContent = item?.exampleText || item?.content || '';
		}
		errorMessage = '';
		isEditing = true;
	}

	async function saveConfiguration() {
		if (!itemName.trim() || !itemContent.trim()) {
			errorMessage = 'Name and content are required.';
			return;
		}

		isSaving = true;
		errorMessage = '';

		const endpoint =
			activeTab === 'styles' ? 'writing_styles' :
			activeTab === 'prompts' ? 'system_prompts' :
			'chat_instructions';

		const isNew = !editingItem?.id;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let payload: any = { ...editingItem };

		if (isNew) {
			payload.projectId = 'default-project';
		}

		if (activeTab === 'styles') {
			payload.title = itemName;
			payload.description = itemDesc;
			payload.exampleText = itemContent;
		} else {
			payload.name = itemName;
			payload.content = itemContent;
			if (isNew) payload.isDefault = 0;
		}

		try {
			const url = isNew ? `/api/db/${endpoint}` : `/api/db/${endpoint}/${editingItem.id}`;
			const method = isNew ? 'POST' : 'PUT';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to save configuration');
			}

			await invalidateAll();
			isEditing = false;
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'An error occurred while saving.';
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Writing Styles — Novellum</title>
</svelte:head>

<div class="styles-page">
	<PageHeader
		eyebrow="Configuration Library"
		title="Writing Styles"
		description="Customize formatting, tone, and behavior rules for Nova."
	>
		{#snippet meta()}
			<div class="styles-header__summary" aria-label="Styles summary">
				<span>{tabs.find((tab) => tab.id === activeTab)?.label}</span>
				<strong>{activeTab === 'styles' ? styles.length : activeTab === 'prompts' ? systemPrompts.length : instructions.length} items</strong>
			</div>
		{/snippet}
	</PageHeader>

	<div class="tab-navigation" aria-label="Styles sections">
		{#each tabs as tab (tab.id)}
			<button
				class="tab-btn {activeTab === tab.id ? 'tab-btn--active' : ''}"
				type="button"
				aria-current={activeTab === tab.id ? 'true' : undefined}
				onclick={() => { activeTab = tab.id; }}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="styles-content">
		{#if activeTab === 'styles'}
		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="Custom Styles"
					description="Define tone, pacing, and formatting rules for Nova's generated prose."
				/>
				<PrimaryButton onclick={() => openEditor({})} disabled={isSaving}>New Style</PrimaryButton>
			</div>
			
			<div class="settings-grid">
				{#each styles as style (style.id)}
					<div class="card">
						<div class="card__info">
							<span class="card__name">{style.title}</span>
							{#if style.description}
								<span class="card__desc">{style.description}</span>
							{/if}
						</div>
						<div class="card__actions">
							<GhostButton onclick={() => openEditor(style)} disabled={isSaving}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="card card--empty"><p>No custom styles defined.</p></div>
				{/each}
			</div>

			<div class="panel-header-actions" style="margin-top: 2rem;">
				<SectionHeader
					title="Built-in Presets"
					description="Standard writing styles available out of the box."
				/>
			</div>

			<div class="settings-grid">
				{#each STYLE_PRESETS as preset (preset.id)}
					<div class="card card--preset">
						<div class="card__info">
							<span class="card__name">{preset.name}</span>
							{#if preset.description}
								<span class="card__desc">{preset.description}</span>
							{/if}
						</div>
						<div class="card__actions">
							<GhostButton onclick={() => openEditor(preset, true)} disabled={isSaving}>View</GhostButton>
						</div>
					</div>
				{/each}
			</div>
		</SurfacePanel>
		{/if}

		{#if activeTab === 'prompts'}
		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="System Prompts"
					description="Core instructions that guide Nova's overarching behavior per project or globally."
				/>
				<PrimaryButton onclick={() => openEditor({})} disabled={isSaving}>New Prompt</PrimaryButton>
			</div>
			
			<div class="settings-grid">
				{#each systemPrompts as prompt (prompt.id)}
					<div class="card">
						<div class="card__info">
							<span class="card__name">{prompt.name}</span>
							<span class="card__desc">{prompt.content.slice(0, 50)}...</span>
						</div>
						<div class="card__actions">
							<GhostButton onclick={() => openEditor(prompt)} disabled={isSaving}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="card card--empty"><p>No items defined.</p></div>
				{/each}
			</div>
		</SurfacePanel>
		{/if}

		{#if activeTab === 'instructions'}
		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="Chat Instructions"
					description="Specific rules and constraints for interactive chat sessions with Nova."
				/>
				<PrimaryButton onclick={() => openEditor({})} disabled={isSaving}>New Instruction</PrimaryButton>
			</div>
			
			<div class="settings-grid">
				{#each instructions as instruction (instruction.id)}
					<div class="card">
						<div class="card__info">
							<span class="card__name">{instruction.name}</span>
							<span class="card__desc">{instruction.content.slice(0, 50)}...</span>
						</div>
						<div class="card__actions">
							<GhostButton onclick={() => openEditor(instruction)} disabled={isSaving}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="card card--empty"><p>No items defined.</p></div>
				{/each}
			</div>
		</SurfacePanel>
		{/if}
	</div>
</div>

{#if isEditing}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="panel-backdrop" onclick={() => { if (!isSaving) isEditing = false; }}>
		<div class="slide-panel" onclick={(e) => e.stopPropagation()}>
			<div class="slide-panel__header">
				<h2 class="slide-panel__title">{editingItem?.id && !isEditingPreset ? 'Edit' : isEditingPreset ? 'View' : 'Create'} {activeTab === 'styles' ? (isEditingPreset ? 'Built-in Preset' : 'Writing Style') : activeTab === 'prompts' ? 'System Prompt' : 'Chat Instruction'}</h2>
				<GhostButton onclick={() => isEditing = false} disabled={isSaving}>Close</GhostButton>
			</div>
			<div class="slide-panel__content">
				{#if errorMessage}
					<div class="error-banner">{errorMessage}</div>
				{/if}
				<div class="form-group">
					<label for="item-name" class="form-label">Name</label>
					<input id="item-name" type="text" class="form-input" placeholder="e.g. Hemingway, Descriptive, Short" bind:value={itemName} disabled={isSaving || isEditingPreset} />
				</div>
				
				{#if activeTab === 'styles'}
				<div class="form-group">
					<label for="item-desc" class="form-label">Description</label>
					<textarea id="item-desc" class="form-textarea form-textarea--small" placeholder="Briefly describe when to use this." bind:value={itemDesc} disabled={isSaving || isEditingPreset}></textarea>
				</div>
				{/if}
				
				<div class="form-group form-group--grow">
					<label for="item-content" class="form-label">Content / Rules</label>
					<textarea id="item-content" class="form-textarea form-textarea--mono" placeholder="Write out the exact instructions or rules Nova should follow..." bind:value={itemContent} disabled={isSaving || isEditingPreset}></textarea>
				</div>
			</div>
			<div class="slide-panel__footer">
				{#if isEditingPreset}
					<!-- spacer to push the primary action if needed, or just the close button -->
					<div style="flex: 1;"></div>
					<PrimaryButton onclick={() => isEditing = false}>Close</PrimaryButton>
				{:else}
					<GhostButton onclick={() => isEditing = false} disabled={isSaving}>Cancel</GhostButton>
					<PrimaryButton onclick={saveConfiguration} disabled={isSaving}>
						{isSaving ? 'Saving...' : 'Save Configuration'}
					</PrimaryButton>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.styles-page {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.styles-page :global(.page-header) {
		padding-bottom: var(--space-6);
	}

	.styles-header__summary {
		display: grid;
		gap: 0.2rem;
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-overlay) 82%, transparent);
		min-width: 12rem;
	}

	.styles-header__summary span {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.styles-header__summary strong {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
	}

	.tab-navigation {
		display: flex;
		justify-content: center;
		border-bottom: 1px solid var(--color-border-default);
		gap: var(--space-6);
		margin-bottom: var(--space-4);
	}

	.tab-btn {
		background: none;
		border: none;
		padding: var(--space-3) var(--space-1);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all var(--duration-fast) var(--ease-standard);
		margin-bottom: -1px;
	}

	.tab-btn:hover {
		color: var(--color-text-secondary);
	}

	.tab-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.tab-btn--active {
		color: var(--color-text-primary);
		border-bottom-color: var(--color-nova-blue);
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

	@media (max-width: 760px) {
		.panel-header-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.tab-navigation {
			justify-content: flex-start;
			overflow-x: auto;
		}
	}

	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 40ch), 1fr));
		gap: var(--space-4);
		margin-top: var(--space-6);
		border-top: 1px solid var(--color-border-default);
		padding-top: var(--space-6);
	}

	.card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: var(--space-5);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xs);
		transition: transform var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard);
		position: relative;
		overflow: hidden;
		min-height: min-content;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-border-strong);
	}
	
	.card:focus-within {
		border-color: var(--color-border-focus);
	}

	:global(.card.active) {
		border-color: var(--color-nova-blue);
		box-shadow: 0 0 16px var(--color-ai-tint), inset 0 0 0 1px var(--color-nova-blue);
	}
	
	.card::before {
		content: '';
		position: absolute;
		top: 0; left: 0; right: 0;
		height: calc(var(--space-1) / 2);
		background: linear-gradient(90deg, var(--color-nova-blue) 0%, var(--color-teal) 100%);
		opacity: 0;
		transition: opacity var(--duration-base) var(--ease-standard);
	}
	
	.card:hover::before {
		opacity: 1;
	}

	.card--empty {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		background: transparent;
		border: 1px dashed var(--color-border-strong);
		border-radius: var(--radius-lg);
		box-shadow: none;
		min-height: min-content;
		color: var(--color-text-muted);
		padding: var(--space-6);
		transition: border-color var(--duration-base) var(--ease-standard), background var(--duration-base) var(--ease-standard);
	}
	
	.card--empty:hover {
		transform: none;
		box-shadow: none;
		border-color: var(--color-border-focus);
		background: var(--color-surface-glass);
	}

	.card--empty:hover::before {
		display: none;
	}

	.card--empty p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--prose-gap-line);
		max-width: var(--prose-width-max);
	}

	.card__info {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.card__name {
		font-family: var(--font-sans);
		font-weight: var(--font-weight-medium);
		font-size: var(--text-base);
		color: var(--color-text-primary);
	}

	.card__desc {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 3;
line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.card__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: auto;
	}

	/* Slide Panel Styles */
	.panel-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		z-index: 100;
		display: flex;
		justify-content: flex-end;
		animation: fadeIn var(--duration-fast) var(--ease-standard);
	}

	.slide-panel {
		width: 100%;
		max-width: 540px;
		height: 100%;
		background: var(--color-surface-overlay);
		border-left: 1px solid var(--color-border-default);
		box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
		animation: slideIn var(--duration-base) var(--ease-editorial);
		display: flex;
		flex-direction: column;
	}

	.slide-panel__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-6) var(--space-6) var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--color-border-subtle);
		background: var(--color-surface-overlay);
	}

	.slide-panel__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}

	.slide-panel__content {
		padding: var(--space-8) var(--space-6);
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		background: var(--color-surface-base);
	}

	.slide-panel__footer {
		padding: var(--space-5) var(--space-6);
		border-top: 1px solid var(--color-border-subtle);
		display: flex;
		justify-content: flex-end;
		gap: var(--space-4);
		background: var(--color-surface-overlay);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.form-group--grow {
		flex: 1;
	}

	.form-label {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	.form-input, .form-textarea {
		width: 100%;
		padding: var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		line-height: 1.5;
		transition: all var(--duration-fast) var(--ease-standard);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
	}

	.form-input::placeholder, .form-textarea::placeholder {
		color: var(--color-text-muted);
	}

	.form-input:hover, .form-textarea:hover {
		border-color: var(--color-border-strong);
	}

	.form-textarea {
		resize: vertical;
		min-height: 15rem;
	}

	.error-banner {
		padding: var(--space-4);
		background-color: rgba(255, 60, 60, 0.1);
		color: #ff4d4d;
		border-radius: var(--radius-lg);
		border: 1px solid rgba(255, 60, 60, 0.2);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
	}

	.form-textarea--small {
		min-height: 6rem;
		resize: none;
	}

	.form-textarea--mono {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.6;
		flex: 1;
		resize: none;
		background: var(--color-surface-sunken);
		border-color: var(--color-border-default);
	}

	.form-input:focus, .form-textarea:focus {
		outline: none;
		border-color: var(--color-nova-blue);
		box-shadow: 0 0 0 4px var(--color-nova-blue-10), inset 0 2px 4px rgba(0, 0, 0, 0.02);
		background: var(--color-surface-overlay);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideIn {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}
</style>
