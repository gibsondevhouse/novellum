# Editorial & Luxury UI/UX Research Brief

**Prepared for:** `refactor-001-ui_ux-polish` → `stage-002-visual-system-and-motion-polish`
**Date:** 2026-04-12
**Status:** Research complete — feeds `phase-001-tokens-components-and-transition-language`

---

## Summary

This brief synthesises research from high-quality editorial/luxury product UIs (Linear, Craft, Awwwards editorial
category, Google Fonts Knowledge, Inter typeface docs) to define concrete, actionable design-system upgrades
that push Novellum from "functionally styled" to "production-quality editorial workspace."

The North Star: a dark, writer-focused interface that **feels premium at rest** — like a literary journal printed
on fine paper — and **disappears when writing is happening**.

---

## Benchmark References

| Product                                     | Why it matters                                                                                                                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Linear** (`linear.app`)                   | Gold standard for dark SaaS tool density: ultra-crisp typography, near-zero radius, sub-1px borders, surgical motion. Shows how opacity + weight alone can handle a full hierarchy without colour noise. |
| **Craft** (`craft.do`)                      | Best-in-class writing-tool aesthetic: layered card surfaces with subtle texture, generous leading, warm neutrals, print-inspired spacing. Apple Design Award recipient — directly comparable domain.     |
| **Awwwards — Home of Ambrose**              | Editorial typographic layout language: oversized display type as structural element, clear column grids, purposeful proximity relationships.                                                             |
| **Awwwards — Editorial Brand Storytelling** | Demonstrates how a purely dark palette can carry cinematic richness through selective luminance layering (not colour).                                                                                   |

---

## Identified Gaps in the Current Design System

### 1. Typography — Missing editorial dimension

**Current state:** Inter variable only, no display/heading partner. Type scale tops at `3xl` (30 px). No
letter-spacing tokens. No `font-style` italic variant considered.

**Gap:** Luxury editorial tools use a **dual-typeface pairing**: a workhorse sans for UI chrome and body copy, and
a high-contrast serif or editorial display face for headings, chapter titles, and hero labels. This creates
immediate tonal elevation. Craft uses this pattern. Literary magazine interfaces rely on it entirely.

**Recommendations:**

- Add a serif display typeface for `--font-display` — candidates: **DM Serif Display**, **Playfair Display**
  (variable), or **Libre Baskerville** (all available on Google Fonts, SIL OFL 1.1 licence — free for commercial production use).
- Extend type scale upward: add `4xl` (2.25 rem / 36 px), `5xl` (3 rem / 48 px), `6xl` (3.75 rem / 60 px) for
  chapter titles, hero labels, and project names.
- Add letter-spacing tokens: `--tracking-tight: -0.03em`, `--tracking-normal: 0em`,
  `--tracking-wide: 0.04em`, `--tracking-widest: 0.12em` (for small-cap UI labels).
- Add `--font-display` token. Apply to: project title in Project Hub, chapter/scene headings in Editor, hero
  labels on the outline tree root nodes.
- Enable Inter variable font features: `font-feature-settings: 'ss01', 'tnum', 'calt'` for UI numeric data.

---

### 2. Colour — Surface hierarchy is too flat

**Current state:** Two neutral backgrounds (`#1a1a1a`, `#0f0f0f`) and two accent colours. No mid-layer surface
tokens. All panels render at the same depth.

**Gap:** Luxury dark UIs create a convincing sense of physical depth using **4–5 distinct surface layers** (not
colours — luminance differentials). Linear uses at least 4 layers. Craft uses warm-tinted card surfaces over
cool backgrounds to mimic paper.

**Recommendations — extended surface palette:**

```css
--color-surface-base: #0a0a0a /* absolute background, behind everything */
  --color-surface-ground: #111111 /* sidebar, navigation rail              */
  --color-surface-raised: #1a1a1a /* primary content panels                */
  --color-surface-overlay: #222222 /* cards, floating panels, popovers      */
  --color-surface-elevated: #2c2c2c /* hover states, highlighted rows        */
  --color-surface-glass: rgba(255, 255, 255, 0.04) /* frosted glass overlays */;
```

