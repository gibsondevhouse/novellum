<!--
	plan-023 stage-005 — Nova panel chat UI.

	Right-side complementary surface anchored to the editor route. Renders
	the message log from `novaSession.messages`, exposes a real prompt
	textarea + Send/Abort, and surfaces error states inline. Streaming
	chunks accumulate into the latest assistant message; the user is
	free to abort mid-stream (partial content + "(aborted)" suffix is
	preserved).

	All persistent state lives in `novaSession`; the only local `$state`
	is the textarea draft.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { novaPanel } from '../stores/nova-panel.svelte.js';
	import { novaSession } from '../stores/nova-session.svelte.js';
	import { sendNovaChat } from '../services/chat-service.js';
	import { safeHtml } from '$lib/ai/markdown.js';
	import type { NovaMessage } from '../types.js';
	import { aiSession } from '../services/ai-session-service.svelte.js';
	import { classifyNovaError } from '../utils/classify-nova-error.js';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import ContextDisclosurePill from './ContextDisclosurePill.svelte';
	import ModelPickerDropdown from './ModelPickerDropdown.svelte';
	import NovaErrorBoundary from './NovaErrorBoundary.svelte';

	interface Props {
		projectId?: string | null;
		activeSceneId?: string | null;
		activeChapterId?: string | null;
		/**
		 * Optional callback for quick-prompts surfaced in the empty
		 * state. The editor route wires this to its `handleAskAi`
		 * adapter, which feeds the same `sendNovaChat` pipeline.
		 */
		onQuickPrompt?: (prompt: string) => void | Promise<void>;
	}

	let {
		projectId = null,
		activeSceneId = null,
		activeChapterId = null,
		onQuickPrompt,
	}: Props = $props();

	type NovaChatMode = 'chat' | 'scribe' | 'research';

	type ChatModeOption = {
		value: NovaChatMode;
		label: string;
		description: string;
		comingSoon?: boolean;
	};

	type StagedAttachment = {
		id: string;
		name: string;
		size: number;
		kind: 'image' | 'document' | 'other';
		mimeType: string;
	};

	type PromptStarter = {
		label: string;
		prompt: string;
	};

	const CHAT_MODE_OPTIONS: ChatModeOption[] = [
		{
			value: 'chat',
			label: 'Chat',
			description: 'Brainstorm and general story conversation.',
		},
		{
			value: 'scribe',
			label: 'Scribe',
			description: 'Agentic writing copilot for concrete drafting tasks.',
		},
		{
			value: 'research',
			label: 'Research',
			description: 'Web-layer story research and citations.',
			comingSoon: true,
		},
	];

	const CHAT_STARTERS: PromptStarter[] = [
		{
			label: 'Story spark',
			prompt:
				'Give me 5 high-concept story sparks based on a protagonist with a dangerous secret and one impossible deadline.',
		},
		{
			label: 'Character depth',
			prompt:
				'Help me deepen my protagonist: give me hidden fear, contradiction, coping mechanism, and one pressure-test scene idea.',
		},
		{
			label: 'Scene tension',
			prompt:
				'I have a slow scene. Give me 3 ways to increase tension without adding action, only through subtext and stakes.',
		},
	];

	const SCRIBE_STARTERS: PromptStarter[] = [
		{
			label: 'Draft pass',
			prompt:
				'Draft a grounded scene where two allies negotiate after a betrayal. Keep it dialogue-forward and emotionally sharp.',
		},
		{
			label: 'Outline beats',
			prompt:
				'Build a 6-beat scene outline for this chapter segment: setup, friction, reveal, pivot, consequence, hook.',
		},
		{
			label: 'Revision pass',
			prompt:
				'Revise this scene for clarity, stronger verbs, and cleaner pacing while preserving voice and POV.',
		},
	];

	let draft = $state('');
	let selectedMode = $state<NovaChatMode>('chat');
	let stagedAttachments = $state<StagedAttachment[]>([]);
	let attachmentInputEl = $state<HTMLInputElement | null>(null);
	let composerInputEl = $state<HTMLTextAreaElement | null>(null);

	const messages = $derived(novaSession.messages);
	const isStreaming = $derived(novaSession.isStreaming);
	const isResearchMode = $derived(selectedMode === 'research');
	const selectedModeMeta = $derived.by(
		() => CHAT_MODE_OPTIONS.find((option) => option.value === selectedMode) ?? CHAT_MODE_OPTIONS[0],
	);
	const activePromptStarters = $derived.by(() => {
		if (selectedMode === 'scribe') return SCRIBE_STARTERS;
		if (selectedMode === 'research') return [];
		return CHAT_STARTERS;
	});
	const attachmentSummary = $derived.by(() => {
		if (stagedAttachments.length === 0) return 'No files attached';
		if (stagedAttachments.length === 1) return '1 file attached';
		return `${stagedAttachments.length} files attached`;
	});
	const composerPlaceholder = $derived.by(() => {
		if (isStreaming) return 'Copilot is responding…';
		if (selectedMode === 'chat') {
			return 'Brainstorm, ask questions, or explore story ideas…';
		}
		if (selectedMode === 'scribe') {
			return 'Give Scribe a concrete task (outline, draft, revise, or analyze)…';
		}
		return 'Research mode is coming soon: web-backed narrative research.';
	});
	const canSubmit = $derived(draft.trim().length > 0 && !isStreaming && !isResearchMode);
	const keyConfigured = $derived(aiSession.keyConfigured);
	const aiLoading = $derived(aiSession.loading);
	const aiChecked = $derived(aiSession.checked);
	const novaError = $derived.by(() => {
		for (let i = novaSession.messages.length - 1; i >= 0; i--) {
			const m = novaSession.messages[i];
			if (m.status === 'error' && m.error) return m.error;
		}
		return null;
	});
	const novaErrorType = $derived(novaError ? classifyNovaError(novaError) : null);

	function isMissingCredentialsError(message: NovaMessage): boolean {
		const text = message.error ?? '';
		return /401|MissingCredentials/i.test(text);
	}

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

	function applyStarter(prompt: string): void {
		if (isResearchMode) return;
		draft = prompt;
		queueMicrotask(() => composerInputEl?.focus());
	}

	function handleAttachmentSelect(event: Event): void {
		const inputEl = event.currentTarget;
		if (!(inputEl instanceof HTMLInputElement) || !inputEl.files) return;

		const next = [...stagedAttachments];
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
		if (!value || isStreaming || isResearchMode) return;
		draft = '';
		await sendNovaChat({
			prompt: buildModePrompt(value),
			projectId,
			activeSceneId,
			activeChapterId,
		});
	}

	onMount(() => {
		void aiSession.hydrate();
	});

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

	function renderAssistant(content: string): string {
		return safeHtml(content);
	}

	function formatToolPayload(payload: unknown): string {
		try {
			return JSON.stringify(payload ?? null, null, 2);
		} catch {
			return String(payload);
		}
	}

	function getToolResultStatus(message: NovaMessage): string {
		const payload = message.toolPayload;
		if (
			payload &&
			typeof payload === 'object' &&
			'status' in payload &&
			typeof (payload as { status: unknown }).status === 'string'
		) {
			return (payload as { status: string }).status;
		}
		return 'unknown';
	}

	function getToolResultError(message: NovaMessage): string | undefined {
		const payload = message.toolPayload;
		if (
			payload &&
			typeof payload === 'object' &&
			'error' in payload &&
			typeof (payload as { error: unknown }).error === 'string'
		) {
			return (payload as { error: string }).error;
		}
		return undefined;
	}

	function isToolStatusError(status: string): boolean {
		return status === 'error' || status === 'not-yet-supported';
	}
