<!--
  StructureCrudCard: Dense utility card for selecting, renaming, or deleting 
  a structural item in the collection zone.
-->
<script lang="ts">
	let {
		id,
		title,
		subtitle = '',
		selected = false,
		onSelect,
		onRename,
		onDelete,
	}: {
		id: string;
		title: string;
		subtitle?: string;
		selected?: boolean;
		onSelect: (id: string) => void;
		onRename: (id: string, newTitle: string) => void;
		onDelete: (id: string) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	function handleSelect() {
		if (!editing) onSelect(id);
	}

	function _startRename(e: MouseEvent) {
		e.stopPropagation();
		editValue = title;
		editing = true;
	}

	function commitRename() {
		const trimmed = editValue.trim();
		if (trimmed && trimmed !== title) {
			onRename(id, trimmed);
		}
		editing = false;
	}

	function cancelRename() {
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitRename();
		else if (e.key === 'Escape') cancelRename();
	}

	function _handleDelete(e: MouseEvent) {
		e.stopPropagation();
		onDelete(id);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="crud-card"
	class:crud-card--selected={selected}
	onclick={handleSelect}
	role="option"
	aria-selected={selected}
	tabindex="0"
>
	<div class="crud-card__cover"></div>
	<div class="crud-card__footer">
		{#if editing}
			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="crud-card__rename-input"
				bind:value={editValue}
				onblur={commitRename}
				onkeydown={handleKeydown}
				autofocus
			/>
		{:else}
			<span class="crud-card__title">{title}</span>
			{#if subtitle}
				<span class="crud-card__subtitle">{subtitle}</span>
			{/if}
		{/if}
	</div>
</div>

<style>
	.crud-card {
		display: flex;
		flex-direction: column;
		aspect-ratio: 2 / 3;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-sans);
		position: relative;
		overflow: hidden;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			background var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}
	.crud-card:hover {
		border-color: var(--color-border-default);
	}
	.crud-card--selected {
		border-color: color-mix(in srgb, var(--color-nova-blue) 40%, transparent);
		background: color-mix(in srgb, var(--color-nova-blue) 6%, var(--color-surface-overlay));
		box-shadow: inset 0 -3px 0 var(--color-nova-blue);
	}
	.crud-card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
	.crud-card--selected:focus-visible {
		box-shadow:
			inset 0 -3px 0 var(--color-nova-blue),
			var(--focus-ring);
	}
	.crud-card__cover {
		flex: 1;
		position: relative;
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		padding: var(--space-2);
	}
	.crud-card__footer {
		padding: var(--space-3) var(--space-3) var(--space-3);
		border-top: 1px solid var(--color-border-subtle);
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-height: 0;
	}
	.crud-card__title {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: var(--leading-tight);
	}
	.crud-card__rename-input {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-nova-blue);
		outline: none;
		width: 100%;
		padding: 0;
		line-height: var(--leading-tight);
	}
	.crud-card__subtitle {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		opacity: 0.55;
	}
</style>
