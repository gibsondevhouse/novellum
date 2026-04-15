<script lang="ts">
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

	let isEditing = $state(false);
	let editingItem = $state<any>(null);

	let styles = $derived(data.styles || []);
	let systemPrompts = $derived(data.systemPrompts || []);
	let instructions = $derived(data.instructions || []);
	let templates = $derived(data.templates || []);

	type Tab = 'styles' | 'prompts' | 'instructions' | 'templates';
	let activeTab = $state<Tab>('styles');

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'styles', label: 'Writing Styles' },
		{ id: 'prompts', label: 'System Prompts' },
		{ id: 'instructions', label: 'Chat Instructions' },
		{ id: 'templates', label: 'Templates' },
	];
</script>

<svelte:head>
	<title>Writing Styles — Novellum</title>
</svelte:head>

<div class="styles-page">
	<div class="styles-header">
		<h1 class="styles-header__title">Writing Styles</h1>
		<p class="styles-header__description">
			Customize formatting, tone, and behavior rules for Nova.
		</p>
	</div>

	<div class="tab-navigation">
		{#each tabs as tab (tab.id)}
			<button
				class="tab-btn {activeTab === tab.id ? 'tab-btn--active' : ''}"
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
					title="Writing Styles"
					description="Define tone, pacing, and formatting rules for Nova's generated prose."
				/>
				<PrimaryButton onclick={() => { isEditing = true; editingItem = {}; }}>New Style</PrimaryButton>
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
							<GhostButton onclick={() => { isEditing = true; editingItem = style; }}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="card card--empty"><p>No items defined.</p></div>
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
				<PrimaryButton onclick={() => { isEditing = true; editingItem = {}; }}>New Prompt</PrimaryButton>
			</div>
			
			<div class="settings-grid">
				{#each systemPrompts as prompt (prompt.id)}
					<div class="card">
						<div class="card__info">
							<span class="card__name">{prompt.name}</span>
							<span class="card__desc">{prompt.content.slice(0, 50)}...</span>
						</div>
						<div class="card__actions">
							<GhostButton onclick={() => { isEditing = true; editingItem = prompt; }}>Edit</GhostButton>
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
				<PrimaryButton onclick={() => { isEditing = true; editingItem = {}; }}>New Instruction</PrimaryButton>
			</div>
			
			<div class="settings-grid">
				{#each instructions as instruction (instruction.id)}
					<div class="card">
						<div class="card__info">
							<span class="card__name">{instruction.name}</span>
							<span class="card__desc">{instruction.content.slice(0, 50)}...</span>
						</div>
						<div class="card__actions">
							<GhostButton onclick={() => { isEditing = true; editingItem = instruction; }}>Edit</GhostButton>
						</div>
					</div>
				{:else}
					<div class="card card--empty"><p>No items defined.</p></div>
				{/each}
			</div>
		</SurfacePanel>
		{/if}
		
		{#if activeTab === 'templates'}
		<SurfacePanel>
			<div class="panel-header-actions">
				<SectionHeader
					title="Templates"
					description="Reusable blueprints for scenes, characters, or structural units."
				/>
				<PrimaryButton onclick={() => { isEditing = true; editingItem = {}; }}>New Template</PrimaryButton>
			</div>
			
			<div class="settings-grid">
				{#each templates as template (template.id)}
					<div class="card">
						<div class="card__info">
							<span class="card__name">{template.name}</span>
							{#if template.description}
								<span class="card__desc">{template.description}</span>
							{/if}
						</div>
						<div class="card__actions">
							<GhostButton onclick={() => { isEditing = true; editingItem = template; }}>Edit</GhostButton>
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
	<div class="panel-backdrop" onclick={() => isEditing = false}>
		<div class="slide-panel" onclick={(e) => e.stopPropagation()}>
			<div class="slide-panel__header">
				<h2 class="slide-panel__title">{editingItem?.id ? 'Edit' : 'Create'} {activeTab === 'styles' ? 'Writing Style' : activeTab === 'prompts' ? 'System Prompt' : activeTab === 'instructions' ? 'Chat Instruction' : 'Template'}</h2>
				<GhostButton onclick={() => isEditing = false}>Close</GhostButton>
			</div>
			<div class="slide-panel__content">
				<div class="form-group">
					<label for="item-name" class="form-label">Name</label>
					<input id="item-name" type="text" class="form-input" placeholder="e.g. Hemingway, Descriptive, Short" value={editingItem?.name || editingItem?.title || ''} />
				</div>
				
				<div class="form-group">
					<label for="item-desc" class="form-label">Description</label>
					<textarea id="item-desc" class="form-textarea form-textarea--small" placeholder="Briefly describe when to use this." value={editingItem?.description || ''}></textarea>
				</div>
				
				<div class="form-group form-group--grow">
					<label for="item-content" class="form-label">Content / Rules</label>
					<textarea id="item-content" class="form-textarea form-textarea--mono" placeholder="Write out the exact instructions or rules Nova should follow..."></textarea>
				</div>
			</div>
			<div class="slide-panel__footer">
				<GhostButton onclick={() => isEditing = false}>Cancel</GhostButton>
				<PrimaryButton onclick={() => isEditing = false}>Save Configuration</PrimaryButton>
			</div>
		</div>
	</div>
{/if}

<style>
	.styles-page {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.styles-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-4);
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
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all var(--transition-fast) ease-in-out;
		margin-bottom: -1px;
	}

	.tab-btn:hover {
		color: var(--color-text-secondary);
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
		animation: slideIn var(--duration-base) var(--ease-out-back);
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
