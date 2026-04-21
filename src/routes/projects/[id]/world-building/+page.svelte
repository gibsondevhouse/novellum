<script lang="ts">
	import { SectionHeader } from '$lib/components/ui/index.js';

	let { data }: { data: { projectId: string } } = $props();

	const sections = $derived([
		{
			id: 'personae',
			label: 'Personae',
			tagline: 'Who carries the world',
			purpose:
				'All sentient life and social structures in your narrative space, from singular voices to collective identity.',
			meaning:
				'Personae defines agency. If Atlas is terrain and Chronicles is time, Personae is will: who can act, who cannot, and what identity costs them to sustain.',
			questions: [
				'Who has power, and what limits that power?',
				'Which loyalties are inherited, chosen, or imposed?',
				'What contradictions make each group or individual dramatically unstable?',
			],
			pitfalls: [
				'Flat archetypes with no conflicting drives.',
				'Factions that exist only as labels, not pressure systems.',
				'Lineages treated as trivia instead of social consequence.',
			],
			signals: [
				'Every major actor has a desire that collides with another actor.',
				'Group identity changes behavior, stakes, and language on the page.',
				'Backstory explains current decisions rather than decorating them.',
			],
			glossary: [
				{ term: 'Individuals', meaning: 'Specific voices with motive, leverage, and vulnerability.' },
				{ term: 'Factions', meaning: 'Collective actors that institutionalize conflict and belonging.' },
				{ term: 'Lineages', meaning: 'Inherited identity threads that shape status, expectation, and risk.' },
				{ term: 'Notes', meaning: 'Unresolved character ideas parked before canonization.' },
			],
			entryHref: `/projects/${data.projectId}/world-building/characters`,
		},
		{
			id: 'atlas',
			label: 'Atlas',
			tagline: 'Where pressure becomes place',
			purpose:
				'The physical where of your world: geography, material context, and the distances between narrative forces.',
			meaning:
				'Atlas defines constraint. It answers what movement costs, where scarcity concentrates, and how environment selects for behavior long before plot begins.',
			questions: [
				'Which routes create opportunity, and which routes create danger?',
				'What resources are abundant, scarce, forbidden, or sacred?',
				'How does geography force social structure?',
			],
			pitfalls: [
				'Pretty maps with no narrative friction.',
				'Landmarks disconnected from power or memory.',
				'Travel distances that change only for convenience.',
			],
			signals: [
				'Locations produce different choices from the same character.',
				'Setting details alter conflict outcomes, not just atmosphere.',
				'Spatial logic remains coherent across every chapter.',
			],
			glossary: [
				{ term: 'Realms', meaning: 'Macro territories and ecological containers for conflict.' },
				{ term: 'Landmarks', meaning: 'High-impact sites where story pressure concentrates.' },
				{ term: 'Maps', meaning: 'Spatial references that preserve route and distance continuity.' },
				{ term: 'Notes', meaning: 'Unslotted spatial ideas awaiting exact placement.' },
			],
			entryHref: `/projects/${data.projectId}/world-building/locations`,
		},
		{
			id: 'archive',
			label: 'The Archive',
			tagline: 'What memory refuses to lose',
			purpose:
				'The cultural memory core: mythic inheritance, speculative systems, and traditions preserved through displacement.',
			meaning:
				'The Archive defines legitimacy. It explains why people believe what they believe, which systems feel inevitable, and what a society calls true even when it is wrong.',
			questions: [
				'What stories does this world tell to justify itself?',
				'What technologies alter moral boundaries?',
				'Which rituals preserve identity under stress?',
			],
			pitfalls: [
				'Lore dumps detached from character stakes.',
				'Tech concepts with no cultural side effects.',
				'Traditions presented as static, not contested.',
			],
			signals: [
				'Belief and custom materially affect plot outcomes.',
				'Knowledge is unevenly distributed and politically useful.',
				'Contradictory histories can both be meaningful in-scene.',
			],
			glossary: [
				{ term: 'Myths', meaning: 'Narrative frameworks that define identity and destiny.' },
				{ term: 'Technology', meaning: 'Applied systems that reshape daily life and power.' },
				{ term: 'Traditions', meaning: 'Repeated practices that encode shared values.' },
				{ term: 'Notes', meaning: 'Archive fragments pending verification or synthesis.' },
			],
			entryHref: `/projects/${data.projectId}/world-building/lore`,
		},
		{
			id: 'threads',
			label: 'Threads',
			tagline: 'How movement becomes consequence',
			purpose:
				'The connective tissue of narrative motion: causal chains, secondary movement, and the why beneath action.',
			meaning:
				'Threads defines causality. It clarifies not only what happens, but why it had to happen given personalities, systems, and prior events.',
			questions: [
				'Which chain of decisions drives each major turn?',
				'What counter-movements complicate the main arc?',
				'Which motives remain hidden versus declared?',
			],
			pitfalls: [
				'Events linked by chronology but not cause.',
				'Sub-plots that do not alter the main story pressure.',
				'Motivations stated but not evidenced in behavior.',
			],
			signals: [
				'Every major beat has a traceable causal parent.',
				'Secondary arcs sharpen, rather than distract from, theme.',
				'Character choices remain legible even when surprising.',
			],
			glossary: [
				{ term: 'Major Arcs', meaning: 'Primary movement of transformation and consequence.' },
				{ term: 'Sub-plots', meaning: 'Secondary lines that intensify or counterpoint the main movement.' },
				{ term: 'Motivations', meaning: 'Decision logic connecting desire to action.' },
				{ term: 'Notes', meaning: 'Unsorted connective ideas before arc placement.' },
			],
			entryHref: `/projects/${data.projectId}/world-building/plot-threads`,
		},
		{
			id: 'chronicles',
			label: 'Chronicles',
			tagline: 'When history splits and reforms',
			purpose:
				'The temporal where and when: historical strata, canonical events, and divergent personal timelines.',
			meaning:
				'Chronicles defines temporal truth. It keeps continuity coherent when official records, private memory, and lived sequence do not perfectly align.',
			questions: [
				'What changes from one era to the next, and why?',
				'Which events are canonical, disputed, suppressed, or forgotten?',
				'Where do personal timelines diverge from public history?',
			],
			pitfalls: [
				'Ambiguous chronology that forces retroactive patching.',
				'Key events listed without downstream effects.',
				'Character histories that violate established world timing.',
			],
			signals: [
				'Time references stay consistent across scenes and arcs.',
				'Historical events produce durable consequences in the present.',
				'Conflicting records are intentional and narratively useful.',
			],
			glossary: [
				{ term: 'Eras', meaning: 'Temporal containers for macro historical shifts.' },
				{ term: 'Key Events', meaning: 'Turning points that alter systemic trajectories.' },
				{ term: 'Personal Histories', meaning: 'Character timeline layers intersecting canon.' },
				{ term: 'Notes', meaning: 'Loose chronology ideas awaiting timeline anchoring.' },
			],
			entryHref: `/projects/${data.projectId}/world-building/timeline`,
		},
	]);
