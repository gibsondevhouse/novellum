<script lang="ts">
	import { WORLDBUILDING_HELP_SECTIONS } from '$modules/world-building/help/worldbuilding-help-content.js';
	import { WorldbuildingHelpDrawer, WorldbuildingReadinessBadge } from '$modules/world-building';
	import { WORLDBUILDING_DOMAIN_SEQUENCE } from '$modules/world-building/worldbuilding-workflow.js';
	import type { WorldbuildingDomainId } from '$modules/world-building/worldbuilding-workflow.js';
	import {
		canGenerateDomain,
		generateDomainWithNova,
	} from '$modules/world-building/worldbuilding-generate-actions.js';
	import { WorldbuildingGenerationStatus } from '$modules/world-building';
	import { evaluateReadiness } from '$modules/world-building/stores/worldbuilding-generation-state.svelte.js';
	import type { DomainCounts } from './+page.js';

	let { data }: { data: { projectId: string; domainCounts: DomainCounts } } = $props();

	let showHelp = $state(false);
	let expandedSection = $state<string | null>(null);
	let activeDomain = $state<WorldbuildingDomainId | null>(null);

	function toggleSection(id: string): void {
		expandedSection = expandedSection === id ? null : id;
	}

	function openHelp(domainId: WorldbuildingDomainId | null = null): void {
		activeDomain = domainId;
		showHelp = true;
	}

	function getBadgeVariant(domainId: WorldbuildingDomainId): 'first' | 'dependent' | 'ready' {
		const config = WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === domainId);
		if (!config) return 'dependent';
		if (config.dependencyIds.length === 0) return 'first';
		const allMet = config.dependencyIds.every((dep) => (data.domainCounts[dep] ?? 0) > 0);
		return allMet ? 'ready' : 'dependent';
	}

	function getDomainCount(domainId: WorldbuildingDomainId): number {
		return data.domainCounts[domainId] ?? 0;
	}

	function getGenerateGuard(domainId: WorldbuildingDomainId) {
		return canGenerateDomain(domainId, {
			projectId: data.projectId,
			domainCounts: data.domainCounts,
		});
	}

	const sections = $derived(
		WORLDBUILDING_HELP_SECTIONS.map((section) => ({
			...section,
			entryHref: `/projects/${data.projectId}/world-building/${
				WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === section.id)?.entryPath ?? section.id
			}`,
		})),
	);

	const helpSections = $derived(
		activeDomain
			? WORLDBUILDING_HELP_SECTIONS.filter((s) => s.id === activeDomain)
			: WORLDBUILDING_HELP_SECTIONS,
	);

	$effect(() => {
		const counts = data.domainCounts;
		for (const domain of WORLDBUILDING_DOMAIN_SEQUENCE) {
			evaluateReadiness(domain.id, counts);
		}
	});
</script>

