# Design System

## Philosophy

Dark, focused, editorial workspace. The visual language communicates craft and intention — it should feel like a serious writing instrument, not a generic productivity tool.

## Surface Layers

Surfaces follow a luminance hierarchy. Higher layers are always lighter than their parent.

| Token                      | Value                    | Usage                                   |
| -------------------------- | ------------------------ | --------------------------------------- |
| `--color-surface-base`     | `#0a0a0a`                | App root / `<html>` background          |
| `--color-surface-ground`   | `#111111`                | Sidebar, navigation rail                |
| `--color-surface-raised`   | `#191917`                | Primary content panels (warm undertone) |
| `--color-surface-overlay`  | `#222222`                | Cards, floating panels                  |
| `--color-surface-elevated` | `#2c2c2c`                | Hover states, highlighted rows          |
| `--color-surface-glass`    | `rgba(255,255,255,0.04)` | Frosted-glass overlays                  |

Legacy aliases still resolve: `--color-charcoal` → `--color-surface-raised`, `--color-slate` → `--color-surface-ground`.

## Colors

### Accents

| Token               | Value                    | Usage                              |
| ------------------- | ------------------------ | ---------------------------------- |
| `--color-nova-blue` | `#3b82f6`                | Primary action, interactive states |
| `--color-teal`      | `#06b6d4`                | AI indicators, secondary accent    |
| `--color-ai-tint`   | `rgba(99,102,241,0.08)`  | AI-context panel surface wash      |
| `--color-selection` | `rgba(245,240,235,0.08)` | Editorial selection / active row   |

### Borders (rgba — breathable hairlines)

| Token                    | Value                    | Usage                 |
| ------------------------ | ------------------------ | --------------------- |
| `--color-border-default` | `rgba(255,255,255,0.08)` | Standard dividers     |
| `--color-border-subtle`  | `rgba(255,255,255,0.04)` | Intra-panel hairlines |
| `--color-border-strong`  | `rgba(255,255,255,0.16)` | Emphasis borders      |
| `--color-border-focus`   | `rgba(59,130,246,0.6)`   | Keyboard focus rings  |

Legacy alias: `--color-border` → `--color-border-default`.

## Typography

### Font Families

| Token            | Stack                                      | Usage                                    |
| ---------------- | ------------------------------------------ | ---------------------------------------- |
| `--font-sans`    | `'Inter', system-ui, sans-serif`           | All UI text                              |
| `--font-display` | `'DM Serif Display', Georgia, serif`       | `h1`, project titles, editorial headings |
| `--font-mono`    | `'JetBrains Mono', 'Fira Code', monospace` | Code, editor textarea                    |

DM Serif Display is loaded via Google Fonts. Inter uses `font-feature-settings: 'ss01', 'tnum', 'calt'`.

### Type Scale

UI: `--text-xs` (12px) through `--text-3xl` (30px). Editorial/display: `--text-4xl` (36px), `--text-5xl` (48px), `--text-6xl` (60px).

### Letter-Spacing

`--tracking-tight` (-0.03em) · `--tracking-normal` (0) · `--tracking-wide` (0.04em) · `--tracking-widest` (0.12em)

## Prose

| Token               | Value            | Usage                                           |
| ------------------- | ---------------- | ----------------------------------------------- |
| `--prose-width-max` | `68ch`           | Optimal measure for body copy / editor textarea |
| `--prose-inset`     | `var(--space-6)` | Horizontal prose padding                        |
| `--prose-gap-line`  | `1.75rem`        | Paragraph-to-paragraph gap                      |
| `--prose-gap-block` | `2.5rem`         | Section break before headings                   |

## Layout

- Sidebar: `--sidebar-width: 220px`
- Main: `--panel-padding: var(--space-4)`

## UI Rules

- Minimal distractions, clear hierarchy, fast interactions
- All borders use rgba tokens — never opaque hex dividers
- Surface elevation always increases with z-layer (base → ground → raised → overlay → elevated)

## Motion

### Durations

`--duration-instant` (80ms) · `--duration-fast` (100ms) · `--duration-base` (150ms) · `--duration-enter` (200ms) · `--duration-slow` (250ms) · `--duration-page` (320ms)

### Easing

