# impl.log — part-001-roll-last-verified

## 2026-06-01 — Date sweep across content-accurate docs

Rolled `> Last verified: 2026-05-07` (and earlier dates) to `2026-06-01` on
docs whose structural content is unchanged.

**Rolled:**

- `dev-docs/README.md`
- `dev-docs/01-project/project-overview.md`
- `dev-docs/01-project/journey.md`
- `dev-docs/02-architecture/system.md`
- `dev-docs/02-architecture/backend.md`
- `dev-docs/02-architecture/modular-boundaries.md`
- `dev-docs/02-architecture/tauri-shell.md`
- `dev-docs/02-architecture/routing.md`
- `dev-docs/05-workflow/dev-workflow.md`
- `dev-docs/05-workflow/planning-conventions.md`
- `dev-docs/05-workflow/testing.md`
- `dev-docs/05-workflow/portability-runbook.md`
- `dev-docs/05-workflow/release.md`
- `dev-docs/04-modules/README.md`

**Deferred — content review needed before bumping date:**

These docs cover surfaces that changed materially under plans 030–038. Their
existing dates (2026-05-25 through 2026-05-30) post-date most of those plans,
so they are still defensible as a snapshot. Rolling them to 2026-06-01 without
a content pass would be misleading. Flagged for the next docs sweep:

- `dev-docs/02-architecture/frontend.md` (2026-05-25) — may need updates for
  Nova VS Code Copilot parity (plan-031).
- `dev-docs/02-architecture/data-model.md` (2026-05-26) — may need updates
  for novel engine v1 schema (plan-038).
- `dev-docs/03-ai/agents-map.md` (2026-05-26) — Nova production refactor
  (plan-030) and worldbuild generation (plan-032/034) may have changed agent
  contracts.
- `dev-docs/03-ai/context-engine.md` (2026-05-27) — agentic worldbuild scan
  (plan-037) may have changed context assembly.
- `dev-docs/03-ai/pipeline.md` (2026-05-28) — novel engine v1 (plan-038)
  added a new pipeline.
- `dev-docs/03-ai/prompt-system.md` (2026-05-07) — needs review against
  plans 032, 036, 037, 038.
- `dev-docs/04-modules/*.md` per-module pages (mostly 2026-05-25) — many
  modules touched by plans 030–038.

These are tracked for a follow-up content-verification plan, not just a date
sweep.

Evidence: see `evidence/files-rolled.md`.

## 2026-06-01 — Follow-up audit pass (factual rebaseline + novellum-docs sweep)

After the initial sweep landed, ran a broader audit across `dev-docs/`
(excluding `plans/` and `archive/`) and `novellum-docs/`. Found and fixed
five factually stale claims and rolled `Last verified` across the rest of
`novellum-docs/`.

**Factual fixes:**

- `GEMINI.md` — `BrainstormAgent`/`OutlineAgent`/`DraftAgent`/`SummaryAgent`
  were listed as "Planned agents". Replaced with the same "Cut from internal
  V1 (2026-05-13, plan-025)" framing used in `AGENTS.md` and
  `dev-docs/03-ai/agents-map.md`.
- `dev-docs/01-project/journey.md` — Era 7/8 reframed to "Internal V1 trust
  foundation" / "Internal V1 product experience" (was "V1 sellable"). Era 9
  rewritten: it previously claimed plan-019 and plan-021 were `draft`, but
  plan-029 retired both on 2026-05-27. Era 9 now reflects the V1.1 fiction
  pipeline + cleanup actually shipped (plans 019/021/024/027/028/029). Era 10
  added (Nova production & worldbuild generation, 030–038, 041). Old Era 10
  ("Next: full AI integration" with "four planned agents Brainstorm/Outline/
  Draft/Summary") → renumbered to Era 11 and the four-cut-agents reference
  removed; replaced with pointers to the drafted plan-039 / plan-040.
- `dev-docs/01-project/journey.md` — fixed broken plan paths
  (`../plans/plan-017-…` → `../plans/archive/plan-017-…`, etc.).
- `dev-docs/05-workflow/release.md` — "Plans relevant to release" claimed
  plan-018's CI/release stage was "in flight"; plan-018 closed 2026-05-06.
  Updated to: plan-017 packaging complete, plan-018 CI/release + licensing
  complete, with outstanding signing/notarisation/icons/CI work pointed at
  `dev-docs/qa-docs/v1.1-release-engineering/`.
- `dev-docs/03-ai/pipeline.md` — "shipped vs planned agents" pointer
  rewritten to "shipped agents and the agents cut from internal V1".
- `dev-docs/01-project/roadmap.md` — fixed seven broken plan paths (plans
  027, 028, 030, 031, 032, 035, 036 all live under `archive/`).
- `dev-docs/qa-docs/manual-smoke-checklist-v1.md` — title and intro reframed:
  "V1 — Manual smoke checklist" was misleading because the checklist is the
  canonical packaged-build smoke test, not a single-release artefact. Date
  rolled to 2026-06-01 with a note that it was originally cut for the
  internal V1 desktop checkpoint (plan-025).

**`Last verified` rolled across novellum-docs/:**

- `novellum-docs/README.md`
- `novellum-docs/user/quick-start.md`, `install.md`, `editor.md`, `export.md`,
  `worldbuilding.md`, `ai-setup.md`, `keyboard-shortcuts.md`,
  `backup-restore.md`, `local-first.md`, `nova.md`
- `novellum-docs/developer/getting-started.md`, `architecture.md`,
  `release.md`, `testing.md`, `contributing.md`

**Out of scope / left alone:**

- `dev-docs/plans/MASTER-PLAN.md` and `dev-docs/plans/ACTIVE-PLAN.md` contain
  pre-existing broken paths to plans 027, 028, 029, 030, 031, 032, 035, 036,
  037 (all moved under `archive/`). Plan-041's scope explicitly excluded
  `plans/` content rewrites — flagged for a separate plan-042.
- `dev-docs/qa-docs/v1.1-release-engineering/**` references to "plan-018
  stage-010" are factually correct — those tasks describe deferred release
  engineering work that historically maps to plan-018 stage-010. Left as-is.
- AI/architecture/module pages already deferred above remain deferred.

Quality gates: `pnpm lint` clean, `pnpm check:tokens` clean (339 files / 0
violations) — re-confirmed after the addendum.
