---
part: part-002-entity-form-surface
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

### [2026-04-25 20:50] Agent: [[Stylist Agent]]

Promoted the **dossier-form** CSS family to global `components.css` and migrated
the four dossier-style archive forms (Myth, Tradition, Technology,
ThreadSystem) to consume the canonical classes, eliminating four duplicated
~80-line `<style>` blocks.

- Promoted: `.dossier-form`, `.dossier-form-section`, `.dossier-form-grid`,
  `.dossier-form-grid--double`, `.dossier-form-field`, `.dossier-form-label`,
  `.dossier-form-hint`, `.dossier-form-input`, `.dossier-form-textarea`,
  `.dossier-form-input-error`, `.dossier-form-error-text`,
  `.dossier-form-actions` →
  [src/styles/components.css](../../../../../../../src/styles/components.css)
  (+108 LoC).
- Renamed `.archive-*` → `.dossier-form-*` in:
  [MythEntryForm](../../../../../../../src/modules/bible/components/MythEntryForm.svelte)
  (335 → 239 LoC),
  [TraditionEntryForm](../../../../../../../src/modules/bible/components/TraditionEntryForm.svelte)
  (365 → 269 LoC),
  [TechnologyEntryForm](../../../../../../../src/modules/bible/components/TechnologyEntryForm.svelte)
  (353 → 262 LoC),
  [ThreadSystemForm](../../../../../../../src/modules/bible/components/ThreadSystemForm.svelte)
  (588 → 497 LoC).
- Stripped duplicated local `<style>` blocks from all four. Net **−374 LoC**
  across forms, **−266 LoC** overall after the global addition.
- ThreadSystem's previous textarea `min-height: 5.5rem` aligned with the
  canonical 6rem (visually indistinguishable; intentional convergence).
- Validation logic, markup, and handler signatures unchanged.
- Gates: eslint clean (CSS file warned `no matching configuration` per repo
  convention — non-blocking); `pnpm run check` 0/0; `pnpm run check:tokens`
  247 / 0; `pnpm test --run` 39 / 261 passing.
- Evidence:
  [evidence/dossier-form-convergence-2026-04-25.md](evidence/dossier-form-convergence-2026-04-25.md).
- Carry-forward (out of this part's scope): Landmark/Realm forms still wrap
  `<SurfacePanel class="form-panel">` and override its chrome via
  `:global(.form-panel)` — they remain visually equivalent to the dossier
  pattern but carry their own `.field` / `.label` / `.input` declarations.
  Migrating them requires a structural decision (drop the wrapper or keep
  it) plus an autosave-binding audit; queued for a follow-up pass.
