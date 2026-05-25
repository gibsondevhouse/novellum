---
name: novellum-design
description: Use this skill to generate well-branded interfaces and assets for Novellum, the local-first AI-assisted novel production workspace by Gibson Dev House. Contains essential design guidelines, colors, type, fonts, assets, and a full UI kit for prototyping cinematic, editorial writing-tool interfaces.
user-invocable: true
---

Read the `README.md` file within this skill first — it covers Novellum's voice, visual foundations, iconography, motion, and the design tokens. Then explore:

- `colors_and_type.css` — drop this stylesheet at the top of any prototype. It defines two layers of tokens: base (`--surface-raised`, `--accent-nova-blue`, `--serif-display`, …) and semantic (`--h1-font`, `--p-size`, `--logline-style`, …). It also styles `h1–h4`, `p`, `a`, `code`, `:focus-visible`, and ships `.eyebrow / .display / .logline / .body-sm` utilities. Loads Inter, DM Serif Display, JetBrains Mono from Google Fonts.
- `assets/nvlm-logo.png` — the product mark. Use it on any "Novellum" surface.
- `assets/icons/*.svg` — Lucide-family icons used in the production chrome (home, book, star, plus, settings, send, search, …). Each is 24×24, 2px stroke, round caps, `currentColor`.
- `assets/cover-palettes.json` — the six gradient pairs for generated book covers. Use with a 160° linear gradient + a foil-screen overlay + a serif initial.
- `preview/*.html` — small reference cards (swatches, type specimens, components in isolation). Useful as visual cribsheets.
- `ui_kits/novellum/` — a high-fidelity React recreation of the Novellum app with Library, Project Hub, Editor, Reader, and Nova screens. Copy components from here when building mocks of Novellum surfaces.
- `reference/tokens.css`, `reference/components.css`, `reference/archive-design-system.md` — raw files lifted from the Novellum codebase, for citation.

## How to design for Novellum

If you're creating visual artifacts (slides, mocks, throwaway prototypes), copy `colors_and_type.css` and any needed assets into the artifact's folder and link them. Compose UI from the React primitives in `ui_kits/novellum/primitives.jsx` if you're building in React, or write fresh HTML using the same class structure as `ui_kits/novellum/styles.css`.

If you're working on production Novellum code, this skill is reference material. The canonical source of truth is `src/styles/tokens.css` in the Novellum repository — these tokens are mirrored here under different names. Cross-reference before committing.

## Designing in Novellum's voice

- The voice is **calm, literate, craft-respecting**. Verbs like "open", "continue", "save", "summon". No cheer, no exclamation marks, no "Awesome!".
- Address the writer in **second person**. The AI persona "Nova" is first-person.
- Page titles are Title Case. Eyebrow labels are UPPERCASE with `--tracking-wide`. Body is sentence case.
- **DM Serif Display** carries title energy — use it for h1, project titles, loglines (italic), reader prose. **Inter** handles UI.
- **No emoji** outside the onboarding flow. Use Lucide-family inline SVG for everything else.
- Color: dark warm near-black (`--surface-raised: #191917`), accents are Nova blue and teal only. Never invent new accent colors.
- Motion: signature easing is `--ease-editorial` (cubic-bezier(.16,1,.3,1)) — a spring-like settle. Use it for panels and cards that need a felt arrival.

## When invoked without further guidance

Ask the user what they want to build (a marketing site? new feature mock? slide deck for a release?), then ask 2–4 sharp questions:

1. Which Novellum surface are we extending or replacing (Library, Project Hub, Editor, Reader, Nova, World Building, Continuity, Export)? Or is this a new surface?
2. Dark only, or do we need light mode (parchment) too?
3. Static mock, interactive prototype, or a real component?
4. Any reference material (Figma, screenshots, existing route in the codebase)?

Then act as an expert designer with deep familiarity with Novellum's idioms. Output HTML artifacts when sketching; React components when integrating with the kit.
