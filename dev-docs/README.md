# dev-docs

Development documentation for the Novellum project. This directory houses all planning artifacts used by AI agents and human contributors throughout the development lifecycle, as well as core architectural decision records.

## Directory Structure

```text
dev-docs/
├── plans/                          # Mult-tier development plans
│   ├── MASTER-PLAN.md              # Registry of all active and archived plans
│   ├── _templates/                 # Canonical templates for each plan tier
│   └── <plan-slug>/                # One directory per plan
│       ├── plan.md                 # Plan overview, goals, stages, quality gates
│       └── stage-NNN-<slug>/
│           ├── stage.md            # Stage overview and phase index
│           └── phase-NNN-<slug>/
│               ├── phase.md        # Phase overview and part index
│               └── part-NNN-<slug>/
│                   ├── part.md         # Task spec: objective, steps, acceptance criteria
│                   ├── checklist.md    # Pre/post implementation verification checklist
│                   ├── impl.log.md     # Timestamped agent implementation log
│                   └── evidence/       # Artifacts: outputs, diffs, screenshots, test results
├── modules/                        # Documentation for specific application modules (e.g. story-bible, editor)
├── architecture.md                 # High-level system architecture
├── agents-map.md                   # AI Agent organizational structure
├── ai-pipeline.md                  # Detailed overview of AI request/response flow
├── context-engine.md               # How context is managed for AI queries
├── data-model.md                   # Database definitions and data shape
├── design-system.md                # UI/UX design tokens and component specs
├── dev-workflow.md                 # Day-to-day developer and agent workflow
├── feature-spec-template.md        # Template for feature specification documents
├── modular-boundaries.md           # Enforced rules for cross-module imports
├── project-overview.md             # Summary of goals and technical stack
├── prompt-system.md                # How prompts are generated and managed
├── README.md                       # This file
├── repo-structure.md               # Full repository layout
├── roadmap.md                      # Long-term goals and planned features
└── tech-stack-docs.md              # Quick reference links to stack technologies
```

## Tiers

| Tier      | Purpose                                     | Owner                |
| --------- | ------------------------------------------- | -------------------- |
| **Plan**  | High-level initiative with a target outcome | Planner Agent        |
| **Stage** | A major milestone grouping related phases   | Planner Agent        |
| **Phase** | A coherent body of work broken into parts   | Planner Agent        |
| **Part**  | A discrete, executable unit of work         | Implementation Agent |

## Part Lifecycle

```text
draft → in-progress → review → complete
                  ↘ blocked
```

Each part must have a completed checklist and at least one evidence artifact before its status can move to `complete`.

## Conventions

- **Slugs** use `kebab-case`. Part/phase/stage numbers use zero-padded three digits (`001`, `002`).
- **Status values**: `draft`, `in-progress`, `review`, `complete`, `blocked`
- **Owners**: the agent or person responsible for producing the deliverable
- **impl.log.md** is append-only. Each entry records agent name, timestamp, action taken, and result.
- **evidence/** stores raw artifacts. Name files descriptively: `test-output-2026-04-11.txt`, `lint-pass.png`.
- Never delete or overwrite `impl.log.md` entries — only append.
