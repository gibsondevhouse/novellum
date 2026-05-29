---
title: Nova VS Code Copilot Parity
slug: plan-031-nova-vscode-copilot-parity
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-05-28
last_updated: 2026-05-28
target_completion: 2026-06-21
branch: feat/nova-development
scope_owner: Nova / AI Runtime / Project Hub grounding
supersedes: plan-030 stage-002 and stage-003
companion_to: plan-030 stage-001 context grounding contract
stages:
  - stage-001-compact-sidepanel-shell
  - stage-002-modes-refactor
  - stage-003-attachments
  - stage-004-agentic-tool-loop
  - stage-005-verification-docs-closeout
dependencies:
  - plan-030 stage-001 context grounding contract
  - feat/nova-development branch
quality_gates:
  - check
  - lint
  - lint_css
  - unit_tests
  - visual_tests
  - tokens
  - source_contracts
  - docs_sync
---


# plan-031 — Nova VS Code Copilot Parity

## 1. Objective

Make Nova feel and behave like the VS Code Copilot sidepanel: a dense, modern chat surface with three explicit modes (**Ask**, **Write**, **Agent**), a real attachments flow for project entities and `.md/.txt` files, and a bounded tool-calling agentic loop that lets Nova plan, read project data, and propose changes the author explicitly accepts.

This plan is not a cosmetic-only pass. It upgrades Nova from a wired prototype into a trustworthy production sidepanel by making every visible affordance honest: compact layout, grounded context, real mode routing, real attachments, real tool execution in Agent mode, and no manuscript auto-mutation.

## 2. Problem Statement

Nova has enough UI and AI scaffolding to look functional, but the product contract is currently weaker than the surface implies:

1. The sidepanel feels chunky compared with modern AI assistant panels. Header, composer, footer, message spacing, and greeting states consume too much vertical space.
2. The existing Chat/Scribe model does not match author workflows. Scribe is too narrow and regex-like, while there is no honest mode for multi-step work.
3. The attachment affordance is present but not real. Users need to attach project entities and small plain-text references to the current conversation.
4. Tool registry/router/chip scaffolding exists, but the runtime is still single-shot. Agent mode must parse tool requests, dispatch tools, feed results back, and stop safely.
5. Generated content must remain review-gated. Nova may propose outline, scene, and character changes, but must never silently mutate manuscript or editor state.

## 3. Non-Negotiable Constraints

- **OpenRouter only.** Do not add direct provider SDK calls.
- **Server-side keys only.** API keys must not be reachable client-side.
- **Svelte 5 Runes only.** Do not introduce legacy reactivity patterns.
- **Token-driven styling.** Styling changes must use `src/styles/tokens.css`; `pnpm check:tokens` must pass.
- **Module boundaries enforced.** Respect `eslint-plugin-boundaries` and module barrel rules.
- **No manuscript auto-mutation.** Tools that look like mutations must return proposal envelopes requiring explicit user acceptance.
- **Attachment file restrictions.** Uploads are limited to `.md` and `.txt`, 100KB maximum, parsed as plain text only, rejected at client and server boundaries.
- **Bounded Agent loop.** Agent mode must have a hard iteration cap, default 8, and a visible user abort path.
- **No unbounded context dump.** Attachments are additive scoped context, not a full manuscript/RAG rewrite.
- **No provider/model fallback expansion.** Preserve existing model selection behavior unless needed to avoid regression.

## 4. Plan-030 Constraint Lift

Plan-030 explicitly prohibited broad tool-calling implementation. Plan-031 intentionally lifts that constraint for **Agent mode only**.

The lift is allowed under these guardrails:

- Tool calls happen only when the user selects Agent mode.
- Ask mode remains conversational and advertises no tools.
- Write mode routes to proposal-generation pipeline behavior and does not execute autonomous tools.
- Read tools are pure functions over existing project repositories and context services.
- Mutation-like tools return `ProposalEnvelope` / pipeline artifact envelopes only.
- No tool may auto-apply changes to manuscript, editor state, outline state, or project entities.
- The loop has a hard iteration cap and user abort.
- A source-contract test blocks Nova tool handlers from importing editor/manuscript mutation paths.

Plan-030 stage 001, the context grounding contract, remains a companion baseline and is not superseded. Plan-030 stages 002 and 003 are superseded by this plan because plan-031 owns compact sidepanel UX, modes, attachments, and Agent-mode workflow boundaries.

