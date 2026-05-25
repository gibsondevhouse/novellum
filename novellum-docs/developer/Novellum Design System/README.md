# Novellum Design System

A design system for **Novellum**, a local-first, AI-assisted novel production workspace by **Gibson Dev House**. The visual language is *editorial* and *cinematic* — a serious writing instrument, not a generic productivity tool.

> Dark, focused, editorial workspace. The visual language communicates craft and intention.
> — Novellum's own internal `design-system.md`, archived 2026-05

## Sources

This system was built by reading the Novellum production codebase, mounted as `novellum/`. Key files referenced:

- `novellum/src/styles/tokens.css` — single source of truth for visual constants → copied to `reference/tokens.css`
- `novellum/src/styles/components.css` → copied to `reference/components.css`
- `novellum/src/app.css` — global stylesheet → `reference/app.css`
- `novellum/dev-docs/archive/2026-05-pre-refactor/design-system.md` — internal design doc → `reference/archive-design-system.md`
- `novellum/src/lib/components/ui/*` — UI primitives (Button, Input, StatusBadge, EmptyStatePanel, SurfaceCard, PillNav, …)
- `novellum/src/lib/components/AppShell.svelte`, `AppSidebar.svelte`, `AppHeader.svelte` — global chrome
- `novellum/src/modules/project/components/LibraryHeroCard.svelte` — the canonical "book on a shelf" card
- `novellum/src/modules/reader/components/BookSpread.svelte`, `BookReaderView.svelte` — the paginated reader
- `novellum/src/modules/nova/components/NovaPanel.svelte` — the AI copilot panel
- `novellum/nvlm-logo.png` — the product mark → copied to `assets/nvlm-logo.png`

The user's brief described Gibson Dev House as a "Solo Human In The Loop Coding Agent Orchestrator". The codebase tells a different story: **Novellum is the product**, a novel-writing workspace. This design system documents Novellum. If Gibson Dev House has additional products under one parent brand, flag them and we'll extend.

---

## What Novellum is

Per `novellum/README.md`, Novellum is a writing app with:

- **Manuscript editor** — TipTap-based scene editor with continuous autosave, snapshot history, and crash recovery.
- **Structural outline** — Arc → Act → Chapter → Scene → Beat hierarchy with drilldown workspaces.
- **World Building** — Personae, Atlas, Archive, Threads, and Chronicles in a unified shell.
- **Nova AI copilot** — chat-style assistant grounded in the project; BYOK OpenRouter.
- **Continuity checks** — agentic consistency review across scenes, characters, locations, and timeline.
- **Reader** — paginated, distraction-free read-through view.
- **Exports** — DOCX, EPUB, Markdown, TXT.
- **Local-first** — SQLite on device. No cloud sync, no telemetry, no account.

Tech: Svelte 5 (Runes) · SvelteKit 2 · Tauri 2 · better-sqlite3 · OpenRouter (BYOK).

---

## Content fundamentals

### Voice and tone

Novellum's voice is **calm, literate, and craft-respecting**. The product treats the writer as a serious practitioner of a craft. Copy is short, declarative, and avoids cheer or sales register. There is no "Awesome! 🎉" energy.

**Verbatim examples from the codebase:**

- Onboarding modal: *"Welcome to Novellum. Your all-in-one workspace for writing your next masterpiece."*
- Onboarding feature cards: *"Organize Thoughts. Build outlines, characters, and settings naturally."* / *"Stay Consistent. AI analyzes your story for timeline and lore accuracy."* / *"Write Freely. A calm editor focused entirely on your words."*
- Library hero label: *"Continue Reading"* (eyebrow), followed by the manuscript title.
- Empty library: *"Your library is ready for its first manuscript. Create a project to seed your shelf, then return here to continue reading and track progress across drafts."*
- Empty Nova session: *"Hi, I'm Nova. Ask me anything about your project."*
- Empty AI key: *"No AI key configured. Add your OpenRouter API key in Settings to start using the AI assistant."*
- Logline placeholder: *"No logline provided for this work yet."*
- Reader empty: *"This book has no readable pages yet."*

### Casing

- **Page titles & h1**: Title Case ("Continue Reading", "Works in Progress", "Recently Read").
- **Section headers (eyebrow)**: UPPERCASE, `--tracking-wide` or `--tracking-widest`. Example: page counter `5 / 142`, badges like `UNCLASSIFIED`, `DRAFTING`.
- **Buttons**: Title Case for primary verbs (`Open Manuscript`, `Get Started`, `New project`). Sentence case is fine for longer phrases (`Add to library`).
- **Body**: Sentence case.

### Person & address

