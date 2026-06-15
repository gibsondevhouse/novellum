---
title: Brainstorm Agent
slug: plan-043-brainstorm-agent
version: 0.2.0
status: candidate
owner: Planner Agent
created: 2026-06-04
last_updated: 2026-06-04
target_completion: TBD
dependencies:
  - plan-042-quality-gates-closure
  - plan-027-vibe-worldbuild-stage-003       # worldbuild pipeline and accept flow
quality_gates:
  - lint
  - lint:css
  - typecheck
  - tests
  - check:tokens
  - test:e2e                                  # critical for UI flow
  - smoke:built                               # ensure packaged app still works
---

## Objective

Re‑introduce the `BrainstormAgent` (cut from internal V1 in plan‑025) as a fully wired, review‑gated feature.  This completes the **front end** of the author pipeline:

> **Brainstorm → Worldbuild → Outline → Draft → Manuscript**

The agent should take a seed idea from the author and produce **structured creative seeds** — premise variants, thematic threads, genre hooks, protagonist sketches — that can be accepted into worldbuilding context or saved as reference notes.  Outputs must strictly adhere to a JSON schema so they can be parsed and validated without hallucination.  No silent edits: authors explicitly accept or discard seeds.

## Scope

**In scope:**

- Add a new `TaskType` (`brainstorm`) and output interfaces to `src/lib/ai/types.ts`.
- Define a strict output schema (Zod) for brainstorm seeds and register it in `src/lib/ai/constants.ts` as `json_brainstorm_proposals`.
- Implement `BrainstormAgent` in `src/lib/ai/brainstorm-agent.ts`.  The agent must:
  - Build prompts following the `ROLE → TASK → CONTEXT → CONSTRAINTS → OUTPUT FORMAT` pattern.
  - Call the model defined in `MODEL_MAP` and parse its JSON output with the registered schema.
  - Surface validation errors clearly without crashing the UI.
- Update `task-resolver.ts`, `prompt-builder.ts` and `constants.ts` so the `brainstorm` action resolves to `BrainstormAgent` with appropriate defaults (context policy: `project_summary`; outputFormat: `json_brainstorm_proposals`; role: “You are the Novellum BrainstormAgent…”).
- Expose a guided brainstorm UI surface:
  - A Nova‑style panel that prompts the author for a seed idea and provides context fields (e.g. genre, tone, existing canon hints).
  - On submit, dispatch the `brainstorm` action and stream the agent’s proposals.
  - Display returned proposals as discrete cards with accept/discard controls and rationale fields.
  - Ensure the UI is accessible (keyboard‑navigable, ARIA labels), respects the design system, and adapts to dark mode.
- Review‑gated accept flow:
  - When the author accepts a proposal, transform it into a preliminary worldbuilding entity (character seed, realm seed, premise note, etc.) and prefill the corresponding creation form (`worldbuild` domain).  Accepted seeds must enter a **staging** state to avoid direct writes to canon; duplicates must be detected and surfaced for manual conflict resolution.
  - When discarded, proposals are logged in session history but not persisted.
  - Provide clear feedback for each accept/discard action and allow undo before commit.
- Unit tests for the agent parser and schema; UI component tests; at least one end‑to‑end test that covers the path: seed input → brainstorm proposals → accept → worldbuild prefill.
- Documentation updates: update `AGENTS.md`, `agents-map.md`, and user docs to list BrainstormAgent as “Planned”.

**Out of scope:**

- Automatic creation of worldbuilding entities without author confirmation.
- Persisted brainstorm session history beyond the current session (ephemeral storage only).
- Multi‑turn iterative brainstorming (single‑shot output + accept/reject only).
- Formal integration with the outline or drafting stages (follow‑up plans will cover those).
- Any changes to the worldbuilding pipeline’s core state machine or acceptance API.

## Assumptions

- The existing `ContextEngine` can provide a “project_summary” scope that includes the project title, synopsis, and minimal canon.  If not yet implemented, it must be added prior to Stage 003.
- The model configured for brainstorming (`openai/gpt-4o-mini`) supports JSON outputs and can be constrained via system prompts; fallback to plain text is acceptable as long as the parser handles validation errors gracefully.
- Worldbuilding modules expose hooks for pre‑fill creation forms.  If not available, stub functions will be added and revisited in plan‑045.

## Stages

