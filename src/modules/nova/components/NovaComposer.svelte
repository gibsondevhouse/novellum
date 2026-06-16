<!--
	plan-031 stage-003 phase-002 — Nova composer with attachment popover and chips.
	Also hosts the Ask/Write/Agent mode pill from stage-002.
-->
<script lang="ts">
	import { novaSession } from '../stores/nova-session.svelte.js';
	import { novaPanel } from '../stores/nova-panel.svelte.js';
	import { novaMode } from '../stores/nova-mode.svelte.js';
	import { sendNovaChat } from '../services/chat-service.js';
	import ModelPickerDropdown from './ModelPickerDropdown.svelte';
	import NovaAttachmentPopover from './NovaAttachmentPopover.svelte';
	import type { NovaMode } from '../types.js';

	type ModeOption = {
		value: NovaMode;
		label: string;
		description: string;
	};

	const MODE_OPTIONS: ModeOption[] = [
		{
			value: 'ask',
			label: 'Ask',
			description: 'Brainstorm and general story conversation.',
		},
		{
			value: 'write',
			label: 'Write',
			description: 'Generate outline, scene, and revision proposals.',
		},
		{
			value: 'agent',
			label: 'Agent',
			description: 'Bounded tool loop — gathers context and takes app actions via tool calls.',
		},
	];

	const MAX_COMPOSER_HEIGHT = 288;

	interface Props {
		projectId?: string | null;
		activeSceneId?: string | null;
		activeChapterId?: string | null;
	}

	let { projectId = null, activeSceneId = null, activeChapterId = null }: Props = $props();

	let draft = $state('');
	let textareaEl = $state<HTMLTextAreaElement | null>(null);
	let attachPopoverOpen = $state(false);
	let attachButtonEl = $state<HTMLButtonElement | null>(null);

	const attachments = $derived(novaSession.attachments);

	const isStreaming = $derived(novaSession.isStreaming);
	const currentMode = $derived(novaMode.current);
	const currentModeMeta = $derived(
		MODE_OPTIONS.find((opt) => opt.value === currentMode) ?? MODE_OPTIONS[0],
	);
	const composerPlaceholder = $derived.by(() => {
		if (isStreaming) return 'Nova is responding…';
		if (currentMode === 'write') return 'Ask Write mode to build an outline or propose a revision…';
		if (currentMode === 'agent') return 'Describe a multi-step task — Nova will use tools to gather context and act…';
		return 'Brainstorm, ask questions, or explore story ideas…';
	});
	const canSubmit = $derived(draft.trim().length > 0 && !isStreaming);

	// Load persisted mode whenever projectId changes.
	$effect(() => {
		novaMode.loadForProject(projectId);
	});

	$effect(() => {
		const pending = novaPanel.pendingPrompt;
		if (pending !== null) {
			draft = pending;
			novaPanel.clearPendingPrompt();
		}
	});

	// Auto-grow textarea with draft as the trigger.
	$effect(() => {
		const el = textareaEl;
		if (!el) return;
		// Depend on draft so the effect re-runs on every keystroke.
		const _draft = draft;
		void _draft;
		// Temporarily remove overflow so scrollHeight reflects full content
		el.style.overflowY = 'hidden';
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT)}px`;
		el.style.overflowY = el.scrollHeight > MAX_COMPOSER_HEIGHT ? 'auto' : 'hidden';
	});

	async function submitDraft() {
		const value = draft.trim();
		if (!value || isStreaming) return;
		draft = '';
		await sendNovaChat({
			prompt: value,
			mode: novaMode.current,
			projectId,
			activeSceneId,
			activeChapterId,
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		// Cmd+. (Mac) or Ctrl+. (Win/Linux) cycles modes.
		if (event.key === '.' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			novaMode.cycle();
			return;
		}
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			void submitDraft();
		}
	}

	function abortActiveStream() {
		const id = novaSession.activeStreamId;
		if (id) novaSession.abort(id);
	}

	function handleModeChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value as NovaMode;
		novaMode.setMode(value);
	}
</script>

<form
	class="nova-composer nova-input-form"
	onsubmit={(event) => {
		event.preventDefault();
		void submitDraft();
	}}
>
	<div class="nova-composer__shell nova-composer__shell--with-popover">
		{#if attachments.length > 0}
			<ul class="nova-attachment-chips" role="list" aria-label="Attached items">
				{#each attachments as attachment (attachment.id)}
					<li class="nova-attachment-chip">
						<span class="nova-attachment-chip__label">
							{#if attachment.kind === 'entity'}
								<span class="nova-attachment-chip__kind">{attachment.entityKind}</span>
								{attachment.label}
							{:else}
								<span class="nova-attachment-chip__kind">file</span>
								{attachment.filename}
							{/if}
						</span>
						<button
							type="button"
							class="nova-attachment-chip__remove"
							aria-label="Remove {attachment.kind === 'entity' ? attachment.label : attachment.filename}"
							onclick={() => novaSession.removeAttachment(attachment.id)}
						>×</button>
					</li>
				{/each}
			</ul>
		{/if}

		<textarea
			class="nova-input"
			bind:this={textareaEl}
			bind:value={draft}
			onkeydown={handleKeydown}
			placeholder={composerPlaceholder}
			aria-label="Ask Nova"
			disabled={isStreaming}
		></textarea>

		<div class="nova-composer__actions">
			<button
				bind:this={attachButtonEl}
				type="button"
				class="nova-action-slot"
				class:is-active={attachPopoverOpen}
				aria-label="Attach files or project context"
				aria-expanded={attachPopoverOpen}
				aria-haspopup="dialog"
				title="Attach files or project context"
				onclick={() => { attachPopoverOpen = !attachPopoverOpen; }}
			>
				<span aria-hidden="true">+</span>
			</button>
			<NovaAttachmentPopover
				{projectId}
				open={attachPopoverOpen}
				anchorEl={attachButtonEl}
				onClose={() => { attachPopoverOpen = false; }}
			/>
			<select
				id="nova-mode-select"
				class="nova-mode-select"
				value={currentMode}
				onchange={handleModeChange}
				aria-label="Nova mode"
				title={currentModeMeta.description}
				disabled={isStreaming}
			>
				{#each MODE_OPTIONS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<span class="nova-model-slot">
				<ModelPickerDropdown />
			</span>
			<span class="nova-composer__spacer" aria-hidden="true"></span>
			{#if isStreaming}
				<button
					type="button"
					class="nova-action nova-action-stop nova-action-abort"
					onclick={abortActiveStream}
					aria-label="Abort response"
				>
					<span class="nova-stop-glyph" aria-hidden="true"></span>
					Stop
				</button>
			{:else}
				<button
					type="submit"
					class="nova-action nova-action-send"
					disabled={!canSubmit}
					aria-label="Send message"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="m22 2-7 20-4-9-9-4z"></path>
						<path d="M22 2 11 13"></path>
					</svg>
					<span class="sr-only">Send</span>
				</button>
			{/if}
		</div>

	</div>
</form>

<style>
	.nova-mode-select,
	.nova-action,
	.nova-action-slot,
	.nova-input {
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard);
	}

	.nova-mode-select:focus-visible,
	.nova-action:focus-visible,
	.nova-action-slot:focus-visible,
	.nova-input:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nova-action:disabled,
	.nova-action-slot:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.nova-mode-select {
		appearance: none;
		-webkit-appearance: none;
		height: 28px;
		min-width: 72px;
		flex-shrink: 1;
		padding: 0 var(--space-5) 0 var(--space-2);
		margin: 0;
		border-radius: var(--radius-full);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 86%, var(--color-candle) 14%);
		background-color: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-align: left;
		cursor: pointer;
		background-image:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-overlay) 90%, var(--color-candle) 10%) 0%,
				var(--color-surface-overlay) 100%
			),
			linear-gradient(45deg, transparent 50%, var(--color-text-muted) 50%),
			linear-gradient(135deg, var(--color-text-muted) 50%, transparent 50%);
		background-position:
			0 0,
			calc(100% - 10px) 11px,
			calc(100% - 6px) 11px;
		background-size:
			100% 100%,
			4px 4px,
			4px 4px;
		background-repeat: no-repeat;
	}

	.nova-mode-select:hover {
		background: var(--color-surface-hover);
	}

	.nova-mode-select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.nova-mode-select option {
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
	}

	.nova-composer {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.nova-composer__shell {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-2);
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 82%, var(--color-candle) 18%);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-overlay) 92%, var(--color-surface-ground)) 0%,
				color-mix(in srgb, var(--color-surface-ground) 86%, var(--color-surface-base)) 100%
			);
		box-shadow: var(--shadow-nova-inset-xs);
	}

	.nova-composer__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-wrap: nowrap;
		min-width: 0;
	}

	.nova-composer__spacer {
		flex: 1;
		min-width: var(--space-1);
	}

	.nova-model-slot {
		display: contents;
		min-width: 0;
		flex-shrink: 1;
	}

	.nova-model-slot :global(.model-picker) {
		min-width: 0;
		flex-shrink: 1;
	}

	.nova-model-slot :global(.model-picker select) {
		min-width: 0;
		max-width: 92px;
		width: 92px;
	}

	.nova-action-slot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-7);
		height: var(--space-7);
		flex-shrink: 0;
		padding: 0;
		margin: 0;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.nova-action-slot:not(:disabled):hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
		border-color: var(--color-border-subtle);
		color: var(--color-text-secondary);
	}

	.nova-input {
		width: 100%;
		min-height: 36px;
		max-height: 288px;
		padding: var(--space-1) var(--space-2);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 78%, var(--color-candle) 22%);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 88%, var(--color-surface-overlay));
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		font-family: inherit;
		resize: none;
		overflow-y: auto;
	}

	.nova-input::placeholder {
		color: color-mix(in srgb, var(--color-text-muted) 82%, var(--color-text-secondary));
	}

	.nova-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.nova-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-8);
		height: var(--space-8);
		flex-shrink: 0;
		padding: 0;
		border-radius: 999px;
		border: 1px solid transparent;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
	}

	.nova-action svg {
		display: block;
	}

	.nova-action-send {
		background: var(--color-candle);
		border-color: color-mix(in srgb, var(--color-brass) 70%, var(--color-candle));
		color: var(--color-ink);
	}

	.nova-action-send:disabled {
		opacity: 0.45;
	}

	.nova-action-stop {
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, var(--color-surface-ground));
		border-color: var(--color-border-default);
		color: var(--color-text-secondary);
		border-radius: var(--radius-md);
		padding-inline: var(--space-2);
		width: auto;
		min-width: 56px;
	}

	.nova-action-stop:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-stop-glyph {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: var(--radius-xs);
		background: currentColor;
	}

.nova-composer__shell--with-popover {
		position: relative;
	}

	.nova-action-slot.is-active {
		background: color-mix(in srgb, var(--color-candle) 18%, var(--color-surface-overlay));
		border-color: color-mix(in srgb, var(--color-candle) 40%, var(--color-border-subtle));
		color: var(--color-text-primary);
	}

	.nova-attachment-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.nova-attachment-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		max-width: 100%;
		padding: 2px var(--space-1) 2px var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 82%, var(--color-candle) 18%);
		background: color-mix(in srgb, var(--color-surface-raised) 90%, var(--color-candle) 10%);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
	}

	.nova-attachment-chip__label {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nova-attachment-chip__kind {
		flex-shrink: 0;
		padding: 0 4px;
		border-radius: var(--radius-xs);
		background: color-mix(in srgb, var(--color-surface-ground) 80%, transparent);
		color: var(--color-text-muted);
		font-size: 9px;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.nova-attachment-chip__remove {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		line-height: 1;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.nova-attachment-chip__remove:hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 80%, transparent);
		color: var(--color-text-primary);
	}

	.nova-attachment-chip__remove:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
