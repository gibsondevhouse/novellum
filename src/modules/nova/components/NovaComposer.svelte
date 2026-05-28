<!--
	Nova chat composer: mode selector, textarea, and
	send / abort controls. Owns its own draft and attachment state; submits via
	sendNovaChat from the chat service.
-->
<script lang="ts">
	import { novaSession } from '../stores/nova-session.svelte.js';
	import { novaPanel } from '../stores/nova-panel.svelte.js';
	import { sendNovaChat } from '../services/chat-service.js';
	import { runAuthorPipelineTask } from '../services/author-pipeline-runner.js';
	import { PIPELINE_TASK_KEYS } from '$lib/ai/pipeline/task-catalog.js';

	type NovaChatMode = 'chat' | 'scribe';

	type ChatModeOption = {
		value: NovaChatMode;
		label: string;
		description: string;
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
			description: 'Structured task mode (currently supports project outline generation).',
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

	const isStreaming = $derived(novaSession.isStreaming);
	const selectedModeMeta = $derived.by(
		() => CHAT_MODE_OPTIONS.find((option) => option.value === selectedMode) ?? CHAT_MODE_OPTIONS[0],
	);
	const composerPlaceholder = $derived.by(() => {
		if (isStreaming) return 'Nova is responding…';
		if (selectedMode === 'chat') return 'Brainstorm, ask questions, or explore story ideas…';
		return 'Ask Scribe to build a project outline…';
	});
	const canSubmit = $derived(draft.trim().length > 0 && !isStreaming);

	$effect(() => {
		const pending = novaPanel.pendingPrompt;
		if (pending !== null) {
			draft = pending;
			novaPanel.clearPendingPrompt();
		}
	});

	function buildModePrompt(rawPrompt: string): string {
		if (selectedMode !== 'scribe') return rawPrompt;
		return `Scribe mode: act as an agentic writing assistant. Be concrete, structured, and action-oriented.\n\n${rawPrompt}`;
	}

	function isOutlineBuildRequest(rawPrompt: string): boolean {
		return (
			/\b(outline|story\s*structure|plot\s*map|chapter\s*plan|chapter\s*outline)\b/i.test(rawPrompt) &&
			/\b(build|create|generate|draft|make|design|plan|structure)\b/i.test(rawPrompt)
		);
	}

	function isScribeConcreteRequest(rawPrompt: string): boolean {
		return /\b(build|create|generate|draft|write|rewrite|revise|edit|analy(?:s|z)e|critique|plan|structure)\b/i.test(
			rawPrompt,
		);
	}

	async function submitDraft() {
		const value = draft.trim();
		if (!value || isStreaming) return;
		draft = '';

		if (selectedMode === 'scribe' && isOutlineBuildRequest(value)) {
			if (!projectId) {
				novaSession.append({ role: 'user', content: buildModePrompt(value), status: 'complete' });
				const errorMessage = novaSession.append({
					role: 'nova',
					content: '',
					status: 'error',
				});
				novaSession.fail(errorMessage.id, 'Open a project before asking Scribe to build an outline.');
				return;
			}

			novaSession.append({ role: 'user', content: buildModePrompt(value), status: 'complete' });
			await runAuthorPipelineTask({
				taskKey: PIPELINE_TASK_KEYS.AUTHOR_OUTLINE,
				projectId,
				activeSceneId,
				activeChapterId,
				instruction: value,
			});
			return;
		}

		if (selectedMode === 'scribe' && isScribeConcreteRequest(value)) {
			novaSession.append({ role: 'user', content: buildModePrompt(value), status: 'complete' });
			novaSession.appendUnsupportedScribeAction(value);
			return;
		}

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
	<div class="nova-composer__shell">
		<div class="nova-composer__toprow">
			<label for="nova-mode-select" class="nova-mode-label">Mode</label>
			<select
				id="nova-mode-select"
				class="nova-mode-select"
				bind:value={selectedMode}
				aria-label="Nova mode"
				title={selectedModeMeta.description}
				disabled={isStreaming}
			>
				{#each CHAT_MODE_OPTIONS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<div class="nova-composer__row">
			<textarea
				class="nova-input"
				bind:value={draft}
				onkeydown={handleKeydown}
				placeholder={composerPlaceholder}
				rows="3"
				aria-label="Ask Nova"
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

		{#if selectedMode === 'scribe'}
			<p class="nova-mode-hint">Scribe currently supports outline generation.</p>
		{/if}
	</div>
</form>

<style>
	.nova-mode-select,
	.nova-action,
	.nova-input {
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard);
	}

	.nova-mode-select:focus-visible,
	.nova-action:focus-visible,
	.nova-input:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nova-action:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.nova-mode-select {
		appearance: none;
		-webkit-appearance: none;
		min-width: 118px;
		height: 30px;
		padding: 0 var(--space-6) 0 var(--space-2);
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
			calc(100% - 12px) 12px,
			calc(100% - 8px) 12px;
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
		gap: var(--space-2);
	}

	.nova-composer__shell {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-2);
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 82%, var(--color-candle) 18%);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-overlay) 92%, var(--color-surface-ground)) 0%,
				color-mix(in srgb, var(--color-surface-ground) 86%, var(--color-surface-base)) 100%
			);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
	}

	.nova-composer__toprow {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.nova-mode-label {
		margin: 0;
		font-size: 11px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.nova-composer__row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		gap: var(--space-2);
	}

	.nova-input {
		width: 100%;
		min-height: 84px;
		max-height: 220px;
		padding: var(--space-2) var(--space-3);
		border: 1px solid color-mix(in srgb, var(--color-border-default) 78%, var(--color-candle) 22%);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-ground) 88%, var(--color-surface-overlay));
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		font-family: inherit;
		resize: none;
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
		width: 40px;
		height: 40px;
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
		box-shadow:
			0 4px 14px rgba(240, 187, 112, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.32);
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
		min-width: 64px;
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

	.nova-mode-hint {
		margin: 0;
		font-size: 11px;
		color: var(--color-text-muted);
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

	@media (max-width: 360px) {
		.nova-composer__toprow {
			flex-wrap: wrap;
		}

		.nova-composer__row {
			grid-template-columns: 1fr auto;
		}
	}
</style>
