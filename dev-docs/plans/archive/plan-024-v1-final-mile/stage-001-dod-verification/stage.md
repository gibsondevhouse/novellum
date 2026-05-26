---
title: DoD Verification & Sign-off
slug: stage-001-dod-verification
stage_number: 1
status: complete
owner: Reviewer Agent
plan: plan-024-v1-final-mile
phases:
  - phase-001-static-inventory
  - phase-002-legal
  - phase-003-core-writing
  - phase-004-export
  - phase-005-ai-nova
  - phase-006-onboarding
  - phase-007-trust-and-data
  - phase-008-performance-and-fixtures
  - phase-009-ci-cd-and-changelog
  - phase-010-e2e-suites
  - phase-011-signoff
estimated_duration: 2d
risk_level: medium
started: 2026-05-10
---

## Goal

Run every checkbox in [v1-dod-checklist.md](../../../qa-docs/v1-dod-checklist.md)
as actual work, not paperwork. Each item must produce evidence
(test log, fixture timing, screenshot) committed under
`evidence/` of the corresponding part once phases are populated.

## Entry Criteria

- All V1 product plans (017, 018, 020, 022, 023) marked `complete`.
  ✅ Confirmed via `MASTER-PLAN.md` 2026-05-10.
- `master` is green for `pnpm check`, `pnpm lint`, and the
  source-tree subset of `pnpm test`.
  ⏳ Deferred to phase-001 (run as the first piece of evidence).

## Exit Criteria

- Every box in `v1-dod-checklist.md` is checked, with a one-line
  citation in `impl.log.md` to the evidence file that backs it.
- Reviewer Agent sign-off line at the bottom of the checklist is
  filled in.
- A `large-novel` fixture (100 chapters / 500 scenes / ≥100k words)
  exists under `tests/fixtures/` and is referenced by both the hub
  load timing test and the export no-freeze test.
- `idx_scenes_projectId` and `idx_scenes_chapterId` are asserted
  by an integration test against a freshly-migrated DB.
- `CHANGELOG.md` has a complete `v1.0.0-beta.1` entry.

## Phases

| #   | Phase                                                       | Status        | Source DoD section            | Est. Duration |
| --- | ----------------------------------------------------------- | ------------- | ----------------------------- | ------------- |
| 001 | Static inventory & gate baseline                            | `complete`    | (cross-cutting)               | 0.25d         |
| 002 | Legal — file existence & content match                      | `complete`    | "Legal" (5 items)             | 0.1d          |
| 003 | Core Writing (Editor)                                       | `draft`       | "Core Writing (Editor)" (7)   | 0.25d         |
| 004 | Export                                                      | `draft`       | "Export" (7)                  | 0.25d         |
| 005 | AI (Nova)                                                   | `complete`    | "AI (Nova)" (7)               | 0.25d         |
| 006 | Onboarding                                                  | `draft`       | "Onboarding" (3)              | 0.1d          |
| 007 | Trust and Data                                              | `complete`    | "Trust and Data" (5)          | 0.15d         |
| 008 | Performance, indexes, large-novel fixture                   | `draft`       | "Performance" (4)             | 0.4d          |
| 009 | CI/CD workflows + `v1.0.0-beta.1` CHANGELOG                 | `draft`       | "CI/CD" (5)                   | 0.2d          |
| 010 | E2E suites (4 Playwright specs)                             | `draft`       | "E2E Suites" (4)              | 0.25d         |
| 011 | Reviewer sign-off line filled in                            | `draft`       | (footer of checklist)         | 0.05d         |

> Phases 002–010 each map 1:1 to a DoD checklist category and produce
> at minimum one evidence file (`evidence/<phase-slug>-<date>.md`)
> citing the verification artifact (file path, line number, command
> output, or screenshot).

---

### Phase-001 — Static inventory & gate baseline

**Goal:** Establish a single triage report that lists, per DoD item,
whether it currently passes by static inspection alone, requires
command execution, or is already known to be broken. Run the three
quality gates (`pnpm check`, `pnpm lint`, source-tree `pnpm test`) so
the rest of the stage starts from a known-green baseline.

**Files to create under `evidence/`:**

- `triage-report-2026-05-10.md` — table covering all 47 DoD items.
- `gate-baseline-2026-05-10.txt` — combined output of `pnpm check`,
  `pnpm lint`, `pnpm lint:css`, `pnpm test` (filtered to source tree).

**Acceptance:**

- [ ] Triage table covers every DoD item, classified as `pass-static`,
      `needs-command`, `needs-manual`, or `at-risk`.
- [ ] Gate baseline file shows zero lint/type errors and the test
      summary line (pass/fail counts).
- [ ] Any `at-risk` item has a one-line note pointing at the file or
      symptom that raised the concern.

---

### Phase-002 — Legal

