# Frontend

> Last verified: 2026-05-25

## Framework

- **Svelte 5** in runes mode (`$state`, `$derived`, `$effect`).
- **SvelteKit 2** + `@sveltejs/adapter-node`.
- **TypeScript 6**, **Vite 8**, **Tailwind 3**.
- Shared UI primitives in `src/lib/components/ui/`.
- Design tokens in `src/styles/tokens.css` are the visual source of truth.

## v2 Design System Snapshot

Plan-026 v2 is now the canonical frontend visual language:

- Warm umber surface hierarchy (not cool charcoal/slate framing).
- Editorial accents anchored on candle + brass + ember tokens.
- Parchment + ink immersive reading/writing surfaces.
- Display serif + prose serif pairing for narrative presentation.

## Token Palette (v2)

Core editorial tokens used across chrome and immersive surfaces:

- `--color-candle`
- `--color-candle-dim`
- `--color-candle-deep`
- `--color-candle-hsl`
- `--color-brass`
- `--color-ember`
- `--color-parchment`
- `--color-parchment-edge`
- `--color-parchment-deep`
- `--color-ink`
- `--color-ink-soft`
- `--color-ink-mute`

Surface stack tokens:

- `--color-surface-base`
- `--color-surface-ground`
- `--color-surface-raised`
- `--color-surface-overlay`
- `--color-surface-elevated`

Legacy compatibility note:

- `--color-nova-blue` is intentionally a backwards-compat alias to `var(--color-candle)`.
- This alias is scheduled for removal in a future cleanup pass after callsites are fully migrated.

## Typography

- `--font-sans`: Inter (`UI chrome`, controls, labels).
- `--font-display`: DM Serif Display (`headers`, section titles, immersive title moments).
- `--font-prose`: Crimson Pro (`editor page prose`, reader room prose, editorial long-form copy).

## Chrome Geometry

Global shell geometry is locked to v2:

- Expanded sidebar width: **208px** (`--sidebar-width`).
- Collapsed sidebar width: **56px** (`--sidebar-collapsed-width`).
- Header height: **52px** (`--header-height`).

AppHeader micro-anatomy:

- Brass eyebrow label: **9px**, **600 weight**, **0.18em uppercase tracking**.
- Serif title line (DM Serif Display).
- Breath bar / mood line below title.

## Immersive Surfaces

### Editor “Page”

- Parchment surface with edge/depth layering.
- Crimson Pro prose (`--font-prose`).
- Scene Rail + editorial chips integrated into the manuscript frame.

### Nova “Muse”

- Right-edge marginalia panel treatment.
- Brass-tinted border-left treatment.
- Candle resize handle for tactile affordance.

### Reader “Room”

- Two-page parchment spread.
- Ornament rhythm + drop-cap opening paragraphs.
- Ember ribbon/bookmark accents + folio cues.

## Structure & Boundaries

Source layout (frontend-relevant):

```text
src/
├── routes/
├── lib/
│   ├── components/
│   ├── stores/
│   ├── ai/
│   └── server/
├── modules/
└── styles/
```

Boundary rules:

- Feature code imports modules via `$modules/<domain>` barrels.
- Shared UI imports via `$lib/components/*`.
- No client imports from `$lib/server/*`.

## Validation & Gates

Frontend closeout gates:

- `pnpm check:tokens`
- `pnpm check`
- `pnpm lint`
- `pnpm lint:css`
- `pnpm test`
- `pnpm exec playwright test`

All must be green before plan closeout promotion.