</script>

<svelte:head>
	<title>World Building — Novellum</title>
</svelte:head>

<div class="worldbuilding-section-view landing-shell">
	<div class="landing-page">
		<section class="hero" aria-labelledby="worldbuilding-hero-title">
			<SectionHeader
				title="World Building"
				description="Build an internal universe with continuity, tension, and memory. Start with a domain below, then drill down into entities and records with intent."
			/>
			<div class="hero-actions" role="navigation" aria-label="Jump to world-building domains">
				{#each sections as section (section.id)}
					<a class="hero-jump" href={`#${section.id}`}>{section.label}</a>
				{/each}
			</div>
		</section>

		<section class="domain-grid" aria-label="World-building domains">
			{#each sections as section (section.id)}
				<article class="domain-tile">
					<div class="domain-tile__top">
						<h2>{section.label}</h2>
						<p>{section.tagline}</p>
					</div>
					<p class="domain-tile__body">{section.purpose}</p>
					<div class="domain-tile__actions">
						<a class="domain-tile__cta" href={section.entryHref}>Open {section.label}</a>
						<a class="domain-tile__jump" href={`#${section.id}`}>Read Guide</a>
					</div>
				</article>
			{/each}
		</section>

		<section class="manifesto" aria-labelledby="manifesto-title">
			<h2 id="manifesto-title">Worldbuilding Orientation</h2>
			<p>
				World building is not inventory. It is a causality framework for meaning. Use this page as
				a reference for semantics first: what each domain is for, what questions it should answer,
				and how to recognize incomplete logic before it leaks into drafting.
			</p>
			<ol class="reading-sequence">
				<li>Establish Personae to define agency and social force.</li>
				<li>Map Atlas so movement, scarcity, and terrain create pressure.</li>
				<li>Codify The Archive to explain legitimacy, belief, and systems.</li>
				<li>Align Threads so events emerge from coherent motivation.</li>
				<li>Lock Chronicles to preserve timeline and continuity truth.</li>
			</ol>
		</section>

		{#each sections as section, i (section.id)}
			<section id={section.id} class="lane" aria-labelledby={`${section.id}-title`}>
				<div class="lane-heading">
					<span class="lane-index">0{i + 1}</span>
					<div>
						<h2 id={`${section.id}-title`}>{section.label}</h2>
						<p class="lane-tagline">{section.tagline}</p>
						<p class="lane-purpose">{section.purpose}</p>
					</div>
				</div>

				<p class="lane-meaning">{section.meaning}</p>

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

				<p class="lane-entry">
					When you are clear on this domain's meaning, continue into
					<a href={section.entryHref}>{section.label}</a>.
				</p>
			</section>
		{/each}
	</div>
</div>

<style>
	.landing-shell {
		position: relative;
		overflow: hidden;
	}

	.landing-shell::before {
		content: '';
		position: absolute;
		inset: -20% -10% auto;
		height: 480px;
		background:
			radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--color-nova-blue) 20%, transparent), transparent 42%),
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

	.hero {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface-overlay) 92%, black 8%);
		border-radius: var(--radius-lg);
	}

	.hero-actions {
		position: sticky;
		top: calc(48px + var(--space-2));
		z-index: 3;
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-base) 88%, transparent);
		backdrop-filter: blur(8px);
	}

	.hero-jump {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-4);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
		background: transparent;
		border: 1px solid var(--color-border-default);
		color: var(--color-text-secondary);
	}

	.hero-jump:hover {
		background: var(--color-surface-overlay);
		border-color: var(--color-border-focus);
		color: var(--color-text-primary);
		text-decoration: none;
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

	.domain-tile__top p {
		margin: var(--space-1) 0 0;
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-widest);
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
		gap: var(--space-3);
		margin-top: auto;
	}

	.domain-tile__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid color-mix(in srgb, var(--color-nova-blue) 45%, var(--color-border-default));
		background: color-mix(in srgb, var(--color-nova-blue) 18%, transparent);
		color: var(--color-text-primary);
		text-decoration: none;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
	}

	.domain-tile__cta:hover,
	.domain-tile__cta:focus-visible {
		outline: none;
		background: color-mix(in srgb, var(--color-nova-blue) 26%, transparent);
		border-color: var(--color-border-focus);
	}

	.domain-tile__jump {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
	}

	.domain-tile__jump:hover,
	.domain-tile__jump:focus-visible {
		color: var(--color-text-primary);
		text-decoration: underline;
		outline: none;
	}

	.manifesto {
		padding: var(--space-8) var(--space-6);
		border-block: 1px solid var(--color-border-default);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.manifesto h2 {
		margin: 0;
		font-size: var(--text-2xl);
	}

	.manifesto p {
		margin: 0;
		max-width: 76ch;
		font-size: var(--text-base);
		color: var(--color-text-secondary);
	}

	.reading-sequence {
		margin: 0;
		padding-inline-start: 1.2rem;
		display: grid;
		gap: var(--space-2);
		color: var(--color-text-secondary);
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
		color: color-mix(in srgb, var(--color-nova-blue) 75%, white 25%);
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
		color: var(--color-nova-blue);
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

		.hero-actions {
			overflow-x: auto;
			flex-wrap: nowrap;
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
