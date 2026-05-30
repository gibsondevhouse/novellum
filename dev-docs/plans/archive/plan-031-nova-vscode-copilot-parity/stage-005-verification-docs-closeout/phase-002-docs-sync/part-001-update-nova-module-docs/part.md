---
title: Update Nova Module Docs
slug: part-001-update-nova-module-docs
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Implementation Agent
phase: phase-002-docs-sync
started_at: "2026-05-28"
completed_at: "2026-05-28"
estimated_duration: 0.25d
---

# Part 001 — Update Nova Module Docs

## Objective

Update Nova module documentation with compact sidepanel, modes, attachments, proposal artifacts, and canonical runtime notes.

## Scope

**In scope:**

- Update Nova module documentation with compact sidepanel, modes, attachments, proposal artifacts, and canonical runtime notes.
- Update only the files required for this part and directly related tests/evidence.
- Maintain plan-031 constraints: OpenRouter only, server-side keys only, Svelte 5 runes, token-driven styling, and no manuscript auto-mutation.

**Out of scope:**

- Pulling in later-stage scope unless needed to remove a fake affordance or keep the build green.
- Direct manuscript/editor mutation.
- Direct provider SDKs or client-visible API keys.
- Broad redesign outside Nova.

## Implementation Steps

1. Document the embedded sidepanel as the canonical Nova runtime for this branch.
2. Document Ask, Write, and Agent responsibilities and boundaries.
3. Document attachment limits and context disclosure behavior.
4. Document proposal-only mutation rule and no auto-apply guarantee.

## Files

**Create:**

- None expected.

**Update:**

- `dev-docs/04-modules/nova.md`

## Acceptance Criteria

- [ ] Module docs match shipped behavior and names.
- [ ] Docs explicitly state direct manuscript mutation is out of scope.
- [ ] No docs refer to old Chat/Scribe semantics except as historical migration notes.

## Edge Cases

- If `/nova` fullscreen route remains divergent, document its status and do not imply parity.

## Evidence Required

- Add at least one artifact to `evidence/`, such as a test output summary, screenshot note, diff summary, or manual verification note.
- Evidence filename should include the date, for example `verification-2026-05-28.md`.

## Notes

- Keep `impl.log.md` append-only.
- Do not mark this part complete until reviewer signoff is appended.