## 5. Scope

### In scope

- Compact embedded Nova sidepanel shell.
- Header, body, message log, composer, footer density pass.
- Ask / Write / Agent mode refactor.
- Mode-aware prompt and resolver routing.
- Write-mode migration of existing Scribe outline capability into proposal generation.
- Attach popover with Project and Upload tabs.
- Project entity attachments: scenes, characters, locations, outline nodes.
- `.md` and `.txt` upload attachments, 100KB maximum, plain-text only.
- Attachment chips, dismissal, clear-on-new-chat behavior.
- User-attached context scope and disclosure counts.
- Agent-mode tool loop with read-only tools and proposal-only mutation-like tools.
- Tool chip rendering and observable Agent step states.
- Unit, source-contract, visual, token, and docs verification.
- `dev-docs/04-modules/nova.md`, `dev-docs/03-ai/pipeline.md`, ACTIVE-PLAN, and MASTER-PLAN updates.

### Out of scope

- Direct editor or manuscript mutation.
- Voice input.
- Image generation.
- Multi-modal upload.
- Full RAG/storage rewrite.
- Full redesign of `/nova` fullscreen route; this plan declares the embedded sidepanel canonical for this branch.
- Model fallback chains or alternate provider SDKs.
- Mobile-specific layout beyond constrained sidepanel widths.
- Brand/color redesign.
- Reintroducing old runtime agents such as Brainstorm, Outline, Draft, and Summary as separate agent personas.
- Implementing slash commands beyond a truthful placeholder or deferred slot.

## 6. Target End State

After this plan ships, Nova:

1. Looks like a modern assistant sidepanel at 280–520px widths.
2. Uses a compact header, dense message log, single-line auto-grow composer, and one action row.
3. Shows one action row: `[+] [</>] [Mode] [Model] ........ [Send]`.
4. Offers three explicit modes:
   - **Ask** — conversational, grounded, no tools.
   - **Write** — structured proposal generation for outline, scene, and revision work.
   - **Agent** — multi-step tool-using mode with capped loop and proposal artifacts.
5. Allows users to attach project entities and `.md/.txt` files as chips.
6. Counts user-attached items separately from project/RAG-derived context in the disclosure pill.
7. Persists last-used mode per project.
8. Shows tool calls and tool results inline as collapsible chips.
9. Produces proposals for generated changes and never writes directly to the manuscript.

## 7. Stages

| # | Stage | Status | Est. Duration | Risk | Outcome |
| --- | --- | --- | --- | --- | --- |
| 001 | [Compact Sidepanel Shell](stage-001-compact-sidepanel-shell/stage.md) | `complete` | 4d | medium | Compress Nova into a dense, modern assistant sidepanel at 280–520px widths without changing the product color system or drifting from design tokens. |
| 002 | [Modes Refactor — Ask, Write, Agent](stage-002-modes-refactor/stage.md) | `complete` | 4d | high | Replace the misleading Chat/Scribe model with explicit Ask, Write, and Agent modes that route through distinct prompt and resolver contracts. |
| 003 | [Attachments](stage-003-attachments/stage.md) | `complete` | 5d | high | Make the `+` affordance real: users can attach project entities and plain-text files to a Nova conversation, and those attachments become a disclosed additive context scope. |
| 004 | [Agentic Tool Loop](stage-004-agentic-tool-loop/stage.md) | `complete` | 6d | critical | Enable a real, bounded Agent-mode tool loop using existing OpenRouter infrastructure, read-only project tools, and proposal-only mutation tools. |
| 005 | [Verification, Docs, and Closeout](stage-005-verification-docs-closeout/stage.md) | `complete` | 2d | medium | Run the full gate stack, update module and AI pipeline docs, reconcile plan trackers, and package closeout evidence. |

## 8. Global Acceptance Criteria