</script>

{#if novaPanel.isOpen}
	<aside class="nova-panel" aria-label="Copilot panel">
		<header class="nova-header">
			<div class="nova-mode-picker">
				<label class="nova-mode-picker__label" for="nova-mode-select">Mode</label>
				<select
					id="nova-mode-select"
					class="nova-mode-picker__select"
					bind:value={selectedMode}
					aria-label="Copilot chat mode"
				>
					{#each CHAT_MODE_OPTIONS as option}
						<option value={option.value}>
							{option.comingSoon ? `${option.label} (coming soon)` : option.label}
						</option>
					{/each}
				</select>
			</div>
			<div class="nova-header-controls">
				{#if aiLoading}
					<span class="nova-checking-dot" aria-label="Checking AI configuration…" title="Checking AI configuration…"></span>
				{/if}
				{#if keyConfigured}
					<ContextDisclosurePill />
					<ModelPickerDropdown />
				{/if}
				<button
					type="button"
					class="nova-close"
					aria-label="Close Copilot"
					onclick={() => novaPanel.close()}
				>
					✕
				</button>
			</div>
		</header>

		<div class="nova-body" aria-live="polite">
			{#if aiChecked && !keyConfigured}
				<EmptyStatePanel
					title="No AI key configured"
					description="Add your OpenRouter API key in Settings to start using the AI assistant."
				>
					{#snippet actions()}
						<a href="/settings/ai" class="nova-settings-link">Go to Settings</a>
					{/snippet}
				</EmptyStatePanel>
			{:else}
				{#if messages.length === 0}
				<section class="nova-welcome">
					<span class="nova-welcome__kicker">{selectedModeMeta.label} mode</span>
					<p class="nova-placeholder">{selectedModeMeta.description}</p>

					{#if !isResearchMode}
						<div class="nova-starters" aria-label="Suggested copilot starters">
							{#each activePromptStarters as starter (starter.label)}
								<button
									type="button"
									class="nova-starter"
									disabled={isStreaming}
									onclick={() => applyStarter(starter.prompt)}
								>
									{starter.label}
								</button>
							{/each}
						</div>
					{/if}

					{#if onQuickPrompt && activeSceneId && !isResearchMode}
						<div class="nova-quick-prompts">
							<button
								type="button"
								class="nova-quick-prompt"
								disabled={isStreaming}
								onclick={() => void onQuickPrompt?.('Continue this scene naturally from where it leaves off.')}
							>
								Continue scene
							</button>
						</div>
					{/if}
				</section>
				{:else}
					<NovaErrorBoundary
						error={novaError}
						errorType={novaErrorType}
						onRetry={() => novaSession.clear()}
					/>
					<ul class="nova-log" role="log" aria-label="Conversation with Nova">
					{#each messages as message (message.id)}
						{#if message.role === 'user'}
							<li class="nova-message nova-message-user">
								<div class="nova-bubble nova-bubble-user">
									{message.content}
								</div>
							</li>
						{:else if message.role === 'nova'}
							<li class="nova-message nova-message-nova">
								<div
									class="nova-bubble nova-bubble-nova"
									class:is-error={message.status === 'error'}
								>
									{#if message.status === 'error'}
										<p class="nova-error-text">{message.error ?? 'Something went wrong.'}</p>
										{#if isMissingCredentialsError(message)}
											<p class="nova-error-hint">
												<a href="/settings">Settings → AI providers</a>
											</p>
										{/if}
									{:else if message.content === '' && message.status === 'streaming'}
										<span class="nova-typing" aria-label="Nova is typing">
											<span></span><span></span><span></span>
										</span>
									{:else}
										<div class="nova-prose">
											<!-- eslint-disable-next-line svelte/no-at-html-tags -- safeHtml() runs DOMPurify sanitization -->
											{@html renderAssistant(message.content)}
										</div>
										{#if message.status === 'aborted'}
											<p class="nova-aborted">(aborted)</p>
										{/if}
									{/if}
								</div>
							</li>
						{:else if message.role === 'tool-call'}
							<li class="nova-message nova-message-tool">
								<div class="nova-tool-chip nova-tool-call" data-testid="nova-tool-call">
									<span class="nova-tool-label">Calling tool:</span>
									<code class="nova-tool-id">{message.toolId ?? 'unknown'}</code>
									<details class="nova-tool-details">
										<summary>Input</summary>
										<pre class="nova-tool-payload">{formatToolPayload(message.toolPayload)}</pre>
									</details>
								</div>
							</li>
						{:else if message.role === 'tool-result'}
							{@const toolStatus = getToolResultStatus(message)}
							{@const toolError = getToolResultError(message)}
							<li class="nova-message nova-message-tool">
								<div
									class="nova-tool-chip nova-tool-result"
									class:is-error={isToolStatusError(toolStatus)}
									data-testid="nova-tool-result"
								>
									<span class="nova-tool-label">Result:</span>
									<code class="nova-tool-id">{message.toolId ?? 'unknown'}</code>
									<span class="nova-tool-status">— {toolStatus}</span>
									{#if toolError}
										<p class="nova-tool-error">{toolError}</p>
									{/if}
									<details class="nova-tool-details">
										<summary>Output</summary>
										<pre class="nova-tool-payload">{formatToolPayload(message.toolPayload)}</pre>
									</details>
								</div>
							</li>
						{/if}
					{/each}
					</ul>
				{/if}
			{/if}
		</div>

		<footer class="nova-footer">
			<form
				class="nova-input-form"
				onsubmit={(event) => {
					event.preventDefault();
					void submitDraft();
				}}
			>
				<div class="nova-composer">
					<div class="nova-composer__toolbar">
						<div class="nova-composer__toolbar-left">
							<input
								bind:this={attachmentInputEl}
								type="file"
								class="nova-attachment-input"
								onchange={handleAttachmentSelect}
								accept=".txt,.md,.pdf,.doc,.docx,.rtf,.odt,image/*"
								multiple
							/>
							<button
								type="button"
								class="nova-attach-button"
								onclick={openAttachmentPicker}
								aria-label="Upload documents and images"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M21.44 11.05 12.25 20.2a6 6 0 0 1-8.48-8.48l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.4a2 2 0 1 1-2.83-2.83l8.49-8.48"></path>
								</svg>
								<span>Upload</span>
							</button>
							<span class="nova-attachment-summary">{attachmentSummary}</span>
						</div>
						<span class="nova-composer__mode-pill" class:is-soon={isResearchMode}>
							{isResearchMode ? 'Research soon' : `${selectedModeMeta.label} mode`}
						</span>
					</div>
					<p class="nova-composer__mode-copy">{selectedModeMeta.description}</p>

					{#if stagedAttachments.length > 0}
						<ul class="nova-attachment-list" aria-label="Staged attachments">
							{#each stagedAttachments as attachment (attachment.id)}
								<li class="nova-attachment-chip">
									<div class="nova-attachment-chip__copy">
										<strong>{attachment.name}</strong>
										<span>{attachment.kind} · {formatFileSize(attachment.size)}</span>
									</div>
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

					{#if isResearchMode}
						<p class="nova-mode-notice" role="status">
							Research mode is coming soon with a dedicated web research layer.
						</p>
					{/if}

					<div class="nova-composer__row">
						<textarea
							bind:this={composerInputEl}
							class="nova-input"
							bind:value={draft}
							onkeydown={handleKeydown}
							placeholder={composerPlaceholder}
							rows="3"
							aria-label="Ask Copilot"
							disabled={isStreaming || isResearchMode}
						></textarea>
						{#if isStreaming}
							<button
								type="button"
								class="nova-action nova-action-abort"
								onclick={abortActiveStream}
								aria-label="Abort response"
							>
								Stop
							</button>
						{:else}
							<button
								type="submit"
								class="nova-action nova-action-send"
								disabled={!canSubmit}
							>
								{isResearchMode ? 'Coming soon' : 'Send'}
							</button>
						{/if}
					</div>
				</div>
			</form>
		</footer>
	</aside>
{/if}

<style>
	.nova-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: var(--nova-panel-width);
		display: flex;
		flex-direction: column;
		background:
			radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--color-teal) 10%, transparent) 0%, transparent 52%),
			var(--nova-panel-bg);
		border-left: 1px solid var(--nova-panel-border);
		box-shadow: var(--nova-panel-shadow);
		z-index: 50;
		color: var(--color-text-primary);
		overflow: hidden;
	}

	.nova-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--nova-panel-border);
		background: color-mix(in srgb, var(--color-surface-base) 92%, transparent);
		backdrop-filter: blur(6px);
	}

	.nova-mode-picker {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.nova-mode-picker__label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.nova-mode-picker__select {
		min-width: 190px;
		height: 32px;
		padding: 0 var(--space-2);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 88%, transparent);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
	}

	.nova-mode-picker__select:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 1px;
	}

	.nova-header-controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.nova-checking-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-text-muted);
		animation: nova-typing-pulse 1s infinite ease-in-out;
	}

	.nova-settings-link {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		text-decoration: none;
		border: 1px solid var(--color-border-default);
	}

	.nova-settings-link:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-close {
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		line-height: 1;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.nova-close:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-close:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.nova-body {
		flex: 1 1 auto;
		overflow-y: auto;
		padding: var(--space-4);
		scrollbar-gutter: stable;
	}

	.nova-welcome {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 72%, transparent);
		border-radius: var(--radius-md);
		background:
			linear-gradient(
				150deg,
				color-mix(in srgb, var(--color-surface-overlay) 94%, transparent) 0%,
				color-mix(in srgb, var(--color-surface-ground) 96%, transparent) 100%
			);
	}

	.nova-welcome__kicker {
		display: inline-flex;
		align-items: center;
		width: fit-content;
		padding: 2px var(--space-2);
		border-radius: 999px;
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--color-surface-ground) 82%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.nova-placeholder {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 13px;
		line-height: var(--leading-relaxed);
	}

	.nova-starters {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.nova-starter {
		padding: var(--space-2) var(--space-2);
		text-align: left;
		border-radius: var(--radius-sm);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 85%, transparent);
		background: color-mix(in srgb, var(--color-surface-overlay) 95%, transparent);
		color: var(--color-text-secondary);
		font-size: 12px;
		font-weight: var(--font-weight-medium);
		cursor: pointer;
	}

	.nova-starter:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
		border-color: color-mix(in srgb, var(--color-border-strong) 80%, transparent);
	}

	.nova-starter:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.nova-quick-prompts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-3);
	}

	.nova-quick-prompt {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: 999px;
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.nova-quick-prompt:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-quick-prompt:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.nova-log {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nova-message {
		display: flex;
	}

	.nova-message-user {
		justify-content: flex-end;
	}

	.nova-message-nova {
		justify-content: flex-start;
	}

	.nova-bubble {
		max-width: 90%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		word-wrap: break-word;
	}

	.nova-bubble-user {
		background: color-mix(in srgb, var(--color-teal) 24%, transparent);
		color: var(--color-text-primary);
		border: 1px solid color-mix(in srgb, var(--color-teal) 38%, transparent);
		white-space: pre-wrap;
	}

	.nova-bubble-nova {
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-subtle);
	}

	.nova-bubble-nova.is-error {
		background: color-mix(in srgb, var(--color-error) 12%, transparent);
		border-color: color-mix(in srgb, var(--color-error) 38%, transparent);
		color: var(--color-error);
	}

	.nova-error-text {
		margin: 0;
		font-size: var(--text-sm);
	}

	.nova-error-hint {
		margin: var(--space-1) 0 0;
		font-size: var(--text-xs);
	}

	.nova-error-hint a {
		color: var(--color-text-link, var(--color-teal));
		text-decoration: underline;
	}

	.nova-prose :global(p) {
		margin: 0 0 var(--space-2);
	}

	.nova-prose :global(p:last-child) {
		margin-bottom: 0;
	}

	.nova-prose :global(code) {
		font-family: var(--font-mono, monospace);
		font-size: 0.9em;
	}

	.nova-aborted {
		margin: var(--space-2) 0 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}

	.nova-typing {
		display: inline-flex;
		gap: 4px;
	}

	.nova-typing span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-text-muted);
		animation: nova-typing-pulse 1s infinite ease-in-out;
	}

	.nova-typing span:nth-child(2) {
		animation-delay: 0.15s;
	}

	.nova-typing span:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes nova-typing-pulse {
		0%, 80%, 100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.nova-footer {
		border-top: 1px solid var(--nova-panel-border);
		padding: var(--space-3) var(--space-4);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-base) 94%, transparent) 0%,
				color-mix(in srgb, var(--color-surface-overlay) 96%, transparent) 100%
			);
	}

	.nova-input-form {
		display: block;
	}

	.nova-composer {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2);
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 80%, transparent);
		background:
			linear-gradient(
				135deg,
				color-mix(in srgb, var(--color-surface-overlay) 96%, transparent) 0%,
				color-mix(in srgb, var(--color-surface-ground) 98%, transparent) 100%
			);
		box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-border-default) 20%, transparent);
	}

	.nova-composer__toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.nova-composer__toolbar-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.nova-attachment-summary {
		font-size: 12px;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.nova-composer__mode-copy {
		margin: 0;
		font-size: 12px;
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		padding-inline: var(--space-1);
	}

	.nova-composer__mode-pill {
		display: inline-flex;
		align-items: center;
		padding: 2px var(--space-2);
		border-radius: 999px;
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--color-teal) 78%, var(--color-text-primary));
		border: 1px solid color-mix(in srgb, var(--color-teal) 38%, transparent);
		background: color-mix(in srgb, var(--color-teal) 10%, transparent);
	}

	.nova-composer__mode-pill.is-soon {
		color: var(--color-text-secondary);
		border-color: color-mix(in srgb, var(--color-border-default) 85%, transparent);
		background: color-mix(in srgb, var(--color-surface-ground) 90%, transparent);
	}

	.nova-attachment-input {
		display: none;
	}

	.nova-attach-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 85%, transparent);
		background: color-mix(in srgb, var(--color-surface-overlay) 92%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		white-space: nowrap;
	}

	.nova-attach-button:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-attach-button:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 1px;
	}

	.nova-attachment-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.nova-attachment-chip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding: var(--space-2);
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 85%, transparent);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-overlay) 92%, transparent);
	}

	.nova-attachment-chip__copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
		gap: 2px;
	}

	.nova-attachment-chip__copy strong {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nova-attachment-chip__copy span {
		font-size: 11px;
		color: var(--color-text-muted);
		text-transform: capitalize;
	}

	.nova-attachment-chip__remove {
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-default);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: 11px;
		cursor: pointer;
	}

	.nova-attachment-chip__remove:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.nova-mode-notice {
		margin: 0;
		padding: var(--space-2);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
		border-radius: var(--radius-sm);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 78%, transparent);
		background: color-mix(in srgb, var(--color-surface-ground) 94%, transparent);
		color: var(--color-text-secondary);
	}

	.nova-composer__row {
		display: flex;
		align-items: flex-end;
		gap: var(--space-2);
	}

	.nova-input {
		flex: 1 1 auto;
		min-height: 74px;
		max-height: 160px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-base) 95%, transparent);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		font-family: inherit;
		resize: none;
		box-shadow: inset 0 1px 1px color-mix(in srgb, var(--color-border-default) 22%, transparent);
	}

	.nova-input:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 1px;
	}

	.nova-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.nova-action {
		flex: 0 0 auto;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
	}

	.nova-action-send {
		background:
			linear-gradient(
				160deg,
				color-mix(in srgb, var(--color-teal) 88%, white) 0%,
				var(--color-teal) 100%
			);
		color: var(--color-text-on-accent, white);
		min-width: 96px;
		box-shadow: 0 6px 14px color-mix(in srgb, var(--color-teal) 32%, transparent);
	}

	.nova-action-send:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.nova-action-abort {
		background: transparent;
		border-color: var(--color-border-default);
		color: var(--color-text-secondary);
	}

	.nova-action-abort:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	@media (max-width: 960px) {
		.nova-starters {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 680px) {
		.nova-header {
			padding-inline: var(--space-3);
		}

		.nova-mode-picker__label {
			display: none;
		}

		.nova-mode-picker__select {
			min-width: 152px;
		}

		.nova-header-controls {
			gap: var(--space-1);
		}

		.nova-starters {
			grid-template-columns: 1fr;
		}

		.nova-composer__toolbar,
		.nova-composer__toolbar-left,
		.nova-composer__row {
			flex-wrap: wrap;
		}

		.nova-composer__mode-pill {
			margin-left: auto;
		}

		.nova-attachment-summary {
			white-space: normal;
		}

		.nova-action {
			width: 100%;
		}
	}

	@media (max-width: 900px) {
		.nova-panel {
			width: 100vw;
			border-left: none;
		}
	}

	/* plan-023 stage-006 — tool-call / tool-result chips. Uses
	   existing surface and text tokens; no new tokens introduced. */
	.nova-message-tool {
		justify-content: flex-start;
	}

	.nova-tool-chip {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		max-width: 90%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		border: 1px dashed var(--color-border-subtle);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
	}

	.nova-tool-chip.is-error {
		background: color-mix(in srgb, var(--color-error) 12%, transparent);
		border-color: color-mix(in srgb, var(--color-error) 38%, transparent);
		color: var(--color-error);
	}

	.nova-tool-label {
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.nova-tool-id {
		font-family: var(--font-mono, monospace);
		color: var(--color-text-primary);
	}

	.nova-tool-status {
		font-style: italic;
	}

	.nova-tool-error {
		margin: 0;
	}

	.nova-tool-details {
		margin-top: var(--space-1);
	}

	.nova-tool-details summary {
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	.nova-tool-payload {
		margin: var(--space-1) 0 0;
		padding: var(--space-2);
		background: var(--color-surface-base, var(--color-surface-overlay));
		border-radius: var(--radius-sm);
		font-family: var(--font-mono, monospace);
		font-size: var(--text-xs);
		color: var(--color-text-primary);
		white-space: pre-wrap;
		overflow-x: auto;
	}
</style>