Mostly **second-person** ("your manuscript", "your library", "your project"). First-person is reserved for the Nova AI persona: *"Hi, I'm Nova."* Avoid "we" — the product does not speak as a corporate "we".

### Emoji

- **Allowed** in the onboarding modal feature cards only (📝 🔍 ✨). These are intentionally bright moments meant to signal the three core capabilities at first contact.
- **Not used** in core product chrome (sidebar, header, library, editor, reader, Nova). The icon vocabulary there is hand-drawn Lucide-style SVG.
- When in doubt, **prefer SVG over emoji**.

### Specific copy moves

- Manuscript-domain nouns: *manuscript*, *book*, *scene*, *chapter*, *arc*, *act*, *beat*, *spine*, *measure*, *prose*, *logline*, *shelf*, *spread*, *gutter*. Lean into these — they're load-bearing.
- The AI is **Nova** (always capitalised) and never called "the AI" in user-facing copy.
- Status verbs: *planning, drafting, revising, completed, archived* (and *published* for stories).
- Error and empty states are **direct and recoverable**: one primary recovery, one secondary escape. Avoid alarming language.
- **Loglines are italic serif** — the design system explicitly typographs them differently from body copy. Lean on this in mocks.

### Vibe in one sentence

*A leather-bound notebook on a deep-walnut desk under a single warm lamp — but with a quiet AI presence sitting beside you, ready to look things up.*

---

## Visual foundations

### Motifs

The system commits to a few load-bearing visual ideas:

1. **Books as objects.** Library cards render with a spine, a foil sheen, and a generated cover gradient. Reader view is a literal two-page spread with a centre gutter, a 3:2 aspect ratio, and a deep shadow. Pagination is `‹ 5 / 142 ›`, not infinite scroll.
2. **Editorial typography.** DM Serif Display sets the tone — used for h1, project titles, loglines, and reader prose. Inter handles UI. The serif's italic is used deliberately for synopses and loglines, never decoratively.
3. **Warm, calm darkness.** The dark theme isn't pitch black; `--surface-raised` is `#191917` — a warm near-black with a subtle umber undertone. Cards in the library use a 145° linear gradient from `--surface-raised` to `--surface-overlay`.
4. **Hairlines, not bars.** Every divider is an `rgba` border (`--border-default` = `rgba(255,255,255,0.08)`). Never opaque hex. This keeps surfaces breathable.

### Color