| Token               | Curve                        | Usage                            |
| ------------------- | ---------------------------- | -------------------------------- |
| `--ease-standard`   | `cubic-bezier(0.4,0,0.2,1)`  | Default state transitions        |
| `--ease-decelerate` | `cubic-bezier(0,0,0.2,1)`    | Elements entering screen         |
| `--ease-editorial`  | `cubic-bezier(0.16,1,0.3,1)` | Panel entry — spring-like settle |
| `--ease-exit`       | `cubic-bezier(0.4,0,1,1)`    | Elements leaving screen          |

### Keyframes

- `novellum-enter` — opacity 0→1 + translateY(4px→0). Used for AI panel, floating panels entering the DOM.
- `fade-in` / `fade-out` — used for SvelteKit View Transitions.

All animations respect `@media (prefers-reduced-motion: reduce)`.

## Components

- Cards — `--color-surface-overlay` background, `--shadow-xs`, `--color-border-default` border
- AI Assistant panel — `--color-surface-overlay` background, `--shadow-lg`, `--color-ai-tint` suggestion card
- Editor panels — `--color-surface-raised` background
- Sidebar — `--color-surface-ground` background

## Canonical Visual Rules (Stage 001 Contract)

These rules are mandatory for Stage 002-009 implementation work and are derived from `plan-016-visual-consistency` audits.

### Page Shell

- Every non-redirect route uses the root shell from `src/routes/+layout.svelte`.
- Every `/projects/[id]/**` workspace route uses project shell framing from `src/routes/projects/[id]/+layout.svelte` in addition to the root shell.
- Redirect-only routes must not introduce route-local visual chrome.
- Scroll ownership: root shell owns main scroll container; route content should avoid nested full-height scroll regions unless explicitly a split workspace.

### Page Header

- Top application header remains canonical (`AppHeader` + project context title pattern).
- Route-level hero/header blocks are archetype-specific, but must keep: one primary heading, one supporting description, and at most one compact action row.
- Collection routes (`/`, `/projects`, `/books`, `/stories`) share one heading rhythm contract (eyebrow + display title + descriptive subcopy).

### Cards and Panels

- Default card/panel primitives: `SurfaceCard`, `SurfacePanel`.
- Route-local card styles are allowed only when tied to a named archetype contract (for example reader prose card or continuity metric card).
- New utility/admin cards must be built from shared primitive variants, not route-local `.card` classes.

### Inspector Panels

- Planning and entity workspaces use a stable two-lane rhythm: navigation/list lane + detail/inspector lane.
- Inspector lanes should reuse existing workspace primitives before adding bespoke wrappers.
- Placeholder states inside inspector lanes must use module-shared placeholder components, not ad-hoc hero blocks.

### Forms

- Prefer shared form controls (`Input` and UI button primitives) for create/edit flows.
- Raw `input`/`textarea` are allowed in the editor manuscript context and tightly scoped utility controls only.
- Form spacing rhythm: label + control + help/error message grouped in consistent vertical stacks.

### Buttons

- Action hierarchy: `PrimaryButton` (create/commit), `SecondaryButton` (supporting utility), `GhostButton` (tertiary), `DestructiveButton` (irreversible).
- Avoid introducing route-local button systems unless converting into shared primitives.
- Disabled, hover, active, and focus-visible states must use tokenized color/focus rules.

### Tabs and Pills

- Shared selection primitives (`PillNav` and future shared tabs primitive) are the default for section switching.
- Any route-local tab implementation must match canonical selected/hover/focus semantics and spacing.
- World-building and editor subnavigation remain intentional specialized uses of shared pill behavior.

### Empty States

- Canonical empty-state baseline: `EmptyStatePanel` (or module-shared equivalent with same tone and structure).
- Empty states must be author-facing and action-guiding (what to do next + primary CTA), not generic placeholder copy.
- Placeholder pages (for not-yet-built subroutes) must use one standardized "under construction" pattern per archetype family.

### Workspace Hero Cards

- Hero sections in planning/review/world-building routes may differ in styling, but must preserve shared information hierarchy and spacing rhythm.
- Arc workspace cannot remain on `future-*` placeholder styling; it must converge with planning workspace hero/panel contracts.

