<!--
  WorkspaceDetailCard: Compact selected-item detail panel.
  Sits between the hero and the collection grid.
  Only rendered when an item is selected.
  Arc mode supports inline editing of title, description, and arc type.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import type { Arc, Act, Scene, ArcType } from '$lib/db/types.js';
	import type { ChapterWithScenes } from '$modules/outliner/types.js';
	import type { WorkspaceMode } from '../types.js';

	type ArcChanges = Partial<Pick<Arc, 'title' | 'description' | 'arcType'>>;
	type EditableField = 'title' | 'description';

	const ARC_TYPES: { value: ArcType; label: string }[] = [
		{ value: 'character', label: 'Character' },
		{ value: 'plot', label: 'Plot' },
		{ value: 'relationship', label: 'Relationship' },
		{ value: 'thematic', label: 'Thematic' },
		{ value: 'world', label: 'World' },
	];

	let {
		mode,
		item,
		projectId = null,
		sceneCount = 0,
		povCharacterName = null,
		onUpdate,
	}: {
		mode: WorkspaceMode;
		item: Arc | Act | ChapterWithScenes | Scene;
		projectId?: string | null;
		sceneCount?: number;
		povCharacterName?: string | null;
		onUpdate?: (id: string, changes: ArcChanges) => void;
	} = $props();

	let editingField = $state<EditableField | null>(null);
	let editValue = $state('');
	let typePicker = $state(false);

	async function startEdit(field: EditableField) {
		if (mode !== 'arcs') return;
		editingField = field;
		const arc = item as Arc;
		editValue = field === 'title' ? arc.title : (arc.description ?? '');
		await tick();
		const el = document.querySelector<HTMLElement>('.detail-card__edit-active');
		el?.focus();
	}

	function cancelEdit() {
		editingField = null;
		editValue = '';
	}

	function confirmEdit() {
		if (!editingField || !onUpdate) return;
		const trimmed = editValue.trim();
		if (editingField === 'title' && !trimmed) return;
		const changes: ArcChanges = { [editingField]: trimmed };
		editingField = null;
		editValue = '';
		onUpdate(item.id, changes);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
			e.preventDefault();
			confirmEdit();
		} else if (e.key === 'Escape') {
			if (editingField) cancelEdit();
			else if (typePicker) typePicker = false;
		}
	}

	function selectArcType(value: ArcType) {
		typePicker = false;
		onUpdate?.(item.id, { arcType: value });
	}

	const bodyText = $derived.by((): string | null => {
		if (mode === 'arcs') {
			const arc = item as Arc;
			return arc.description || null;
		}
		if (mode === 'acts') {
			const act = item as Act;
			return act.planningNotes || null;
		}
		if (mode === 'chapters') {
			const ch = item as ChapterWithScenes;
			return ch.summary || null;
		}
		if (mode === 'scenes') {
			const sc = item as Scene;
			return sc.summary || null;
		}
		return null;
	});

	const chips = $derived.by((): string[] => {
		const out: string[] = [];
		if (mode === 'acts') {
			out.push(`Act ${(item as Act).order + 1}`);
		}
		if (mode === 'chapters') {
			out.push(`${sceneCount} ${sceneCount === 1 ? 'scene' : 'scenes'}`);
		}
		if (mode === 'scenes') {
			out.push(povCharacterName ? `POV — ${povCharacterName}` : 'POV — Unassigned');
		}
		return out;
	});

	const currentArcType = $derived(mode === 'arcs' ? ((item as Arc).arcType ?? null) : null);
	const currentArcTypeLabel = $derived(
		currentArcType ? (ARC_TYPES.find((t) => t.value === currentArcType)?.label ?? null) : null,
	);
</script>

