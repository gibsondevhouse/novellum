<script lang="ts">
	import { OpenRouterClient } from '$lib/ai/openrouter.js';
	import { safeHtml } from '$lib/ai/markdown.js';
	import type { AIRequestPayload } from '$lib/ai/types.js';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import type { Project } from '$lib/db/types.js';
	import { apiGet } from '$lib/api-client.js';
	import { getSelectedModel } from '$lib/stores/model-selection.svelte.js';
	import { isExplicitlyUnsupportedBinaryAttachment, isSupportedTextAttachment, NOVA_MAX_FILE_TEXT_CHARS } from '$lib/ai/context-files.js';
	import type { NovaContextResponsePayload, NovaSessionContextItem } from '$modules/ai/types.js';
	import { requestNovaContext, toNovaContextRequestPayload } from '../services/nova-context.js';
	import PromptInput from './PromptInput.svelte';
	import QuickLinks from './QuickLinks.svelte';
	import SuggestionChips from './SuggestionChips.svelte';

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
		{ label: 'Projects', href: '/projects', icon: 'book' as const },
		{ label: 'Images', href: '/images', icon: 'list' as const },
		{ label: 'Settings', href: '/settings', icon: 'settings' as const },
		{ label: 'Styles', href: '/styles', icon: 'code' as const },
	];

	let messages = $state<Message[]>([]);
	let promptValue = $state('');
	let isStreaming = $state(false);
	let sessionContextItems = $state<NovaSessionContextItem[]>([]);
	let contextWarnings = $state<string[]>([]);
	let projectPickerOpen = $state(false);
	let projectPickerLoading = $state(false);
	let projects = $state<Project[]>([]);
	let hasMessages = $derived(messages.length > 0);
	let attachedProjectIds = $derived(
		new Set(
			sessionContextItems
				.filter((item): item is Extract<NovaSessionContextItem, { kind: 'project' }> => item.kind === 'project')
				.map((item) => item.projectId),
		),
	);

	const client = new OpenRouterClient();

	function dedupeWarnings(warnings: string[]): string[] {
		const unique: string[] = [];
		for (const warning of warnings) {
			const trimmed = warning.trim();
			if (!trimmed) continue;
			if (unique.includes(trimmed)) continue;
			unique.push(trimmed);
		}
		return unique.slice(-8);
	}

	function pushWarnings(warnings: string[]): void {
		contextWarnings = dedupeWarnings([...contextWarnings, ...warnings]);
	}

	function removeContextItem(id: string): void {
		sessionContextItems = sessionContextItems.filter((item) => item.id !== id);
	}

	async function handleContextFilesSelected(files: File[]): Promise<void> {
		const nextItems: NovaSessionContextItem[] = [];
		const warnings: string[] = [];

		for (const file of files) {
			if (!isSupportedTextAttachment({ name: file.name, mimeType: file.type })) {
				if (isExplicitlyUnsupportedBinaryAttachment({ name: file.name, mimeType: file.type })) {
					warnings.push(`"${file.name}" is not supported yet. Use text, markdown, JSON, or CSV for now.`);
				} else {
					warnings.push(`"${file.name}" is not a supported text attachment and was skipped.`);
				}
				continue;
			}

			try {
				let text = await file.text();
				if (!text.trim()) {
					warnings.push(`"${file.name}" is empty and was skipped.`);
					continue;
				}
				if (text.length > NOVA_MAX_FILE_TEXT_CHARS) {
					text = text.slice(0, NOVA_MAX_FILE_TEXT_CHARS);
					warnings.push(`"${file.name}" exceeded ${NOVA_MAX_FILE_TEXT_CHARS.toLocaleString()} chars and was clipped.`);
				}

				nextItems.push({
					id: `file:${crypto.randomUUID()}`,
					kind: 'file',
					name: file.name,
					mimeType: file.type || 'text/plain',
					sizeBytes: file.size,
					text,
				});
			} catch {
				warnings.push(`"${file.name}" could not be read and was skipped.`);
			}
		}

		if (nextItems.length > 0) {
			sessionContextItems = [...sessionContextItems, ...nextItems];
		}
		if (warnings.length > 0) {
			pushWarnings(warnings);
		}
	}

	async function openProjectPicker(): Promise<void> {
		projectPickerOpen = true;
		if (projects.length > 0 || projectPickerLoading) return;
		projectPickerLoading = true;
		try {
			projects = await apiGet<Project[]>('/api/db/projects');
		} catch {
			pushWarnings(['Projects could not be loaded right now.']);
		} finally {
			projectPickerLoading = false;
		}
	}

	function closeProjectPicker(): void {
		projectPickerOpen = false;
	}

	function handleProjectPickerBackdropClick(event: MouseEvent): void {
		if (event.target !== event.currentTarget) return;
		closeProjectPicker();
	}

	function handleProjectPickerBackdropKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape') return;
		closeProjectPicker();
	}

	function toggleProjectAttachment(project: Project): void {
		const itemId = `project:${project.id}`;
		const exists = sessionContextItems.some((item) => item.id === itemId);
		if (exists) {
			sessionContextItems = sessionContextItems.filter((item) => item.id !== itemId);
			return;
		}

		sessionContextItems = [
			...sessionContextItems,
			{
				id: itemId,
				kind: 'project',
				projectId: project.id,
				label: project.title,
			},
		];
	}

	async function resolveAttachedContext(userPrompt: string): Promise<NovaContextResponsePayload | null> {
		if (sessionContextItems.length === 0) return null;
		const payload = toNovaContextRequestPayload(sessionContextItems, userPrompt);
		const response = await requestNovaContext(payload);
		if (response.warnings.length > 0) {
			pushWarnings(response.warnings);
		}
		return response;
	}

	async function handleSubmit(text: string) {
		if (!text.trim() || isStreaming) return;

		let contextResponse: NovaContextResponsePayload | null = null;
		if (sessionContextItems.length > 0) {
			try {
				contextResponse = await resolveAttachedContext(text.trim());
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error while assembling context.';
				pushWarnings([`Attached context failed: ${message}`]);
				return;
			}
		}

		const nextConversation = [...messages, { role: 'user', content: text.trim() } as const];
		messages = nextConversation;
		promptValue = '';
		isStreaming = true;
		messages = [...messages, { role: 'assistant', content: '' }];

		const payloadMessages: AIRequestPayload['messages'] = nextConversation
			.map((message) => ({ role: message.role, content: message.content }))
			.filter((message) => message.content);

		if (contextResponse?.contextText) {
			payloadMessages.unshift({
				role: 'system',
				content: `SESSION CONTEXT\n${contextResponse.contextText}`,
			});
		}

		const payload: AIRequestPayload = {
			model: getSelectedModel(),
			messages: payloadMessages,
		};

		try {
			for await (const chunk of client.streamComplete(payload)) {
				// Mutate the last message and trigger reactivity with array reassignment
				messages[messages.length - 1].content += chunk;
				messages = messages;
			}
		} catch (error) {
			console.error('Nova chat error:', error);
			messages[messages.length - 1].content += `\n\n*Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}*`;
			messages = messages;
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
				contextItems={sessionContextItems}
				contextWarnings={contextWarnings}
				onremovecontext={removeContextItem}
				onrequestprojectpicker={openProjectPicker}
				onfilesselected={handleContextFilesSelected}
				onsubmit={handleSubmit}
			/>
		</div>
	{:else}
		<!-- ─── Empty / home state ─── -->
		<div class="home">
			<div class="home__prompt-group">
				<div class="home__intro">
					<p class="home__eyebrow">Prompt Stage</p>
					<h2>What do you need from Nova?</h2>
					<p>Start with a prompt, then keep the conversation focused on one creative problem at a time.</p>
				</div>
				<div class="prompt-shell">
					<PromptInput
						bind:value={promptValue}
						placeholder="Help me write a scene ..."
						disabled={isStreaming}
						contextItems={sessionContextItems}
						contextWarnings={contextWarnings}
						onremovecontext={removeContextItem}
						onrequestprojectpicker={openProjectPicker}
						onfilesselected={handleContextFilesSelected}
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

{#if projectPickerOpen}
	<div
		class="project-picker-backdrop"
		role="presentation"
		tabindex="-1"
		onclick={handleProjectPickerBackdropClick}
		onkeydown={handleProjectPickerBackdropKeydown}
	>
		<div class="project-picker" role="dialog" aria-modal="true" aria-label="Attach projects to this Nova session" tabindex="-1">
			<header class="project-picker__header">
				<div>
					<p class="project-picker__eyebrow">Session Context</p>
					<h3>Add Projects</h3>
					<p>Attach one or more projects for this chat session. Nova will include their current data on each send.</p>
				</div>
				<button type="button" class="project-picker__close" onclick={closeProjectPicker} aria-label="Close project picker">×</button>
			</header>

			<div class="project-picker__body">
				{#if projectPickerLoading}
					<p class="project-picker__status">Loading projects...</p>
				{:else if projects.length === 0}
					<p class="project-picker__status">No projects available yet.</p>
				{:else}
					<ul class="project-picker__list" aria-label="Projects">
						{#each projects as project (project.id)}
							<li>
								<button
									type="button"
									class="project-picker__option"
									class:project-picker__option--attached={attachedProjectIds.has(project.id)}
									onclick={() => toggleProjectAttachment(project)}
								>
									<span class="project-picker__option-title">{project.title}</span>
									<span class="project-picker__option-tag">{attachedProjectIds.has(project.id) ? 'Attached' : 'Attach'}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<footer class="project-picker__footer">
				<p>{attachedProjectIds.size} project{attachedProjectIds.size === 1 ? '' : 's'} attached</p>
				<button type="button" class="project-picker__done" onclick={closeProjectPicker}>Done</button>
			</footer>
		</div>
	</div>
{/if}

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
		padding: min(11vh, 7rem) var(--space-6) 0;
	}

	.home__prompt-group {
		width: 100%;
		max-width: 580px;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.home__intro {
		display: grid;
		gap: var(--space-2);
		text-align: center;
	}

	.home__eyebrow,
	.home__intro h2,
	.home__intro p {
		margin: 0;
	}

	.home__eyebrow {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.home__intro h2 {
		font-size: clamp(1.4rem, 1.6vw + 1rem, 2rem);
	}

	.home__intro p {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	/* ── Outer shell: wraps subcard + chips ── */
	.prompt-shell {
		display: flex;
		flex-direction: column;
		border-radius: 26px;
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 76%, transparent);
		padding: 12px;
		box-shadow: var(--shadow-xs);
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
		background-color: color-mix(in srgb, var(--color-nova-blue) 12%, var(--color-surface-overlay));
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

	:global(.msg__bubble--assistant.surface-card) {
		border-color: var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 82%, transparent);
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

	/* ──────────────────── Project picker ─── */
	.project-picker-backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-5);
		background: color-mix(in srgb, var(--color-surface-base) 55%, transparent);
		backdrop-filter: blur(4px);
		z-index: 60;
	}

	.project-picker {
		width: min(560px, 100%);
		max-height: min(82vh, 680px);
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border-default);
		background: linear-gradient(175deg, var(--color-surface-overlay), var(--color-surface-ground));
		box-shadow: var(--shadow-lg);
	}

	.project-picker__header {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-5);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.project-picker__eyebrow,
	.project-picker__header h3,
	.project-picker__header p {
		margin: 0;
	}

	.project-picker__eyebrow {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.project-picker__header h3 {
		margin-top: var(--space-1);
		font-size: var(--text-xl);
	}

	.project-picker__header p {
		margin-top: var(--space-2);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}

	.project-picker__close {
		width: 30px;
		height: 30px;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-md);
		border: none;
		background: transparent;
		font-size: 1.2rem;
		line-height: 1;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.project-picker__close:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.project-picker__close:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.project-picker__body {
		flex: 1;
		overflow: auto;
		padding: var(--space-4) var(--space-5);
	}

	.project-picker__status {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.project-picker__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-2);
	}

	.project-picker__option {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: 0.65rem 0.8rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-default);
		background: color-mix(in srgb, var(--color-surface-overlay) 60%, transparent);
		text-align: left;
		cursor: pointer;
	}

	.project-picker__option:hover {
		background: var(--color-surface-hover);
	}

	.project-picker__option:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.project-picker__option--attached {
		border-color: color-mix(in srgb, var(--color-nova-blue) 48%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-nova-blue) 10%, var(--color-surface-overlay));
	}

	.project-picker__option-title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.project-picker__option-tag {
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.project-picker__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		border-top: 1px solid var(--color-border-subtle);
	}

	.project-picker__footer p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.project-picker__done {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 65%, transparent);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.project-picker__done:hover {
		background: var(--color-surface-hover);
	}

	.project-picker__done:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
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