### Sanctioned Header Exceptions (Phase 002)

- `/projects/[id]/hub` keeps `ProjectHubHero` as an approved domain hero. This route is intentionally richer than `PageHeader` because it carries project identity (cover, synopsis, and high-level metadata) as a single showcase surface.
- Exception use is narrow: specialized heroes are valid only when they communicate domain-critical structure that `PageHeader` cannot represent without information loss.
- Any future specialized hero must include an explicit rationale in plan evidence and preserve canonical heading rhythm (one primary heading and one supporting description block).

### Placeholder Header Deferral Policy

- Placeholder routes may temporarily use archetype-level placeholder hero patterns while a feature is unimplemented.
- Deferred placeholders must include a dated backlog artifact in the active plan's evidence folder, with migration trigger and target primitive.
- For current Stage 002 scope, `/projects/[id]/arcs` is deferred and must migrate to `PageHeader` once Arc Planner moves to implementation.

### Editor Surface

- Editor remains the calmest high-focus surface: prose-first lane, restrained chrome, secondary tools in side rails.
- Editor-specific dense micro-controls are allowed only when they support immediate writing flow.

### AI Assistant Surface

- `/nova` and in-editor AI panels should feel like one family: same action hierarchy, card rhythm, and feedback/error treatment.
- Utility-style admin patterns in AI configuration screens should be reduced through shared primitives.

### Metadata Rows

- Metadata chips/rows (status, counts, tags, badges) should use consistent casing, spacing, and border/fill contrast.
- Avoid mixing several badge geometries on the same surface.

### Entity Cards

- Story bible entity types (individuals, factions, lineages, realms, landmarks, myths, technology, traditions) share one dossier-card family.
- Intentional content differences are allowed; structural card rhythm should remain recognizable across entity types.

### Scroll Behavior

- Shell-level scrolling is default; route-level scroll containers only for explicit split-pane workspaces.
- Sticky subheaders are allowed for world-building and editor selection rails, but must not create competing sticky stacks.

### Archetype Preservation Rules

- Writing surface (`editor`, scene editor): prose-first, minimal utility clutter.
- Planning workspace (`outline`, future arcs): hierarchy + inspector clarity, no dashboard visual noise.
- Entity management (`world-building` family): dossier continuity and artifact-like cards.
- Review/consistency (`continuity`): triage clarity with restrained utility controls.
- Export/production (`books/[id]`, export modal): document-forward and outcome-focused.
- Settings/configuration (`settings`, `styles`, `migrate`): utility clarity without breaking Novellum tone.

### Tone Anchors (Empty / Loading / Error)

- Empty: calm, invitational, author-facing, action-guided.
- Loading: neutral and steady, never alarming; prefer skeletons for list/card surfaces.
- Error: direct and recoverable with one primary recovery action and one secondary escape path.

### Follow-up Constraints

- Do not add new visual tokens unless absolutely necessary and backed by explicit conflict evidence.
- Resolve drift through primitive convergence and archetype contracts before introducing new token surface area.

### Outline Workspace Interactions

- **Inline-only create and edit**: Act, Chapter, and Scene rows in the outline workspace use inline editing only. No modals or drawers are introduced for create/edit of these entities. The "Add" affordance creates the row in place; the rename affordance turns the row title into an inline input.
- **Selection taxonomy**: Entity rows use scope-specific accent colors that are intentional and must be preserved:
  - Chapter selection → `--color-teal` accent.
  - Scene selection → `--color-nova-blue` accent.
  - Acts use the muted muted accent and indicate state via expand/collapse rather than a "selected" treatment.
- **Convergent treatments**: Hover background uses `color-mix(in srgb, var(--color-text-primary) 5%, transparent)`. Focus uses `outline: none; box-shadow: var(--focus-ring)` across all sidebar buttons (`act-select-btn`, `act-expand-btn`, `chapter-select`, `expand-btn`, `scene-title`, `util-btn`).
- **Disabled states**: None of the outline sidebar rows have a disabled state by design — selection is always available. Do not add `:disabled` styling to these components without a documented use case.
- **Exception path**: A component may diverge from these rules if it documents the reason inline (with a comment) and adds a note to this file. Otherwise it must converge.
