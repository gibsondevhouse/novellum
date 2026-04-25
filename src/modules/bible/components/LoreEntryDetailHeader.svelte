<script lang="ts">
	import EntityDetailHeader from '$lib/components/ui/EntityDetailHeader.svelte';
	import type { LoreEntry } from '$lib/db/types.js';

	let {
		entry,
		formatMeta,
	}: {
		entry: LoreEntry | null;
		formatMeta?: (entry: LoreEntry) => string;
	} = $props();

	const meta = $derived.by(() => {
		if (!entry) return '';
		return formatMeta?.(entry) ?? entry.category;
	});

	const contentPreview = $derived.by(() => {
		if (!entry?.content) return 'No content yet';
		try {
			const parsed = JSON.parse(entry.content);
			if (typeof parsed === 'object' && parsed !== null) {
				const values = Object.values(parsed)
					.filter((v) => typeof v === 'string' && (v as string).trim())
					.slice(0, 2);
				return values.join(' • ') || 'Content recorded';
			}
		} catch {
			// Content is not JSON
		}
		return entry.content.substring(0, 80).trim() + (entry.content.length > 80 ? '...' : '');
	});

	const categoryLabel = $derived.by(() => entry?.category?.replace(/[:-]/g, ' ').trim() || 'Category pending');

	const statusLabel = $derived.by(() => (entry?.content?.trim() ? 'Drafted' : 'Status pending'));
</script>

<EntityDetailHeader ariaLabel="Lore entry header" attributesColumns={2}>
	{#snippet media()}
		<div class="lore-type-badge">
			<p class="lore-type-badge__label">{meta?.toUpperCase()}</p>
		</div>
	{/snippet}
	{#snippet identity()}
		<p class="dossier-eyebrow">Identity Dossier</p>
		<h2 class="entity-name">{entry?.title?.trim() || 'New Entry'}</h2>
		<div class="role-row">
			<p class="entity-role">{meta?.toLowerCase() || 'Type pending'}</p>
			<span class="role-separator">•</span>
			<p class="entity-role">{statusLabel}</p>
		</div>
		<div class="identity-tags" aria-label="Entry quick tags">
			<span>{categoryLabel}</span>
			<span>{statusLabel}</span>
		</div>
		<p class="entity-summary">{contentPreview}</p>
	{/snippet}
	{#snippet attributes()}
		<div class="attribute-item">
			<span class="attribute-label">Category</span>
			<p class="attribute-value">{entry?.category?.replace(/[:-]/g, ' ').trim() || '—'}</p>
		</div>
		<div class="attribute-item">
			<span class="attribute-label">Status</span>
			<p class="attribute-value">{entry?.content?.trim() ? 'Drafted' : 'Empty'}</p>
		</div>
		{#if entry?.tags && entry.tags.length > 0}
			<div class="attribute-item">
				<span class="attribute-label">Tags</span>
				<p class="attribute-value">{entry.tags.slice(0, 2).join(', ')}</p>
			</div>
		{/if}
	{/snippet}
</EntityDetailHeader>

<style>
	.lore-type-badge {
		width: 100%;
		aspect-ratio: 3 / 2;
		border: 1px solid color-mix(in srgb, var(--color-border-default) 65%, transparent);
		border-radius: var(--radius-lg);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-surface-overlay) 75%, transparent) 0%,
			color-mix(in srgb, var(--color-surface-ground) 90%, transparent) 100%
		);
		display: grid;
		place-items: center;
		color: var(--color-text-secondary);
		overflow: hidden;
	}

	.lore-type-badge__label {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
</style>
