<script lang="ts">
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
</script>

<div class="lore-header">
	<div class="header-type-badge">
		<div class="type-badge-placeholder">
			<p class="type-badge-label">{meta?.toUpperCase()}</p>
		</div>
	</div>

	<div class="header-info">
		<div class="identity-quick">
			<h2 class="entry-title">{entry?.title?.trim() || 'New Entry'}</h2>
			<p class="entry-preview">{contentPreview}</p>
		</div>

		<div class="attributes-grid">
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
		</div>
	</div>
</div>

<style>
	.lore-header {
		display: grid;
		grid-template-columns: minmax(180px, 220px) 1fr;
		gap: var(--space-5);
		align-items: start;
		padding-bottom: var(--space-5);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 55%, transparent);
	}

	.header-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.identity-quick {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.entry-title,
	.entry-preview,
	.attribute-value,
	.attribute-label {
		margin: 0;
	}

	.entry-title {
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.entry-preview {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		max-width: 60ch;
		line-height: var(--leading-relaxed);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin: 0;
	}

	.header-type-badge {
		width: 100%;
	}

	.type-badge-placeholder {
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

	.type-badge-label {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2) var(--space-3);
	}

	.attribute-item {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding-bottom: var(--space-1);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent);
	}

	.attribute-label {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.attribute-value {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 860px) {
		.attributes-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.attributes-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
