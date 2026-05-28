# plan-031 — Nova VS Code Copilot Parity

> Status: explanation only (pre-draft)
> Branch: `feat/nova-development`
> Supersedes: plan-030 stages 002 and 003 (UX hardening, modes/workflow boundaries)
> Companion to: plan-030 stage 001 (context grounding contract — keep as-is)

This document explains the intent, scope, and rationale of plan-031 so a second
agent (ChatGPT) can draft the full plan artifacts (`plan.md`, stage/phase/part
files, checklists, evidence templates) before implementation begins.

---

## 1. One-line summary

Make Nova feel and behave like the VS Code Copilot sidepanel: a dense, modern
chat surface with three explicit modes (Ask, Write, Agent), a real attachments
flow (project entities and `.md/.txt` uploads), and a real tool-calling agentic
loop that lets Nova plan, read project data, and propose changes the author
accepts.

---

## 2. Why this plan exists

### 2.1 The product problem

Nova today is wired but not usable as an actual assistant:

1. The sidepanel is visually chunky compared to modern AI assistants (VS Code
   Copilot, Cursor, Claude, Raycast). Padding, button sizing, and the
   pre-sized 3-row textarea make it feel like a prototype.
2. The mode model (Chat / Scribe) does not map to how authors actually work.
   Scribe is a thin regex over the prompt and only ever does outline
   generation. There is no honest "do work" mode.
3. There is no attachment story. The `+` slot was scaffolded but never wired,
   and there is no concept of "add this character / scene / outline node /
   reference document into the conversation".
4. There is no agentic behavior. Each turn is a single-shot prompt to
   OpenRouter. Tool registry, tool router, and tool chip rendering exist as
   scaffolding, but the streaming layer does not parse `tool_use` blocks and
   no real tools are registered.

The user's frustration is correct: "everything has seemingly been wired
already" but the actual product surface is not delivering.

### 2.2 The reference target

The user provided a screenshot of VS Code Copilot's chat panel. The target is
not the color palette; it is the *information density and control layout*:

- Compact header
- Single-line auto-grow input
- One action row at the bottom: attach, slash/tools, mode, model, send
- Status footer (small, low contrast)
- Tool calls rendered inline, collapsible

---

## 3. Scope

### 3.1 In scope

1. **Compact sidepanel shell** — density pass on header, body, message bubbles,
   composer, footer.
2. **Three-mode model** — replace `chat | scribe` with `ask | write | agent`.
3. **Attachments** — popover with two tabs:
   - Project entities (scenes, characters, locations, outline nodes)
   - File upload limited to `.md` and `.txt`, ≤100KB, plain-text parse only
4. **Agentic tool loop** — real LLM `tool_use` parsing in the stream, dispatch
   through the existing tool router, feed `tool_result` back, iterate up to a
   capped number of steps, user can abort mid-loop.
5. **Tool surface** — register read-only project tools and propose-only
   mutation tools. Nothing auto-applies to the manuscript.
6. **Tests + docs** — unit, visual, source-contract tests; update
   `dev-docs/04-modules/nova.md` and `dev-docs/03-ai/pipeline.md`.

### 3.2 Out of scope

1. Direct editor or manuscript mutation
2. Voice input, image generation, multi-modal upload
3. Full RAG/storage rewrite
4. Redesign of the `/nova` fullscreen route (defer; declare canonical surface
   only)
5. Model fallback chains, alternate provider SDKs
6. Mobile-specific layout
7. Brand or color changes (token-driven styling stays as-is)
8. Re-introducing the four cut runtime agents (Brainstorm, Outline, Draft,
   Summary)

### 3.3 Constraints (non-negotiable)

1. OpenRouter only. No direct provider SDKs.
2. API keys remain server-side only.
3. Svelte 5 Runes only. No legacy reactivity.
4. Token-driven styling. `pnpm check:tokens` must pass.
5. Module boundaries enforced by `eslint-plugin-boundaries`.
6. Nova never auto-applies changes to the manuscript or editor state. Tools
   that look like mutations must return proposals the user explicitly accepts.
7. File uploads restricted to `.md` and `.txt`, ≤100KB, parsed as plain text.
   Reject everything else at the boundary (OWASP file-upload guard).
8. Agentic loop must have an iteration cap (recommend 8) and a user-abort
   path. No unbounded recursion.

### 3.4 Plan-030 constraint lift

Plan-030 explicitly forbids "broad tool-calling implementation". Plan-031
**lifts** that constraint with the following rationale and guardrails:

- Tool calls only happen in Agent mode (opt-in per turn).
- Read tools are pure functions over existing repositories.
- Mutating tools return `Proposal` envelopes; user accepts before anything
  changes.
