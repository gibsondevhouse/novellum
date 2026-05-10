# Claude Code Guide

> Pointer file. Claude Code reads this on session start. The full agent
> ecosystem and resumption protocol live in [`AGENTS.md`](./AGENTS.md).

## Resuming work

When the user says something like "continue", "what's next", or starts
a session without naming a task, follow the discovery procedure in
[`AGENTS.md` → `0. Resuming Work — Active Plan Discovery`](./AGENTS.md#0-resuming-work--active-plan-discovery).

Short version:

1. Read [`dev-docs/plans/ACTIVE-PLAN.md`](./dev-docs/plans/ACTIVE-PLAN.md).
2. Open the plan it points at and find the first stage / phase / part
   whose status is not `complete`.
3. Follow [`.github/instructions/plan-conventions.instructions.md`](./.github/instructions/plan-conventions.instructions.md)
   for status transitions, evidence files, and `impl.log.md` rules.

The full prompt template is at [`.github/prompts/continue-plan.prompt.md`](./.github/prompts/continue-plan.prompt.md).

## Project conventions

- Svelte 5 Runes only (`$state`, `$derived`, `$effect`). No Svelte 4
  reactivity (no `$:`).
- TypeScript strict mode.
- Token-driven styling — every color, spacing, and shadow comes from
  `src/styles/tokens.css`. `pnpm check:tokens` enforces this.
- Modular boundaries are enforced by `eslint-plugin-boundaries`.
  Modules under `src/modules/<domain>/` expose a public barrel
  (`index.ts`); cross-module imports must go through that barrel.
- AI prompts follow ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT.
- Agents must never auto-apply changes to the manuscript. They emit
  suggestions the user accepts explicitly.

## Quality gates

Before considering any change done:

```bash
pnpm check        # svelte-check + tsc
pnpm lint         # eslint
pnpm lint:css     # stylelint
pnpm test         # vitest run
pnpm check:tokens # forbid hardcoded design values
```

Source-tree tests under `tests/` are the canonical suite. Anything
under `.claude/worktrees/` is local scratch and should not gate work.

## Filesystem map (top level)

- `src/lib/` — shared primitives, design system, AI scaffolding,
  database client, keyboard registry, server-side services.
- `src/modules/<domain>/` — vertical feature slices (editor, nova,
  reader, settings, continuity, outline, project, etc.).
- `src/routes/` — SvelteKit routes; route names should match the
  module they render (see [plan-019](./dev-docs/plans/plan-019-naming-consistency/plan.md)).
- `src-tauri/` — desktop shell. Touch only when the work is
  packaging or capabilities related.
- `tests/` — Vitest + Playwright. Mirror the source tree.
- `dev-docs/` — internal documentation. Plans live under
  `dev-docs/plans/`. The roadmap is `dev-docs/01-project/roadmap.md`.
- `novellum-docs/` — user-facing docs.
