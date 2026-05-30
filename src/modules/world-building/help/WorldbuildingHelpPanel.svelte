<script lang="ts">
	import type { WorldbuildingHelpSection } from './worldbuilding-help-content.js';

	interface Props {
		sections: readonly WorldbuildingHelpSection[];
	}

	let { sections }: Props = $props();
</script>

<div class="help-panel">
	{#each sections as section (section.id)}
		<div class="help-panel__section">
			<div class="help-panel__section-head">
				<h3 class="help-panel__label">{section.label}</h3>
				<p class="help-panel__tagline">{section.tagline}</p>
			</div>
			<p class="help-panel__meaning">{section.meaning}</p>
			<div class="help-panel__blocks">
				<div class="help-panel__block">
					<h4>Core Questions</h4>
					<ul>
						{#each section.questions as q (q)}
							<li>{q}</li>
						{/each}
					</ul>
				</div>
				<div class="help-panel__block">
					<h4>Common Failure Modes</h4>
					<ul>
						{#each section.pitfalls as p (p)}
							<li>{p}</li>
						{/each}
					</ul>
				</div>
				<div class="help-panel__block">
					<h4>Completion Signals</h4>
					<ul>
						{#each section.signals as s (s)}
							<li>{s}</li>
						{/each}
					</ul>
				</div>
			</div>
			<dl class="help-panel__glossary">
				{#each section.glossary as entry (entry.term)}
					<div>
						<dt>{entry.term}</dt>
						<dd>{entry.meaning}</dd>
					</div>
				{/each}
			</dl>
		</div>
	{/each}
</div>

<style>
	.help-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.help-panel__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-8);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.help-panel__section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.help-panel__section-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.help-panel__label {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.help-panel__tagline {
		margin: 0;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
	}

	.help-panel__meaning {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		max-width: 68ch;
	}

	.help-panel__blocks {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.help-panel__block {
		padding-inline-start: var(--space-3);
		border-left: 1px solid var(--color-border-default);
	}

	.help-panel__block h4 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		font-weight: var(--font-weight-semibold);
	}

	.help-panel__block ul {
		margin: 0;
		padding-inline-start: 1.05rem;
		display: grid;
		gap: var(--space-2);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.help-panel__glossary {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3) var(--space-5);
	}

	.help-panel__glossary div {
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}

	.help-panel__glossary dt {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.help-panel__glossary dd {
		margin: var(--space-1) 0 0;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	@media (max-width: 768px) {
		.help-panel__blocks {
			grid-template-columns: 1fr;
		}

		.help-panel__glossary {
			grid-template-columns: 1fr;
		}
	}
</style>
