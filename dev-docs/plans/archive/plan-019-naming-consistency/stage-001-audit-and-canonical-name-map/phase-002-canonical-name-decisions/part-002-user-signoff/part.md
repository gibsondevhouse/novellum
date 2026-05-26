---
title: User Sign-off
slug: part-002-user-signoff
part_number: 2
status: draft
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-002-canonical-name-decisions
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Walk the user through `evidence/name-map.md`, resolve any open
questions surfaced in part-001, and record explicit approval in
`impl.log.md`. Without this approval, Stage 002 must not start.

## Scope

**In scope:**

- A single review pass with the user covering every row of the
  name map.
- Edits to `evidence/name-map.md` to reflect final decisions.

**Out of scope:**

- Code or doc changes outside the plan-019 directory.

## Implementation Steps

1. Present the contents of
   `phase-002/part-001/evidence/name-map.md` to the user
   together with the open-questions section.
2. Capture each answer; update the name-map row in place.
3. Once every open question is closed and the user says "go",
   append an `impl.log.md` entry with the timestamp, the user's
   confirmation phrase verbatim, and a hash of the final
   `name-map.md` contents.

## Files

**Create:**

- `checklist.md`
- `impl.log.md`

**Update:**

- `phase-002/part-001/evidence/name-map.md` (final form)

## Acceptance Criteria

- [ ] Every "Open questions for user" entry resolved.
- [ ] `impl.log.md` contains a sign-off entry with timestamp +
      user confirmation phrase.
- [ ] Stage 002 can begin.

## Edge Cases

- If the user wants to change scope (e.g. "actually, also rename
  the API routes"), do **not** silently expand. Stop, log the
  request, and update the parent `plan.md` Scope section as a
  separate edit before resuming.

## Notes

- Treat this as the gate that protects every downstream stage
  from churn.
