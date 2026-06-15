---
title: Clean Outline Detail Metadata
slug: part-001-clean-outline-detail-metadata
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-002-checkpoint-detail-disclosure
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Remove raw runtime metadata from default outline checkpoint detail rows and replace it with author-facing context.

## Scope

**In scope:**

- Format timestamps.
- Replace task/pipeline jargon in detail rows.
- Hide raw payload behind Advanced details.
- Keep warnings and accept/reject implications visible.

**Out of scope:**

- Changing checkpoint persistence or materialization semantics.

## Implementation Steps

1. Audit every detail row and raw payload disclosure.
2. Apply display helpers and advanced disclosure grouping.
3. Update CSS to keep details scannable.
4. Add component or route tests for hidden debug metadata.

## Files

**Create:**

- `tests/outline/outline-checkpoint-detail-copy.test.ts`

**Update:**

- `src/routes/projects/[id]/outline/+page.svelte`

**Reference:**

- `src/routes/projects/[id]/outline/+page.svelte`

## Acceptance Criteria

- [ ] Default review panel does not show full JSON payload.
- [ ] Raw payload is still available under an Advanced details disclosure.
- [ ] Accept/reject warning copy names user impact, not internal task keys.

## Edge Cases

- Very large payloads should not freeze or resize the layout when disclosure opens.
- Debug disclosure should remain keyboard accessible.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
