# Agent Prompt — Stage 004 Verification and Closeout

You are closing plan-030.

## Objective

Prove the Nova refactor is complete, documented, and regression-protected.

## Required Commands

```bash
pnpm run check
pnpm run lint
pnpm run lint:css
pnpm run test
pnpm run test:visual
```

If full visual tests are not feasible, run targeted Nova specs and document why.

## Required Docs

Update:

- `dev-docs/04-modules/nova.md`
- `dev-docs/03-ai/context-engine.md`
- `dev-docs/03-ai/pipeline.md`
- active/master tracker files as appropriate

## Required Evidence

Write closeout evidence with:

- files changed
- tests added
- commands run
- screenshots/visual notes
- remaining known limitations
- explicit no-auto-apply verification

## Output

Return a closeout summary suitable for PR description.