Verifies the five "Legal" items by reading repo-root files and the
`/settings/legal` and `/settings/about` route components.

**Items:**
1. `LICENSE` exists at repo root.
2. `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md` exist at repo root.
3. `/settings/legal` route renders EULA and NOTICE content.
4. `/settings/about` shows correct `APP_VERSION` and links to `/settings/legal`.
5. `NOTICE.md` lists all seven key third-party packages.

**Evidence:** `legal-2026-05-10.md` — file listing + grep results +
route component path:line citations.

---

### Phase-003 — Core Writing (Editor)

Seven items. Mix of static (TipTap loads, shortcuts wired, scene
create/delete routes) and interactive (typing lag on 5,000-word scene,
autosave timing). Static items can pass with code citations; interactive
items need either a Playwright assertion or manual screenshot.

**Evidence:** `core-writing-2026-05-10.md` + screenshots / log lines for
the interactive items.

---

### Phase-004 — Export

Seven items covering profile selector, three driver formats, EPUB script
escape, metadata pre-fill, partial export. All have existing tests in
`tests/export/` from plan-018; this phase confirms those tests pass on
master and that ExportModal is the surface they exercise.

**Evidence:** `export-2026-05-10.md` + test output excerpt.

---

### Phase-005 — AI (Nova)

Seven items. Most are surface checks (sidebar opens, error messages
render) plus the "Nova suggestions never auto-apply" rule from
[`AGENTS.md` §4 Guardrails](../../../../AGENTS.md). Streaming and
context disclosure require an integration test or live-key smoke run.

**Evidence:** `ai-nova-2026-05-10.md` + screenshots of error messages
+ context disclosure panel.

---

### Phase-006 — Onboarding

Three items. `tests/e2e/onboarding.spec.ts` covers two of them; the
"first-launch flag persists across refresh" item needs an explicit
storage-state assertion in the spec.

**Evidence:** `onboarding-2026-05-10.md` + Playwright report excerpt.

---

### Phase-007 — Trust and Data

Five items. Backup/restore round-trip, data location surfacing in
Settings, privacy route present, privacy text matches `PRIVACY.md`.

**Evidence:** `trust-and-data-2026-05-10.md` + a backup-restore diff
log.

---

### Phase-008 — Performance, indexes, large-novel fixture

Four items, **highest-risk phase in the stage:**

1. Hub loads under 2s on a 100-chapter / 500-scene fixture — fixture
   does not exist yet; must be generated.
2. No UI freeze during Markdown / DOCX export of a 100k-word project.
3. `idx_scenes_projectId` and `idx_scenes_chapterId` indexes present
   in the schema — assert via integration test against a freshly
   migrated DB.
4. `ExportModal` is loaded lazily.

**Files to create:**

- `tests/fixtures/large-novel/` — generator script + serialized SQLite
  fixture (100ch / 500sc / ≥100k words).
- `tests/db/schema-indexes.test.ts` — asserts the two index names
  exist after `runMigrations()` on a fresh in-memory DB.

**Evidence:** `performance-2026-05-10.md` with measured hub-load timing
(median over 3 cold loads) and bundle-analyzer output proving lazy
ExportModal split.

---

### Phase-009 — CI/CD + CHANGELOG

Five items. Workflow files already exist; verify each is green on
`master`, run `release.yml` validate+build dry-run, and write the
`v1.0.0-beta.1` CHANGELOG entry consolidating plans 017–023.

**Files to update:**

- `CHANGELOG.md` — add `## [1.0.0-beta.1] — 2026-05-10` entry.

**Evidence:** `ci-cd-2026-05-10.md` linking to GitHub Actions runs +
the CHANGELOG diff.

---

### Phase-010 — E2E Suites

Four named Playwright specs (`onboarding`, `project-lifecycle`,
`settings-ai-key`, `hub-word-count`) must pass on the **committed**
Playwright config — not from stale `.claude/worktrees/` copies.

**Evidence:** `e2e-2026-05-10.md` with the Playwright HTML report path
and a list of green / red specs.

---

### Phase-011 — Reviewer sign-off

Once phases 002–010 are all `complete`, the Reviewer Agent fills in the
final sign-off line at the bottom of `v1-dod-checklist.md`. No
implementation; this phase exists to keep the gate explicit.

## Notes

- This stage is mostly verification, not implementation, but it
  is the most likely to surface real bugs. Reserve buffer.
- The four E2E suites named in the DoD (`onboarding`,
  `project-lifecycle`, `settings-ai-key`, `hub-word-count`) must
  pass on the committed Playwright config — not from the stale
  `.claude/worktrees/` copies.
- Phase ordering is read-only first (002 Legal → 007 Trust) so that
  any code changes triggered by phase-008 (fixture, index test) and
  phase-009 (CHANGELOG) land against a stable, fully-inventoried tree.
