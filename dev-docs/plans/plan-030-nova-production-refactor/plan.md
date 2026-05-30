# plan-030 — Nova Production Refactor

> Status: `complete`  
> Branch: `feat/nova-development`  
> Scope owner: Nova / AI Runtime / Project Hub grounding  
> Created: 2026-05-27  
> Closed: 2026-05-28  
> Target repo path: `dev-docs/plans/plan-030-nova-production-refactor/`

## 1. Objective

Upgrade Nova from a prototype-grade assistant surface into a production-quality, project-aware sidepanel that can be trusted for story planning and authoring workflows.

The refactor has two main objectives:

1. **Production-quality sidepanel UX**
   - Nova must feel like a polished assistant sidepanel, not a rough prototype.
   - Required qualities: clear hierarchy, responsive behavior, usable constrained-width states, honest interaction affordances, explicit loading/error/no-context states, and visual consistency with the rest of Novellum.

2. **Reliable project context awareness**
   - Nova must always ingest and use core Project Hub context before generating story content when a project is open.
   - Minimum required grounding: project title, genre, status, project type, target word count, logline, synopsis, style preset id, updated timestamp, entity counts, and relevant planning/story-frame context.
   - Nova must not answer as if it lacks project materials when Project Hub metadata exists.

## 2. Problem Statement

Nova currently has enough UI and AI plumbing to appear functional, but the experience is not production-safe:

- The sidepanel has shell mechanics, but the hierarchy, empty states, context states, and interaction truthfulness are incomplete.
- Project context is not guaranteed. The current sidepanel context path can return empty context when no active scene exists, even though the active Project Hub has enough metadata for grounded answers.
- Nova exposes some affordances that may not actually affect the model request, especially attachment staging in the sidepanel composer.
- Chat/Scribe behavior is not yet a clean product contract.
- `/nova` and the embedded sidepanel appear to be separate implementations, creating drift risk.

The priority is not cosmetic polish first. The priority is **trust repair**:

1. Make Nova grounded when a project is open.
2. Make the UI disclose what Nova is grounded on.
3. Remove fake or misleading affordances.
4. Then refine sidepanel ergonomics and visual quality.

## 3. Non-Negotiable Constraints

- **OpenRouter only.** Do not add direct provider SDK calls.
- **Server-side keys only.** API keys must not be reachable client-side.
- **Context is rebuilt per request.** Do not rely on hidden long-lived model memory.
- **Scoped context only.** Do not send the full manuscript by default.
- **Project summary baseline required.** If `projectId` exists, Nova must receive compact project baseline context even when there is no active scene.
- **Author-in-the-loop.** Nova must not auto-apply manuscript edits or generated prose.
- **No broad tool-calling implementation.** Existing experimental tool advertisement must not be expanded into autonomous tool execution in this plan.
- **No unrelated app redesign.** This plan is Nova/context scoped.
- **Svelte 5/runes conventions remain required.** Do not introduce legacy Svelte state patterns.
- **Use existing API resource paths.** Do not rename `/api/db/*` resources as part of this plan.

## 4. Scope

### In scope

- Embedded Nova sidepanel production hardening.
- Project context baseline/fallback behavior.
- Context disclosure and context-count correctness.
- Chat/Scribe product contract cleanup.
- Attachment affordance truthfulness.
- Error, loading, no-key, no-project, and unsupported-action states.
- Visual and unit regression coverage for Nova.
- Documentation updates for Nova and AI context behavior.

### Out of scope

- Full app shell redesign.
- Full `/nova` route redesign unless needed to prevent implementation drift.
- Autonomous tool-calling parser/runtime.
- Direct manuscript mutation or editor apply workflow.
- Large RAG system rewrite.
- Full PDF/DOCX ingestion unless explicitly chosen instead of disabling attachment affordance.
- Model fallback architecture beyond preserving existing behavior.
- Worldbuilding/outline module redesign outside required context integration.

## 5. Low-Hanging Fruit To Pluck During The Refactor

These should be completed opportunistically while implementing the main objectives:

