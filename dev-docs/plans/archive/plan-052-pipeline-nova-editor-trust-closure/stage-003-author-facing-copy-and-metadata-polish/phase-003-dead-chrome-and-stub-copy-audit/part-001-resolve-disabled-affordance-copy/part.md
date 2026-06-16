---
title: Resolve Disabled Affordance Copy
slug: part-001-resolve-disabled-affordance-copy
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-003-dead-chrome-and-stub-copy-audit
started_at: 2026-06-15
completed_at: 2026-06-15
estimated_duration: 0.5d
---

## Objective

Remove or reword disabled and stubbed pre-release chrome so users do not encounter permanent dead ends.

## Scope

**In scope:**

- Audit Nova slash command button.
- Audit LM Studio disabled tab copy.
- Audit auto-updater unsupported reason string.
- Choose remove, hide, or truthful unavailable copy for each.

**Out of scope:**

- Implementing slash commands, LM Studio support, or auto-update signing.

## Implementation Steps

1. Inspect each disabled/stubbed surface.
2. Apply the smallest truthful copy or visibility change.
3. Add tests for updater reason and settings tab copy where stable.

## Files

**Create:**

- `tests/settings/ai-settings-copy.test.ts`

**Update:**

- `src/modules/nova/components/NovaComposer.svelte`
- `src/routes/settings/ai/+page.svelte`
- `src/lib/desktop/updater.ts`

**Reference:**

- `dev-docs/05-workflow/release.md`
- `dev-docs/qa-docs/v1.1-release-engineering/README.md`

## Acceptance Criteria

- [x] No visible control suggests a feature is clickable when it is not.
- [x] Unavailable provider/update features explain current support without internal scheduling language.
- [x] Implementation does not expand release-engineering scope.

## Edge Cases

- Settings tests should not require a real desktop updater environment.
- Removing a button must not shift composer layout awkwardly on mobile.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is in `review` pending real Reviewer Agent sign-off. Keep review and mutation boundaries real.
