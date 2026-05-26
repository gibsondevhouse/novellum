# Novellum Dev Docs

> Last verified: 2026-05-07
> Source of truth for the Novellum codebase. Audience: contributors, reviewers, and the AI agents in `.github/agents/`.

This directory is a **living developer reference**, not marketing copy. Every page is anchored to real files in [src/](../src) and [src-tauri/](../src-tauri). When code and docs disagree, the code wins — open a PR to fix the doc.

## How to navigate

| If you want to… | Read… |
| --- | --- |
| Understand what Novellum is and where it's going | [01-project/](./01-project/) |
| Understand how the system is built | [02-architecture/](./02-architecture/) |
| Work on the AI layer | [03-ai/](./03-ai/) |
| Modify or extend a feature module | [04-modules/](./04-modules/) |
| Run, test, package, or release the app | [05-workflow/](./05-workflow/) |
| Trace how the project got to its current state | [01-project/journey.md](./01-project/journey.md) |
| See active and historical work plans | [plans/MASTER-PLAN.md](./plans/MASTER-PLAN.md) |
| Review past audits, checklists, QA notes | [audits/](./audits/), [checklists/](./checklists/), [qa-docs/](./qa-docs/) |

## Directory map

```text
dev-docs/
├── 01-project/         # Vision, roadmap, journey (history of the build)
├── 02-architecture/    # System, frontend, backend, routing, data, boundaries, tauri shell
├── 03-ai/              # AI pipeline, agents, prompts, context engine
├── 04-modules/         # One page per src/modules/* slice
├── 05-workflow/        # Dev workflow, planning conventions, testing, release, portability
├── plans/              # 4-tier work plans (Plan → Stage → Phase → Part) — LIVE history trail
├── implementation-logs/# Free-form session logs
├── audits/             # Inventory + audit artifacts
├── checklists/         # Reusable review checklists
├── qa-docs/            # Bug reports, user-problem ledgers
├── release/            # Release notes and runbooks
└── archive/            # Pre-refactor snapshots (frozen on the date in the folder name)
```

## Documentation conventions

- **Date stamps.** Every page has `> Last verified: YYYY-MM-DD` at the top. If you change a page, update it.
- **Code anchors.** Claims point at real paths (`[file](../src/...)`). No vague references.
- **No aspiration without a label.** Anything not yet shipped is marked **Planned** or **Draft**, not described as if it exists.
- **Single source of truth.** Long-form developer content lives here; [novellum-docs/developer/](../novellum-docs/developer/) links into it instead of duplicating.
- **Plans are history.** Completed plans stay under [plans/archive/](./plans/archive/) for traceability — see [01-project/journey.md](./01-project/journey.md) for the chronological view.

## For collaborators new to the repo

Start here, in this order:

1. [01-project/project-overview.md](./01-project/project-overview.md) — what we're building and why.
2. [01-project/journey.md](./01-project/journey.md) — how we got here, plan-by-plan.
3. [02-architecture/system.md](./02-architecture/system.md) — the high-level shape.
4. [05-workflow/dev-workflow.md](./05-workflow/dev-workflow.md) — running and testing the app.
5. [05-workflow/planning-conventions.md](./05-workflow/planning-conventions.md) — how plans are written before code is.
