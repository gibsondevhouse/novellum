# Agent Handoff — plan-030 Nova Production Refactor

## Current Branch

`feat/nova-development`

## Primary Objective

Make Nova trustworthy and production-quality by fixing project grounding first, then hardening the sidepanel UX.

## First Principle

Do not polish around a trust defect. If Nova can see a Project Hub with logline/synopsis and still answer as if no project exists, the UX is broken regardless of styling.

## Required Implementation Order

1. Stage 001: context grounding contract.
2. Stage 002: sidepanel UX states and affordance truthfulness.
3. Stage 003: Chat/Scribe workflow boundaries.
4. Stage 004: tests, docs, evidence.

## Critical Constraints

- No direct model/provider SDKs.
- No client-side API key access.
- No full manuscript by default.
- No silent auto-apply to manuscript/editor state.
- No broad tool-calling implementation.
- No unrelated module redesign.

## Reporting Format For Agent Updates

Every implementation update must include:

```md
## Completed
- ...

## Changed Files
- ...

## Verification
- Command: ...
- Result: ...

## Risks / Follow-up
- ...
```

## Stop Conditions

Stop and report instead of pushing forward if:

- Fixing context requires changing `/api/db/*` resource names.
- You find direct client-side OpenRouter key handling.
- You find a generated artifact path that mutates manuscript content automatically.
- You cannot determine whether attachment uploads are actually sent to the model.
- Visual changes require deleting existing accessibility behavior.