- [ ] At 360px width, Nova has compact density: single action row, single-line starting composer, and no oversized greeting card.
- [ ] Header, composer, footer, and message log use tokens and pass `pnpm check:tokens`.
- [ ] Mode pill shows Ask / Write / Agent exactly.
- [ ] Each mode has distinct placeholder copy, prompt behavior, and resolver routing.
- [ ] Ask mode advertises no tools and remains single-shot grounded chat.
- [ ] Write mode routes to proposal-generation behavior and migrates the old Scribe outline path.
- [ ] Agent mode performs a real tool-calling loop against registered project tools.
- [ ] Agent loop has visible tool-call/tool-result chips, max-step cap, and user abort.
- [ ] Attach popover opens from `+` and supports Project and Upload tabs.
- [ ] Project entities can be attached as chips.
- [ ] `.md/.txt` files up to 100KB can be attached; invalid files are rejected at client and server boundaries.
- [ ] Attached items enter context as `'user-attached'` scope and are counted separately in disclosure.
- [ ] New chat clears attachments and disclosure attachment count.
- [ ] No tool handler imports editor or manuscript mutation paths.
- [ ] From Project Hub with logline + synopsis + zero scenes, asking Agent to draft the first scene produces a proposal artifact, not an auto-applied change.
- [ ] `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm test:visual`, and `pnpm check:tokens` pass or have accepted waivers.
- [ ] Docs and trackers are updated.

## 9. Required Validation Commands

```bash
pnpm check
pnpm lint
pnpm lint:css
pnpm test
pnpm test:visual
pnpm check:tokens
```

If full visual tests are too expensive or unstable locally, run targeted Nova visual specs and record the substitution rationale:

```bash
pnpm exec playwright test tests/visual/editor-nova-panel.test.ts
pnpm exec playwright test tests/visual/editor-nova-panel-conversation.test.ts
pnpm exec playwright test tests/visual/editor-nova-panel-tools.test.ts
```

## 10. Evidence Requirements

Every completed part must leave evidence in its own `evidence/` directory. Acceptable evidence includes:

- command output summaries
- screenshot paths or visual diff notes
- test output logs
- source-contract scan output
- before/after density measurements
- rejected-file validation examples
- Agent loop transcript fixtures
- docs/tracker diff summaries

Evidence files should be named with the date, for example `test-output-2026-05-28.txt`.

## 11. Risk Register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Agent loop runs away or burns tokens | Critical | Hard max of 8 iterations, user abort, per-step token budget evidence, cap-exhaustion UI state. |
| Tool handler accidentally mutates manuscript | Critical | Proposal-only tools, no auto-apply prompt contract, no-mutation import source-contract test. |
| File upload becomes attack vector | High | Client and server allowlist for `.md/.txt`, 100KB cap, text-only parsing, structured rejection. |
| Streaming parser regresses normal chat | High | Tool parsing only in Agent mode when tools are advertised; Ask/Write regression tests. |
| Mode model confuses users | Medium | Compact mode hints, distinct placeholders, per-project persistence, docs. |
| Visual baselines churn | Medium | Rebaseline compact shell once in Stage 001, then lock baseline before behavior stages. |
| Plan-030 / plan-031 ownership drift | Medium | Stage 005 tracker reconciliation and explicit supersession note for plan-030 stages 002/003. |
| Attachment chips bloat context | Low | Per-conversation lifecycle, clear-on-new-chat, visible disclosure counts, truncation metadata. |

## 12. Definition of Done

Plan-031 is complete only when the following end-to-end workflow is true:

1. User opens a project with logline/synopsis and zero scenes.
2. User opens the embedded Nova sidepanel at constrained width.
3. Nova visibly indicates project context and compact sidepanel state.
4. User selects Ask and gets grounded project-aware conversational help.
5. User selects Write and receives a clearly marked proposal artifact.
6. User attaches a project entity and a valid `.md/.txt` file.
7. Context disclosure reports user-attached context separately.
8. User selects Agent and asks for first-scene work.
9. Agent mode plans, reads project data through tools, renders tool chips, and returns a proposal artifact.
10. User can abort the Agent loop.
11. The loop cannot exceed the hard step cap.
12. No generated content is auto-applied to manuscript or editor state.
13. All quality gates and docs/tracker updates are complete.

## 13. Deferred Follow-Up Candidates

These are intentionally deferred unless they become trivial during implementation:

- Full slash-command registry behind the `</>` action-row slot.
- `/nova` fullscreen route parity refactor.
- Attachment persistence across conversations.
- Dedicated Agent planning sidebar.
- Multi-modal attachments.
- Model fallback chains.
- Direct apply workflow for accepted proposals.
