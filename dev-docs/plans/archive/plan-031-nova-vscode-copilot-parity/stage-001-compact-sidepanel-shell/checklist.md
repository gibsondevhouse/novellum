---
stage: stage-001-compact-sidepanel-shell
last_updated: 2026-05-28
status: draft
---

# Stage Checklist

## Pre-Implementation

- [ ] Branch is `feat/nova-development` and plan-030 stage 001 context grounding is treated as the companion baseline, not reimplemented here.
- [ ] Current Nova sidepanel visual behavior has been captured through screenshots or existing Playwright baselines.
- [ ] No mode, attachment, or agent-loop behavior is changed during this stage except where required to prevent visual dead controls.

## Implementation

- [ ] Complete `phase-001-density-audit-and-token-baseline` — Density Audit and Token Baseline
- [ ] Complete `phase-002-header-body-footer-compression` — Header, Body, and Footer Compression
- [ ] Complete `phase-003-composer-action-row` — Composer Auto-Grow and Action Row
- [ ] Complete `phase-004-message-log-and-empty-state-density` — Message Log and Empty State Density
- [ ] Complete `phase-005-visual-baseline-rebaseline` — Visual Baseline Rebaseline

## Post-Implementation

- [ ] Header, body, composer, message log, and footer use compact spacing tokens and remain keyboard accessible.
- [ ] Composer presents one action row: attach, slash/tools slot, mode slot placeholder, model picker, send.
- [ ] Nova visual baselines are rebaselined once and documented before later stages add behavior.
- [ ] `pnpm check:tokens`, targeted Nova visual tests, and accessibility smoke checks are recorded as evidence.
- [ ] Stage `impl.log.md` entries, if any, are append-only.
- [ ] Reviewer Agent has reviewed all child phases.
