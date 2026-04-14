<script lang="ts">
	import { OpenRouterClient } from '$lib/ai/openrouter.js';
	import type { AIRequestPayload } from '$lib/ai/types.js';
	import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import { safeHtml } from '$lib/ai/markdown.js';
	import PromptInput from './PromptInput.svelte';
	import SuggestionChips from './SuggestionChips.svelte';
	import QuickLinks from './QuickLinks.svelte';

	interface Message {
		role: 'user' | 'assistant' | 'system';
		content: string;
	}

	const suggestions = [
		{ label: 'Character arc', prompt: 'Help me develop a compelling character arc. Ask me about the character I have in mind.' },
		{ label: 'Scene draft', prompt: 'Help me draft a scene. Ask me about the setting, characters involved, and what needs to happen.' },
		{ label: 'Plot structure', prompt: 'I need help structuring my plot. Let me describe where I am in the story.' },
	];

	const quickLinks = [
		{ label: 'Story Bible', href: '/books', icon: 'edit' as const },
		{ label: 'Outline', href: '/stories', icon: 'list' as const },
		{ label: 'Settings', href: '/settings', icon: 'settings' as const },
	];

	let messages = $state<Message[]>([]);
	let promptValue = $state('');
	let isStreaming = $state(false);
	let hasMessages = $derived(messages.length > 0);

	const client = new OpenRouterClient();

	async function handleSubmit(text: string) {
		if (!text.trim() || isStreaming) return;

		messages = [...messages, { role: 'user', content: text.trim() }];
		promptValue = '';
		isStreaming = true;

		messages = [...messages, { role: 'assistant', content: '' }];

		const payload: AIRequestPayload = {
			model: getSelectedModel(),
			messages: messages.map((m) => ({ role: m.role, content: m.content })).filter((m) => m.content),
		};

		try {
			for await (const chunk of client.streamComplete(payload)) {
				// Mutate the last message and trigger reactivity with array reassignment
				messages[messages.length - 1].content += chunk;
				messages = messages; // Reassign to trigger Svelte 5 reactivity
			}
		} catch (error) {
			console.error('Nova chat error:', error);
			messages[messages.length - 1].content +=
				`\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}*`;
			messages = messages; // Reassign to trigger reactivity
		} finally {
			isStreaming = false;
		}
	}
</script>

<div class="chat-root" class:chat-root--conversation={hasMessages}>
	{#if hasMessages}
		<!-- ─── Conversation mode ─── -->
		<div class="chat-history" role="log" aria-label="Conversation">
			{#each messages as message, i (i)}
				<div class="msg msg--{message.role}">
					{#if message.role === 'user'}
						<div class="msg__bubble msg__bubble--user">{message.content}</div>
					{:else}
						<SurfaceCard variant="flat" class="msg__bubble msg__bubble--assistant">
							<div class="prose">
								{#if message.content === '' && isStreaming && i === messages.length - 1}
									<span class="typing" aria-label="Nova is typing">
										<span></span><span></span><span></span>
									</span>
								{:else}
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- safeHtml() runs DOMPurify sanitization -->
									{@html safeHtml(message.content)}
								{/if}
							</div>
						</SurfaceCard>
					{/if}
				</div>
			{/each}
		</div>

		<div class="conversation-input">
			<PromptInput
				bind:value={promptValue}
				placeholder="Reply ..."
				disabled={isStreaming}
				onsubmit={handleSubmit}
			/>
		</div>
	{:else}
		<!-- ─── Empty / home state ─── -->
		<div class="home">
			<div class="home__prompt-group">
				<div class="prompt-shell">
					<PromptInput
						bind:value={promptValue}
						placeholder="Help me write a scene ..."
						disabled={isStreaming}
						onsubmit={handleSubmit}
					/>
					<SuggestionChips {suggestions} onselect={handleSubmit} />
				</div>

				<QuickLinks label="Quick access" links={quickLinks} />
			</div>
		</div>

		<footer class="home-footer">
			<span>AI-assisted writing</span>
			<span class="home-footer__dot">·</span>
			<span>Use suggestions with care</span>
		</footer>
	{/if}
</div>

<style>
	/* ───────────────────────────── Root ─── */
	.chat-root {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	/* ───────── Empty / home state ─── */
	.home {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10vh var(--space-6) 0;
	}

	.home__prompt-group {
		width: 100%;
		max-width: 580px;
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
	}

	/* ── Outer shell: wraps subcard + chips ── */
	.prompt-shell {
		display: flex;
		flex-direction: column;
		border-radius: 26px;
		border: 1px solid rgba(255, 255, 255, 0.075);
		padding: 12px;
	}

	/* ──────────────────────────── Footer ─── */
	.home-footer {
		padding: var(--space-3) var(--space-6) var(--space-5);
		text-align: center;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.home-footer__dot {
		margin: 0 var(--space-1);
	}

	/* ──────────────────── Conversation mode ─── */
	.chat-history {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding: var(--space-6) var(--space-6) var(--space-2);
		max-width: 820px;
		width: 100%;
		margin: 0 auto;
	}

	.conversation-input {
		padding: var(--space-2) var(--space-6) var(--space-4);
		max-width: 820px;
		width: 100%;
		margin: 0 auto;
	}

	.msg {
		display: flex;
		width: 100%;
	}

	.msg--user {
		justify-content: flex-end;
	}

	.msg--assistant {
		justify-content: flex-start;
	}

	.msg__bubble {
		max-width: 85%;
	}

	.msg__bubble--user {
		background-color: var(--color-surface-overlay);
		color: var(--color-text-primary);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		border-bottom-right-radius: var(--radius-xs);
		white-space: pre-wrap;
		line-height: var(--leading-normal);
		font-size: var(--text-base);
	}

	.msg__bubble--assistant {
		width: 100%;
	}

	/* ──────────────────────── Prose (markdown) ─── */
	.prose {
		font-size: var(--text-base);
		color: var(--color-text-primary);
	}

	:global(.prose p) {
		margin: 0 0 var(--space-3) 0;
		line-height: var(--leading-relaxed);
	}
	:global(.prose p:last-child) {
		margin-bottom: 0;
	}
	:global(.prose pre) {
		background-color: var(--color-surface-base);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		overflow-x: auto;
		margin: var(--space-3) 0;
		border: 1px solid var(--color-border-subtle);
	}
	:global(.prose code) {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}
	:global(.prose em) {
		font-style: italic;
	}
	:global(.prose strong) {
		font-weight: var(--font-weight-bold);
	}

	/* ──────────────────── Typing indicator ─── */
	.typing {
		display: inline-flex;
		gap: var(--space-1);
		align-items: center;
		height: 1.25em;
	}

	.typing span {
		display: inline-block;
		width: 6px;
		height: 6px;
		background-color: var(--color-text-muted);
		border-radius: 50%;
		--_dur: 1.2s;
		animation: typing-bounce var(--_dur) infinite var(--ease-standard);
	}

	.typing span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.typing span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing-bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
			opacity: 0.4;
		}
		30% {
			transform: translateY(-4px);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.typing span {
			animation: none;
		}
	}
</style>
