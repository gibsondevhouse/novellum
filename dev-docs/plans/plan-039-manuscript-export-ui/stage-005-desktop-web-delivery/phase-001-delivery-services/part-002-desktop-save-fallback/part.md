---
title: Implement desktop save fallback policy
slug: part-002-desktop-save-fallback
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-005-desktop-web-delivery
phase: phase-001-delivery-services
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.25d
dependencies: ["part-001-create-web-download-service"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Implement desktop save fallback policy

## Objective

Implement a safe delivery policy that attempts desktop save only when available and otherwise falls back to browser download.

## Problem

The desktop abstraction exists, but Tauri methods may still be placeholders. A manuscript export cannot fail merely because desktop save is not wired yet.

## Files

**Create:**

- None.

**Update:**

- `src/modules/export/services/export-delivery.ts`
- `src/modules/export/services/export-delivery.test.ts`
- `src/modules/export/components/ManuscriptExportDialog.svelte`

## Required Changes

- Add delivery function that receives blob, filename, and delivery preference.
- If desktop save is available and returns a path, write only through an existing safe file-writing capability if present.
- If desktop save is unavailable, cancelled, or unimplemented, fall back to web download unless user explicitly selected desktop-only.
- Treat save dialog cancel as `cancelled`, not `failed`.
- Return a typed delivery result for UI state.

## UI/UX Requirements

- Show clear success for browser download or desktop save.
- Show neutral cancelled state for user cancel.
- Avoid exposing Tauri placeholder internals to users.

## Data Requirements

- No database changes.
- No persistent export history.

## Error Handling Requirements

- Normalize unimplemented desktop errors into fallback behavior where safe.
- Only show failure when both generation and delivery cannot complete.

## Tests

- Web fallback path returns downloaded result.
- Desktop cancel returns cancelled result.
- Desktop unimplemented path falls back to browser download.
- Delivery failure is surfaced when fallback also fails.

## Acceptance Criteria

- [x] Browser export works even when Tauri save is unavailable.
- [x] Cancel is not shown as error.
- [x] Delivery result drives dialog status.
- [x] Tests cover fallback behavior.

## Out of Scope

- Do not implement new Rust/Tauri commands unless an existing capability requires a minimal companion change.
- Do not block browser export on desktop shell readiness.

## Dependencies

- part-001-create-web-download-service

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Implement a safe delivery policy that attempts desktop save only when available and otherwise falls back to browser download.
2. **Problem:** The desktop abstraction exists, but Tauri methods may still be placeholders. A manuscript export cannot fail merely because desktop save is not wired yet.
3. **Files:** Create: None. Update: src/modules/export/services/export-delivery.ts, src/modules/export/services/export-delivery.test.ts, src/modules/export/components/ManuscriptExportDialog.svelte.
4. **Changes:** Add delivery function that receives blob, filename, and delivery preference., If desktop save is available and returns a path, write only through an existing safe file-writing capability if present., If desktop save is unavailable, cancelled, or unimplemented, fall back to web download unless user explicitly selected desktop-only., Treat save dialog cancel as `cancelled`, not `failed`., Return a typed delivery result for UI state.
5. **UI/UX:** Show clear success for browser download or desktop save., Show neutral cancelled state for user cancel., Avoid exposing Tauri placeholder internals to users.
6. **Data:** No database changes., No persistent export history.
7. **Errors:** Normalize unimplemented desktop errors into fallback behavior where safe., Only show failure when both generation and delivery cannot complete.
8. **Tests:** Web fallback path returns downloaded result., Desktop cancel returns cancelled result., Desktop unimplemented path falls back to browser download., Delivery failure is surfaced when fallback also fails.
9. **Criteria:** Browser export works even when Tauri save is unavailable., Cancel is not shown as error., Delivery result drives dialog status., Tests cover fallback behavior.
10. **Out-of-scope:** Do not implement new Rust/Tauri commands unless an existing capability requires a minimal companion change., Do not block browser export on desktop shell readiness.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-create-web-download-service.
