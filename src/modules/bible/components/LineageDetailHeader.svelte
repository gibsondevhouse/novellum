<script lang="ts">
	type LineageHeaderField =
		| 'name'
		| 'lineageType'
		| 'summary'
		| 'origin'
		| 'eraAge'
		| 'regionHomeland'
		| 'currentStatus';

	type LineageHeaderModel = {
		name?: string;
		lineageType?: string;
		summary?: string;
		photoUrl?: string;
		origin?: string;
		eraAge?: string;
		regionHomeland?: string;
		currentStatus?: string;
	};

	let {
		lineage,
		onFieldChange,
		onPhotoUpload,
	}: {
		lineage: LineageHeaderModel | null;
		onFieldChange: (field: LineageHeaderField, value: string) => void;
		onPhotoUpload?: (file: File) => void | Promise<void>;
	} = $props();

	async function handleImageChange(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		await onPhotoUpload?.(file);
		input.value = '';
	}
</script>

<div class="lineage-header">
	<div class="header-photo">
		<div class="photo-placeholder">
			{#if lineage?.photoUrl?.trim()}
				<img class="photo-image" src={lineage.photoUrl} alt="Crest for {lineage.name || 'lineage'}" />
			{:else}
				<svg viewBox="0 0 300 200" aria-hidden="true">
					<rect width="300" height="200" fill="currentColor" opacity="0.05" />
					<text x="150" y="100" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="currentColor" opacity="0.3">Crest</text>
				</svg>
			{/if}
		</div>
		<label class="upload-photo-btn">
			<span>Upload Sigil</span>
			<input type="file" accept="image/*" onchange={handleImageChange} />
		</label>
	</div>

	<div class="header-info">
		<div class="identity-quick">
			<input class="lineage-name input-inline" type="text" value={lineage?.name || ''} oninput={(e) => onFieldChange('name', (e.currentTarget as HTMLInputElement).value)} placeholder="Unnamed Lineage" />
			<input class="lineage-type input-inline" type="text" value={lineage?.lineageType || ''} oninput={(e) => onFieldChange('lineageType', (e.currentTarget as HTMLInputElement).value)} placeholder="Lineage Type" />
			<textarea class="lineage-summary input-inline" rows="2" value={lineage?.summary || ''} oninput={(e) => onFieldChange('summary', (e.currentTarget as HTMLTextAreaElement).value)} placeholder="Lineage records track inherited identity, legacy, and ancestral continuity."></textarea>
		</div>

		<div class="attributes-grid">
			<div class="attribute-item"><span class="attribute-label">Origin</span><input class="attribute-value input-inline" type="text" value={lineage?.origin || ''} oninput={(e) => onFieldChange('origin', (e.currentTarget as HTMLInputElement).value)} placeholder="-" /></div>
			<div class="attribute-item"><span class="attribute-label">Era / Age</span><input class="attribute-value input-inline" type="text" value={lineage?.eraAge || ''} oninput={(e) => onFieldChange('eraAge', (e.currentTarget as HTMLInputElement).value)} placeholder="-" /></div>
			<div class="attribute-item"><span class="attribute-label">Region / Homeland</span><input class="attribute-value input-inline" type="text" value={lineage?.regionHomeland || ''} oninput={(e) => onFieldChange('regionHomeland', (e.currentTarget as HTMLInputElement).value)} placeholder="-" /></div>
			<div class="attribute-item"><span class="attribute-label">Current Status</span><input class="attribute-value input-inline" type="text" value={lineage?.currentStatus || ''} oninput={(e) => onFieldChange('currentStatus', (e.currentTarget as HTMLInputElement).value)} placeholder="-" /></div>
		</div>
	</div>
</div>

<style>
	.lineage-header { display: grid; grid-template-columns: minmax(220px, 260px) 1fr; gap: var(--space-5); align-items: start; padding-bottom: var(--space-5); border-bottom: 1px solid color-mix(in srgb, var(--color-border-default) 55%, transparent); }
	.photo-placeholder { width: 100%; aspect-ratio: 3 / 2; border: 1px solid color-mix(in srgb, var(--color-border-default) 65%, transparent); border-radius: var(--radius-lg); background: linear-gradient(180deg, color-mix(in srgb, var(--color-surface-overlay) 75%, transparent) 0%, color-mix(in srgb, var(--color-surface-ground) 90%, transparent) 100%); overflow: hidden; }
	.photo-placeholder svg,.photo-image { width: 100%; height: 100%; display: block; }
	.photo-image { object-fit: cover; }
	.upload-photo-btn { margin-top: var(--space-2); display: inline-flex; align-items: center; justify-content: center; border: 1px solid color-mix(in srgb, var(--color-border-default) 82%, transparent); border-radius: var(--radius-md); padding: 0.45rem 0.7rem; font-size: var(--text-xs); font-weight: var(--font-weight-semibold); letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-muted); background: color-mix(in srgb, var(--color-surface-overlay) 30%, transparent); cursor: pointer; }
	.upload-photo-btn input { display: none; }
	.header-info,.identity-quick { display: flex; flex-direction: column; gap: var(--space-2); }
	.header-info { gap: var(--space-4); }
	.lineage-name { font-size: var(--text-xl); font-weight: var(--font-weight-semibold); }
	.lineage-type { font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); font-weight: var(--font-weight-semibold); }
	.attributes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2) var(--space-3); }
	.attribute-item { display: flex; flex-direction: column; gap: 0.35rem; padding-bottom: var(--space-1); border-bottom: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent); }
	.attribute-label { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); font-weight: var(--font-weight-semibold); }
	.input-inline { width: 100%; border: 1px solid transparent; background: transparent; color: inherit; padding: 0.15rem 0.2rem; border-radius: var(--radius-sm); }
	.input-inline:hover { border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent); }
	.input-inline:focus { outline: none; border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default)); background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent); }
	@media (max-width: 1024px) { .lineage-header { grid-template-columns: 1fr; } }
</style>
