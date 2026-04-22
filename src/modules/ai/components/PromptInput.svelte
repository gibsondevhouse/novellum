<script lang="ts">
	import type { NovaSessionContextItem } from '$modules/ai/types.js';

	let {
		value = $bindable(''),
		placeholder = 'Help me fix this error ...',
		disabled = false,
		contextItems = [],
		contextWarnings = [],
		onsubmit,
		onrequestprojectpicker,
		onfilesselected,
		onremovecontext,
	}: {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		contextItems?: NovaSessionContextItem[];
		contextWarnings?: string[];
		onsubmit?: (text: string) => void;
		onrequestprojectpicker?: () => void;
		onfilesselected?: (files: File[]) => void;
		onremovecontext?: (id: string) => void;
	} = $props();

	let focused = $state(false);
	let contextMenuOpen = $state(false);
	let fileInputElement = $state<HTMLInputElement | null>(null);
	let hasInlineMeta = $derived(contextItems.length > 0 || contextWarnings.length > 0);

	function closeContextMenu(): void {
		if (!contextMenuOpen) return;
		contextMenuOpen = false;
	}

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			closeContextMenu();
		}
	}

	function handleEditorKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			submit();
		}
	}

	function toggleContextMenu(event: MouseEvent): void {
		event.stopPropagation();
		contextMenuOpen = !contextMenuOpen;
	}

	function openProjectPicker(event: MouseEvent): void {
		event.stopPropagation();
		contextMenuOpen = false;
		onrequestprojectpicker?.();
	}

	function openFilePicker(event: MouseEvent): void {
		event.stopPropagation();
		contextMenuOpen = false;
		fileInputElement?.click();
	}

	function handleFileInputChange(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		onfilesselected?.(Array.from(input.files));
		input.value = '';
	}

	function submit() {
		if (!value.trim() || disabled) return;
		onsubmit?.(value.trim());
	}
</script>

<svelte:window onclick={closeContextMenu} onkeydown={handleWindowKeydown} />

<div class="prompt-subcard" class:prompt-subcard--expanded={focused || hasInlineMeta}>
	{#if contextItems.length > 0}
		<div class="prompt-subcard__chips" role="list" aria-label="Attached session context">
			{#each contextItems as item (item.id)}
				<span class="context-chip" role="listitem">
					<span class="context-chip__kind">{item.kind === 'project' ? 'Project' : 'File'}</span>
					<span class="context-chip__label">{item.kind === 'project' ? item.label : item.name}</span>
					<button
						type="button"
						class="context-chip__remove"
						onclick={() => onremovecontext?.(item.id)}
						aria-label={`Remove ${item.kind === 'project' ? item.label : item.name}`}
					>
						×
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<div class="prompt-subcard__body">
		<textarea
			class="prompt-subcard__textarea"
			bind:value
			{placeholder}
			rows="1"
			onkeydown={handleEditorKeydown}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			{disabled}
		></textarea>
	</div>

	<div class="prompt-subcard__actions">
		<div class="prompt-subcard__context-actions">
			<button
				type="button"
				class="prompt-subcard__context-trigger"
				onclick={toggleContextMenu}
				disabled={disabled}
				aria-label="Add project or file context"
				aria-haspopup="menu"
				aria-expanded={contextMenuOpen}
			>
				+
			</button>

			{#if contextMenuOpen}
				<div class="prompt-subcard__context-menu" role="menu">
					<button type="button" class="prompt-subcard__context-option" role="menuitem" onclick={openProjectPicker}>
						Add Project
					</button>
					<button type="button" class="prompt-subcard__context-option" role="menuitem" onclick={openFilePicker}>
						Add File / Document
					</button>
				</div>
			{/if}

			<input
				bind:this={fileInputElement}
				type="file"
				class="prompt-subcard__file-input"
				multiple
				accept=".txt,.md,.markdown,.json,.csv,text/*,application/json"
				onchange={handleFileInputChange}
				tabindex="-1"
				aria-hidden="true"
			/>
		</div>

		<button
			type="button"
			class="prompt-subcard__send"
			onmousedown={submit}
			disabled={!value.trim() || disabled}
			aria-label="Send message"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<line x1="5" y1="12" x2="19" y2="12"></line>
				<polyline points="12 5 19 12 12 19"></polyline>
			</svg>
		</button>
	</div>

	{#if contextWarnings.length > 0}
		<ul class="prompt-subcard__warnings" aria-live="polite" aria-label="Context warnings">
			{#each contextWarnings as warning, index (`${warning}-${index}`)}
				<li>{warning}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.prompt-subcard {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background-color: var(--color-surface-raised);
		transition: border-color var(--duration-fast) var(--ease-standard);
	}

	.prompt-subcard:focus-within {
		border-color: var(--color-border-strong);
	}

	.prompt-subcard--expanded .prompt-subcard__body {
		min-height: 200px;
	}

	.prompt-subcard__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.context-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		max-width: 100%;
		padding: 0.25rem 0.45rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 70%, transparent);
	}

	.context-chip__kind {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.context-chip__label {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		max-width: min(34ch, 52vw);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.context-chip__remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;
	}

	.context-chip__remove:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.context-chip__remove:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 1px;
	}

	.prompt-subcard__body {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	.prompt-subcard__textarea {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-family: inherit;
		font-size: var(--text-base);
		line-height: var(--leading-normal);
		resize: none;
		padding: 0;
		min-height: 24px;
		max-height: 200px;
	}

	.prompt-subcard--expanded .prompt-subcard__textarea {
		max-height: none;
	}

	.prompt-subcard__textarea:focus {
		outline: none;
	}

	.prompt-subcard__textarea::placeholder {
		color: var(--color-text-secondary);
	}

	.prompt-subcard__textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.prompt-subcard__actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.prompt-subcard__context-actions {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.prompt-subcard__context-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 32px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 62%, transparent);
		color: var(--color-text-primary);
		font-size: 1rem;
		line-height: 1;
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		padding: 0;
	}

	.prompt-subcard__context-trigger:hover:not(:disabled) {
		background: var(--color-surface-hover);
	}

	.prompt-subcard__context-trigger:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.prompt-subcard__context-trigger:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.prompt-subcard__context-menu {
		position: absolute;
		left: 0;
		top: calc(100% + 8px);
		min-width: 190px;
		padding: 0.35rem;
		display: grid;
		gap: 0.2rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		box-shadow: var(--shadow-lg);
		z-index: 40;
	}

	.prompt-subcard__context-option {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-primary);
		padding: 0.45rem 0.6rem;
		font-size: var(--text-sm);
		text-align: left;
		cursor: pointer;
	}

	.prompt-subcard__context-option:hover {
		background: var(--color-surface-hover);
	}

	.prompt-subcard__context-option:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 1px;
	}

	.prompt-subcard__file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.prompt-subcard__send {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		background-color: var(--color-ai-tint);
		color: var(--color-teal);
		cursor: pointer;
		flex-shrink: 0;
		padding: 0 var(--space-2);
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.prompt-subcard__send:hover:not(:disabled) {
		background-color: color-mix(in srgb, var(--color-teal) 20%, transparent);
		color: var(--color-text-on-dark);
	}

	.prompt-subcard__send:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.prompt-subcard__send:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.prompt-subcard__warnings {
		margin: 0;
		padding-left: 1.15rem;
		display: grid;
		gap: var(--space-1);
		font-size: var(--text-xs);
		color: var(--color-semantic-warning-fg, var(--color-text-secondary));
	}
</style>
