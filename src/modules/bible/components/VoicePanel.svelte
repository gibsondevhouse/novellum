<script lang="ts">
	type VoiceField = 'voiceSummary' | 'speechPattern' | 'phrases' | 'tells' | 'bodyLanguage' | 'dialogueSample';

	type VoiceModel = {
		voiceSummary?: string;
		speechPattern?: string;
		phrases?: string;
		tells?: string;
		bodyLanguage?: string;
		dialogueSample?: string;
		[key: string]: unknown;
	};

	let {
		character,
		onFieldChange,
	}: {
		character: VoiceModel | null;
		onFieldChange: (field: VoiceField, value: string) => void;
	} = $props();

	let isCollapsed = $state(false);
</script>

<section class="dossier-section" aria-labelledby="voice-behavior-title">
	<div class="section-header">
		<h3 id="voice-behavior-title" class="section-title">Voice & Behavior</h3>
		<button type="button" class="collapse-toggle" aria-expanded={!isCollapsed} aria-controls="voice-behavior-content" onclick={() => (isCollapsed = !isCollapsed)}>
			{isCollapsed ? 'Expand' : 'Collapse'}
		</button>
	</div>
	{#if !isCollapsed}
		<div id="voice-behavior-content" class="field-group">
			<div class="field-pair wide">
				<span class="field-label">Voice Summary</span>
				<textarea class="field-value input-inline" rows="2" value={character?.voiceSummary || ''} oninput={(event) => onFieldChange('voiceSummary', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair">
				<span class="field-label">Speech Pattern</span>
				<input class="field-value input-inline" type="text" value={character?.speechPattern || ''} oninput={(event) => onFieldChange('speechPattern', (event.currentTarget as HTMLInputElement).value)} placeholder="—" />
			</div>
			<div class="field-pair">
				<span class="field-label">Common Phrases</span>
				<textarea class="field-value input-inline" rows="2" value={character?.phrases || ''} oninput={(event) => onFieldChange('phrases', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair wide">
				<span class="field-label">Behavioral Tells</span>
				<textarea class="field-value input-inline" rows="2" value={character?.tells || ''} oninput={(event) => onFieldChange('tells', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair wide">
				<span class="field-label">Body Language</span>
				<textarea class="field-value input-inline" rows="2" value={character?.bodyLanguage || ''} oninput={(event) => onFieldChange('bodyLanguage', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="—"></textarea>
			</div>
			<div class="field-pair wide">
				<span class="field-label">Dialogue Sample</span>
				<textarea class="dialogue-sample input-inline" rows="4" value={character?.dialogueSample || ''} oninput={(event) => onFieldChange('dialogueSample', (event.currentTarget as HTMLTextAreaElement).value)} placeholder="No sample recorded yet."></textarea>
			</div>
		</div>
	{/if}
</section>

<style>
	.dossier-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid color-mix(in srgb, var(--color-border-subtle) 65%, transparent);
	}

	.section-title {
		margin: 0;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
	}

	.collapse-toggle {
		border: 1px solid color-mix(in srgb, var(--color-border-subtle) 70%, transparent);
		background: transparent;
		color: var(--color-text-muted);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		cursor: pointer;
	}

	.field-group {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4) var(--space-5);
	}

	.field-pair {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field-pair.wide {
		grid-column: 1 / -1;
	}

	.field-label {
		font-size: var(--text-xs);
		letter-spacing: 0.03em;
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.field-value {
		font-size: var(--text-sm);
		color: var(--color-text-primary);
		line-height: var(--leading-relaxed);
	}

	.dialogue-sample {
		margin: 0;
		padding: var(--space-3) var(--space-3);
		font-size: var(--text-sm);
		font-style: italic;
		line-height: var(--leading-relaxed);
		background: color-mix(in srgb, var(--color-surface-overlay) 38%, transparent);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		border-left: 2px solid color-mix(in srgb, var(--color-nova-blue) 38%, transparent);
		resize: vertical;
	}

	.input-inline {
		width: 100%;
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		padding: 0.2rem 0.25rem;
		border-radius: var(--radius-sm);
	}

	.input-inline:hover {
		border-color: color-mix(in srgb, var(--color-border-subtle) 75%, transparent);
	}

	.input-inline:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-surface-overlay) 35%, transparent);
	}

	@media (max-width: 768px) {
		.field-group {
			grid-template-columns: 1fr;
		}

		.field-pair.wide {
			grid-column: 1;
		}
	}
</style>
