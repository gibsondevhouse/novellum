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

	let draft = $state('');

	const messages = $derived(novaSession.messages);
	const isStreaming = $derived(novaSession.isStreaming);
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

	async function submitDraft() {
		const value = draft.trim();
		if (!value || isStreaming) return;
		draft = '';
		await sendNovaChat({
			prompt: value,
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
	<aside class="nova-panel" aria-label="Nova copilot">
		<header class="nova-header">
			<h2 class="nova-title">Nova</h2>
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
					aria-label="Close Nova"
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
				<p class="nova-placeholder">
					Hi, I'm Nova. Ask me anything about your manuscript — I'll use the
					active scene and its neighbours as context.
				</p>
				{#if onQuickPrompt && activeSceneId}
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
				<textarea
					class="nova-input"
					bind:value={draft}
					onkeydown={handleKeydown}
					placeholder={isStreaming ? 'Nova is responding…' : 'Ask Nova…'}
					rows="2"
					aria-label="Ask Nova"
					disabled={isStreaming}
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
						disabled={draft.trim().length === 0}
					>
						Send
					</button>
				{/if}
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
		background: var(--nova-panel-bg);
		border-left: 1px solid var(--nova-panel-border);
		box-shadow: var(--nova-panel-shadow);
		z-index: 50;
		color: var(--color-text-primary);
	}

	.nova-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--nova-panel-border);
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

	.nova-title {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
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
	}

	.nova-placeholder {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
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
	}

	.nova-input-form {
		display: flex;
		gap: var(--space-2);
		align-items: flex-end;
	}

	.nova-input {
		flex: 1 1 auto;
		min-height: 40px;
		max-height: 160px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		font-family: inherit;
		resize: vertical;
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
		background: var(--color-teal);
		color: var(--color-text-on-accent, white);
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
