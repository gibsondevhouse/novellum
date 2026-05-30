# part-001 — Header Identity and Status

> Status: `complete`  
> Parent phase: `phase-001`  
> Parent stage: `stage-002`  
> Parent plan: `plan-030-nova-production-refactor`

## Objective

Add clear Nova identity, close control, and compact status hierarchy without bloating the panel.

## Problem

Nova currently needs this part because the sidepanel must be trustworthy before it can be treated as a production assistant. The work here should reduce ambiguity, remove misleading behavior, or strengthen regression coverage.

## Files

- `src/modules/nova/components/NovaPanel.svelte`

## Required Changes

- Header says Nova.
- Close action remains accessible.
- Model/context controls remain discoverable.

## UI / UX Requirements

- Preserve existing accessibility behavior unless explicitly replacing it with equivalent or better behavior.
- Make user-facing states honest.
- Do not expose controls that imply unsupported behavior.
- Keep copy short, concrete, and product-specific.

## Data / Context Requirements

- Project context must remain scoped and deterministic.
- Do not send the full manuscript by default.
- Treat generated content as proposal unless an explicit accept workflow exists.
- Missing context must be surfaced, not silently hidden.

## Error Handling Requirements

- Surface recoverable failures with actionable messages.
- Do not swallow context failures for project-dependent generation.
- Preserve existing retry/abort semantics unless the part explicitly changes them.

## Tests

- Add or update tests directly tied to this part.
- Prefer behavior-level assertions over brittle copy snapshots.
- Include source-contract tests where safety depends on absence of imports or mutations.

## Acceptance Criteria

- Header says Nova.
- Close action remains accessible.
- Model/context controls remain discoverable.
- Relevant tests are added or updated.
- No plan-030 non-negotiable constraints are violated.
- Evidence is recorded before moving to the next part.

## Out of Scope

- Full app redesign.
- Broad provider/model architecture changes.
- Autonomous tool-calling runtime.
- Direct manuscript mutation.
- Unrelated module cleanup.

## Evidence To Record

- Files changed.
- Commands run.
- Test results.
- Known limitations.
- Screenshot/visual note if this part affects UI.
