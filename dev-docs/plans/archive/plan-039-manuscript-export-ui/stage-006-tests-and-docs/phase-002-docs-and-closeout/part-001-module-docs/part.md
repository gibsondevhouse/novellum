---
title: Update export module docs
slug: part-001-module-docs
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-006-tests-and-docs
phase: phase-002-docs-and-closeout
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.15d
dependencies: ["part-003-e2e-export-flow"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Update export module docs

## Objective

Document the manuscript export UI, supported formats, and service contract for future agents.

## Problem

Without a module note, future agents may rediscover or misrepresent export formats, profile behavior, and desktop fallback policy.

## Files

**Create:**

- `dev-docs/modules/export.md`

**Update:**

- `dev-docs/README.md`

## Required Changes

- Document supported formats and profiles.
- Document user flow and entry point.
- Document export service request shape.
- Document web/desktop delivery policy.
- Document known future work: PDF, custom profiles, export history, native desktop save.

## UI/UX Requirements

- Docs must describe user-visible behavior, not just code internals.

## Data Requirements

- Docs must state whether metadata/settings persist.

## Error Handling Requirements

- Docs must state cancel versus failure behavior.

## Tests

- No code tests required.
- Docs should reference test files added in this plan.

## Acceptance Criteria

- [x] Export module docs exist or are updated.
- [x] Supported formats and profiles are documented accurately.
- [x] Future work is separated from delivered behavior.

## Out of Scope

- Do not rewrite unrelated module docs.

## Dependencies

- part-003-e2e-export-flow

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Document the manuscript export UI, supported formats, and service contract for future agents.
2. **Problem:** Without a module note, future agents may rediscover or misrepresent export formats, profile behavior, and desktop fallback policy.
3. **Files:** Create: dev-docs/modules/export.md. Update: dev-docs/README.md.
4. **Changes:** Document supported formats and profiles., Document user flow and entry point., Document export service request shape., Document web/desktop delivery policy., Document known future work: PDF, custom profiles, export history, native desktop save.
5. **UI/UX:** Docs must describe user-visible behavior, not just code internals.
6. **Data:** Docs must state whether metadata/settings persist.
7. **Errors:** Docs must state cancel versus failure behavior.
8. **Tests:** No code tests required., Docs should reference test files added in this plan.
9. **Criteria:** Export module docs exist or are updated., Supported formats and profiles are documented accurately., Future work is separated from delivered behavior.
10. **Out-of-scope:** Do not rewrite unrelated module docs.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-003-e2e-export-flow.
