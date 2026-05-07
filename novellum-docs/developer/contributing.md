# Contributing

> Last verified: 2026-05-07

## Before you write code

1. **Open an issue or pick one.** New work needs a tracked reason.
2. **For non-trivial changes, write a plan.** Plans live under [../../dev-docs/plans/](../../dev-docs/plans/) and follow the 4-tier system in [../../dev-docs/05-workflow/planning-conventions.md](../../dev-docs/05-workflow/planning-conventions.md). Plans need approval before stages start.
3. **Branch off `master`.** Name it `<type>/<short-slug>`, e.g. `feat/reader-empty-state` or `fix/nova-key-persistence`.

## While you write code

- **Svelte 5 Runes only.** No legacy `$:` reactivity, no `export let`.
- **Modular boundaries.** Cross-module imports go through `index.ts` barrels (`$modules/<domain>`). ESLint blocks the alternative.
- **Server-only stays server-only.** Anything in `src/lib/server/` cannot be imported from client code.
- **Tokens, not magic numbers.** All visual values come from `src/styles/tokens.css`. `pnpm check:tokens` enforces.
- **Tests next to features.** New code in a module needs tests under `tests/<module>/`.
- **Keep `+server.ts` exports clean.** Only HTTP handlers, `config`, or `_`-prefixed extras. Helpers go in sibling files.

## Before you open a PR

Run all gates locally:

```bash
pnpm check
pnpm lint
pnpm lint:css
pnpm check:tokens
pnpm test
```

If your change is UI-visible, also run:

```bash
pnpm test:e2e
pnpm test:visual
```

If a visual snapshot intentionally changes, update it in the same PR and explain why in the PR body.

## Opening the PR

- **Title:** present-tense imperative — "add reader empty state", "fix nova key persistence".
- **Body:**
  - What changed and why.
  - Plan / stage / phase reference if applicable (e.g. `Closes plan-021 stage 002 phase 001`).
  - Screenshots or recordings for UI changes.
  - Any migration notes.
- **Scope:** keep PRs small. One concern per PR. If your branch sprawls, split it.

## Review

- A reviewer will check architecture, boundaries, tests, and visual fidelity.
- Address review notes by pushing follow-up commits; squash on merge if appropriate.

## Commit hygiene

- Logical commits with focused messages.
- Squash trivial WIP commits before merge.
- Reference plan IDs in commit bodies where helpful.

## What we will reject

- Hardcoded colors, pixels, or magic font sizes (token violation).
- Cross-module imports that bypass the barrel.
- New `export let` or `$:` reactivity in Svelte components.
- Logic in `+page.svelte` / `+layout.svelte` that should live in a module service.
- New `+server.ts` files that export helpers with arbitrary names.
- Removing tests because they're red. Fix the cause.

## What we love

- Plans that capture trade-offs honestly.
- Small, well-scoped PRs.
- Tests that document behavior other tests assumed.
- Doc updates with the code change (especially under `dev-docs/`).
