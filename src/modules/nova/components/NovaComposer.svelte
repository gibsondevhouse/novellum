<!--
	Nova chat composer: mode selector, file attachment staging, textarea, and
	send / abort controls. Owns its own draft and attachment state; submits via
	sendNovaChat from the chat service.
-->
<script lang="ts">
	import { novaSession } from '../stores/nova-session.svelte.js';
	import { novaPanel } from '../stores/nova-panel.svelte.js';
	import { sendNovaChat } from '../services/chat-service.js';

	type NovaChatMode = 'chat' | 'scribe';

	type ChatModeOption = {
		value: NovaChatMode;
		label: string;
		shortLabel: string;
		description: string;
	};

	type StagedAttachment = {
		id: string;
		name: string;
		size: number;
		kind: 'image' | 'document' | 'other';
		mimeType: string;
	};

	const CHAT_MODE_OPTIONS: ChatModeOption[] = [
		{
			value: 'chat',
			label: 'Chat',
			shortLabel: 'C',
			description: 'Brainstorm and general story conversation.',
		},
		{
			value: 'scribe',
			label: 'Scribe',
			shortLabel: 'S',
			description: 'Agentic writing copilot for concrete drafting tasks.',
		},
	];

	interface Props {
		projectId?: string | null;
		activeSceneId?: string | null;
		activeChapterId?: string | null;
	}

	let { projectId = null, activeSceneId = null, activeChapterId = null }: Props = $props();

	let draft = $state('');
	let selectedMode = $state<NovaChatMode>('chat');
	let stagedAttachments = $state<StagedAttachment[]>([]);
	let attachmentInputEl = $state<HTMLInputElement | null>(null);

	const isStreaming = $derived(novaSession.isStreaming);
	const selectedModeMeta = $derived.by(
		() => CHAT_MODE_OPTIONS.find((option) => option.value === selectedMode) ?? CHAT_MODE_OPTIONS[0],
	);
	const composerPlaceholder = $derived.by(() => {
		if (isStreaming) return 'Copilot is responding…';
		if (selectedMode === 'chat') return 'Brainstorm, ask questions, or explore story ideas…';
		return 'Give Scribe a concrete task (outline, draft, revise, or analyze)…';
	});
	const canSubmit = $derived(draft.trim().length > 0 && !isStreaming);

	$effect(() => {
		const pending = novaPanel.pendingPrompt;
		if (pending !== null) {
			draft = pending;
			novaPanel.clearPendingPrompt();
		}
	});

	function classifyAttachmentKind(file: File): StagedAttachment['kind'] {
		if (file.type.startsWith('image/')) return 'image';
		if (
			file.type.includes('pdf') ||
			file.type.includes('word') ||
			file.type.includes('text') ||
			file.type.includes('markdown')
		) {
			return 'document';
		}
		const lowerName = file.name.toLowerCase();
		if (
			lowerName.endsWith('.md') ||
			lowerName.endsWith('.txt') ||
			lowerName.endsWith('.doc') ||
			lowerName.endsWith('.docx') ||
			lowerName.endsWith('.pdf')
		) {
			return 'document';
		}
		return 'other';
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function openAttachmentPicker(): void {
		attachmentInputEl?.click();
	}

	function handleAttachmentSelect(event: Event): void {
		const inputEl = event.currentTarget;
		if (!(inputEl instanceof HTMLInputElement) || !inputEl.files) return;

		const next = [...stagedAttachments];
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local dedup, not reactive state
		const seen = new Set(next.map((item) => `${item.name}:${item.size}:${item.mimeType}`));
		for (const file of Array.from(inputEl.files)) {
			const candidate: StagedAttachment = {
				id: crypto.randomUUID(),
				name: file.name,
				size: file.size,
				kind: classifyAttachmentKind(file),
				mimeType: file.type,
			};
			const key = `${candidate.name}:${candidate.size}:${candidate.mimeType}`;
			if (seen.has(key)) continue;
			seen.add(key);
			next.push(candidate);
		}

		stagedAttachments = next;
		inputEl.value = '';
	}

	function removeAttachment(id: string): void {
		stagedAttachments = stagedAttachments.filter((item) => item.id !== id);
	}

	function buildModePrompt(rawPrompt: string): string {
		if (selectedMode !== 'scribe') return rawPrompt;
		return `Scribe mode: act as an agentic writing copilot. Be concrete, structured, and action-oriented.\n\n${rawPrompt}`;
	}

	async function submitDraft() {
		const value = draft.trim();
		if (!value || isStreaming) return;
		draft = '';
		await sendNovaChat({
			prompt: buildModePrompt(value),
			projectId,
			activeSceneId,
			activeChapterId,
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			void submitDraft();
		}
	}

	function abortActiveStream() {
		const id = novaSession.activeStreamId;
		if (id) novaSession.abort(id);
	}
</script>

<form
	class="nova-composer nova-input-form"
	onsubmit={(event) => {
		event.preventDefault();
		void submitDraft();
	}}
>
	<div class="nova-composer__row">
		<input
			bind:this={attachmentInputEl}
			type="file"
			class="nova-attachment-input"
			onchange={handleAttachmentSelect}
			accept=".txt,.md,.pdf,.doc,.docx,.rtf,.odt,image/*"
			multiple
		/>

		<div class="nova-square-stack">
			<select
				class="nova-mode-square"
				bind:value={selectedMode}
				aria-label="Copilot chat mode"
				title={`${selectedModeMeta.label} mode`}
			>
				{#each CHAT_MODE_OPTIONS as option (option.value)}
					<option value={option.value}>{option.shortLabel}</option>
				{/each}
			</select>

			<button
				type="button"
				class="nova-upload-icon"
				onclick={openAttachmentPicker}
				aria-label="Upload documents and images"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21.44 11.05 12.25 20.2a6 6 0 0 1-8.48-8.48l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.4a2 2 0 1 1-2.83-2.83l8.49-8.48"></path>
				</svg>
			</button>
		</div>

		<textarea
			class="nova-input"
			bind:value={draft}
			onkeydown={handleKeydown}
			placeholder={composerPlaceholder}
			rows="3"
			aria-label="Ask Copilot"
			disabled={isStreaming}
		></textarea>

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
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m22 2-7 20-4-9-9-4z"></path>
					<path d="M22 2 11 13"></path>
				</svg>
				<span class="sr-only">Send</span>
			</button>
		{/if}
	</div>

	{#if stagedAttachments.length > 0}
		<ul class="nova-attachment-inline" aria-label="Staged attachments">
			{#each stagedAttachments as attachment (attachment.id)}
				<li class="nova-attachment-chip">
					<span class="nova-attachment-chip__name">{attachment.name}</span>
					<span class="nova-attachment-chip__meta">{formatFileSize(attachment.size)}</span>
					<button
						type="button"
						class="nova-attachment-chip__remove"
						onclick={() => removeAttachment(attachment.id)}
						aria-label={`Remove ${attachment.name}`}
					>
						Remove
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</form>

<style>
	.nova-mode-square,
	.nova-upload-icon,
	.nova-action,
	.nova-attachment-chip__remove {
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard);
	}

	.nova-mode-square:focus-visible,
	.nova-upload-icon:focus-visible,
	.nova-action:focus-visible,
	.nova-attachment-chip__remove:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nova-action:disabled,
	.nova-attachment-chip__remove:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.nova-mode-square {
		appearance: none;
		-webkit-appearance: none;
		width: 36px;
		height: 36px;
		padding: 0;
		margin: 0;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-align: center;
		text-align-last: center;
		cursor: pointer;
	}

	.nova-mode-square:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-mode-square option {
		background: var(--color-surface-ground);
		color: var(--color-text-primary);
	}

	.nova-composer {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.nova-composer__row {
		display: grid;
		grid-template-columns: 36px 1fr 36px;
		align-items: end;
		gap: var(--space-2);
	}

	.nova-square-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.nova-attachment-input {
		display: none;
	}

	.nova-upload-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.nova-upload-icon:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-input {
		width: 100%;
		min-height: 96px;
		max-height: 220px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		font-family: inherit;
		resize: none;
	}

	.nova-input:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nova-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.nova-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border-radius: var(--radius-md);
		border: 1px solid transparent;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
	}

	.nova-action svg {
		display: block;
	}

	.nova-action-send {
		background: var(--color-nova-blue);
		border-color: var(--color-nova-blue);
		color: var(--color-text-on-dark);
	}

	.nova-action-send:disabled {
		opacity: 0.45;
	}

	.nova-action-stop {
		background: var(--color-surface-overlay);
		border-color: var(--color-border-default);
		color: var(--color-text-secondary);
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

	.nova-attachment-inline {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nova-attachment-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border-radius: 999px;
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		max-width: 100%;
	}

	.nova-attachment-chip__name {
		font-size: var(--text-xs);
		color: var(--color-text-primary);
		max-width: 170px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nova-attachment-chip__meta {
		font-size: 11px;
		color: var(--color-text-muted);
	}

	.nova-attachment-chip__remove {
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		font-size: 11px;
		cursor: pointer;
		text-decoration: underline;
		border-radius: var(--radius-md);
	}

	.nova-attachment-chip__remove:hover {
		color: var(--color-text-primary);
	}
</style>
