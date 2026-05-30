# dev-docs

Engineering and planning documentation for Novellum.

This directory contains architecture references, module notes, and the 4-tier planning system used by agents and human contributors.

## Updated

- Last updated: 2026-04-20

## Directory Structure

```text
dev-docs/
├── plans/                          # Multi-tier development plans
│   ├── MASTER-PLAN.md              # Registry of active and archived plans
│   ├── _templates/                 # Canonical templates for each plan tier
│   ├── archive/                    # Archived plans
│   └── plan-*/                     # Plan files and/or plan directories
├── modules/                        # Module-specific implementation documentation
├── architecture.md                 # High-level architecture overview
├── agents-map.md                   # Agent roster and responsibilities
├── ai-pipeline.md                  # Runtime AI pipeline design
├── context-engine.md               # Context construction and scoping
├── data-model.md                   # Domain model and persistence notes
├── design-system.md                # Design tokens and UI guidance
├── dev-workflow.md                 # Day-to-day development workflow
├── modular-boundaries.md           # Import boundary and layering rules
├── project-overview.md             # Project goals and technical posture
├── repo-structure.md               # Repository map
├── roadmap.md                      # Product roadmap
└── README.md                       # This file
```

## Planning Tiers

- Plan: Initiative-level goal and quality gates.
- Stage: Milestone-level grouping of phases.
- Phase: Coherent deliverable slice broken into parts.
- Part: Smallest executable unit of implementation work.

## Quality Gates

- Run `pnpm run lint` for boundaries and code quality enforcement.
- Run `pnpm run test` (or `pnpm run test:coverage`) before completion.
- For service/AI-heavy work, maintain at least 80% line coverage.
- Persist evidence in plan artifacts when required by templates.

## Conventions

- Slugs use `kebab-case`.
- Plan numbering and references follow existing `plan-###-*` patterns.
- Status values: `draft`, `in-progress`, `review`, `complete`, `blocked`.
- Logs are append-only; do not rewrite historical entries.
- Follow planning rules in `.github/instructions/plan-conventions.instructions.md` for files under `dev-docs/plans/**`.
