# Planning Conventions

> Last verified: 2026-06-16

Novellum uses a strict 4-tier planning system. Every non-trivial change goes through it. The canonical rules live in [.github/instructions/plan-conventions.instructions.md](../../.github/instructions/plan-conventions.instructions.md); this page is the developer-facing summary.

## Hierarchy

```text
Plan       (initiative — a body of work, weeks-to-months scale)
└── Stage  (milestone — independently verifiable)
    └── Phase (deliverable — ships a coherent slice)
        └── Part  (task — single PR sized)
```

Each tier has its own template under [../plans/_templates/](../plans/_templates/).

## Where plans live

- **Active:** `dev-docs/plans/plan-NNN-<slug>/plan.md` (+ stage/phase/part subfolders).
- **Archived (completed/superseded):** `dev-docs/plans/archive/plan-NNN-<slug>/`.
- **Master registry:** [../plans/MASTER-PLAN.md](../plans/MASTER-PLAN.md).
- **Research:** [../plans/research/](../plans/research/) — exploratory artifacts that feed plans.

## When to write a plan

Always, when:

- The change spans more than one module.
- It introduces a new module, route, or migration.
- It changes a public API (`/api/*`, module barrel).
- It touches the AI pipeline, agents, or schema.

You may skip a plan only for trivial fixes (typo, dead-import removal, single-component CSS tweak).

## Plan lifecycle

| Status | Meaning |
| --- | --- |
| `draft` | Written but not yet executing. Open for revision. |
| `active` | Being executed. Stages have begun. |
| `complete` | All stages closed. Plan archived but stays linked from MASTER-PLAN. |
| `superseded` | Replaced by a newer plan. Reason recorded in the supersession plan's preamble. |

## Quality gates from MASTER-PLAN

- All components must use Svelte 5 Runes.
- No hardcoded pixel values (use `--space-*` tokens).
- 100% test coverage for new UI primitives.
- Accessibility audit pass.

These are enforced at PR review time; ESLint + `check:tokens` cover the mechanical parts.

## Authoring tips

- **Be explicit about scope boundaries.** What's in, what's out, what depends on what.
- **Reference real files.** No vague "the editor module" — link to a path.
- **Capture decisions.** Why this approach over the alternatives.
- **Mark planning vs implementation.** A plan can declare task types (e.g., new agents) without shipping them; the [03-ai/agents-map.md](../03-ai/agents-map.md) reflects shipped status separately.

## After a plan completes

1. Mark its status `complete` in [MASTER-PLAN.md](../plans/MASTER-PLAN.md).
2. Move (or symlink) the folder under `plans/archive/` if desired.
3. Add a one-line entry under the correct era in [../01-project/journey.md](../01-project/journey.md).
4. Update any affected pages in `dev-docs/` (especially `04-modules/` and `02-architecture/`).
