<script lang="ts">
	import { OpenRouterClient } from '$lib/ai/openrouter.js';
	import type { AIRequestPayload } from '$lib/ai/types.js';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import GhostButton from '$lib/components/ui/GhostButton.svelte';
	import { parseMarkdown } from '$lib/ai/markdown.js';

	interface Message {
		role: 'user' | 'assistant' | 'system';
		content: string;
	}

	let messages = $state<Message[]>([]);
	let currentInput = $state('');
	let isStreaming = $state(false);
	
	const client = new OpenRouterClient();
	const defaultModel = 'anthropic/claude-3-haiku';

	async function handleSubmit() {
		if (!currentInput.trim() || isStreaming) return;

		const userText = currentInput.trim();
		messages = [...messages, { role: 'user', content: userText }];
		currentInput = '';
		isStreaming = true;

		// Add empty assistant message to stream into
		messages = [...messages, { role: 'assistant', content: '' }];

		const payload: AIRequestPayload = {
			model: defaultModel,
			messages: messages.map(m => ({ role: m.role, content: m.content })).filter(m => m.content),
		};

		try {
			for await (const chunk of client.streamComplete(payload)) {
				// Update the last message
				messages[messages.length - 1].content += chunk;
			}
		} catch (error) {
			console.error('Nova chat error:', error);
			messages[messages.length - 1].content += `\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}*`;
		} finally {
			isStreaming = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="chat-interface">
	<div class="chat-history">
		{#if messages.length === 0}
			<div class="chat-empty-state">
				<p>Hello! I am Nova, your AI assistant. How can I help you today?</p>
			</div>
		{/if}
		
		{#each messages as message, i (i)}
			<div class="message-wrapper {message.role}">
				{#if message.role === 'user'}
					<div class="message-bubble user-bubble">
						{message.content}
					</div>
				{:else}
					<SurfaceCard variant="flat" class="message-bubble assistant-bubble">
						<div class="markdown-content">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html parseMarkdown(message.content)}
						</div>
					</SurfaceCard>
				{/if}
			</div>
		{/each}
	</div>

	<div class="chat-input-area">
		<SurfaceCard variant="inset" class="input-card">
			<textarea
				class="chat-textarea"
				bind:value={currentInput}
				placeholder="Message Nova..."
				rows="1"
				onkeydown={handleKeydown}
				disabled={isStreaming}
			></textarea>
			<div class="input-actions">
				<GhostButton 
					onclick={handleSubmit} 
					disabled={!currentInput.trim() || isStreaming}
					aria-label="Send message"
				>
					Send
				</GhostButton>
			</div>
		</SurfaceCard>
	</div>
</div>

<style>
	.chat-interface {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		gap: var(--space-4);
	}

	.chat-history {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding: var(--space-4) var(--space-2);
	}

	.chat-empty-state {
		text-align: center;
		color: var(--color-text-muted);
		margin-top: auto;
		margin-bottom: auto;
		font-style: italic;
	}

	.message-wrapper {
		display: flex;
		width: 100%;
	}

	.message-wrapper.user {
		justify-content: flex-end;
	}

	.message-wrapper.assistant {
		justify-content: flex-start;
	}

	.message-bubble {
		max-width: 85%;
	}

	.user-bubble {
		background-color: var(--color-surface-hover);
		color: var(--color-text-primary);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		border-bottom-right-radius: var(--radius-xs);
		white-space: pre-wrap;
	}

	.assistant-bubble {
		width: 100%;
	}

	.chat-input-area {
		padding-top: var(--space-2);
	}

	.input-card {
		display: flex;
		flex-direction: column;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
	}

	.chat-textarea {
		width: 100%;
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-family: inherit;
		font-size: var(--text-base);
		resize: none;
		padding: var(--space-2);
		min-height: 48px;
		max-height: 200px;
	}

	.chat-textarea:focus {
		outline: none;
	}

	.chat-textarea::placeholder {
		color: var(--color-text-muted);
	}

	.chat-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.input-actions {
		display: flex;
		justify-content: flex-end;
		padding-top: var(--space-2);
	}

	/* Markdown Content Styles */
	:global(.markdown-content p) {
		margin: 0 0 var(--space-3) 0;
		line-height: var(--leading-relaxed);
	}
	:global(.markdown-content p:last-child) {
		margin-bottom: 0;
	}
	:global(.markdown-content pre) {
		background-color: var(--color-surface-base);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		overflow-x: auto;
		margin: var(--space-3) 0;
		border: 1px solid var(--color-border-subtle);
	}
	:global(.markdown-content code) {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}
	:global(.markdown-content em) {
		font-style: italic;
	}
	:global(.markdown-content strong) {
		font-weight: var(--font-weight-bold);
	}
</style>
