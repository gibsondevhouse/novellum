# Stage 005 Phase 002 Part 002 — Entity Form Surface Convergence

**Captured:** 2026-04-25 20:50 EDT
**Implementer:** Stylist Agent

## Outcome

Promoted the **dossier-form** CSS family from per-component duplication into
[src/styles/components.css](../../../../../../../src/styles/components.css)
and migrated the four dossier-style archive forms.

## Form Landscape (audit)

The eleven Story Bible forms split into four clusters:

| Cluster | Pattern | Forms |
| ------- | ------- | ----- |
| A | Basic panel (`SurfacePanel.form-panel` + global `.field` / `.input`) | Location, LoreEntry, PlotThread, TimelineEvent |
| B | Panel with chrome stripped via `:global(.form-panel)` + local dossier-equivalent CSS | Landmark, Realm |
| C | Bare `<div class="archive-form">` + `.archive-*` family with duplicated CSS | Myth, Tradition, Technology, ThreadSystem |
| D | Sectioned panel with `Input` primitive | Character |

Clusters B and C are visually equivalent (transparent inputs, hover/focus
border, top-divided sections, eyebrow `h3`s) but used different class names
and re-declared the same CSS in every component.

## This Pass: Cluster C Convergence

Renamed `.archive-*` → `.dossier-form-*` and promoted the family to global.

| Form | Before (LoC) | After (LoC) | Reduction |
| ---- | ------------ | ----------- | --------- |
| MythEntryForm | 335 | 239 | -29% |
| TraditionEntryForm | 365 | 269 | -26% |
| TechnologyEntryForm | 353 | 262 | -26% |
| ThreadSystemForm | 588 | 497 | -15% |
| **Total** | **1641** | **1267** | **-374 (-23%)** |

Plus +108 LoC in `components.css` for the canonical family →
**net -266 LoC** with one source of truth for dossier form rhythm.

## Gates

- eslint: clean (one non-blocking config warning on the `.css` file).
- `pnpm run check`: 0 errors / 0 warnings.
- `pnpm run check:tokens`: 247 files / 0 violations.
- `pnpm test --run`: 39 files / 261 tests passing.

## Carry-forward

- Cluster B (Landmark, Realm) is the obvious next target — it currently
  wraps `<SurfacePanel class="form-panel">` then strips the chrome via
  `:global(.form-panel)` overrides, then re-declares the dossier rhythm
  with different class names (`.field` / `.label` / `.input`). Migrating
  needs a structural decision (drop wrapper vs keep) and an autosave
  binding audit — queued for a follow-up pass.
- Cluster A and D were intentionally left alone: they consume the
  existing transitional global `.field` / `.label` / `.input` family
  from `components.css` and have a distinct visual treatment (real panel
  chrome, opaque inputs).
