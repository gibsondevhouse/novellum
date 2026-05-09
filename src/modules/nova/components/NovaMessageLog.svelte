<!--
	Renders the Nova conversation message log: user bubbles, assistant prose,
	tool-call / tool-result chips, and inline error states. Stateless — all
	data flows in via props.
-->
<script lang="ts">
	import { safeHtml } from '$lib/ai/markdown.js';
	import type { NovaMessage } from '../types.js';
	import NovaErrorBoundary from './NovaErrorBoundary.svelte';
	import { classifyNovaError } from '../utils/classify-nova-error.js';

	interface Props {
		messages: NovaMessage[];
		novaError: string | null;
		novaErrorType: ReturnType<typeof classifyNovaError> | null;
		onRetry: () => void;
	}

	let { messages, novaError, novaErrorType, onRetry }: Props = $props();

	function isMissingCredentialsError(message: NovaMessage): boolean {
		const text = message.error ?? '';
		return /401|MissingCredentials/i.test(text);
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

<NovaErrorBoundary error={novaError} errorType={novaErrorType} {onRetry} />

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

<style>
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
</style>
