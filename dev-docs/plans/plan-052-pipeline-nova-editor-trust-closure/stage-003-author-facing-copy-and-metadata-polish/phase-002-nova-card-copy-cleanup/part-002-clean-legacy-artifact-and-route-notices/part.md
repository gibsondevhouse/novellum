---
title: Clean Legacy Artifact And Route Notices
slug: part-002-clean-legacy-artifact-and-route-notices
part_number: 2
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-002-nova-card-copy-cleanup
started_at: 2026-06-15
completed_at: 2026-06-15
estimated_duration: 0.25d
---

## Objective

Replace internal labels like Legacy artifact and Legacy fullscreen route with author-safe copy or remove them from default UI.

## Scope

**In scope:**

- Update NovaOutlineCard eyebrow copy.
- Update /nova route notice to user-facing Muse workspace language or remove the banner.
- Preserve navigation reachability.

**Out of scope:**

- Redesigning the full Nova route.

## Implementation Steps

1. Inspect legacy artifact and /nova route labels in current UI.
2. Replace dev-facing copy with user-facing wording.
3. Add a small route/card assertion where practical.

## Files

**Create:**

- None

**Update:**

- `src/modules/nova/components/NovaOutlineCard.svelte`
- `src/routes/nova/+page.svelte`

**Reference:**

- `src/modules/nova/components/NovaPanel.svelte`
- `src/routes/nova/+page.svelte`

## Acceptance Criteria

- [x] Users do not see Legacy artifact as a default eyebrow.
- [x] The /nova route does not present itself as an internal/deprecated engineering route.
- [x] Updated copy does not promise parity features that are not present.

## Edge Cases

- Some users may still reach /nova directly from browser history or navigation.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is in `review` pending real Reviewer Agent sign-off. Keep review and mutation boundaries real.