Note: progressively name these `base → ground → raised → overlay → elevated` so component engineers always
know which level they're working at.

**Accent palette audit:**

- **Nova Blue (`#1e40af`)** reads as mid-range corporate — it lacks the authority of a luxury product. Two options:
  1. **Shift to a deeper, more saturated electric blue**: `#2563eb` → `#3b82f6` as hover, used sparingly
  2. **Add a secondary warm accent** — a warm cream-white (`#f5f0eb`) for editorial highlights, distinct from
     cold-white text. Reserve blue for interactive affordances only.
- Add semantic surface tints for AI-context panels: a subtle indigo tint (`rgba(99, 102, 241, 0.08)`) that
  separates AI-generated content without screaming.

---

### 3. Border & Division — Too visible, not systematic

**Current state:** `--color-border: #2a2a2a` and `--color-border-subtle: #1f1f1f`. Both are raw hex values with
no semantic framing.

**Gap:** Premium tool interfaces (Linear, Craft, Notion) prefer nearly-invisible dividers — `1px solid rgba(255,
255, 255, 0.06)` — rather than opaque tones. This keeps surfaces breathable without muddy borders.

**Recommendations:**

```css
--color-border-default: rgba(255, 255, 255, 0.08) /* standard dividers           */
  --color-border-subtle: rgba(255, 255, 255, 0.04) /* intra-panel hairlines        */
  --color-border-focus: rgba(59, 130, 246, 0.6) /* accessibility focus rings    */
  --color-border-strong: rgba(255, 255, 255, 0.16) /* emphasis borders, separators */;
```

---

### 4. Spacing & Rhythm — Scale needs tightening for editorial density

**Current state:** 4 px base grid, `space-1` through `space-16`. Sufficient but lacks declaration around
**prose-specific spacing** (the kind used inside the editor for paragraph rhythm, blockquote insets, etc.).

**Gap:** Editorial tools need a secondary rhythm layer for content typography — separate from the UI chrome
spacing — to honour the prose reading experience without conflating it with button padding.

**Recommendations:**

- Add prose-specific spacing tokens:

  ```css
  --prose-gap-line: 1.75rem /* paragraph-to-paragraph gap in editor        */
    --prose-gap-block: 2.5rem /* section break gap (before headings, etc.)   */
    --prose-width-max: 68ch /* optimal measure for body copy               */
    --prose-inset: var(--space-6) /* horizontal padding for prose content   */;
  ```

- `68ch` for max prose width is validated by Google Fonts "Understanding measure/line length" knowledge: optimal
  is 45–75 characters; 68ch centre-targets this perfectly for English long-form.

---

### 5. Radius — Overcalibrated for editorial luxury

**Current state:** `radius-sm: 4px`, `radius-md: 8px`, `radius-lg: 12px`.

**Gap:** The 8–12 px range is borrowed from standard app design (Tailwind defaults). Luxury editorial tools
(Linear especially) use near-zero radii for primary chrome (panels, sidebars) and reserve rounding only for
interactive affordances (buttons, badges, tooltips).

**Recommendations:**

```css
--radius-none: 0px /* panels, sidebar, editor pane, rule lines */ --radius-xs: 2px
  /* new default for minimal rounding           */ --radius-sm: 4px
  /* input fields, small chips                  */ --radius-md: 6px
  /* buttons, cards (conservative)              */ --radius-lg: 10px
  /* popovers, modals                           */ --radius-full: 9999px
  /* pills, avatar bubbles, toggle tabs         */;
```

Rule: panels and structural chrome should use `radius-none` or `radius-xs`. Only interactive components (buttons,
inputs, chips) get `radius-sm` and above.

---

### 6. Shadow & Elevation — Not defined

**Current state:** No shadow tokens exist. Elevation is implied only by background colour.

**Gap:** Luxury dark UIs construct depth through **shadow + surface luminance together**. Without shadow tokens,
floating elements (popovers, command palettes, AI panels) will either be invisible or rely on crude borders.

**Recommendations:**

```css
/* Shadows for dark surfaces — use rgba on black for authentic depth */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.7), 0 4px 16px rgba(0, 0, 0, 0.5);
```

