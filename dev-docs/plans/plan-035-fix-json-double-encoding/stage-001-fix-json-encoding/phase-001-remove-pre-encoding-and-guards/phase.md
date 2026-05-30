---
title: Remove Pre-Encoding & Add Type Guards
slug: phase-001-remove-pre-encoding-and-guards
phase_number: 1
status: review
owner: Planner Agent
stage: stage-001-fix-json-encoding
parts:
  - part-001-remove-pre-encoding
  - part-002-add-type-guards
estimated_duration: 1d
risk_level: low
---

## Goal

Remove 13 pre-encoding `JSON.stringify()` calls from `GeneratedEntityModal.saveDraft` and add type guards to 4 crash-prone array consumer functions. These are independent changes that can be implemented in parallel.

## Parts

| #   | Part                                     | Status  | Est. Duration |
| --- | ---------------------------------------- | ------- | ------------- |
| 001 | [Remove Pre-Encoding](part-001-remove-pre-encoding/part.md) | `review` | 0.5d |
| 002 | [Add Type Guards](part-002-add-type-guards/part.md) | `review` | 0.5d |

## Entry Criteria

- [ ] Branch `fix/json-double-encoding` is active
- [ ] Plan and stages documented
- [ ] All file locations and line numbers confirmed

## Exit Criteria

- [ ] All 13 pre-encoding removals completed
- [ ] All 4 type guards added (joinCommaSeparated, aliases.join, tags.slice.join, traits.join)
- [ ] No lint errors
- [ ] TypeScript strict mode: no errors
- [ ] Both parts marked `complete`

## Notes

- Pre-encoding removal is in a single file: `GeneratedEntityModal.svelte`
- Type guards span 4 files but are simple, localized changes
- These changes are safe to ship independently of other phases
- Manual smoke testing can verify no obvious regressions
