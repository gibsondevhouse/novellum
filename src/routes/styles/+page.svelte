<script lang="ts">
	import {
		Button,
		EditorialEyebrow,
		Logline,
		Ornament,
		DropCap,
		Input,
		PillToolbar,
		Stepper,
		type PillToolbarItem,
	} from '$lib/components/ui/index.js';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { toast } from '$lib/stores/toast.svelte.js';

	const surfaceTokens = [
		'--color-surface-base',
		'--color-surface-ground',
		'--color-surface-raised',
		'--color-surface-overlay',
		'--color-surface-elevated',
	] as const;

	const editorialTokens = [
		'--color-candle',
		'--color-candle-dim',
		'--color-candle-deep',
		'--color-brass',
		'--color-ember',
		'--color-parchment',
		'--color-parchment-edge',
		'--color-parchment-deep',
		'--color-ink',
		'--color-ink-soft',
		'--color-ink-mute',
	] as const;

	const typeSamples = [
		{
			label: 'Inter — --font-sans',
			font: 'var(--font-sans)',
			sample: 'Narrative workspace chrome, labels, chips, and controls.',
		},
		{
			label: 'DM Serif Display — --font-display',
			font: 'var(--font-display)',
			sample: 'A Chronicle in Candlelight',
		},
		{
			label: 'Crimson Pro — --font-prose',
			font: 'var(--font-prose)',
			sample:
				'The vellum breathed beneath her hand as though the page remembered every draft it had survived.',
		},
	] as const;

	let toolbarBold = $state(true);
	let toolbarItalic = $state(false);
	let toolbarAlign = $state<'left' | 'center' | 'justify'>('left');
	let inputValue = $state('Chapter Seven: Lanterns at the quay');

	const toolbarItems = $derived.by(
		(): PillToolbarItem[] => [
			{
				kind: 'button',
				id: 'bold',
				label: 'Bold',
				icon: 'B',
				pressed: toolbarBold,
				onSelect: () => {
					toolbarBold = !toolbarBold;
				},
			},
			{
				kind: 'button',
				id: 'italic',
				label: 'Italic',
				icon: 'I',
				pressed: toolbarItalic,
				onSelect: () => {
					toolbarItalic = !toolbarItalic;
				},
			},
			{ kind: 'divider', id: 'd-1' },
			{
				kind: 'menu',
				id: 'align',
				label: 'Alignment',
				icon: '≡',
				items: [
					{
						id: 'align-left',
						label: 'Align left',
						pressed: toolbarAlign === 'left',
						onSelect: () => {
							toolbarAlign = 'left';
						},
					},
					{
						id: 'align-center',
						label: 'Align center',
						pressed: toolbarAlign === 'center',
						onSelect: () => {
							toolbarAlign = 'center';
						},
					},
					{
						id: 'align-justify',
						label: 'Align justify',
						pressed: toolbarAlign === 'justify',
						onSelect: () => {
							toolbarAlign = 'justify';
						},
					},
				],
			},
		],
	);
</script>

<svelte:head>
	<title>Styles Showcase — Novellum</title>
</svelte:head>