Reserved for: tooltip → `xs`, dropdown → `sm`, card → `md`, command palette → `lg`, modal → `xl`.

---

### 7. Motion — Sufficient structure, missing editorial character

**Current state:** Three durations (100 / 150 / 250 ms), standard easing set, transition shorthands.

**Gap:** The easing values are generic Material-derived curves. Editorial luxury motion has two signatures:

1. **Editorial enters**: elements slide in with slight vertical offset + fade (like pages turning), not horizontal
   slides or scale pops.
2. **Instant exits**: dismissals should be extremely fast (80–100 ms) to feel decisive and intentional, not
   apologetic.

**Recommendations (additions only):**

```css
--ease-editorial: cubic-bezier(0.16, 1, 0.3, 1) /* spring-like settle — for panels entering */
  --ease-exit: cubic-bezier(0.4, 0, 1, 1) /* match existing accelerate — fast exits   */
  --duration-instant: 80ms /* exits, confirmations                   */ --duration-enter: 200ms
  /* panels, drawers, modals opening        */ --duration-page: 320ms
  /* route-level transitions                 */ /* Standard enter animation for panels/overlays */
  @keyframes novellum-enter {from {opacity: 0; transform: translateY(4px) ;} to {opacity: 1;
  transform: translateY(0) ;}};
```

---

Motion principle: **every motion should communicate hierarchy**. The sidebar doesn't "slide in" — it
_resolves_ (content entering the viewport should settle, not travel). Only elements that logically move through
space (drawer, modal, context menu) should translate.

---

### 8. Focus & Accessibility — Needs luxury treatment

**Gap:** Focus rings on dark surfaces often look either invisible or jarring. The luxury approach is a fine,
high-contrast ring that feels intentional — like a thin inset halo.

**Recommendation:**

```css
:focus-visible {
  outline: 2px solid var(--color-border-focus); /* rgba(59, 130, 246, 0.6) */
  outline-offset: 2px;
}
```

This gives keyboard navigators a precise, premium indicator without the chunky browser default.

---

## Typography Pairing Candidates

All candidates are Google Fonts (SIL OFL 1.1 — free for commercial production use, self-hostable).

| Role                             | Typeface                        | Technical facts                                                                                                                                                                                                                                                                                                                                                                                                                                              | Why                                                                                                                                                                                                                                                                                            |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Display / Editorial headings** | **DM Serif Display**            | Designed by Colophon Foundry (UK). High-contrast **transitional** serif. **2 styles only: Regular 400 and Regular 400 Italic** (not variable — no weight axis). Part of the Google DM type system (alongside DM Sans and DM Mono). Designed for large/display sizes; companion `DM Serif Text` exists for smaller settings. 187M weekly Google Fonts serves; in 174K+ websites.                                                                              | Designed by the same foundry that does editorial design and publishing (Colophon). Crisp, contemporary transitional feel — references Enlightenment print without feeling period. Pairs cleanly with Inter at large sizes. The single-weight constraint is not a problem for display headings. |
| **Display alt**                  | **Playfair Display** (variable) | Designed by Claus Eggers Sørensen (Amsterdam). **Didone** style — high contrast, influenced by Baskerville and Scotch Roman tradition. Variable font: weight axis 400–900, italic axis. 12 static styles (6 weights × upright + italic). Includes built-in small caps, common and discretionary ligatures. 1.65B weekly Google Fonts serves; in 3.07M+ websites. Succeeded by the complete **Playfair** (2023) which adds an optical size axis for body use. | More expressive and classical. Use if the tone leans toward literary tradition. The optical size discovery in 2023 means `Playfair` (without "Display") now supports both headings and body copy on a single variable axis — a strong alternative for a three-in-one font investment.          |
| **Fallback display**             | **Libre Baskerville**           | Static serif, Regular 400 and Bold 700. Designed for web body text at small sizes despite the name.                                                                                                                                                                                                                                                                                                                                                          | Fallback if neither above is available or if loading budget is tight. Lower contrast than the two primaries.                                                                                                                                                                                   |
| **Body / UI**                    | **Inter** (variable, keep)      | Variable font: weight 100–900, italic, optical size axis (opsz 14–32). Designed by Rasmus Andersson. 147 languages covered. Enable `font-feature-settings: 'ss01', 'tnum', 'calt'` for UI contexts.                                                                                                                                                                                                                                                          | Already in system. Industry-standard for dark tool interfaces.                                                                                                                                                                                                                                 |
| **Mono**                         | **JetBrains Mono** (keep)       | No change needed.                                                                                                                                                                                                                                                                                                                                                                                                                                            | Correct for code/data.                                                                                                                                                                                                                                                                         |
| **Small caps / Labels**          | Inter + CSS                     | `font-variant-caps: all-small-caps` + `--tracking-widest`                                                                                                                                                                                                                                                                                                                                                                                                    | Creates editorial nav labels (CHAPTER / PROJECT / SCENE) without a fourth typeface.                                                                                                                                                                                                            |

