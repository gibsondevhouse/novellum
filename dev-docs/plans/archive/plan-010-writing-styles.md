---
title: Writing Styles and AI Prompts Customization
slug: plan-010-writing-styles
version: 1.0.0
status: draft
owner: Planner Agent
created: 2026-04-15
last_updated: 2026-04-15
target_completion: TBD
stages:
  - stage-001-data-layer
  - stage-002-ui-components
  - stage-003-ai-integration
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
---

## Objective

> Repurpose and expand the `/styles` page to allow authors to customize structural writing styles and templates used by Nova (the AI). This will also manage AI system prompts, chat instructions, and behavioral rules, giving authors fine-grained control over how Nova interprets requests and outputs narrative prose.

## Scope

**In scope:**

- Modify `/styles` routing and UI to act as a centralized hub for Writing Styles and AI configuration.
- Implement server-side SQLite (`/api/db/*`) storage for storing custom writing styles, templates, system prompts, and Nova chat instructions.
- Create UI using Svelte 5 Runes explicitly (`$state`, `$derived`, `.svelte.ts`) to manage, edit, and select these styles and prompts.
- Establish strict modular boundaries ensuring the data layer communicates correctly through the service abstractions, passing the `eslint-plugin-boundaries` check.
- Provide a minimum of 80% line coverage in tests for all newly added AI logic and service layers.

**Out of scope:**

- Modifying the visual UI themes (`light`/`dark`) outside of moving their current configuration location if necessary.

## Stages

| #   | Stage                                                                      | Status  | Est. Duration |
| --- | -------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Data Layer Setup](stage-001-data-layer/stage.md)                          | `draft` | 1d            |
| 002 | [UI Components & Svelte 5 Integration](stage-002-ui-components/stage.md) | `draft` | 2d            |
| 003 | [AI Prompt Engineering & Integration](stage-003-ai-integration/stage.md)   | `draft` | 1.5d          |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors (`pnpm run lint` must pass `eslint-plugin-boundaries` checks)
- [ ] **typecheck** — zero type errors
- [ ] **tests** — all tests pass via `pnpm run test` (Services and AI Logic require 80% line coverage)
- [ ] **docs_sync** — relevant docs updated

## Risks & Mitigations

| Risk         | Likelihood | Mitigation          |
| ------------ | ---------- | ------------------- |
| Escaping boundary constraints when querying local DB for prompts | medium | Strictly follow `eslint-plugin-boundaries` and execute data operations solely via the `/api/db/*` SQLite layer. |

## Notes

> All new UI state for managing styles and templates must strictly utilize Svelte 5 reactivity (`$state()`, `$derived()`) rather than Svelte 4 stores or reactive declarations. The primary data layer must persist down to the SQLite database via API calls, while Dexie is retained only for portability operations if applicable.