{#key item.id}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="detail-card" onkeydown={handleKeydown}>
		<div class="detail-card__primary">
			<span class="detail-card__eyebrow">
				{#if mode === 'arcs'}
					Arc {(item as Arc).order + 1}
				{:else}
					{mode.slice(0, -1)}
				{/if}
			</span>

			{#if mode === 'arcs' && editingField === 'title'}
				<input
					class="detail-card__edit-active detail-card__edit-title"
					type="text"
					bind:value={editValue}
					onblur={confirmEdit}
					aria-label="Edit arc title"
				/>
			{:else if mode === 'arcs'}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<h3
					class="detail-card__title detail-card__title--editable"
					onclick={() => startEdit('title')}
					title="Click to edit"
				>
					{item.title}
				</h3>
			{:else}
				<h3 class="detail-card__title">{item.title}</h3>
			{/if}

			{#if mode === 'arcs'}
				<button
					class="detail-card__type-badge"
					class:detail-card__type-badge--set={currentArcType !== null}
					onclick={() => {
						typePicker = !typePicker;
					}}
					aria-label="Set arc type"
					aria-expanded={typePicker}
				>
					{currentArcTypeLabel ?? 'Set type…'}
				</button>
			{/if}

			{#if editingField}
				<div class="detail-card__controls">
					<button
						class="detail-card__ctrl detail-card__ctrl--confirm"
						onclick={confirmEdit}
						aria-label="Save">✓</button
					>
					<button
						class="detail-card__ctrl detail-card__ctrl--cancel"
						onclick={cancelEdit}
						aria-label="Cancel">✕</button
					>
				</div>
			{/if}
		</div>

		<div class="detail-card__secondary">
			{#if mode === 'arcs'}
				{#if editingField === 'description'}
					<textarea
						class="detail-card__edit-active detail-card__edit-description"
						bind:value={editValue}
						onblur={confirmEdit}
						aria-label="Edit arc description"
						placeholder="Describe this arc…"
						rows={4}
					></textarea>
				{:else if bodyText}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<p
						class="detail-card__body detail-card__body--editable"
						onclick={() => startEdit('description')}
						title="Click to edit"
					>
						{bodyText}
					</p>
				{:else if !editingField}
					<button class="detail-card__empty-prompt" onclick={() => startEdit('description')}>
						Add a description for this arc
					</button>
				{/if}
				{#if projectId && !editingField}
					<a class="detail-card__develop-link" href="/projects/{projectId}/arcs/{item.id}"
						>Develop this arc →</a
					>
				{/if}
			{:else}
				{#if bodyText}
					<p class="detail-card__body">{bodyText}</p>
				{/if}
				{#if chips.length > 0}
					<div class="detail-card__chips">
						{#each chips as chip (chip)}
							<span class="detail-card__chip">{chip}</span>
						{/each}
					</div>
				{/if}
			{/if}
		</div>

		{#if typePicker}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="type-picker-backdrop" onclick={() => (typePicker = false)}></div>
			<div class="type-picker" role="dialog" aria-label="Choose arc type">
				<p class="type-picker__label">Arc Type</p>
				<div class="type-picker__pills">
					{#each ARC_TYPES as t (t.value)}
						<button
							class="type-pill"
							class:type-pill--active={currentArcType === t.value}
							onclick={() => selectArcType(t.value)}>{t.label}</button
						>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/key}

<style>
	.detail-card {
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-5) var(--space-8);
		display: flex;
		align-items: flex-start;
		gap: var(--space-8);
		animation: detail-appear var(--duration-enter) var(--ease-decelerate) both;
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
		height: 245px;
		overflow: visible; /* allow picker overlay to escape */
		position: relative;
	}

	@keyframes detail-appear {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ── Primary: eyebrow + title ── */
	.detail-card__primary {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex-shrink: 0;
		min-width: 200px;
		max-width: 320px;
	}

	.detail-card__eyebrow {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.4;
	}

	.detail-card__title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		margin: 0;
	}

	/* ── Secondary: description + chips ── */
	.detail-card__secondary {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-top: 2px; /* subtle optical alignment with title baseline */
	}

	.detail-card__body {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		opacity: 0.7;
	}

	.detail-card__body--editable,
	.detail-card__title--editable {
		cursor: text;
		border-radius: var(--radius-sm);
		transition: background var(--duration-fast) var(--ease-standard);
	}

	.detail-card__body--editable:hover,
	.detail-card__title--editable:hover {
		background: var(--color-surface-glass);
	}

	/* ── Inline edit inputs ── */
	.detail-card__edit-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-tight);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--color-nova-blue);
		outline: none;
		width: 100%;
		padding: 0;
		margin: 0;
	}

	.detail-card__edit-description {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		background: color-mix(in srgb, var(--color-nova-blue) 4%, var(--color-surface-overlay));
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 30%, transparent);
		border-radius: var(--radius-md);
		outline: none;
		resize: none;
		width: 100%;
		padding: var(--space-2) var(--space-3);
		margin: 0;
	}

	/* ── Confirm / Cancel controls ── */
	.detail-card__controls {
		display: flex;
		gap: var(--space-1);
		margin-top: var(--space-1);
	}

	.detail-card__ctrl {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		font-size: 11px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-raised);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;
		transition:
			color var(--duration-fast) var(--ease-standard),
			background var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard);
	}

	.detail-card__ctrl--confirm:hover {
		color: var(--color-success);
		background: color-mix(in srgb, var(--color-success) 10%, var(--color-surface-raised));
		border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
	}

	.detail-card__ctrl--cancel:hover {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, var(--color-surface-raised));
		border-color: color-mix(in srgb, var(--color-error) 30%, transparent);
	}

	/* ── Empty prompt ── */
	.detail-card__empty-prompt {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		opacity: 0.4;
		background: none;
		border: none;
		padding: 0;
		cursor: text;
		text-align: left;
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.detail-card__empty-prompt:hover {
		opacity: 0.7;
	}

	.detail-card__chips {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.detail-card__chip {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		letter-spacing: var(--tracking-wide);
		opacity: 0.55;
	}

	/* ── Arc type badge ── */
	.detail-card__type-badge {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		padding: 3px var(--space-3);
		cursor: pointer;
		width: max-content;
		transition:
			color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			background var(--duration-fast) var(--ease-standard);
	}

	.detail-card__type-badge:hover {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
		background: var(--color-surface-elevated);
	}

	.detail-card__type-badge--set {
		color: var(--color-text-secondary);
		border-color: var(--color-border-default);
	}

	.detail-card__type-badge:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* ── Develop link ── */
	.detail-card__develop-link {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-nova-blue);
		text-decoration: none;
		opacity: 0.7;
		transition: opacity var(--duration-fast) var(--ease-standard);
	}

	.detail-card__develop-link:hover {
		opacity: 1;
	}

	.detail-card__develop-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-xs);
	}

	/* ── Type picker overlay ── */
	.type-picker-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10;
	}

	.type-picker {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 85%;
		min-height: 85%;
		z-index: 11;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-6);
		padding: var(--space-8);
		animation: picker-appear var(--duration-base) var(--ease-decelerate) both;
	}

	@keyframes picker-appear {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}

	.type-picker__label {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.type-picker__pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		justify-content: center;
	}

	.type-pill {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-secondary);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-full);
		padding: var(--space-2) var(--space-5);
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--ease-standard),
			background var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}

	.type-pill:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-overlay);
		border-color: var(--color-border-default);
	}

	.type-pill--active {
		color: var(--color-nova-blue);
		background: color-mix(in srgb, var(--color-nova-blue) 8%, var(--color-surface-raised));
		border-color: color-mix(in srgb, var(--color-nova-blue) 35%, transparent);
		--_shadow: 0 0 0 1px color-mix(in srgb, var(--color-nova-blue) 25%, transparent);
		box-shadow: var(--_shadow);
	}

	.type-pill:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* Responsive: stack on narrow screens */
	@media (max-width: 600px) {
		.detail-card {
			flex-direction: column;
			gap: var(--space-3);
			padding: var(--space-4) var(--space-5);
		}
		.detail-card__primary {
			min-width: unset;
			max-width: unset;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.detail-card {
			animation: none;
		}
		.type-picker {
			animation: none;
		}
	}
</style>