| Priority | Item | Required Decision | Files |
| --- | --- | --- | --- |
| P0 | Sidepanel attachment truthfulness | Wire attachments into real context or disable/remove upload affordance | `NovaComposer.svelte`, `chat-service.ts` |
| P0 | No-scene project grounding | If `projectId` exists and `activeSceneId` is null, use project summary context | `context-hooks.ts`, `context-engine.ts` |
| P0 | Context disclosure honesty | Count/display project, story-frame, and outline scopes | `chat-service.ts`, `ContextDisclosurePill.svelte` |
| P1 | Settings link consistency | Normalize no-key/missing-key links to the same AI settings route | `NovaPanel.svelte`, `NovaMessageLog.svelte` |
| P1 | Product naming cleanup | Replace user-facing “Copilot” labels with “Nova” | Nova components |
| P1 | Empty state copy | Show whether a project is attached before saying “ask about your project” | `NovaPanel.svelte` |
| P1 | No-project state | Surface “No project context” before project-dependent generation | `NovaPanel.svelte`, `chat-service.ts` |
| P1 | Exact bug regression | Test project with logline/synopsis and zero scenes | `tests/nova/*`, `tests/ai/*` |
| P2 | Canonical surface doc | State which Nova runtime is canonical for this branch | `dev-docs/04-modules/nova.md` |

## 6. Stage Map

| Stage | Name | Outcome |
| --- | --- | --- |
| stage-001 | Context Grounding Contract | Nova reliably receives project baseline context before story generation. |
| stage-002 | Production Sidepanel UX | Nova sidepanel has deliberate layout, states, and honest controls. |
| stage-003 | Modes and Agentic Workflow Boundaries | Chat/Scribe modes are predictable and review-gated. |
| stage-004 | Verification, Docs, and Closeout | Tests, docs, and evidence prove the branch is production-ready. |

### Stage Supersession Note (2026-05-28)

Plan-031 (Nova VS Code Copilot Parity) supersedes **stage-002** (Production Sidepanel UX) and **stage-003** (Modes and Agentic Workflow Boundaries) of this plan. Plan-031 replaces those goals with compact-shell density, Ask/Write/Agent mode routing, real attachments, and a bounded agentic tool loop.

**Stage-001** (Context Grounding Contract) is NOT superseded — it remains the canonical baseline context contract and is referenced as a companion by plan-031.

## 7. Global Acceptance Criteria

The plan is complete only when all of the following are true:

- From Project Hub, with project title/logline/synopsis but zero scenes, asking “What is this novel about?” produces a grounded answer using project metadata.
- Nova never claims it lacks project information when project metadata is available.
- Context disclosure accurately reports project, scene, outline, and compressed/truncated states.
- Sidepanel attachment UI either affects model context or is disabled with honest copy.
- Chat/Scribe behavior is explicitly bounded.
- No generated artifact is auto-applied to manuscript/editor state.
- Visual states are covered for desktop, constrained width, and compact viewport.
- Tests and docs are updated.
- Required validation commands are recorded in closeout evidence.

## 8. Required Validation Commands

Run at closeout unless explicitly waived with rationale:

```bash
pnpm run check
pnpm run lint
pnpm run lint:css
pnpm run test
pnpm run test:visual
```

If full visual suite is too expensive locally, run targeted Nova visual specs and document the substitution:

```bash
pnpm exec playwright test tests/visual/editor-nova-panel.test.ts
pnpm exec playwright test tests/visual/editor-nova-panel-conversation.test.ts
pnpm exec playwright test tests/visual/editor-nova-panel-tools.test.ts
```

## 9. Evidence Requirements

Each phase must leave evidence in its phase folder or in `evidence/`:

- files changed
- commands run
- test output summary
- known limitations
- screenshots or visual baseline notes for UI phases
- explicit “no manuscript mutation” verification for generated artifacts

## 10. Risk Register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Nova remains ungrounded without an active scene | Critical | Add project summary baseline and regression tests. |
| Full manuscript gets sent by default | Critical | Enforce baseline + additive scopes only. Add tests. |
| Attachment UI remains fake | High | Wire or disable/remove during Stage 002. |
| `/nova` and sidepanel diverge further | High | Declare canonical runtime and defer/migrate explicitly. |
| Scribe overpromises unsupported actions | High | Add supported-action routing and unsupported-task state. |
| Context disclosure under-reports grounding | Medium | Count project/storyFrame/outline scopes. |
| Visual polish breaks accessibility | Medium | Preserve focus states, keyboard resize, aria labels. |
| Tests become brittle from copy changes | Low | Assert behavior/state, not long prose. |

## 11. Definition of Done

Plan-030 is done when Nova is trustworthy enough for the following workflow:

1. User opens a project in Project Hub.
2. Project has logline/synopsis but no scenes.
3. User opens Nova sidepanel.
4. Nova visibly indicates project context is attached.
5. User asks what the novel is about.
6. Nova answers from project metadata.
7. User asks for outline or first-scene help.
8. Nova either generates a clearly marked proposal from grounded context or asks for the missing required fields.
9. Nothing is automatically written into the manuscript.
