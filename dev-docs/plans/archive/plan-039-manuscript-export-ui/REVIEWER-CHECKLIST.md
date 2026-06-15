---
title: Reviewer Checklist
slug: plan-039-reviewer-checklist
created: 2026-06-01
---

# Reviewer Checklist

## Plan Structure

- [x] `plan.md` exists and lists all stages.
- [x] Each stage has `stage.md`.
- [x] Each phase has `phase.md`.
- [x] Each part has `part.md`, `checklist.md`, `impl.log.md`, and `evidence/README.md`.
- [x] No template placeholder syntax remains.

## Product Review

- [x] Export manuscript action is discoverable.
- [x] JSON backup/export flow still exists.
- [x] Format options match supported export formats.
- [x] Profile options match supported manuscript profiles.
- [x] Metadata fields influence exported manuscript.
- [x] Chapter subset selection influences exported manuscript.
- [x] Empty selections are blocked.
- [x] Cancel is not treated as failure.

## Engineering Review

- [x] `exportProject()` accepts UI-selected compile options.
- [x] `assembleManuscript()` receives selected chapter IDs.
- [x] Browser download helper is centralized.
- [x] Desktop fallback policy is tested.
- [x] Tests cover service, component, and one e2e path.
- [x] Token/design-system rules are followed.

## Closeout Review

- [x] Evidence files contain real outputs.
- [x] `impl.log.md` files are append-only.
- [x] `MASTER-PLAN.md` is updated if required.
- [x] Reviewer handoff identifies residual risks.
