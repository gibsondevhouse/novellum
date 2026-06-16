---
title: Clean Outline And Author Draft Review Cards
slug: part-001-clean-outline-and-author-draft-review-cards
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-002-nova-card-copy-cleanup
started_at: 2026-06-15
completed_at: 2026-06-15
estimated_duration: 0.75d
---

## Objective

Remove raw timestamps, hashes, prompt versions, schema labels, scene UUIDs, and the Sidecar term from default Nova review cards.

## Scope

**In scope:**

- Format generated dates with locale-safe display.
- Replace raw scene UUIDs with scene title or a concise fallback.
- Move context hash, prompt version, and schema version behind advanced details.
- Rename Sidecar to Author notes or Draft callouts.

**Out of scope:**

- Removing diagnostic metadata from persisted records.

## Implementation Steps

1. Apply display helpers to NovaOutlineDraftCheckpointCard.
2. Apply scene label and callout copy changes to NovaAuthorDraftCheckpointCard.
3. Add tests or snapshots for default and advanced metadata displays.

## Files

**Create:**

- `tests/nova/nova-review-card-copy.test.ts`

**Update:**

- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`

**Reference:**

- `src/lib/ai/pipeline/outline-draft-contract.ts`
- `src/lib/ai/pipeline/author-draft-contract.ts`

## Acceptance Criteria

- [x] Generated row displays a readable date/time.
- [x] Context hash and prompt version are not visible without advanced disclosure.
- [x] Scene metadata is readable to an author and avoids full UUID display.
- [x] Sidecar is replaced with author-facing terminology.

## Edge Cases

- Scene title can be blank.
- Unknown schema versions still need reviewer-safe warning copy.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is in `review` pending real Reviewer Agent sign-off. Keep review and mutation boundaries real.