**Primary recommendation: DM Serif Display** — chosen over Playfair because its Transitional (rather than Didone)
style reads as contemporary editorial rather than classical/period. The Colophon Foundry connection to editorial
design and publishing is a meaningful signal. Single-weight limitation is acceptable for a display accent font.

Avoid: script fonts, decorative swashes, or anything with strong historical period associations. The tone is
_contemporary editorial_ — think _The Atlantic_, _Literary Hub_, or _Wired_ in dark mode, not a period novel.

---

## Font Loading — Embed Code

Add to `src/app.html` inside `<head>`, before any stylesheet:

```html
<!-- Preconnect for Google Fonts performance -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- DM Serif Display (Regular 400 + Italic) -->
<link
  href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
  rel="stylesheet"
/>

<!-- Playfair Display variable (if chosen as alt) -->
<!-- <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"> -->
```

Add to `src/styles/tokens.css`:

```css
--font-display: 'DM Serif Display', Georgia, serif;
```

Inter is already loaded in the system. If loading via rsms.me CDN (recommended for full variable font support
including `opsz` axis), use:

```html
<!-- Inter variable (full opsz + wght axes) -->
<link rel="preconnect" href="https://rsms.me/" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
```

With corresponding CSS:

```css
:root {
  font-family: 'InterVariable', 'Inter', system-ui, sans-serif;
  font-feature-settings:
    'liga' 1,
    'calt' 1;
}
```

**Font budget note:** DM Serif Display (2 styles) weighs ~50 KB total via Google Fonts with `display=swap`.
Inter variable from rsms.me is ~360 KB (covers all weights/styles). Both are served from global CDNs.
For a PW/offline-capable app, consider self-hosting via `@fontsource` packages instead to avoid external
network dependency.

---

## Colour Direction: Refined Dark Palette

The current cool-grey darks are correct in tone but need depth. Two refinements:

**1. Introduce a subtle warm undertone to the primary surface:**
`#1a1a1a` → `#191917` (barely perceptible warm tint — mimics the warmth of quality print paper under low
light. This is what Craft does with its card surfaces.)

**2. Calibrate accent accent hierarchy:**

- Primary action: `#3b82f6` (Tailwind blue-500 — brighter, more accessible contrast on dark)
- AI indicator / secondary: `#06b6d4` (cyan-500 — distinctive from blue, clearly "AI-flavoured")
- Editorial highlight / selection: `rgba(245, 240, 235, 0.08)` (warm cream wash — used for selected text,
  active document row, or hovered chapter node)

---

## Production Readiness Checklist — Visual System

Before closing `stage-002`, the following should be verifiable:

- [ ] `tokens.css` updated with all new tokens (surfaces, display font, letter-spacing, prose spacing, shadows,
      radius-none, refined easing)
- [ ] `--font-display` loaded via `<link rel="preconnect">` + Google Fonts in `app.html`
- [ ] Sidebar, editor pane, and panel surfaces each using distinct surface layer tokens (not raw hex)
- [ ] All border colours migrated to rgba-based border tokens
- [ ] At least one editorial heading in the UI (project title or chapter heading) renders in `--font-display`
- [ ] Focus ring style applied globally via `:focus-visible`
- [ ] `@keyframes novellum-enter` applied to panels/modals
- [ ] Prose max-width constraint applied to the editor body
- [ ] `prefers-reduced-motion` wraps all keyframe animations
- [ ] Visual QA pass in Safari (dark mode), Chrome (dark mode), and Firefox

