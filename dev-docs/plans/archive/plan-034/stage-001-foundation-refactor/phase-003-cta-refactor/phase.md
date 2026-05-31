---
title: CTA Refactor
slug: phase-003-cta-refactor
phase_number: 3
status: complete
owner: Stylist Agent
stage: stage-001-foundation-refactor
parts:
  - part-001-rename-world-building-ctas
  - part-002-add-readiness-copy
estimated_duration: 1.5d
---

## Goal

Rename "Start Writing with Nova" to semantically correct worldbuilding labels on the World Building page, and add static section readiness copy to each domain tile based on the workflow config created in phase-002.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Rename World Building CTAs](part-001-rename-world-building-ctas/part.md) | `draft` | — | 0.5d |
| 002 | [Add Readiness Copy](part-002-add-readiness-copy/part.md) | `draft` | — | 1d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] No instance of "Start Writing with Nova" appears on the World Building page
- [ ] Primary CTA uses one of: "Start Worldbuild with Nova", "Generate Worldbuilding Plan", or "Build World Bible with Nova"
- [ ] Each domain tile displays a readiness label drawn from the workflow config (e.g. "Recommended first", "Requires Personae", "Ready to generate")
- [ ] Readiness labels are static (no DB queries required)
- [ ] CTA and readiness copy are token-driven (no hardcoded colors)
- [ ] `pnpm check`, `pnpm lint`, `pnpm lint:css` pass

## Notes

**Depends on phase-002:** Readiness copy must reference the workflow config sequence, not be hardcoded inline.

The "Start Writing with Nova" label is semantically wrong here because "writing" implies manuscript drafting. This page is about canon/world generation. The rename is small but signals intentional product positioning.

Readiness labels by domain (from the workflow config):

| Domain | Label |
| --- | --- |
| Personae | Recommended first |
| Atlas | Requires Personae |
| Archive | Works best after Atlas |
| Threads | Requires Personae + Atlas |
| Chronicles | Works best after all domains |