<svelte:head>
	<title>World Building — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view landing-shell">
	<div class="landing-page">
		<section class="domain-grid" aria-label="World-building domains">
			{#each sections as section (section.id)}
				{@const domainId = section.id as WorldbuildingDomainId}
				{@const guard = getGenerateGuard(domainId)}
				{@const count = getDomainCount(domainId)}
				<article class="domain-tile" id={section.id}>
					<div class="domain-tile__top">
						<div class="domain-tile__title-row">
							<h2>{section.label}</h2>
							<WorldbuildingReadinessBadge
								label={WORLDBUILDING_DOMAIN_SEQUENCE.find((d) => d.id === domainId)?.generationReadiness ?? ''}
								variant={getBadgeVariant(domainId)}
							/>
						</div>
						<p>{section.tagline}</p>
					</div>
					<p class="domain-tile__count">
						{count > 0 ? `${count} record${count === 1 ? '' : 's'}` : 'No records yet'}
					</p>
					<p class="domain-tile__body">{section.purpose}</p>
					<div class="domain-tile__actions">
						<a
							class="domain-tile__action domain-tile__action--open"
							href={section.entryHref}
							aria-label="Open {section.label}"
						>Open</a>
						<button
							type="button"
							class="domain-tile__action domain-tile__action--help"
							aria-label="Help for {section.label}"
							onclick={() => openHelp(domainId)}
						>Help</button>
						<button
							type="button"
							class="domain-tile__action domain-tile__action--generate"
							aria-label="Generate {section.label} with Nova{guard.reason ? ': ' + guard.reason : ''}"
							disabled={!guard.allowed}
							title={guard.reason ?? undefined}
							onclick={() => generateDomainWithNova(data.projectId, domainId)}
						>Generate</button>
					</div>
					<WorldbuildingGenerationStatus domainId={domainId} />
					<button
						type="button"
						class="domain-tile__guide-toggle"
						aria-expanded={expandedSection === section.id}
						onclick={() => toggleSection(section.id)}
					>Guide {expandedSection === section.id ? '↑' : '↓'}</button>
				</article>
			{/each}
		</section>

		<section class="manifesto" aria-labelledby="manifesto-title">
			<div class="manifesto-header">
				<h2 id="manifesto-title">Worldbuilding Orientation</h2>
				<button
					type="button"
					class="help-toggle"
					aria-expanded={showHelp}
					aria-label="Toggle worldbuilding orientation"
					onclick={() => openHelp(null)}
				>?</button>
			</div>
		</section>

		{#each sections as section, i (section.id)}
			<section class="lane" aria-labelledby={`${section.id}-title`}>
				<div class="lane-heading">
					<span class="lane-index">0{i + 1}</span>
					<div>
						<h2 id={`${section.id}-title`}>{section.label}</h2>
						<p class="lane-tagline">{section.tagline}</p>
						<p class="lane-purpose">{section.purpose}</p>
					</div>
				</div>

				<p class="lane-meaning">{section.meaning}</p>

				{#if expandedSection === section.id}
					<div class="lane-grammar" aria-label={`${section.label} interpretation guide`}>
						<div class="guide-block">
							<h3>Core Questions</h3>
							<ul>
								{#each section.questions as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
						<div class="guide-block">
							<h3>Common Failure Modes</h3>
							<ul>
								{#each section.pitfalls as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
						<div class="guide-block">
							<h3>Completion Signals</h3>
							<ul>
								{#each section.signals as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
					</div>

					<dl class="lane-glossary">
						{#each section.glossary as item (item.term)}
							<div>
								<dt>{item.term}</dt>
								<dd>{item.meaning}</dd>
							</div>
						{/each}
					</dl>
				{/if}

				<p class="lane-entry">
					When you are clear on this domain's meaning, continue into
					<a href={section.entryHref}>{section.label}</a>.
				</p>
			</section>
		{/each}
	</div>
</div>

<WorldbuildingHelpDrawer bind:open={showHelp} sections={helpSections} />

<style>
	.landing-shell {
		position: relative;
		overflow-x: clip;
		overflow-y: visible;
	}

	.landing-shell::before {
		content: '';
		position: absolute;
		inset: -20% -10% auto;
		height: 480px;
		background:
			radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--color-candle) 14%, transparent), transparent 42%),
			radial-gradient(circle at 75% 10%, color-mix(in srgb, var(--color-teal) 14%, transparent), transparent 38%);
		pointer-events: none;
	}

	.landing-page {
		position: relative;
		padding: var(--space-8) 0 var(--space-12);
		display: flex;
		flex-direction: column;
		gap: var(--space-10);
		max-width: 1040px;
		margin: 0 auto;
	}

	.domain-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.domain-tile {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		background: linear-gradient(145deg, var(--color-surface-raised) 0%, var(--color-surface-overlay) 100%);
		box-shadow: var(--shadow-xs);
	}

	.domain-tile__top h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
	}

	.domain-tile__title-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.domain-tile__top p {
		margin: var(--space-1) 0 0;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
	}

	.domain-tile__count {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.domain-tile__body {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	.domain-tile__actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: auto;
		flex-wrap: wrap;
	}

	.domain-tile__action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		text-decoration: none;
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.domain-tile__action--open {
		border: 1px solid color-mix(in srgb, var(--color-brass) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-candle) 14%, transparent);
		color: var(--color-text-primary);
	}

	.domain-tile__action--open:hover,
	.domain-tile__action--open:focus-visible {
		outline: none;
		background: color-mix(in srgb, var(--color-candle) 22%, transparent);
		border-color: var(--color-border-focus);
	}

	.domain-tile__action--help {
		border: 1px solid var(--color-border-default);
		background: transparent;
		color: var(--color-text-secondary);
	}

	.domain-tile__action--help:hover,
	.domain-tile__action--help:focus-visible {
		outline: none;
		background: var(--color-surface-overlay);
		color: var(--color-text-primary);
		border-color: var(--color-border-focus);
	}

	.domain-tile__action--generate {
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-nova-blue) 14%, transparent);
		color: var(--color-text-primary);
	}

	.domain-tile__action--generate:hover:not(:disabled),
	.domain-tile__action--generate:focus-visible:not(:disabled) {
		outline: none;
		background: color-mix(in srgb, var(--color-nova-blue) 22%, transparent);
		border-color: var(--color-border-focus);
	}

	.domain-tile__action--generate:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		border-color: var(--color-border-subtle);
		background: transparent;
		color: var(--color-text-muted);
	}

	.domain-tile__guide-toggle {
		display: inline-flex;
		align-items: center;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		gap: var(--space-1);
		align-self: flex-start;
	}

	.domain-tile__guide-toggle:hover {
		color: var(--color-text-secondary);
	}

	.manifesto {
		padding: var(--space-8) var(--space-6);
		border-block: 1px solid var(--color-border-default);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.manifesto-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.help-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--space-6);
		height: var(--space-6);
		border-radius: 50%;
		border: 1px solid var(--color-border-subtle);
		background: transparent;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}

	.help-toggle:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text-secondary);
	}

	.manifesto h2 {
		margin: 0;
		font-size: var(--text-2xl);
	}

	.lane {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		scroll-margin-top: 72px;
		padding: var(--space-7) var(--space-4);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.lane-heading {
		display: grid;
		grid-template-columns: 72px 1fr;
		gap: var(--space-4);
		align-items: start;
}

	.lane-index {
		font-size: var(--text-4xl);
		font-weight: var(--font-weight-semibold);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
		color: var(--color-brass);
	}

	.lane-heading h2 {
		margin: 0;
		font-size: var(--text-2xl);
	}

	.lane-tagline {
		margin: var(--space-1) 0 0;
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
		color: var(--color-text-muted);
	}

	.lane-purpose {
		margin: var(--space-3) 0 0;
		max-width: 72ch;
		color: var(--color-text-secondary);
	}

	.lane-meaning {
		margin: 0;
		max-width: 74ch;
		line-height: var(--leading-relaxed);
	}

	.lane-grammar {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-4);
		align-items: start;
	}

	.guide-block {
		padding-inline-start: var(--space-3);
		border-left: 1px solid var(--color-border-default);
	}

	.guide-block h3 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
	}

	.guide-block ul {
		margin: 0;
		padding-inline-start: 1.05rem;
		display: grid;
		gap: var(--space-2);
		color: var(--color-text-secondary);
	}

	.lane-glossary {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3) var(--space-5);
	}

	.lane-glossary div {
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border-subtle);
	}

	.lane-glossary dt {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
	}

	.lane-glossary dd {
		margin: var(--space-1) 0 0;
		color: var(--color-text-secondary);
	}

	.lane-entry {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.lane-entry a {
		color: var(--color-candle);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.lane-entry a:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.domain-grid {
			grid-template-columns: 1fr;
		}

		.lane-heading {
			grid-template-columns: 1fr;
		}

		.lane-index {
			font-size: var(--text-xl);
		}

		.lane-grammar {
			grid-template-columns: 1fr;
		}

		.lane-glossary {
			grid-template-columns: 1fr;
		}
	}
</style>