---

## References

### Typefaces

- [Inter — rsms.me/inter](https://rsms.me/inter/) — Full variable font specimen, OpenType feature reference, usage
  guide, and CDN embed code. Variable axes: `wght` 100–900, `opsz` 14–32, `ital`. Designed by Rasmus Andersson.
  License: SIL OFL 1.1.
- [DM Serif Display — specimen](https://fonts.google.com/specimen/DM+Serif+Display) — Styles preview, glyphs,
  embed code generator.
- [DM Serif Display — about](https://fonts.google.com/specimen/DM+Serif+Display/about) — Confirms: high-contrast
  transitional, designed by Colophon Foundry (UK) for super-sized display settings. Based on Adobe Source Serif Pro.
  Latin Extended glyph set. 187M weekly serves. 2 styles (Regular 400 + Italic).
- [Playfair Display — specimen](https://fonts.google.com/specimen/Playfair+Display) — Variable axes: `wght`
  400–900, `ital`. 12 static styles. Embed code generator.
- [Playfair Display — about](https://fonts.google.com/specimen/Playfair+Display/about) — Confirms: Didone
  transitional design by Claus Eggers Sørensen. Influenced by Baskerville and Scotch Roman. Published 2011, updated 2017. Includes small caps, common + discretionary ligatures. 1.65B weekly serves. Succeeded by Playfair (2023)
  with optical size axis.
- [Playfair (2023, full variable) — specimen](https://fonts.google.com/specimen/Playfair) — Newer family with
  `opsz` axis covering both display and body text ranges. Strong alternative to Playfair Display if one font needs
  to serve multiple sizes.
- [Libre Baskerville — specimen](https://fonts.google.com/specimen/Libre+Baskerville) — Fallback display serif.
  Static, Regular 400 and Bold 700 only.

### Typographic Theory & System Design

- [Google Fonts Knowledge: vertical spacing in design systems](https://fonts.google.com/knowledge/using_type/vertical_spacing_and_line_height_in_design_systems) —
  Validates the `68ch` prose measure recommendation; explains platform rendering differences and leading-trim
  proposals for web. Source for the vertical spacing approach in Gap 4.
- [Google Fonts Knowledge: emotive considerations for typefaces](https://fonts.google.com/knowledge/choosing_type/emotive_considerations_for_choosing_typefaces) —
  Source for the "type makes us feel before we read" principle underlying the dual-typeface pairing strategy.
  Referenced for the "Transitional vs. Didone" tonal distinction between DM Serif Display and Playfair Display.
- [Google Fonts Knowledge: understanding measure / line length](https://fonts.google.com/knowledge/using_type/understanding_measure_line_length) —
  Validates `--prose-width-max: 68ch` (optimal 45–75 characters for Latin body text).

### Benchmark Products

- [Linear — linear.app](https://linear.app) — Benchmark for dark SaaS tool density. Verified: sub-1px borders,
  opacity-only surface hierarchy, near-zero radius on structural chrome, surgical micro-motion. Informed Gaps 2, 3,
  5, and 7.
- [Craft — craft.do](https://craft.do) — Benchmark for writing-tool luxury. Verified: layered warm-tinted card
  surfaces, warm undertone on primary surface, generous leading, print-inspired spacing. Apple Design Award and
  German Design Award winner. Informed Gaps 1, 2, and 4. Directly comparable product domain.

### Editorial Design Inspiration

- [Awwwards — editorial dark search](https://www.awwwards.com/inspiration/search?text=editorial+dark) —
  Collection of award-winning editorial dark UI implementations. Key pieces reviewed: Home of Ambrose (editorial
  layout language), Editorial Brand Storytelling by BEYOND AGENCY (cinematic dark palette), Dark minimal hero with
  typographic hierarchy (PIVentures).
- [Awwwards — Home of Ambrose editorial layouts](https://www.awwwards.com/inspiration/editorial-layouts-home-of-ambrose) —
  Specific editorial layout inspiration. Tags: editorial, typographic, content. Informed Gap 1 (display type as
  structural element).