- Surfaces layer in a strict luminance hierarchy: **base → ground → raised → overlay → elevated**. Higher layers are always lighter than their parent. Never invert.
- Two accents only: `--accent-nova-blue` (#3b82f6) for primary actions, focus rings, and Nova-the-AI; `--accent-teal` (#06b6d4) for genre pills, links, and secondary accents.
- AI surfaces get a soft indigo wash: `--accent-ai-tint` = `rgba(99,102,241,0.08)`. Don't use indigo anywhere else.
- A parchment-toned **light theme** exists (`<html data-theme="light">`) — surfaces become #f5f3ee, #efece5, #ffffff. Designs should at minimum *not break* in light mode. Use it sparingly; dark is canonical.
- Six "cover palette" gradient pairs are used for generated book covers (see `assets/cover-palettes.json`).

### Type

- Two families do real work: **DM Serif Display** (display + reader prose) and **Inter** (UI). **JetBrains Mono** for code and the rare technical readout.
- DM Serif Display is set at **regular weight** for h1 — its character comes from the letterforms, not from bolding.
- Inter has `'ss01', 'tnum', 'calt'` font-features enabled globally for ligatures and tabular numerals.
- Type scale steps are explicit and locked: `12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60`. Don't invent in-between sizes.
- Eyebrow labels: 12px, `--tracking-wide` (0.04em), UPPERCASE, `--fg3` muted color.

### Spacing & layout

- **4px base grid**: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64.
- Sidebar: 220px expanded, 64px collapsed. Header: 48px fixed. Nova panel: 360px default, 280–520 range, drag-resizable, persisted to localStorage.
- Reader measure: **68ch** max. Editor measure: **65ch** max. Authors parse their own prose at closer range than readers consume it.
- Library page max-width: 1100px, centered.
- A **floating Nova panel** docks right of the editor — it is *not* a modal. The page reflows around it.

### Backgrounds

- **No images on chrome.** Surfaces are flat warm-near-black with subtle gradient washes.
- A `--gradient-spotlight` radial wash (`80% 80% at 50% 0%`, `rgba(59,130,246,0.08)`) is occasionally used at the top of hero areas — a single warm-light-from-above suggestion.
- Library card covers carry a generated 160° linear gradient + a **`.foil` overlay**: two stacked radial+linear gradients with `mix-blend-mode: screen` for a subtle sheen. Repurpose this technique for any "cover-like" surface (book cover, song album, photo).
- No repeating patterns, no noise textures by default. A `.surface-texture-noise` utility exists but is rarely used.

### Motion

- Durations: `instant 80ms → fast 100 → base 150 → enter 200 → slow 250 → page 320`.
- Four easings, each with a job:
  - `--ease-standard` `cubic-bezier(0.4, 0, 0.2, 1)` — default state changes.
  - `--ease-decelerate` `cubic-bezier(0, 0, 0.2, 1)` — things entering screen.
  - `--ease-exit` `cubic-bezier(0.4, 0, 1, 1)` — things leaving.
  - **`--ease-editorial`** `cubic-bezier(0.16, 1, 0.3, 1)` — spring-like settle. This is the signature easing; use it for panels and cards that need a felt arrival.
- Signature entry keyframe: `novellum-enter` — `opacity 0→1 + translateY(4px → 0)` over 200ms with `--ease-editorial`. Library cards stagger this by 50ms per card up to a 280ms cap.
- Page-to-page navigation uses the **View Transitions API** with `fade-in / fade-out` over `--duration-page` (320ms).
- All animations respect `@media (prefers-reduced-motion: reduce)`.

### Interactive states

- **Hover (buttons, nav items, ghost actions):** typically a wash to `--surface-hover` (`#262626`) for the background and `--fg1` for the foreground. Primary buttons hover via `opacity: 0.88` (not a darker shade). Cards lift with `transform: translateY(-2px)` and an upgraded shadow.
- **Press / active:** no shrink. The system prefers a brightening of the hover state or a momentary outline. There is *no* `transform: scale(0.98)` press style anywhere in the codebase.
- **Focus-visible:** 2px solid `--border-focus` outline, 2px offset. On surfaces over `--surface-raised`, use the `--focus-ring-offset` double-ring (raised-color spacer between target and ring).
- **Selection in editor**: `--selection-wash` = `rgba(245,240,235,0.08)` — a warm parchment wash, not the OS default blue.
- **Disabled**: `opacity: 0.5`, `cursor: not-allowed`. Don't grey-out colors.

### Borders, radii, shadows

- Borders: always rgba. Never `#222`-style opaque dividers.
- Radii: small UI uses `--radius-sm` (4px) for inputs/chips, `--radius-md` (6px) for buttons/cards, `--radius-lg` (10px) for modals, `--radius-xl` (16px) for hero banners, `--radius-full` for pills/badges. The reader spread has no radius.
- Shadows are dark-surface-tuned — deep `rgba(0,0,0,0.5–0.7)` rather than the soft greys you'd use on light backgrounds. Five tiers: `xs / sm / md / lg / xl`. Most cards rest at `xs–sm`; modals and the Nova panel use `lg`; the reader spread uses `lg` for its book-on-desk impression.

### Card anatomy

- **Default surface**: `--surface-overlay` (#222), `--border-default` 1px, `--radius-md`, `--shadow-xs`.
- **Library hero card**: 145° gradient from `--surface-raised` to `--surface-overlay`, padding `--space-5` (20px), grid layout with a cover thumbnail (128–164px column) + content column. Hover: `translateY(-2px)` + `--shadow-lg`.
- **AI / Nova surfaces**: same shell as default cards but with `--accent-ai-tint` as background wash and `--shadow-lg`.

### Transparency & blur

- The onboarding modal backdrop uses `color-mix(in srgb, black 60%, transparent)` + `backdrop-filter: blur(4px)`. This is the *only* place blur is used in chrome — keep blur rare.
- Glass surfaces (`--surface-glass` = `rgba(255,255,255,0.04)`) are used for hover washes on tonally-equal surfaces (e.g. active header action) where a hex hover would be too heavy.

### Imagery vibe

The product currently has very little imagery; what exists is:
- **The mark itself** (`assets/nvlm-logo.png`) — an open book with a glowing crystal sphere above, blue + gold + violet pages. Warm-cool gradient. Painterly, slightly luminous, hand-illustrated feel.
- **Generated book covers** — pure gradient + a foil sheen + a serif initial. No photographic content.

Future imagery should lean **warm, slightly desaturated, painterly**, with a touch of mist/atmosphere. Avoid: corporate stock photography, flat illustration, blue-purple gradients of the SaaS variety.

### Layout rules (fixed elements)

- **AppSidebar** is sticky-left, 220px / 64px collapsed, `--surface-ground` background, single hairline border-right.
- **AppHeader** is sticky-top, 48px, `--surface-base` background. A second 40px row appears in the editor for scene-pill navigation.
- **NovaPanel** is fixed-right, 360px default, anchored below the header. Can be dragged to resize 280–520; persists to localStorage.
- **Main content** scrolls; the shell does not. Sticky subheaders are allowed only for world-building and editor selection rails.

---

## Iconography

**Approach:** Inline hand-rolled SVG in the **Lucide / Feather visual family**.

- All icons in the codebase are inline `<svg>` elements with `width="1em" height="1em"`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- They live alongside the markup that uses them — there's no central icon component, no icon font, no `<use href>` sprite, no Lucide npm package (a search for `lucide-svelte` returns zero matches in the source tree, though the storybook research doc mentions a former dependency).
- Icon sizes via CSS tokens: `--icon-size-sm: 16px`, `--icon-size-md: 20px`, `--icon-size-lg: 24px`.
- Icons inherit text color via `currentColor`. Hover states change the *text* color and the icon follows.

**Used in the live codebase** (re-create these from Lucide if you need them):
- Sidebar nav: `home`, `book` (open), `star` (Nova), `image`, `droplet` (Styles), `grid` (Projects)
- Header actions: `plus` (new), `sun` (theme), `star` (Nova toggle), `settings` (gear)
- Sidebar toggle: `menu` (hamburger)

**For mocks and slides**: use [Lucide CDN](https://unpkg.com/lucide-static@latest/icons/) icons — they match the in-app style exactly. Drop them in as inline SVG, or fetch from the unpkg path. Do not introduce filled or rounded icon systems (Material, Phosphor, Bootstrap Icons) — they read as foreign in this product.

**Emoji**: used *only* in the onboarding modal feature cards (📝 🔍 ✨). Don't introduce emoji anywhere else.

**Unicode characters**: `‹` / `›` are used for reader pagination arrows. `×` is used for modal close buttons. These are intentional — the typography is doing the work; don't replace them with SVG.

---

## Index — what's in this design system

```
/
├── README.md                          ← you are here
├── colors_and_type.css                ← base + semantic CSS variables, import this
├── SKILL.md                           ← Claude Code-compatible skill manifest
├── assets/
│   ├── nvlm-logo.png                  ← product mark (use everywhere a logo belongs)
│   ├── cover-palettes.json            ← the six book-cover gradient pairs
│   └── icons/                         ← Lucide-style SVG icons used in chrome
├── preview/                           ← Design System tab cards (registered assets)
│   ├── colors-surfaces.html
│   ├── colors-accents.html
│   ├── colors-state.html
│   ├── type-display.html
│   ├── type-ui-scale.html
│   ├── type-roles.html
│   ├── spacing-scale.html
│   ├── radii.html
│   ├── shadows.html
│   ├── motion.html
│   ├── components-buttons.html
│   ├── components-inputs.html
│   ├── components-badges.html
│   ├── components-cards.html
│   ├── components-pills.html
│   ├── components-empty-state.html
│   ├── brand-logo.html
│   └── brand-iconography.html
├── ui_kits/
│   └── novellum/
│       ├── README.md
│       ├── index.html                 ← interactive recreation: library → reader → editor + Nova
│       ├── AppShell.jsx
│       ├── Sidebar.jsx
│       ├── Header.jsx
│       ├── LibraryHeroCard.jsx
│       ├── BookSpread.jsx
│       ├── EditorPane.jsx
│       ├── NovaPanel.jsx
│       └── primitives.jsx             ← Button / Input / Badge / EmptyState / SurfaceCard / PillNav
└── reference/                         ← raw files copied from novellum/ for citation
    ├── tokens.css
    ├── components.css
    ├── app.css
    └── archive-design-system.md
```

---

## Substitutions & flags

- **Fonts**: DM Serif Display, Inter, and JetBrains Mono are all on Google Fonts — `colors_and_type.css` loads them from the Google Fonts CDN. No `.woff2` files were shipped in the Novellum repo (Google Fonts is loaded at runtime in production). If you'd like self-hosted webfonts to ship with the design system, request `.woff2`/`.ttf` files and we'll add a `fonts/` directory.
- **Icons**: no icon font or central icon library exists in the codebase — every icon is an inline SVG drawn in the Lucide/Feather style. The design system mirrors that by recommending Lucide CDN for mock-up work; the visual match is 1:1.
- **Cover artwork**: real book projects have user-uploaded covers; in mocks, use the generated `cover-palette` gradients in `assets/cover-palettes.json` with a single serif initial. Don't generate fake book-cover artwork.

---

Open `preview/*` files (auto-registered in the Design System tab) to see swatches, type specimens, and components in isolation. Open `ui_kits/novellum/index.html` for the full interactive recreation.
