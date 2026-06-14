# ACTIVE PLAN

> Single source of truth for "which plan is currently being worked on".
> Any agent (Codex CLI, Claude Code, Gemini CLI, GitHub Copilot) resuming
> work should read this file first, then jump to the plan it points at.

## Current

[plan-049-agent-runtime-stack-hardening](./plan-049-agent-runtime-stack-hardening/plan.md) — Agent Runtime Stack Hardening. Next slice: Stage 005 Observability, Evals & Diagnostics. Status: `in-progress`.

## Pending review

No plans are currently pending plan-level review.

## Recently completed

- [plan-047-worldbuilding-canon-merge-diff](./plan-047-worldbuilding-canon-merge-diff/plan.md) — Worldbuilding Canon Merge Diff. Upgraded worldbuilding proposal acceptance from insert-only projection to reviewable canon diff/merge behavior with audit metadata, duplicate evidence, and E2E coverage. Closed 2026-06-14 after plan-level reviewer evaluation.
- [plan-046-pipeline-checkpoint-contract-reconciliation](./plan-046-pipeline-checkpoint-contract-reconciliation/plan.md) — Pipeline Checkpoint Contract Reconciliation. Reconciled checkpoint route ownership, schema versions, docs, and full E2E expectations across current generation pipelines. Closed 2026-06-14 after plan-level reviewer evaluation.
- [plan-043-outline-pipeline-consolidation](./plan-043-outline-pipeline-consolidation/plan.md) — Outline Pipeline Consolidation. Retired legacy direct apply paths; made checkpoints the sole materialization path. Closed 2026-06-12 after plan-level reviewer evaluation.
- [plan-045-agent-tool-mutation-boundary](./plan-045-agent-tool-mutation-boundary/plan.md) — Agent Tool Mutation Boundary. Separated model-callable Agent tools from trusted UI/app mutation commands; added capability classification, model advertisement filtering, default mutation dispatch blocking, source-contract coverage, docs sync, and current quality-gate evidence. Closed 2026-06-12 after Reviewer Agent sign-off.
- [plan-044-nova-active-context-routing](./plan-044-nova-active-context-routing/plan.md) — Nova Active Context Routing. Resolved brittle context detection by centralizing resolution in `activeContext` store. Integrated with root layout and Nova panel, ensuring grounding on deep routes. (Closed 2026-06-11).
- [plan-042-quality-gates-closure](./plan-042-quality-gates-closure/plan.md) — Quality Gates Closure. Eliminated all 11 pre-existing `pnpm check` warnings (unused CSS selectors + a11y autofocus), fixed the `lint:css` duplicate `text-align` error in `IndividualsWorkspaceShell.svelte`, hardened sidebar active-project detection to guard against non-`/projects/` routes (with 6 new unit tests), and audited Dexie boundary (all imports correct; assets module documented as known exception pending dedicated migration). Closed 2026-06-04. Quality gates: check (0 errors, 0 warnings, 1833 files), lint (clean), lint:css (clean), test (237 files / 1728 tests), tokens (347 files / 0 violations).