- Iteration cap + abort prevent runaway behavior.
- Source-contract test forbids tool handlers from importing editor/manuscript
  mutation paths.

ChatGPT should restate this lift explicitly in the drafted `plan.md`.

---

## 4. Target end state

After plan-031 ships, Nova:

1. Looks like a modern assistant sidepanel at 280–520px widths, with no
   "chunky" padding or pre-sized input.
2. Has a single action row matching the reference screenshot:
   `[+] [</>] [Mode] [Model] ........ [Send]`.
3. Offers three modes:
   - **Ask** — conversational. No tool calls. Grounded in project context.
   - **Write** — structured proposal generation: outline, scene draft,
     revision pack. Routes to existing pipeline runners.
   - **Agent** — multi-step. Parses `tool_use`, calls registered tools,
     iterates, produces a final answer plus proposal artifacts.
4. Has an attach button that actually attaches things:
   - "From project" tab to add scenes, characters, locations, outline nodes
   - "Upload" tab for `.md/.txt` files
   - Chips above the input; dismissible; cleared on new conversation
5. Has honest context disclosure that counts user-attached items separately
   from RAG-derived scopes.
6. Persists last-used mode per project.

---

## 5. Architecture changes at a glance

### 5.1 New / changed types

- `NovaMode = 'ask' | 'write' | 'agent'` (replaces `chat | scribe`)
- `NovaAttachment = { id, kind: 'entity' | 'file', label, payload }`
- `ToolDefinition` (already exists) → register real entries
- `ProposalEnvelope` (reuse pipeline `PipelineArtifactEnvelope` pattern)

### 5.2 Streaming loop

`chat-service.ts` currently does a single pass. New behavior in Agent mode:

```text
loop step = 0..maxSteps:
  stream completion
  if response contains tool_use:
    parse → dispatch via tool-router → append tool_result message
    continue
  else:
    finalize assistant message; break
abort if user cancels; abort if step >= maxSteps with explicit UI state
```

### 5.3 Mode → resolver routing

- Ask → existing chat resolver, no tools advertised
- Write → existing pipeline runners (outline, scene, revision)
- Agent → new agentic resolver, tools advertised, loop enabled

### 5.4 Attachments → context

Attached items become an additive context scope: `'user-attached'`. They are
prepended to RAG context, counted in `ContextDisclosurePill`, and cleared on
new chat.

---

## 6. Stage map (for ChatGPT to expand)

ChatGPT should expand each stage into phases and parts per the repo's plan
conventions in `.github/instructions/plan-conventions.instructions.md`.
Each part needs: `part.md`, `checklist.md`, `impl.log.md`, `evidence/`.

### Stage A — Compact Sidepanel Shell

Goal: kill the chunky feel. Match the reference screenshot density.

Phases (suggested):

1. Header + status pill compression
2. Composer auto-grow input + single action row
3. Message log densification (gap, padding, bubble size)
4. Footer/status bar consolidation
5. Visual baseline rebaseline

Key files:

- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/ModelPickerDropdown.svelte`
- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/styles/tokens.css` (fix undefined `--space-7`, add `--size-dot-small`)

Concrete density targets:

- Textarea min-height 84px → 32px, auto-grow to 144px
- Body padding `--space-4` (16px) → `--space-3` (12px)
- Inter-message gap 8px → 6px
- Bubble padding-y 8px → 6px
- Greeting card 20px → 16px or replace with single-line tip
- Send button 40 → 32; drop shadow removed
- Header padding 12+8 → 8+4; subtitle moved into inline pill

### Stage B — Modes Refactor (Ask / Write / Agent)

Goal: replace Chat/Scribe with the three-mode model and route accordingly.

Phases (suggested):

1. Type + state refactor (`NovaMode`, store, persistence)
2. UI: mode pill in action row, `Cmd+.` to cycle
3. Per-mode placeholder + system prompt
4. Routing through `task-resolver.ts` and `prompt-builder.ts`
5. Migration of existing Scribe outline path into Write

Key files:

- `src/modules/nova/types.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/services/chat-service.ts`
- `src/lib/ai/task-resolver.ts`
- `src/lib/ai/prompt-builder.ts`

### Stage C — Attachments

Goal: `+` button opens a real attach menu with project entities and file
upload.

Phases (suggested):

1. Attachment data model + store state
2. Popover UI (two tabs, keyboard accessible)
3. Entity tab wiring (repositories → searchable list)
4. File upload tab (`.md/.txt`, ≤100KB, plain-text parse, reject everything
   else)
5. Chips above composer (dismissible, cleared on new chat)
6. Context wiring (`'user-attached'` scope) + disclosure count
7. Server-side validation in `chat-service.ts`

