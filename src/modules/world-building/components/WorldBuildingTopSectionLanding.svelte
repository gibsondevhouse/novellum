<script lang="ts">
	import { translator } from '$lib/i18n';
	import { SectionHeader } from '$lib/components/ui/index.js';
	import WorldBuildingSubheaderNav from '$modules/bible/components/WorldBuildingSubheaderNav.svelte';
	import type { WorldBuildingTopSectionId } from '$modules/bible/worldbuilding-navigation.js';

	type LandingLink = {
		id: string;
		label: string;
		tagline: string;
		description: string;
		href: string;
	};

	let {
		projectId,
		topSection,
		ariaLabel,
		title,
		description,
		orientationTitle,
		orientation,
		links,
	}: {
		projectId: string;
		topSection: WorldBuildingTopSectionId;
		ariaLabel: string;
		title: string;
		description: string;
		orientationTitle: string;
		orientation: string;
		links: LandingLink[];
	} = $props();
</script>

<div class="worldbuilding-section-view landing-shell">
	<WorldBuildingSubheaderNav
		{projectId}
		{topSection}
		activeId="overview"
		{ariaLabel}
	/>

	<div class="landing-page">
		<section class="hero" aria-labelledby="top-section-hero-title">
			<SectionHeader title={title} {description} />
			<div
				class="hero-actions"
				role="navigation"
				aria-label={$translator('worldbuilding.landing.jumpNavAria')}
			>
				{#each links as link (link.id)}
					<a class="hero-jump" href={`#${link.id}`}>{link.label}</a>
				{/each}
			</div>
		</section>

		<section class="manifesto" aria-labelledby="orientation-title">
			<h2 id="orientation-title">{orientationTitle}</h2>
			<p>{orientation}</p>
		</section>

		{#each links as link, index (link.id)}
			<section id={link.id} class="lane" aria-labelledby={`${link.id}-title`}>
				<div class="lane-heading">
					<span class="lane-index">0{index + 1}</span>
					<div>
						<h2 id={`${link.id}-title`}>{link.label}</h2>
						<p class="lane-tagline">{link.tagline}</p>
						<p class="lane-description">{link.description}</p>
					</div>
				</div>

				<p class="lane-entry">
					{$translator('worldbuilding.landing.continueInto')} <a href={link.href}
						>{link.label}</a
					>.
				</p>

				<div class="lane-actions">
					<a class="lane-cta" href={link.href}>{$translator('worldbuilding.landing.open')} {link.label}</a>
				</div>
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
		height: 420px;
		background:
			radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--color-nova-blue) 15%, transparent), transparent 40%),
			radial-gradient(circle at 75% 10%, color-mix(in srgb, var(--color-teal) 12%, transparent), transparent 36%);
		pointer-events: none;
	}

	.landing-page {
		position: relative;
		padding: var(--space-6) 0 var(--space-10);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
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
		z-index: 4;
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		padding: var(--space-3);
		border: 1px solid var(--color-border-default);
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--color-surface-base) 88%, transparent);
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

	.manifesto {
		padding: var(--space-7) var(--space-6);
		border-block: 1px solid var(--color-border-default);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
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

	.lane {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		scroll-margin-top: 72px;
		padding: var(--space-6) var(--space-4);
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

	.lane-description {
		margin: var(--space-2) 0 0;
		max-width: 72ch;
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

	.lane-actions {
		display: flex;
		justify-content: flex-start;
	}

	.lane-cta {
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

	.lane-cta:hover,
	.lane-cta:focus-visible {
		outline: none;
		background: color-mix(in srgb, var(--color-nova-blue) 26%, transparent);
		border-color: var(--color-border-focus);
	}

	@media (max-width: 768px) {
		.lane-heading {
			grid-template-columns: 1fr;
		}

		.lane-index {
			font-size: var(--text-xl);
		}
	}
</style>
