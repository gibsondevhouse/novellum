<!--
	plan-023 stage-005 — Nova panel shell.

	Right-side fixed panel anchored to the editor route. Manages its own width
	(drag-to-resize + keyboard + localStorage persistence) and viewport
	compaction. Content is delegated to NovaMessageLog and NovaComposer.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { novaPanel } from '../stores/nova-panel.svelte.js';
	import { novaSession } from '../stores/nova-session.svelte.js';
	import { aiSession } from '../services/ai-session-service.svelte.js';
	import { sendNovaChat } from '../services/chat-service.js';
	import { classifyNovaError } from '../utils/classify-nova-error.js';
	import EmptyStatePanel from '$lib/components/ui/EmptyStatePanel.svelte';
	import ContextDisclosurePill from './ContextDisclosurePill.svelte';
	import NovaMessageLog from './NovaMessageLog.svelte';
	import NovaComposer from './NovaComposer.svelte';

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

	const PANEL_WIDTH_STORAGE_KEY = 'novellum.nova.panel.width';
	const PANEL_DEFAULT_WIDTH = 360;
	const PANEL_MIN_WIDTH = 280;
	const PANEL_MAX_WIDTH = 520;
	const PANEL_CONSTRAINED_WIDTH = 340;
	const PANEL_KEYBOARD_STEP = 16;

	let resizeHandleEl = $state<HTMLButtonElement | null>(null);
	let panelWidth = $state<number>(readStoredPanelWidth());
	let isCompactViewport = $state(false);
	let isResizing = $state(false);

	let activeResizePointerId: number | null = null;
	let resizeStartX = 0;
	let resizeStartWidth = PANEL_DEFAULT_WIDTH;

	const messages = $derived(novaSession.messages);
	const keyConfigured = $derived(aiSession.keyConfigured);
	const aiLoading = $derived(aiSession.loading);
	const aiChecked = $derived(aiSession.checked);
	const hasProjectContext = $derived(Boolean(projectId));
	const panelStatusLabel = $derived.by(() => {
		if (aiLoading) return 'Checking AI configuration';
		if (aiChecked && !keyConfigured) return 'AI key required';
		if (hasProjectContext) return 'Project context attached';
		return 'No project context';
	});
	const starterPrompts = $derived.by(() => {
		if (hasProjectContext) {
			return [
				'Summarize this project premise in one paragraph.',
				'Give me three options for the next scene.',
				'What continuity risks should I watch right now?',
			];
		}
		return [
			'Help me outline a chapter arc.',
			'Give me five plot-twist ideas for a thriller.',
			'How do I raise stakes in my opening scene?',
		];
	});
	const panelViewportState = $derived.by(() => {
		if (isCompactViewport) return 'compact';
		if (panelWidth <= PANEL_CONSTRAINED_WIDTH) return 'constrained';
		return 'desktop';
	});
	const novaError = $derived.by(() => {
		for (let i = novaSession.messages.length - 1; i >= 0; i--) {
			const m = novaSession.messages[i];
			if (m.status === 'error' && m.error) return m.error;
		}
		return null;
	});
	const novaErrorType = $derived(novaError ? classifyNovaError(novaError) : null);

	function queueStarterPrompt(prompt: string): void {
		if (onQuickPrompt) {
			onQuickPrompt(prompt);
			return;
		}
		novaPanel.openWithPrompt(prompt);
	}

	function handleRetry(): void {
		// Pop the failed assistant turn, re-run the AI pipeline against the
		// last user prompt without duplicating it in the message log.
		const lastUser = novaSession.removeFailedAssistantTurn();
		if (!lastUser) return;
		void sendNovaChat({
			prompt: lastUser.content,
			projectId,
			activeSceneId,
			activeChapterId,
			skipUserAppend: true,
		});
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

	// Re-check key status every time the panel transitions to open.
	// Covers the "save key → open Nova" path where mount-time hydrate
	// already ran before the credential existed.
	$effect(() => {
		if (novaPanel.isOpen) {
			void aiSession.hydrate();
		}
	});

	// Push the app shell content column out of the way when the panel is open.
	// AppShell reads --nova-panel-open-offset via padding-right so the main
	// content flexes rather than being overlaid. Compact viewport keeps overlay.
	$effect(() => {
		if (typeof document === 'undefined') return;
		const offset = novaPanel.isOpen && !isCompactViewport ? `${panelWidth}px` : '0px';
		document.documentElement.style.setProperty('--nova-panel-open-offset', offset);
		return () => {
			document.documentElement.style.removeProperty('--nova-panel-open-offset');
		};
	});
</script>

{#if novaPanel.isOpen}
	<aside
		class="nova-panel"
		class:is-resizing={isResizing}
		aria-label="Nova panel"
		data-viewport-state={panelViewportState}
	>
		<button
			bind:this={resizeHandleEl}
			type="button"
			class="nova-resize-handle"
			role="slider"
			aria-orientation="horizontal"
			aria-label="Resize Nova panel"
			aria-valuemin={PANEL_MIN_WIDTH}
			aria-valuemax={PANEL_MAX_WIDTH}
			aria-valuenow={panelWidth}
			aria-valuetext={`${panelWidth}px`}
			disabled={isCompactViewport}
			onpointerdown={beginResize}
			onkeydown={handleResizeHandleKeydown}
		></button>

		<header class="nova-header">
			<div class="nova-header-identity">
				<h2 id="nova-panel-title" class="nova-header-title">Nova</h2>
				<p class="nova-header-status" aria-live="polite">
					<span class="nova-header-status-dot" aria-hidden="true"></span>
					{panelStatusLabel}
				</p>
			</div>
			<button
				type="button"
				class="nova-close"
				aria-label="Close Nova"
				onclick={() => novaPanel.close()}
			>×</button>
		</header>

		{#if keyConfigured}
			<div class="nova-session-tray" aria-label="Context disclosure">
				{#if aiLoading}
					<span class="nova-checking-dot" aria-label="Checking AI configuration…" title="Checking AI configuration…"></span>
				{/if}
				<ContextDisclosurePill />
			</div>
		{/if}

		<div class="nova-body" class:nova-body-empty={messages.length === 0} aria-live="polite">
			{#if aiChecked && !keyConfigured}
				<EmptyStatePanel
					title="No AI key configured"
					description="Add your OpenRouter API key in AI Settings to start using Nova."
				>
					{#snippet actions()}
						<a href="/settings/ai" class="nova-settings-link">Open AI Settings</a>
					{/snippet}
				</EmptyStatePanel>
			{:else}
				{#if messages.length === 0}
					<div class="nova-greeting">
						<p class="nova-greeting-eyebrow">Nova</p>
						<div class="nova-starter-prompts" aria-label="Starter prompts">
							{#each starterPrompts as prompt (prompt)}
								<button
									type="button"
									class="nova-starter-btn"
									onclick={() => queueStarterPrompt(prompt)}
								>
									{prompt}
								</button>
							{/each}
						</div>
					</div>
				{/if}
				{#if messages.length > 0}
					<NovaMessageLog
						{messages}
						{novaError}
						{novaErrorType}
						onRetry={handleRetry}
						{projectId}
					/>
				{/if}
			{/if}
		</div>

		<footer class="nova-footer">
			<NovaComposer {projectId} {activeSceneId} {activeChapterId} />
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
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-ground) 90%, var(--color-surface-overlay)) 0%,
				var(--color-surface-ground) 56%,
				color-mix(in srgb, var(--color-surface-ground) 88%, var(--color-surface-base)) 100%
			);
		border-left: 1px solid color-mix(in srgb, var(--color-brass) 44%, var(--nova-panel-border));
		box-shadow: var(--shadow-nova-panel);
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
		background: var(--color-candle);
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

	.nova-checking-dot {
		display: inline-block;
		width: var(--size-dot-small);
		height: var(--size-dot-small);
		border-radius: 50%;
		background: var(--color-text-muted);
		animation: nova-typing-pulse var(--duration-pulse) infinite var(--ease-editorial);
	}

	.nova-session-tray {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3) var(--space-2);
		background: color-mix(in srgb, var(--color-surface-ground) 86%, var(--color-surface-overlay));
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.nova-panel[data-viewport-state='constrained'] .nova-session-tray,
	.nova-panel[data-viewport-state='compact'] .nova-session-tray {
		flex-wrap: wrap;
	}

	.nova-panel[data-viewport-state='constrained'] .nova-session-tray {
		align-items: flex-start;
		row-gap: var(--space-1);
	}

	.nova-header {
		position: relative;
		flex-shrink: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-ground) 84%, var(--color-surface-overlay));
	}

	.nova-header::after {
		content: '';
		position: absolute;
		left: var(--space-4);
		right: var(--space-4);
		bottom: 0;
		height: 1px;
		background: color-mix(in srgb, var(--color-candle) 22%, transparent);
		opacity: 0.7;
	}

	.nova-header-identity {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.nova-header-title {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		line-height: var(--leading-tight);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.nova-header-status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: var(--leading-tight);
	}

	.nova-header-status-dot {
		width: var(--size-dot-small);
		height: var(--size-dot-small);
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-candle) 78%, var(--color-text-secondary));
		box-shadow: var(--shadow-nova-dot-ring);
	}

	.nova-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--space-7);
		height: var(--space-7);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-surface-overlay) 72%, transparent);
		color: var(--color-text-secondary);
		font-size: var(--text-lg);
		line-height: 1;
		cursor: pointer;
	}

	.nova-close:hover {
		background: var(--color-surface-overlay);
		border-color: var(--color-border-default);
		color: var(--color-text-primary);
	}

	.nova-greeting {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-1);
	}

	.nova-greeting-eyebrow {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.nova-starter-prompts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.nova-starter-btn {
		display: inline-flex;
		padding: 3px var(--space-2);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-ground) 84%, var(--color-surface-overlay));
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		line-height: 1.5;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.nova-starter-btn:hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 78%, var(--color-candle) 22%);
		color: var(--color-text-secondary);
		border-color: color-mix(in srgb, var(--color-candle) 22%, var(--color-border-subtle));
	}

	.nova-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		background: transparent;
	}

	.nova-body.nova-body-empty {
		justify-content: center;
	}

	.nova-panel[data-viewport-state='constrained'] .nova-body,
	.nova-panel[data-viewport-state='constrained'] .nova-footer {
		padding-inline: var(--space-2);
	}

	.nova-panel[data-viewport-state='constrained'] .nova-greeting {
		padding: var(--space-2) var(--space-1);
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

	.nova-footer {
		flex-shrink: 0;
		border-top: 1px solid var(--color-border-subtle);
		padding: var(--space-2) var(--space-3);
		background: color-mix(in srgb, var(--color-surface-ground) 82%, var(--color-surface-overlay));
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
			padding-inline: var(--space-2);
		}

		.nova-greeting {
			padding: var(--space-2) var(--space-1);
		}
	}
</style>