- [plan-040-outline-generation](./plan-040-outline-generation/plan.md) — Outline Generation: Worldbuilding to Outline. Shipped review-gated outline proposal generation from worldbuilding context, Nova review UI, atomic accept materialization, conflict/stale/rollback safety, docs sync, and closeout evidence. Closed 2026-06-04. Quality gates: check (0 errors, 11 pre-existing warnings), lint (clean), lint:css waived for known unrelated `IndividualsWorkspaceShell.svelte:183`, test (237 files / 1722 tests), tokens (347 files / 0 violations), targeted e2e (2 tests).
- [plan-039-manuscript-export-ui](./plan-039-manuscript-export-ui/plan.md) — Manuscript Export UI: wired `ManuscriptExportDialog` to existing export services, chapter subset selector, delivery helper, profile/format selectors, metadata fields, `openJsonExport` context preserving legacy JSON portability flow. 6 stages, all quality gates passed (check 0 errors, lint clean, 219 tests / 1615, tokens 345 files / 0 violations). Closed 2026-06-03.
- [plan-041-docs-rebaseline-internal-version](./plan-041-docs-rebaseline-internal-version/plan.md) — Docs rebaseline: reframe V1/V1.1/V2 references as **internal development milestones** (Novellum has not cut a public release yet), absorb plans 030–038 into the roadmap, drop the closed plan-018 reference and the four cut-agents claim from user docs, and roll `Last verified` across content-accurate dev-docs. Closed 2026-06-01.
- [plan-038-novel-engine-v1](./plan-038/plan.md) — Novel Engine v1: Draft From Outline guided pipeline. Closed 2026-06-01 with all 5 stages complete. Agentic surface copy fixes, fetch DI for buildContext, author-draft checkpoint service with stale-guard, chapter draft runner, quality gap closure (unresolvedThreads, rawOutput strip, progress counter fix, draft lifecycle removal). Quality gates: check (0 errors), lint (clean), test (212 files / 1575 tests), tokens (0 violations). Pre-existing lint:css error in IndividualsWorkspaceShell documented.
- [plan-037-agentic-worldbuild-scan](./plan-037-agentic-worldbuild-scan/plan.md) — Agentic worldbuild scan + review-gated proposal flow. Closed 2026-05-31 with all 5 stages complete; scan execution wired 2026-06-01. Scan contract, provider-backed proposal generation, proposal schema, pending notification UI, atomic accept/reject, 73 new tests. Quality gates: check (0 errors), test (209 files / 1546 tests), tokens (0 violations). Pre-existing lint and lint:css errors documented.
- [plan-036-context-priority-generation](./plan-036-context-priority-generation/plan.md) — Context-priority worldbuilding generation with typed target/avoid hints, expanded character draft field coverage, and faction/lineage extension. Closed 2026-05-30 (PR #26 merge).
- [plan-035-fix-json-double-encoding](./plan-035-fix-json-double-encoding/plan.md) — GeneratedEntityModal JSON hardening and double-encoding fix for world-building draft saves. Closed 2026-05-30 (PR #25 merge).
- [plan-034-world-building-workflow-refactor](./plan-034/plan.md) — World Building Workflow Refactor. Stage 001 (Foundation Refactor) complete. Stages 002–004 pending.
- [plan-032-worldbuilding-generation-engine](./plan-032-worldbuilding-generation-engine/plan.md) — Worldbuilding Generation Engine + Help Disclosure. Closed 2026-05-29. Proactive one-click entity generation (character / faction / realm / landmark / lore-entry / plot-thread / timeline-event) with review modal; help-disclosure toggles on all worldbuilding landing pages; AppShell transition token fix. Quality gates: `pnpm check` (0 errors), `pnpm lint` (clean), `pnpm lint:css` (clean), `pnpm test` (194 files / 1359 tests), `pnpm check:tokens` (0 violations).
- [plan-031-nova-vscode-copilot-parity](./plan-031-nova-vscode-copilot-parity/plan.md) — Nova VS Code Copilot Parity. Closed 2026-05-28 with all 5 stages complete. Compact sidepanel, Ask/Write/Agent modes, real attachments, bounded agentic tool loop (MAX_AGENT_STEPS=8), source-contract tests. Quality gates: `pnpm check` (0 errors), `pnpm lint` (clean), `pnpm lint:css` (clean), `pnpm test` (194 files / 1358 tests), `pnpm check:tokens` (0 violations). Visual test waived on same basis as plan-030.
- [plan-030-nova-production-refactor](./plan-030-nova-production-refactor/plan.md) —
  Nova Production Refactor. Closed 2026-05-28 with all 4 stages complete.
  Quality gates: `pnpm run check`, `pnpm run lint`, `pnpm run lint:css`,
  and `pnpm run test` passed (`190` files / `1299` tests). Full
  `pnpm run test:visual` reported existing cross-surface snapshot drift;
  targeted Nova visual specs were run as substitution (`2` passed, `3` skipped).
- [plan-029-v1.1-unfinished-work-closeout](./plan-029-v1.1-unfinished-work-closeout/plan.md) —
  V1.1 Unfinished Work Closeout. Closed 2026-05-27 with all 4 stages
  complete. Retired plan-019 (naming consistency — superseded by organic
  evolution), plan-021 (reader pagination — shipped via plans 027/028),
  and plan-024 stage-003 (Ollama & shortcuts — shipped). Executed plan-024
  stage-006 docs rebaseline at reduced scope. Deferred plan-024 stage-002
  (release engineering) to a dedicated release plan. Quality gates: 187
  files / 1270 tests passing; token guard 325 files / 0 violations.
- [plan-028-v1.1-hierarchical-pipeline-ui](./plan-028/plan.md) —
  V1.1 Hierarchical Pipeline UI. Closed 2026-05-26 with all four stages
  complete. Final vitest baseline: 187 files / 1268 tests passing.
- [plan-027-v1.1-scoping](./plan-027-v1.1-scoping/plan.md) —
  V1.1 Fiction Pipeline Scoping & Delivery. Closed 2026-05-27 with
  all three stages complete. Final vitest baseline: 177 files / 1156 tests.
- [plan-024-v1-final-mile](./archive/plan-024-v1-final-mile/plan.md) —
  V1 DoD closure. Closed 2026-05-26 with 47/47 DoD items satisfied.
  Deferred stages fully resolved by plan-029.

## How to resume

1. Read this file. If `Current` says "No active plan", ask the user
   what to work on next.
2. Open the current plan's `plan.md` and find the first stage whose
   `status` is not `complete`. That is the next stage to work on.
3. Inside that stage, find the first phase (or, if phases are not yet
   populated, scaffold them from `_templates/phase.template.md`).
