<script lang="ts">
	import { onMount } from 'svelte';
	import {
		listActions,
		saveBinding,
		resetBinding,
		resetAll,
		loadSavedBindings,
		type ActionEntry,
	} from '$lib/keyboard/index.js';

	/** Action id currently being recorded; null = idle. */
	let recordingId = $state<string | null>(null);
	/** Per-action inline error messages. */
	let conflictError = $state<Record<string, string>>({});
	/** Reactive snapshot of the registry; refreshed after every mutation. */
	let actions = $state<ActionEntry[]>(listActions());

	onMount(async () => {
		await loadSavedBindings();
		actions = listActions();
	});

	/** Convert canonical 'Meta+X' to a platform-appropriate display string. */
	function formatCombo(combo: string): string {
		const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
		return combo.replace('Meta', isMac ? '⌘' : 'Ctrl');
	}

	/**
	 * Build a canonical combo string from a KeyboardEvent.
	 * Returns null when the pressed key is a bare modifier (nothing to capture yet).
	 * Both metaKey (Cmd on macOS) and ctrlKey (Ctrl on Windows/Linux) map to the
	 * canonical 'Meta' prefix, so stored bindings are platform-agnostic.
	 */
	function buildCombo(e: KeyboardEvent): string | null {
		const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift', 'CapsLock', 'Tab']);
		if (MODIFIER_KEYS.has(e.key)) return null;

		const parts: string[] = [];
		if (e.metaKey || e.ctrlKey) parts.push('Meta');
		if (e.altKey) parts.push('Alt');
		if (e.shiftKey) parts.push('Shift');
		parts.push(e.key);
		return parts.join('+');
	}

	function startRecording(actionId: string): void {
		recordingId = actionId;
		conflictError = { ...conflictError, [actionId]: '' };
	}

	function cancelRecording(): void {
		recordingId = null;
	}

	async function handleKeydown(e: KeyboardEvent): Promise<void> {
		if (!recordingId) return;
		e.preventDefault();

		if (e.key === 'Escape') {
			cancelRecording();
			return;
		}

		const combo = buildCombo(e);
		if (!combo) return; // lone modifier key — keep recording

		const currentId = recordingId;
		const result = await saveBinding(currentId, combo);

		if (result.ok) {
			conflictError = { ...conflictError, [currentId]: '' };
			recordingId = null;
			actions = listActions();
		} else {
			const errorMsg =
				result.error === 'denied'
					? `${formatCombo(combo)} is reserved and cannot be assigned.`
					: `${formatCombo(combo)} is already used by another action.`;
			conflictError = { ...conflictError, [currentId]: errorMsg };
		}
	}

	async function handleReset(actionId: string): Promise<void> {
		await resetBinding(actionId);
		actions = listActions();
	}

	async function handleResetAll(): Promise<void> {
		await resetAll();
		actions = listActions();
	}
</script>