<main class="styles-showcase">
	<header class="showcase-hero">
		<EditorialEyebrow>Design System Reference</EditorialEyebrow>
		<h1>Novellum v2 Surfaces, Tokens, and Primitives</h1>
		<Logline>
			Single-page reference for the warm umber chrome, editorial palette,
			typographic stack, and immersive Page / Muse / Room anatomy.
		</Logline>
	</header>

	<section class="showcase-section">
		<div class="section-head">
			<EditorialEyebrow>Surface Palette</EditorialEyebrow>
			<h2>Core surface hierarchy</h2>
		</div>
		<div class="swatch-grid">
			{#each surfaceTokens as token (token)}
				<article class="token-card">
					<div class="token-chip" style={`--chip: var(${token})`} aria-hidden="true"></div>
					<p class="token-name">{token}</p>
				</article>
			{/each}
		</div>
	</section>

	<section class="showcase-section">
		<div class="section-head">
			<EditorialEyebrow>Editorial Palette</EditorialEyebrow>
			<h2>Candle, brass, parchment, and ink</h2>
		</div>
		<div class="swatch-grid swatch-grid--editorial">
			{#each editorialTokens as token (token)}
				<article class="token-card">
					<div class="token-chip" style={`--chip: var(${token})`} aria-hidden="true"></div>
					<p class="token-name">{token}</p>
				</article>
			{/each}
		</div>
		<div class="alias-note" role="note">
			<div class="alias-pair">
				<span class="token-chip" style="--chip: var(--color-nova-blue)" aria-hidden="true"></span>
				<span class="token-chip" style="--chip: var(--color-candle)" aria-hidden="true"></span>
			</div>
			<p>
				Legacy alias: <code>--color-nova-blue</code> currently resolves to
				<code>var(--color-candle)</code> for backwards compatibility.
			</p>
		</div>
	</section>

	<section class="showcase-section">
		<div class="section-head">
			<EditorialEyebrow>Type Stack</EditorialEyebrow>
			<h2>Canonical typography families</h2>
		</div>
		<div class="type-stack">
			{#each typeSamples as sample (sample.label)}
				<article class="type-card">
					<p class="type-label">{sample.label}</p>
					<p class="type-sample" style={`font-family: ${sample.font};`}>{sample.sample}</p>
				</article>
			{/each}
		</div>
	</section>

	<section class="showcase-section">
		<div class="section-head">
			<EditorialEyebrow>Primitives</EditorialEyebrow>
			<h2>Reusable UI building blocks</h2>
		</div>
		<div class="primitive-grid">
			<article class="primitive-card">
				<EditorialEyebrow>Editorial primitives</EditorialEyebrow>
				<Ornament />
				<p class="dropcap-demo"><DropCap letter="I" />n dusk and vellum, the line between memory and manuscript narrows.</p>
			</article>

			<article class="primitive-card">
				<EditorialEyebrow>Button variants</EditorialEyebrow>
				<div class="button-row">
					<Button>Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
				</div>
			</article>

			<article class="primitive-card">
				<EditorialEyebrow>Input</EditorialEyebrow>
				<Input id="showcase-input" label="Scene title" bind:value={inputValue} />
			</article>

			<article class="primitive-card">
				<EditorialEyebrow>PillToolbar</EditorialEyebrow>
				<PillToolbar items={toolbarItems} ariaLabel="Showcase toolbar" density="comfortable" />
			</article>

			<article class="primitive-card">
				<EditorialEyebrow>Stepper</EditorialEyebrow>
				<Stepper steps={5} current={2} />
			</article>

			<article class="primitive-card">
				<EditorialEyebrow>ToastContainer</EditorialEyebrow>
				<div class="button-row">
					<Button variant="outline" onclick={() => toast('Draft saved.', 'success')}>Success toast</Button>
					<Button variant="outline" onclick={() => toast('Context mismatch detected.', 'error')}>Error toast</Button>
				</div>
			</article>
		</div>
	</section>

	<section class="showcase-section">
		<div class="section-head">
			<EditorialEyebrow>Chrome Reference</EditorialEyebrow>
			<h2>Sidebar and header geometry</h2>
		</div>
		<div class="chrome-preview" aria-label="App chrome reference">
			<div class="chrome-sidebar chrome-sidebar--expanded"><span>208px</span></div>
			<div class="chrome-sidebar chrome-sidebar--collapsed"><span>56px</span></div>
			<div class="chrome-header">
				<div class="header-eyebrow">Narrative View</div>
				<div class="header-title">The Lantern Archive</div>
				<div class="header-breath" aria-hidden="true"></div>
			</div>
		</div>
	</section>

	<section class="showcase-section">
		<div class="section-head">
			<EditorialEyebrow>Immersive Surfaces</EditorialEyebrow>
			<h2>Page, Muse, and Room previews</h2>
		</div>
		<div class="immersive-grid">
			<article class="surface-card page-card">
				<EditorialEyebrow>Page</EditorialEyebrow>
				<p><DropCap letter="W" />here the margins glow warm and every line sits on parchment with Crimson Pro prose.</p>
			</article>

			<article class="surface-card muse-card">
				<EditorialEyebrow>Muse</EditorialEyebrow>
				<p>Right-edge marginalia with brass border-left and candle resize handle.</p>
				<span class="muse-handle" aria-hidden="true"></span>
			</article>

			<article class="surface-card room-card">
				<EditorialEyebrow>Room</EditorialEyebrow>
				<div class="room-spread" aria-hidden="true">
					<div class="room-page"></div>
					<div class="room-page"></div>
				</div>
				<p>Two-page spread with ornament rhythm, drop-cap cadence, ember ribbon, and folio voice.</p>
			</article>
		</div>
	</section>
</main>

<ToastContainer />

<style>
	.styles-showcase {
		--panel: color-mix(in srgb, var(--color-surface-raised) 75%, var(--color-surface-ground));
		max-width: 1120px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4) var(--space-16);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.showcase-hero {
		padding: var(--space-6);
		border: 1px solid color-mix(in srgb, var(--color-brass) 26%, var(--color-border-default));
		border-radius: var(--radius-xl);
		background:
			radial-gradient(circle at 80% -10%, color-mix(in srgb, var(--color-candle) 18%, transparent), transparent 62%),
			linear-gradient(180deg, color-mix(in srgb, var(--color-surface-overlay) 92%, var(--color-surface-ground)), var(--panel));
		box-shadow: var(--shadow-md);
	}

	.showcase-hero h1 {
		margin: var(--space-3) 0 var(--space-4);
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 2.8vw, 2.8rem);
		line-height: 1.1;
		font-weight: var(--font-weight-normal);
		color: var(--color-candle);
	}

	.showcase-section {
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: var(--panel);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.section-head h2 {
		margin: var(--space-2) 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2vw, 1.9rem);
		font-weight: var(--font-weight-normal);
		color: var(--color-text-primary);
	}

	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-3);
	}

	.swatch-grid--editorial {
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	}

	.token-card {
		padding: var(--space-3);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 62%, transparent);
		display: grid;
		gap: var(--space-2);
	}

	.token-chip {
		width: 100%;
		height: 56px;
		border-radius: var(--radius-sm);
		background: var(--chip);
		border: 1px solid color-mix(in srgb, var(--chip) 35%, var(--color-border-default));
	}

	.token-name {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}

	.alias-note {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-ground) 85%, transparent);
		border: 1px solid var(--color-border-subtle);
	}

	.alias-note p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.alias-note code {
		font-family: var(--font-mono);
		font-size: 0.78rem;
	}

	.alias-pair {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.alias-pair .token-chip {
		width: 36px;
		height: 36px;
	}

	.type-stack {
		display: grid;
		gap: var(--space-3);
	}

	.type-card {
		padding: var(--space-4);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 62%, transparent);
	}

	.type-label {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.type-sample {
		margin: 0;
		font-size: clamp(1rem, 1.7vw, 1.3rem);
		line-height: 1.45;
	}

	.primitive-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-3);
	}

	.primitive-card {
		padding: var(--space-4);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-surface-overlay) 64%, transparent);
		display: grid;
		gap: var(--space-3);
	}

	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.dropcap-demo {
		margin: 0;
		font-family: var(--font-prose);
		line-height: 1.6;
		color: var(--color-text-secondary);
	}

	.chrome-preview {
		display: grid;
		grid-template-columns: 208px 56px 1fr;
		min-height: 190px;
		overflow: hidden;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-default);
		background: var(--color-surface-base);
	}

	.chrome-sidebar {
		display: flex;
		align-items: flex-end;
		padding: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		background: linear-gradient(180deg, var(--color-surface-ground), color-mix(in srgb, var(--color-surface-ground) 84%, black));
		border-right: 1px solid color-mix(in srgb, var(--color-brass) 28%, var(--color-border-default));
	}

	.chrome-sidebar--collapsed {
		justify-content: center;
	}

	.chrome-header {
		padding: var(--space-3) var(--space-4);
		display: grid;
		grid-template-rows: auto auto 1fr;
		gap: var(--space-1);
		background: linear-gradient(180deg, color-mix(in srgb, var(--color-surface-overlay) 85%, black), transparent 70%);
	}

	.header-eyebrow {
		font-size: 9px;
		letter-spacing: 0.18em;
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		color: var(--color-brass);
	}

	.header-title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--color-text-primary);
	}

	.header-breath {
		margin-top: var(--space-2);
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--mood-accent) 40%, var(--color-candle)),
			transparent
		);
	}

	.immersive-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-3);
	}

	.surface-card {
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-subtle);
		display: grid;
		gap: var(--space-3);
		position: relative;
	}

	.page-card {
		background: linear-gradient(180deg, var(--color-parchment), var(--color-parchment-edge));
		color: var(--color-ink-soft);
	}

	.page-card :global(.editorial-eyebrow) {
		color: color-mix(in srgb, var(--color-brass) 78%, var(--color-ink-soft));
	}

	.page-card p {
		margin: 0;
		font-family: var(--font-prose);
		line-height: 1.6;
	}

	.muse-card {
		background: linear-gradient(180deg, var(--color-surface-overlay), var(--color-surface-ground));
		border-left: 2px solid color-mix(in srgb, var(--color-brass) 44%, transparent);
	}

	.muse-card p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	.muse-handle {
		position: absolute;
		left: -5px;
		top: 46%;
		width: 10px;
		height: 36px;
		border-radius: var(--radius-full);
		background: color-mix(in srgb, var(--color-candle) 75%, var(--color-candle-dim));
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.28);
	}

	.room-card {
		background: linear-gradient(180deg, color-mix(in srgb, var(--color-surface-overlay) 88%, black), var(--color-surface-base));
	}

	.room-spread {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	.room-page {
		height: 96px;
		border-radius: var(--radius-sm);
		background: linear-gradient(180deg, var(--color-parchment), var(--color-parchment-deep));
		border: 1px solid color-mix(in srgb, var(--color-ink) 12%, transparent);
	}

	.room-card p {
		margin: 0;
		font-family: var(--font-prose);
		font-size: var(--text-sm);
		line-height: 1.6;
		color: var(--color-text-secondary);
	}

	@media (max-width: 900px) {
		.styles-showcase {
			padding: var(--space-6) var(--space-3) var(--space-12);
		}

		.showcase-section {
			padding: var(--space-4);
		}

		.chrome-preview {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
		}

		.chrome-sidebar {
			min-height: 60px;
		}
	}
</style>