Key files:

- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/modules/nova/services/context-hooks.ts`
- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/types.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`

### Stage D — Agentic Tool Loop

Goal: real tool-calling. Agent mode actually does multi-step work.

Phases (suggested):

1. Plan-030 constraint lift recorded in plan-031 `plan.md`
2. Register read tools (project summary, scenes, characters, locations,
   outline) via existing `tool-registry.ts`
3. Register propose-only mutation tools (`propose_outline_revision`,
   `propose_scene_draft`, `propose_character_update`)
4. Streaming loop extension in `chat-service.ts` (parse `tool_use`, dispatch,
   feed `tool_result`, iterate, cap, abort)
5. Tool chip rendering polish in `NovaMessageLog.svelte` (already scaffolded)
6. Agentic flag removal for Agent mode path
7. Source-contract tests forbidding mutation imports in tool handlers
8. Agent-mode system prompt update (instruct tool use + proposal pattern)

Key files:

- `src/modules/nova/services/chat-service.ts`
- `src/modules/nova/services/tool-registry.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/nova/services/feature-flags.ts`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/lib/ai/prompt-builder.ts`
- `src/lib/ai/pipeline/contracts.ts`

### Stage E — Verification, Docs, Closeout

Phases (suggested):

1. Full quality gates
2. Docs sync (`dev-docs/04-modules/nova.md`, `dev-docs/03-ai/pipeline.md`)
3. Plan-030 reconciliation (mark superseded stages, link to plan-031)
4. ACTIVE-PLAN and MASTER-PLAN updates
5. PR readiness + final evidence bundle

---

## 7. Acceptance criteria (global)

Plan-031 is done when all of the following are true:

1. At 360px width, Nova matches the reference screenshot density: single
   action row, single-line input, no oversized greeting card.
2. Mode pill shows Ask / Write / Agent. Each mode has a distinct placeholder
   and system prompt and routes correctly.
3. `+` button opens the attach popover. Project entities and file upload both
   work. Attachments appear as chips, count in disclosure, and clear on new
   chat.
4. Agent mode performs a real tool-calling loop against registered project
   tools, with visible tool-call and tool-result chips, an iteration cap, and
   a user abort path.
5. No tool handler imports editor or manuscript mutation paths.
6. From Project Hub with logline + synopsis + 0 scenes, asking Agent to
   "draft the first scene" produces a proposal artifact, not an auto-applied
   change.
7. All quality gates pass: `pnpm check`, `pnpm lint`, `pnpm lint:css`,
   `pnpm test`, `pnpm test:visual`, `pnpm check:tokens`.
8. Docs updated. Plan-030 reconciled. Trackers updated.

---

## 8. Quality gates

```bash
pnpm check
pnpm lint
pnpm lint:css
pnpm test
pnpm test:visual   # or targeted: tests/visual/editor-nova-panel*.test.ts
pnpm check:tokens
```

Required new test files (suggested):

- `tests/nova/mode-routing.test.ts`
- `tests/nova/attachments.test.ts`
- `tests/nova/agentic-loop.test.ts`
- `tests/nova/tool-handlers.test.ts`
- Source-contract: `tests/nova/no-mutation-imports.test.ts`

---

## 9. Risk register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Agent loop runs away or burns tokens | Critical | Hard iteration cap (8), user abort, per-step token budget |
| Tool handler accidentally mutates manuscript | Critical | Source-contract test blocking mutation imports; proposal-only pattern |
| File upload becomes attack vector | High | Extension allowlist (`.md/.txt`), 100KB cap, text-only parse, reject at boundary |
| Mode model confuses users | Medium | Single-sentence inline hint per mode; persist per project |
| Visual baselines churn | Medium | Re-baseline in Stage A only, lock for the rest of plan |
| Plan-030 vs plan-031 ownership drift | Medium | Stage E explicitly reconciles plan-030 stage 002/003 as superseded |
| Streaming parser regression on non-tool turns | High | Branch only when Agent mode + advertise tools; keep Ask/Write paths untouched |
| Attachment chips bloat context | Low | Cleared on new chat; per-conversation only; count visible in disclosure |

---

## 10. Decisions already locked

1. Three modes: **Ask, Write, Agent** (not Chat/Scribe, not single adaptive).
2. Agentic capability: **full tool-calling loop** with proposal-only mutating
   tools.
3. Attachments: **project entities AND `.md/.txt` upload**.
4. Plan-030 "no broad tool-calling" constraint: **lifted** in plan-031 with
   explicit rationale and guardrails.
5. No manuscript auto-mutation, ever.

---

## 11. Further considerations (recommended defaults)

These are not blocking. ChatGPT can fold them into the drafted plan or leave
them as open questions in the plan's "Notes" sections.

1. **Write-mode sub-action picker.**
   Recommend: small chip row under the input (Outline / Scene / Revision)
   when Write is active. Alternative: free-text + intent classifier (defer).

2. **Attachment persistence.**
   Recommend: per-conversation only, cleared on new chat. Avoids stale
   context bleeding across sessions.

3. **Agent's "Plan" display.**
   Recommend: collapsible "Plan" header in the first assistant message, then
   inline tool chips for each step. Alternative: dedicated planning sidebar
   (more work, defer).

4. **Per-step token budget in Agent mode.**
   Recommend: soft cap that triggers a "compressed context" warning rather
   than a hard failure.

5. **Slash commands (`/`)**.
   Recommend: defer the `</>` button to a follow-up plan. Keep the slot in
   the action row visually but make it open a "coming soon" hint, or hide it
   entirely until backed.

---

## 12. What ChatGPT should produce next

Draft the following artifacts under
`dev-docs/plans/plan-031-nova-vscode-copilot-parity/` (or whichever final
slug you prefer; this doc lives at `dev-docs/plans/plan-031/` for now):

1. `plan.md` — full plan front matter, objective, scope, constraints, stage
   table, quality gates, risks, definition of done. Mirror the structure of
   [plan-030/plan.md](../plan-030-nova-production-refactor/plan.md).
2. `README.md` — short orientation for agents.
3. `checklist.md` — global checklist mirroring stage acceptance criteria.
4. `validation-matrix.md` — gate-to-evidence mapping.
5. `agent-handoff.md` — for Codex execution: required order, stop conditions,
   reporting format.
6. Stage scaffolds: `stage-001-compact-shell/`, `stage-002-modes/`,
   `stage-003-attachments/`, `stage-004-agentic-loop/`,
   `stage-005-verification-docs-closeout/`, each with `stage.md`,
   `checklist.md`, and per-phase folders + part files (`part.md`,
   `checklist.md`, `impl.log.md`, `evidence/`) per
   [.github/instructions/plan-conventions.instructions.md](../../../.github/instructions/plan-conventions.instructions.md).
7. `prompts/` folder with one agent prompt per stage.
8. Tracker update snippets for `ACTIVE-PLAN.md` and `MASTER-PLAN.md` marking
   plan-031 as the new active plan and plan-030 stages 002/003 as superseded
   by plan-031.

### 12.1 Conventions ChatGPT must follow

1. Replace all `[[PLACEHOLDER]]` tokens before treating any file as active.
2. Parts follow `draft → in-progress → review → complete` (or `blocked`).
3. Each part requires: pre-impl checklist, impl, post-impl checklist, at
   least one `evidence/` artifact, and a final `impl.log.md` entry.
4. `impl.log.md` is append-only.
5. Stages and phases derive status from their children.
6. Update `dev-docs/plans/MASTER-PLAN.md` and
   `dev-docs/plans/ACTIVE-PLAN.md` when the plan is created and again when
   it completes.

### 12.2 Hand-off prompt template for ChatGPT

> Draft the full plan-031 artifact set described in section 12 of
> `dev-docs/plans/plan-031/plan-explanation.md`. Follow the repo plan
> conventions in `.github/instructions/plan-conventions.instructions.md`.
> Reuse plan-030's structure as a reference but treat plan-031 as a clean
> plan that supersedes plan-030 stages 002 and 003. Do not implement code.
> Produce only the planning artifacts (markdown files and folder
> scaffolding). Lock the decisions listed in section 10 verbatim. Surface
> the items in section 11 as plan-level "Notes" or open questions if you
> cannot resolve them. Make all stage / phase / part status fields `draft`.

---

## 13. Reference: source-of-truth files

- Repo plan conventions:
  [.github/instructions/plan-conventions.instructions.md](../../../.github/instructions/plan-conventions.instructions.md)
- Prior plan to mirror structure from:
  [dev-docs/plans/plan-030-nova-production-refactor/plan.md](../plan-030-nova-production-refactor/plan.md)
- Active plan pointer:
  [dev-docs/plans/ACTIVE-PLAN.md](../ACTIVE-PLAN.md)
- Master tracker:
  [dev-docs/plans/MASTER-PLAN.md](../MASTER-PLAN.md)
- Module docs to update at closeout:
  - [dev-docs/04-modules/nova.md](../../04-modules/nova.md)
  - [dev-docs/03-ai/pipeline.md](../../03-ai/pipeline.md)
- Templates:
  [dev-docs/plans/_templates/](../_templates/)
