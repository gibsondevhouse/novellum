---
title: Create Review Card Component
slug: part-001-create-review-card-component
part_number: 1
status: draft
owner: Architect Agent
assigned_to: Architect Agent
phase: phase-002-review-accept-flow
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `WorldbuildingProposalCard.svelte` that renders a domain generation proposal with domain label, proposed content preview, model used, creation timestamp, and source context summary. Render one card per domain in `+page.svelte` when a proposal exists.

## Scope

**In scope:**

- `WorldbuildingProposalCard` accepts `proposal: WorldbuildDomainCheckpointRecord` prop
- Renders: domain label, lifecycle badge (`draft` / `review`), proposed content summary, `model`, `createdAt`, `sourceContextSummary`
- Accept and Reject action buttons — wired to no-ops at this part (wired in part-002)
- Renders inline below the domain tile that triggered it (not a modal)

**Out of scope:**

- Wiring accept/reject to API calls (part-002)
- Canon projection logic (part-003)

## Implementation Steps

1. Confirm phase-001 (artifact envelopes) is complete.
2. Create `src/modules/world-building/components/WorldbuildingProposalCard.svelte`.
3. Accept `proposal: WorldbuildDomainCheckpointRecord` and render fields.
4. Style with design tokens; lifecycle badge uses `--color-status-*` tokens.
5. In `+page.svelte`, import the card and conditionally render it per domain when a proposal in `review-ready` state exists.
6. Run `pnpm check`, `pnpm lint:css`, `pnpm check:tokens`.
7. Screenshot in `evidence/`.

## Files

**Create:**

- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`

**Update:**

- `src/routes/projects/[id]/world-building/+page.svelte` (render proposal cards per domain)

## Acceptance Criteria

- [ ] `WorldbuildingProposalCard` renders domain label, lifecycle badge, preview, model, timestamp, context summary
- [ ] Card renders inline below its domain tile
- [ ] Accept and Reject buttons present (may be no-ops at this part)
- [ ] No hardcoded colors (`pnpm check:tokens` passes)
- [ ] Screenshot in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
