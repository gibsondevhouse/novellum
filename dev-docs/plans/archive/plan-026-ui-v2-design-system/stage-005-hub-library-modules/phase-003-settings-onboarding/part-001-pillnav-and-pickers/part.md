---
title: PillNav + Pickers
slug: part-001-pillnav-and-pickers
part_number: 1
status: complete
owner: Stylist Agent
phase: phase-003-settings-onboarding
---

## Scope

- `PillNav`: active button rendered with a candle-tinted background
  (`color-mix(in srgb, var(--color-candle) 14%, var(--color-surface-elevated))`),
  candle-coloured text, and a 1px brass inset rule for a hand-bound
  feel.
- `routes/settings/appearance/+page.svelte`:
  - Title swapped to display font / normal weight.
  - `.appearance__heading` converted to 9px brass uppercase eyebrow.
  - `.picker__pill:focus-visible` outline uses
    `--color-border-focus`.
  - `.picker__pill--active` recoloured candle on a warm surface.
- `routes/settings/defaults/+page.svelte`: same picker treatment.
- `routes/settings/data/+page.svelte`: `.status-badge.migrating`
  remapped from `--color-nova-blue` to `--color-info`.

See [`checklist.md`](checklist.md) and [`impl.log.md`](impl.log.md).
