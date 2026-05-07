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
		onQuickPrompt?: (prompt: string) => void;
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
		shortLabel: string;
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
		{
			value: 'research',
			label: 'Research',
			shortLabel: 'R',
			description: 'Web-layer story research and citations.',
			comingSoon: true,
		},
	];

	const PANEL_WIDTH_STORAGE_KEY = 'novellum.nova.panel.width';
	const PANEL_DEFAULT_WIDTH = 360;
	const PANEL_MIN_WIDTH = 280;
	const PANEL_MAX_WIDTH = 520;
	const PANEL_KEYBOARD_STEP = 16;

	let draft = $state('');
	let selectedMode = $state<NovaChatMode>('chat');
	let stagedAttachments = $state<StagedAttachment[]>([]);
	let attachmentInputEl = $state<HTMLInputElement | null>(null);
	let composerInputEl = $state<HTMLTextAreaElement | null>(null);
	let resizeHandleEl = $state<HTMLButtonElement | null>(null);
	let panelWidth = $state<number>(readStoredPanelWidth());
	let isCompactViewport = $state(false);
	let isResizing = $state(false);

	let activeResizePointerId: number | null = null;
	let resizeStartX = 0;
	let resizeStartWidth = PANEL_DEFAULT_WIDTH;

	const messages = $derived(novaSession.messages);
	const isStreaming = $derived(novaSession.isStreaming);
	const isResearchMode = $derived(selectedMode === 'research');
	const selectedModeMeta = $derived.by(
		() => CHAT_MODE_OPTIONS.find((option) => option.value === selectedMode) ?? CHAT_MODE_OPTIONS[0],
	);
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

	function clampPanelWidth(next: number): number {
		if (!Number.isFinite(next)) return PANEL_DEFAULT_WIDTH;
		return Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_MAX_WIDTH, Math.round(next)));
	}

	function readStoredPanelWidth(): number {
		if (typeof window === 'undefined') return PANEL_DEFAULT_WIDTH;
		try {
			const raw = window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
			if (!raw) return PANEL_DEFAULT_WIDTH;
			return clampPanelWidth(Number.parseInt(raw, 10));
		} catch {
			return PANEL_DEFAULT_WIDTH;
		}
	}

	function persistPanelWidth(width: number): void {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(width));
		} catch {
			/* ignore quota / disabled-storage */
		}
	}

	function syncPanelWidthVar(width: number): void {
		if (typeof document === 'undefined') return;
		document.documentElement.style.setProperty('--nova-panel-width', `${width}px`);
	}

	function setPanelWidth(next: number, persist = true): void {
		const clamped = clampPanelWidth(next);
		panelWidth = clamped;
		syncPanelWidthVar(clamped);
		if (persist) persistPanelWidth(clamped);
	}

	function beginResize(event: PointerEvent): void {
		if (isCompactViewport) return;
		event.preventDefault();

		isResizing = true;
		activeResizePointerId = event.pointerId;
		resizeStartX = event.clientX;
		resizeStartWidth = panelWidth;
		resizeHandleEl?.setPointerCapture(event.pointerId);

		window.addEventListener('pointermove', handleResizePointerMove);
		window.addEventListener('pointerup', handleResizePointerUp);
		window.addEventListener('pointercancel', handleResizePointerUp);

		if (typeof document !== 'undefined') {
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
		}
	}

	function stopResize(persist = true): void {
		if (!isResizing) return;

		isResizing = false;
		window.removeEventListener('pointermove', handleResizePointerMove);
		window.removeEventListener('pointerup', handleResizePointerUp);
		window.removeEventListener('pointercancel', handleResizePointerUp);

		if (activeResizePointerId !== null) {
			try {
				resizeHandleEl?.releasePointerCapture(activeResizePointerId);
			} catch {
				/* no-op */
			}
		}
		activeResizePointerId = null;

		if (persist) persistPanelWidth(panelWidth);

		if (typeof document !== 'undefined') {
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		}
	}

	function handleResizePointerMove(event: PointerEvent): void {
		if (!isResizing) return;
		const delta = resizeStartX - event.clientX;
		setPanelWidth(resizeStartWidth + delta, false);
	}

	function handleResizePointerUp(event: PointerEvent): void {
		if (!isResizing) return;
		if (activeResizePointerId !== null && event.pointerId !== activeResizePointerId) return;
		stopResize(true);
	}

	function handleResizeHandleKeydown(event: KeyboardEvent): void {
		if (isCompactViewport) return;
		const step = event.shiftKey ? PANEL_KEYBOARD_STEP * 2 : PANEL_KEYBOARD_STEP;

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			setPanelWidth(panelWidth + step);
			return;
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			setPanelWidth(panelWidth - step);
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			setPanelWidth(PANEL_MIN_WIDTH);
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			setPanelWidth(PANEL_MAX_WIDTH);
		}
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
		setPanelWidth(panelWidth, false);

		if (typeof window === 'undefined') return;

		const compactMedia = window.matchMedia('(max-width: 900px)');
		const handleCompactChange = (event: MediaQueryListEvent): void => {
			isCompactViewport = event.matches;
			if (event.matches) stopResize(false);
		};

		isCompactViewport = compactMedia.matches;
		compactMedia.addEventListener('change', handleCompactChange);

		return () => {
			compactMedia.removeEventListener('change', handleCompactChange);
			stopResize(false);
		};
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
	<aside class="nova-panel" class:is-resizing={isResizing} aria-label="Nova copilot">
		<button
			bind:this={resizeHandleEl}
			type="button"
			class="nova-resize-handle"
			role="slider"
			aria-orientation="horizontal"
			aria-label="Resize Copilot panel"
			aria-valuemin={PANEL_MIN_WIDTH}
			aria-valuemax={PANEL_MAX_WIDTH}
			aria-valuenow={panelWidth}
			aria-valuetext={`${panelWidth}px`}
			disabled={isCompactViewport}
			onpointerdown={beginResize}
			onkeydown={handleResizeHandleKeydown}
		></button>
		<header class="nova-header">
			<button
				type="button"
				class="nova-close"
				aria-label="Close Nova"
				onclick={() => novaPanel.close()}
			>×</button>
		</header>
		{#if keyConfigured}
			<div class="nova-session-tray" aria-label="Session controls">
				{#if aiLoading}
					<span class="nova-checking-dot" aria-label="Checking AI configuration…" title="Checking AI configuration…"></span>
				{/if}
				<ContextDisclosurePill />
				<ModelPickerDropdown />
			</div>
		{/if}

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
					<div class="nova-greeting">
						<p class="nova-greeting-title">Hi, I'm Nova.</p>
						<p class="nova-greeting-body">Ask me anything about your project.</p>
						<button
							type="button"
							class="nova-quick-prompt"
							onclick={() => onQuickPrompt?.('Summarize what we know so far.')}
						>Summarize what we know so far</button>
					</div>
				{/if}
				{#if messages.length > 0}
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

				{#if isResearchMode}
					<p class="nova-mode-notice" role="status">
						Research mode is coming soon with a dedicated web research layer.
					</p>
				{/if}
			</form>
		</footer>
	</aside>
{/if}

<style>
	.nova-panel {
		--nova-panel-width-min: 280px;
		--nova-panel-width-max: 520px;
		position: fixed;
		top: 48px;
		right: 0;
		bottom: 0;
		width: clamp(var(--nova-panel-width-min), var(--nova-panel-width), var(--nova-panel-width-max));
		max-width: min(var(--nova-panel-width-max), calc(100vw - 48px));
		min-width: var(--nova-panel-width-min);
		display: flex;
		flex-direction: column;
		background: var(--color-surface-ground);
		border-left: 1px solid var(--nova-panel-border);
		box-shadow: var(--nova-panel-shadow);
		z-index: 50;
		color: var(--color-text-primary);
	}

	.nova-resize-handle {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 10px;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		cursor: col-resize;
		touch-action: none;
		z-index: 2;
	}

	.nova-resize-handle::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 4px;
		transform: translateY(-50%);
		width: 2px;
		height: 56px;
		border-radius: var(--radius-full);
		background: var(--color-border-strong);
		opacity: 0;
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.nova-panel:hover .nova-resize-handle::after,
	.nova-panel.is-resizing .nova-resize-handle::after,
	.nova-resize-handle:focus-visible::after {
		opacity: 1;
	}

	.nova-resize-handle:focus-visible {
		outline: none;
		box-shadow: inset var(--focus-ring);
	}

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

	.nova-checking-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-text-muted);
		animation: nova-typing-pulse var(--duration-pulse) infinite var(--ease-editorial);
	}

	.nova-session-tray {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border-bottom: 1px solid var(--color-border-default);
		background: var(--color-surface-ground);
	}

	.nova-header {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: var(--space-2) var(--space-4);
	}

	.nova-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-7);
		height: var(--space-7);
		border: 0;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--text-lg);
		line-height: 1;
		cursor: pointer;
	}

	.nova-close:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
	}

	.nova-greeting {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-6) var(--space-2);
		text-align: center;
	}

	.nova-greeting-title {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.nova-greeting-body {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.nova-quick-prompt {
		align-self: center;
		margin-top: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.nova-quick-prompt:hover {
		background: var(--color-surface-raised);
	}

	.nova-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-4);
	}

	.nova-settings-link {
		display: inline-flex;
		align-items: center;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		text-decoration: none;
		border: 1px solid var(--color-border-default);
	}

	.nova-settings-link:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
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

	.nova-message-nova,
	.nova-message-tool {
		justify-content: flex-start;
	}

	.nova-bubble {
		max-width: 90%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		overflow-wrap: break-word;
	}

	.nova-bubble-user {
		background: var(--color-surface-ground);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-primary);
		white-space: pre-wrap;
	}

	.nova-bubble-nova {
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-primary);
	}

	.nova-bubble-nova.is-error {
		border-color: var(--color-error);
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
		color: var(--color-nova-blue);
		text-decoration: underline;
	}

	.nova-prose :global(p) {
		margin: 0 0 var(--space-2);
	}

	.nova-prose :global(p:last-child) {
		margin-bottom: 0;
	}

	.nova-prose :global(code) {
		font-family: var(--font-mono);
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
		animation: nova-typing-pulse var(--duration-pulse) infinite var(--ease-editorial);
	}

	.nova-typing span:nth-child(2) {
		animation-delay: 0.15s;
	}

	.nova-typing span:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes nova-typing-pulse {
		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.nova-footer {
		border-top: 1px solid var(--color-border-default);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface-ground);
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

	.nova-mode-notice {
		margin: 0;
		padding: var(--space-2);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}

	.nova-tool-chip {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		max-width: 90%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		line-height: var(--leading-relaxed);
	}

	.nova-tool-chip.is-error {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.nova-tool-label {
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.nova-tool-id {
		font-family: var(--font-mono);
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
		background: var(--color-surface-ground);
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-primary);
		white-space: pre-wrap;
		overflow-x: auto;
	}

	@media (max-width: 900px) {
		.nova-panel {
			top: 48px;
			width: 100vw;
			max-width: none;
			min-width: 0;
			border-left: none;
		}

		.nova-resize-handle {
			display: none;
		}
	}

	@media (max-width: 640px) {
		.nova-session-tray,
		.nova-body,
		.nova-footer {
			padding-inline: var(--space-3);
		}
	}
</style>
