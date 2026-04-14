<script lang="ts">
	let { modes, active, onChange } = $props<{
		modes: { key: string; label: string }[];
		active: string;
		onChange: (key: string) => void;
	}>();

	function handleKeydown(e: KeyboardEvent, i: number) {
		if (e.key === 'ArrowLeft' && i > 0) {
			e.preventDefault();
			onChange(modes[i - 1].key);
		} else if (e.key === 'ArrowRight' && i < modes.length - 1) {
			e.preventDefault();
			onChange(modes[i + 1].key);
		}
	}
</script>

<div class="ps-mode-switcher" role="tablist" aria-label="Panel mode">
	{#each modes as mode, i (mode.key)}
		<button
			class="mode-tab"
			class:is-active={active === mode.key}
			role="tab"
			aria-selected={active === mode.key}
			tabindex={active === mode.key ? 0 : -1}
			onclick={() => onChange(mode.key)}
			onkeydown={(e) => handleKeydown(e, i)}>{mode.label}</button
		>
	{/each}
</div>

<style>
	/* ── Track: dark ground surface creates clear contrast inside elevated card ── */
	.ps-mode-switcher {
		display: flex;
		gap: 2px;
		background: var(--color-surface-ground);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: var(--radius-full);
		padding: 3px;
	}

	.mode-tab {
		padding: 5px 14px;
		border-radius: var(--radius-full);
		background: none;
		border: none;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		cursor: pointer;
		white-space: nowrap;
		font-family: inherit;
		transition:
			color var(--duration-base) var(--ease-standard),
			background var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}

	.mode-tab.is-active {
		background: var(--color-surface-elevated);
		color: var(--color-text-primary);
		/* Inset outline + drop shadow to separate active pill from ground track */
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(255, 255, 255, 0.07);
	}

	.mode-tab:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
