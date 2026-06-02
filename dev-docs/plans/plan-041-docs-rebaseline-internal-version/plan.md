---
title: Docs Re-baseline — Internal Version Framing
slug: plan-041-docs-rebaseline-internal-version
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-01
last_updated: 2026-06-01
target_completion: 2026-06-01
stages:
  - stage-001-rebaseline
dependencies:
  - plan-038-novel-engine-v1
quality_gates:
  - lint
  - check:tokens
---

## Objective

Re-baseline `dev-docs/` and `novellum-docs/` to reflect two realities:

1. **Novellum is not yet at a public V1.** Existing references to "V1 sellable",
   "V1 Definition-of-Done", "V1.1", "UI v2 design system" describe **internal
   development milestones**, not public releases. The wording in the docs has bled into
   tone that implies a shipped product.
2. **Plans 030 through 038 closed.** The roadmap and master tracker have not absorbed the
   shipped scope from those plans (Nova production refactor, VS Code Copilot parity,
   worldbuild generation, JSON encoding fix, context-priority generation, agentic worldbuild
   scan, novel engine v1).

## Scope

**In scope:**

- Update `dev-docs/01-project/roadmap.md`: roll `Last verified`, add plans 030-038 to
  Shipped, reframe V1/V1.1/v2 language as **internal milestones**, prune deferred items
  that now have plans (plan-039, plan-040), clarify versioning convention up front.
- Update `novellum-docs/user/nova.md`: remove the "four more agents are planned" claim
  (those agents were cut by plan-025; AGENTS.md confirms).
- Update `novellum-docs/user/faq.md`: stop pointing licensing answers at the now-closed
  plan-018; just reference LICENSE/EULA/TERMS as the source of truth. Roll `Last verified`.
- Roll `Last verified` dates across architecture, AI, modules, and workflow docs that
  remain content-accurate (no structural rewrites — date sweep only).
- Update `dev-docs/README.md` `Last verified`.

**Out of scope:**

- Content rewrites of architecture/module docs that are still accurate.
- Rewriting `novellum-docs/developer/Novellum Design System/ui_kits/novellum-v2/README.md`
  (it correctly describes the internal v2 UI kit — no marketing claim there).
- Updating archived doc snapshots under `dev-docs/archive/2026-05-pre-refactor/`.

## Versioning Convention (to be added to roadmap)

Internal milestones (V1, V1.1, V2) are **development checkpoints**, not public releases.
Novellum has not cut a public release. When that happens, it will be tagged `desktop-v1.0.0`
in git and referenced explicitly as a public release.

## Stages

| #   | Stage                                              | Status        | Est. Duration |
| --- | -------------------------------------------------- | ------------- | ------------- |
| 001 | [Rebaseline Sweep](stage-001-rebaseline/stage.md)  | `complete`    | 0.5d          |

## Quality Gates

- `pnpm lint` — clean
- `pnpm check:tokens` — 0 violations
- Manual: docs render correctly in Markdown preview, all links resolve.

## Notes

This is a docs-only plan. No source code changes. No new tests required.
