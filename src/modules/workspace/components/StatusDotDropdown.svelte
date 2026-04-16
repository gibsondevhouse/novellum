<script lang="ts">
	import type { StatusOption } from '../types.js';

	let { status, statuses, onSelect } = $props<{
		status: string;
		statuses: StatusOption[];
		onSelect: (value: string) => void;
	}>();

	let isOpen = $state(false);
	let dropdownPos = $state({ top: 0, left: 0 });

	function toggle(event: MouseEvent) {
		if (isOpen) {
			isOpen = false;
			return;
		}
		const dot = event.currentTarget as HTMLElement;
		const rect = dot.getBoundingClientRect();
		dropdownPos = { top: rect.top - 4, left: rect.right + 8 };
		isOpen = true;
	}

	function select(value: string) {
		onSelect(value);
		isOpen = false;
	}

	$effect(() => {
		if (!isOpen) return;
		function handleClickOutside(e: MouseEvent) {
			const target = e.target as HTMLElement;
			if (!target.closest('.status-dot-wrapper')) {
				isOpen = false;
			}
		}
		document.addEventListener('click', handleClickOutside, true);
		return () => document.removeEventListener('click', handleClickOutside, true);
	});
</script>

<div class="status-dot-wrapper">
	<button
		class="status-dot"
		data-status={status}
		onclick={toggle}
		title={statuses.find((s: { value: string; label: string }) => s.value === status)?.label ?? status}
		aria-label="Change stage status"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	></button>
	{#if isOpen}
		<ul class="status-dropdown" role="listbox" aria-label="Stage status" style="top:{dropdownPos.top}px;left:{dropdownPos.left}px">
			{#each statuses as opt (opt.value)}
				<li>
					<button
						class="status-option"
						class:active={status === opt.value}
						role="option"
						aria-selected={status === opt.value}
						onclick={() => select(opt.value)}
					>
						<span class="status-dot-preview" data-status={opt.value}></span>
						{opt.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.status-dot-wrapper {
		position: relative;
		flex-shrink: 0;
		margin-top: var(--space-2);
	}

	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: none;
		padding: 0;
		cursor: pointer;
		background: var(--color-text-muted);
		transition: transform var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}

	.status-dot:hover {
		transform: scale(1.3);
	}

	.status-dot:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: 2px;
	}

	.status-dot[data-status="planned"] {
		background: var(--color-text-muted);
	}

	.status-dot[data-status="in_progress"] {
		background: var(--color-nova-blue);
	}

	.status-dot[data-status="completed"] {
		background: var(--color-success);
	}

	.status-dropdown {
		position: fixed;
		list-style: none;
		margin: 0;
		padding: var(--space-1);
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.3));
		z-index: 100;
		min-width: 120px;
		white-space: nowrap;
	}

	.status-option {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background: transparent;
		border: none;
		border-radius: var(--radius-xs, 2px);
		color: var(--color-text-secondary);
		font-family: inherit;
		font-size: var(--text-xs);
		cursor: pointer;
		transition: background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.status-option:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-primary);
	}

	.status-option:focus-visible {
		outline: 2px solid var(--color-border-focus);
		outline-offset: -2px;
	}

	.status-option.active {
		color: var(--color-text-primary);
		font-weight: var(--font-weight-medium);
	}

	.status-dot-preview {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--color-text-muted);
	}

	.status-dot-preview[data-status="planned"] {
		background: var(--color-text-muted);
	}

	.status-dot-preview[data-status="in_progress"] {
		background: var(--color-nova-blue);
	}

	.status-dot-preview[data-status="completed"] {
		background: var(--color-success);
	}
</style>