<svelte:head>
	<title>Shortcuts — Novellum</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="shortcuts">
	<h1 class="shortcuts__title">Shortcuts</h1>

	<div class="shortcuts__table-wrap">
		<table class="shortcuts__table" role="grid" aria-label="Keyboard shortcuts">
			<thead>
				<tr>
					<th scope="col" class="shortcuts__th">Action</th>
					<th scope="col" class="shortcuts__th">Description</th>
					<th scope="col" class="shortcuts__th">Shortcut</th>
					<th scope="col" class="shortcuts__th shortcuts__th--controls">Controls</th>
				</tr>
			</thead>
			<tbody>
				{#each actions as action (action.id)}
					{@const isRecording = recordingId === action.id}
					{@const error = conflictError[action.id] ?? ''}
					<tr
						class="shortcuts__row"
						class:shortcuts__row--recording={isRecording}
					>
						<td role="gridcell" class="shortcuts__td shortcuts__td--label">
							{action.label}
						</td>
						<td role="gridcell" class="shortcuts__td shortcuts__td--desc">
							{action.description}
						</td>
						<td role="gridcell" class="shortcuts__td shortcuts__td--combo">
							{#if isRecording}
								<span class="shortcuts__recording">Press any key…</span>
								<span class="shortcuts__escape-hint">Esc to cancel</span>
							{:else}
								<kbd class="shortcuts__kbd">{formatCombo(action.current)}</kbd>
							{/if}
							{#if error}
								<span class="shortcuts__error" role="alert">{error}</span>
							{/if}
						</td>
						<td role="gridcell" class="shortcuts__td shortcuts__td--controls">
							{#if isRecording}
								<button
									type="button"
									class="shortcuts__btn shortcuts__btn--cancel"
									onclick={cancelRecording}
								>
									Cancel
								</button>
							{:else}
								<button
									type="button"
									class="shortcuts__btn shortcuts__btn--edit"
									aria-label="Edit shortcut for {action.label}"
									onclick={() => startRecording(action.id)}
								>
									Edit
								</button>
								<button
									type="button"
									class="shortcuts__btn shortcuts__btn--reset"
									aria-label="Reset shortcut for {action.label}"
									onclick={() => handleReset(action.id)}
								>
									Reset
								</button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="shortcuts__footer">
		<button
			type="button"
			class="shortcuts__btn shortcuts__btn--reset-all"
			onclick={handleResetAll}
		>
			Reset all shortcuts
		</button>
	</div>
</div>

<style>
	.shortcuts {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.shortcuts__title {
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
	}

	.shortcuts__table-wrap {
		overflow-x: auto;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
	}

	.shortcuts__table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.shortcuts__th {
		padding: var(--space-3) var(--space-4);
		text-align: left;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-secondary);
		border-bottom: 1px solid var(--color-border-subtle);
		background: var(--color-surface-raised);
	}

	.shortcuts__th--controls {
		text-align: right;
	}

	.shortcuts__row {
		border-bottom: 1px solid var(--color-border-subtle);
		transition: background var(--duration-fast) var(--ease-standard);
	}

	.shortcuts__row:last-child {
		border-bottom: none;
	}

	.shortcuts__row:hover {
		background: color-mix(in srgb, var(--color-surface-overlay) 40%, transparent);
	}

	.shortcuts__row--recording {
		background: color-mix(in srgb, var(--color-accent-primary) 8%, transparent);
	}

	.shortcuts__td {
		padding: var(--space-3) var(--space-4);
		color: var(--color-text-primary);
		vertical-align: middle;
	}

	.shortcuts__td--label {
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
	}

	.shortcuts__td--desc {
		color: var(--color-text-secondary);
	}

	.shortcuts__td--combo {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.shortcuts__td--controls {
		text-align: right;
		white-space: nowrap;
	}

	.shortcuts__kbd {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-primary);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
	}

	.shortcuts__recording {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-accent-primary);
		animation: shortcuts-pulse var(--duration-pulse) var(--ease-editorial) infinite;
	}

	.shortcuts__escape-hint {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
	}

	.shortcuts__error {
		font-size: var(--text-xs);
		color: var(--color-status-error);
	}

	.shortcuts__btn {
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		cursor: pointer;
		transition: background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard);
	}

	.shortcuts__btn--edit,
	.shortcuts__btn--reset {
		color: var(--color-text-secondary);
		background: transparent;
		border-color: var(--color-border-subtle);
	}

	.shortcuts__btn--edit:hover,
	.shortcuts__btn--reset:hover {
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
	}

	.shortcuts__btn--cancel {
		color: var(--color-text-secondary);
		background: transparent;
		border-color: var(--color-border-subtle);
	}

	.shortcuts__btn--cancel:hover {
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
	}

	.shortcuts__btn--reset-all {
		color: var(--color-text-secondary);
		background: transparent;
		border-color: var(--color-border-subtle);
	}

	.shortcuts__btn--reset-all:hover {
		background: var(--color-surface-raised);
		color: var(--color-text-primary);
	}

	.shortcuts__footer {
		display: flex;
		justify-content: flex-end;
	}

	@keyframes shortcuts-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
