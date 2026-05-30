---
title: Review & Accept Flow
slug: phase-002-review-accept-flow
phase_number: 2
status: draft
owner: Architect Agent
stage: stage-003-generation-pipeline
parts:
  - part-001-create-review-card-component
  - part-002-wire-accept-reject-actions
  - part-003-canon-projection-on-accept
estimated_duration: 2.5d
---

## Goal

Build the domain-scoped artifact review card component that surfaces generated proposals to the user, wire accept/reject actions, and implement canon projection on accept.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Create Review Card Component](part-001-create-review-card-component/part.md) | `draft` | — | 1d |
| 002 | [Wire Accept & Reject Actions](part-002-wire-accept-reject-actions/part.md) | `draft` | — | 0.75d |
| 003 | [Canon Projection on Accept](part-003-canon-projection-on-accept/part.md) | `draft` | — | 0.75d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Each domain generates a review card that shows: proposed content, domain label, model used, generation timestamp, source context summary
- [ ] Review card renders inside the World Building page section (not as a separate route)
- [ ] Accept action triggers canon projection to the correct canonical tables
- [ ] Reject action discards the proposal and logs rejection reason
- [ ] No canon writes occur except on explicit accept
- [ ] Review cards are not auto-dismissed — they persist until the user decides
- [ ] `pnpm check`, `pnpm lint`, `pnpm test` pass

## Notes

**Depends on phase-001** (artifact envelopes) for proposal structure.

**Canon projection targets by domain:**

| Domain | Target tables |
| --- | --- |
| Personae | `characters`, `factions`, `character_relationships` |
| Atlas | `locations` |
| Archive | `lore_entries`, `themes`, `glossary_terms` |
| Threads | `plot_threads` |
| Chronicles | `timeline_events` |

**Review card placement:** Inline below the domain tile that triggered generation. Not a modal, not a separate route, not a global panel. This keeps the review context co-located with the domain it belongs to.

**Key safety rule:** Accept is a **user action**, not automatic. Any generation that completes without user interaction must remain in `review-ready` state indefinitely.