| #   | Stage                                                      | Deliverables & Acceptance Criteria                                         | Est. Duration |
|---- |-----------------------------------------------------------|-----------------------------------------------------------------------------|--------------|
| 001 | **Define contract and schema**                            | - Extend `TaskType` with `brainstorm`.<br>- Add `BrainstormSeed` interface and `BrainstormProposal` array type.<br>- Create `json_brainstorm_proposals` output format description in `constants.ts`.<br>- Write a strict Zod schema (`brainstormProposalSchema`) in `src/lib/ai/validators/brainstorm-proposal-schema.ts` that rejects extra fields.<br>- Update `MODEL_MAP` and `OUTPUT_FORMAT_DESCRIPTIONS`.<br>- Add planner documentation lines to `AGENTS.md` and `agents-map.md`. | 1 d |
| 002 | **Implement BrainstormAgent**                             | - Create `brainstorm-agent.ts` with parser using the Zod schema.<br>- Register default role, task description, and constraints (e.g. propose at least 3 alternatives, avoid canonical contradictions, separate ideas clearly).<br>- Add unit tests in `tests/ai/brainstorm-agent.test.ts` covering valid output, malformed JSON, and schema rejection.<br>- Update `task-resolver.ts` to map the `brainstorm` action and `prompt-builder.ts` to handle new output format.<br>- Ensure code respects modular boundaries and uses no `$:` Svelte syntax. | 1.5 d |
| 003 | **Nova integration & brainstorm UI**                       | - Design and implement a `NovaBrainstormPanel` Svelte component inside `src/modules/nova/components/`.<br>- Provide input fields for the seed idea and optional genre/tone hints; validate non‑empty seed.<br>- Integrate with Nova’s session store and streaming logic (`chat-service.ts`) to dispatch the `brainstorm` action.<br>- Render proposals as a list of cards with accept/discard buttons and optional tags.<br>- Persist accepted proposals in a session‑local store for subsequent worldbuilding prefill; ensure discard removes them.<br>- Unit test component interactions and add Playwright e2e test covering the full brainstorm flow (seed input → proposals displayed). | 2 d |
| 004 | **Accept flow & worldbuild hookup**                       | - Implement a service (e.g. `brainstorm-accept-service.ts`) that converts a `BrainstormProposal` into the appropriate worldbuilding draft format (character seed → `vibe-worldbuild.domain.personae`, realm seed → `vibe-worldbuild.domain.atlas`, premise note → `project_metadata.notes`).<br>- Call the worldbuilding creation forms via existing modals, pre‑filling fields from the proposal; do not auto‑insert into canon.<br>- Add duplication detection by comparing proposal identifiers (e.g. name/title) against pending and canonical entities; surface warnings to the user.<br>- Instrument the flow with optimistic UI updates and error handling; ensure that acceptance failures roll back state.<br>- Write integration tests for conversion logic and duplication checks. | 1.5 d |
| 005 | **Docs & quality gate closure**                            | - Update `dev-docs/03-ai/agents-map.md` to mark `BrainstormAgent` as “Planned” with the new schema.<br>- Add user‑facing docs in `novellum-docs/user/` explaining how to use the brainstorm feature and its limits.<br>- Run all quality gates: `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm test:e2e`, `pnpm check:tokens`, `pnpm smoke:built`.  Fix any issues.<br>- Final review with the Reviewer agent and update `quality_gates` checklist in this plan.<br>- Archive any temporary stubs added during development and ensure no orphan files remain. | 0.5 d |

## Quality Gates

- **pnpm check** — no TypeScript or Svelte warnings/errors.
- **pnpm lint** — zero ESLint and boundary violations.
- **pnpm lint:css** — no stylelint errors; all styles use tokens.
- **pnpm test** — unit tests pass, including new agent parser tests.
- **pnpm test:e2e** — Playwright e2e coverage for the brainstorm flow passes.
- **pnpm check:tokens** — no hard‑coded design values; UI uses tokens.
- **pnpm smoke:built** — packaged desktop app still functions after adding the brainstorm feature.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|----- |----------- |------- |----------- |
| **JSON output variance** — The model may produce malformed or semi‑structured output that doesn’t match the schema. | medium | Agent fails to parse, causing user frustration. | Use a strict Zod schema and fallback parser that surfaces a human‑readable error with retry guidance. Include unit tests for malformed outputs. |
| **UI overwhelm** — Presenting too many proposals or complex controls may overwhelm authors. | medium | Poor UX leads to low adoption. | Limit proposals to 3–5 items; allow toggling details; follow existing Nova panel patterns; conduct e2e tests with varied seed lengths. |
| **Duplicate or conflicting entities** — Accepted seeds may overlap with existing worldbuilding entities. | high | Canon contamination or confusion. | Implement a staging layer for accepted seeds; run duplication checks against canon and pending proposals; prompt the author to resolve conflicts before insertion. |
| **Prompt injection or creative drift** — The brainstorm prompt might leak privileged data or deviate into off‑topic content. | medium | Safety or quality issues. | Scope context to `project_summary`; include explicit constraints (e.g. “Do not invent facts outside the seed idea or provided context”); sanitise seed text before sending. |
| **Module boundary violations** — New code may cross module boundaries or hardcode tokens. | low | Violates architecture rules. | Enforce ESLint boundaries; import through module barrels; rely on tokens in `tokens.css`; run `check:tokens`. |
| **Time overruns due to new UI complexities** | medium | Missed deadlines. | Add buffer in Stage 003 estimate; focus on minimal viable UI; defer enhancements to follow‑up plans. |
| **Accessibility regressions** — New components might not meet accessibility standards. | medium | Reduced usability for some users. | Follow Novellum’s accessibility checklist; use proper ARIA attributes; test with keyboard navigation; run `test:e2e` scenarios for screen reader labels. |

## Notes

`BrainstormAgent` was originally declared as a `TaskType` in the initial agent registry but removed in plan‑025.  The infrastructure (`ContextEngine`, `PromptBuilder`, `ModelRouter`) is fully in place — this plan covers only the feature implementation.  When completing each stage, append detailed implementation logs under `dev-docs/plans/plan-043-brainstorm-agent/stage-00X/phase-00Y/impl-log.md` and include at least one test artifact under `evidence/`.  Ensure cross‑references (e.g. `AGENTS.md`, `agents-map.md`, `context.md`) are kept in sync with the new agent definition.
