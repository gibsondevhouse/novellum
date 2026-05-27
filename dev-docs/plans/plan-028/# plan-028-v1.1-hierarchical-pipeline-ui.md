# plan-028-v1.1-hierarchical-pipeline-ui

Status: draft  
Depends on: plan-027-v1.1-scoping  
Scope: frontend/ui integration only  
Primary hierarchy: arcs → acts → milestones → chapters → scenes → beats → stages  
Backend assumption: plan-027-v1.1-scoping finalized the pipeline contracts, orchestrator behavior, artifact model, and checkpoint workflow.

---

## 1. Plan

### Objective

Build the Novellum UI layer that allows users to traverse the finalized narrative pipeline hierarchy, invoke stage-based orchestrator calls at the correct hierarchy depth, and manage artifact checkpoints through explicit accept/reject review gates.

The UI must make the backend pipeline operationally usable. It cannot merely display the hierarchy. It must expose a complete working loop:

1. Select narrative scope.
2. Traverse from arc down to stage.
3. Trigger stage-level generation/orchestration.
4. Review produced artifacts.
5. Accept, reject, revise, or supersede artifacts.
6. Preserve checkpoint evidence and user decisions.

### Non-Negotiable Constraints

- The hierarchy is strict: `arcs → acts → milestones → chapters → scenes → beats → stages`.
- Orchestrator calls are stage-based.
- No generated artifact becomes canonical manuscript/project state until accepted through checkpoint review.
- Rejecting an artifact must preserve the artifact, rejection reason, and next-action state.
- Accepted artifacts must remain traceable to:
  - parent hierarchy path,
  - stage definition,
  - orchestrator call,
  - model/request metadata if exposed by backend,
  - checkpoint decision.
- UI must not flatten the data model into a generic outline.
- UI must not create hidden backend state transitions.
- UI must not bypass review gates for convenience.

### User Workflow Target

The user should be able to move through the hierarchy like this:

```text
Arc
└── Act
    └── Milestone
        └── Chapter
            └── Scene
                └── Beat
                    └── Stage
                        ├── Run orchestrator
                        ├── Review artifact
                        ├── Accept artifact
                        └── Reject artifact with reason
````

### Primary Surfaces

| Surface                  | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| Hierarchy Navigator      | Traverse arcs through stages without losing context |
| Scope Header             | Show current selected path and readiness state      |
| Detail Workspace         | Edit/view selected node metadata                    |
| Stage Orchestrator Panel | Trigger generation for the active stage             |
| Artifact Review Panel    | Inspect outputs before acceptance                   |
| Checkpoint Queue         | Manage pending accept/reject decisions              |
| Decision Log             | Preserve checkpoint history and artifact lineage    |

### Quality Gates

* `pnpm run lint` passes.
* `pnpm run test` passes.
* UI/state-heavy stores and adapters have targeted unit coverage.
* Service/AI-heavy integration paths maintain at least 80% line coverage where applicable.
* Playwright coverage exists for traversal, orchestrator trigger, artifact review, accept, reject, and failure handling.
* Evidence is persisted in the plan artifact before completion.

---

## 2. Stages

---

## Stage 1 — Hierarchy Navigation Foundation

Status: draft

### Objective

Implement the UI foundation for traversing the strict narrative hierarchy without breaking parent-child context.

### Criteria

* User can select an arc and progressively drill down to acts, milestones, chapters, scenes, beats, and stages.
* Breadcrumbs always show the full active path.
* Empty child states are explicit and actionable.
* Orphaned or invalid data states are handled defensively without silent corruption.
* The UI never implies that stages can exist outside beats.

### Risks

| Severity | Risk                                                  | Mitigation                                                     |
| -------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| Critical | UI flattens hierarchy and destroys pipeline semantics | Enforce typed selection path and parent-scoped queries         |
| High     | User loses context while moving between layers        | Persistent breadcrumb and active scope header                  |
| High     | Empty states feel broken instead of actionable        | Layer-specific empty states with create/select guidance        |
| Medium   | Deep hierarchy becomes visually noisy                 | Use progressive disclosure, not full tree expansion by default |

### Dependencies

* Finalized plan-027 data contracts.
* Existing route/layout conventions.
* Existing design-system primitives.
* Existing local-first state/data access layer.

---

### Phase 1.1 — Define UI Selection Contract

#### Objective

Create the frontend selection model for tracking the user’s active hierarchy path.

#### Parts

##### Part 1.1.1 — Create active hierarchy path type

Define a typed structure equivalent to:

```ts
activePath = {
  arcId,
  actId,
  milestoneId,
  chapterId,
  sceneId,
  beatId,
  stageId
}
```

Rules:

* Every child ID requires its parent ID.
* Clearing a parent clears all descendants.
* Selecting a child auto-populates its ancestor path when possible.
* Invalid paths are rejected or repaired with a visible warning state.

##### Part 1.1.2 — Add hierarchy path validation

Validation must catch:

* stage without beat,
* beat without scene,
* scene without chapter,
* chapter without milestone,
* milestone without act,
* act without arc,
* stale/deleted selected node,
* duplicated sibling ordering conflicts.

##### Part 1.1.3 — Add state reset behavior

When a user changes:

* arc: clear act through stage.
* act: clear milestone through stage.
* milestone: clear chapter through stage.
* chapter: clear scene through stage.
* scene: clear beat through stage.
* beat: clear stage.

#### Acceptance Criteria

* Selection state cannot represent an impossible hierarchy.
* Unit tests cover parent clearing and invalid-path repair.
* UI displays a safe fallback when selected data no longer exists.

---

### Phase 1.2 — Build Hierarchy Navigator

#### Objective

Create the main traversal UI for arcs through stages.

#### Parts

##### Part 1.2.1 — Arc list panel

Must show:

* arc title,
* arc type/status if available,
* child act count,
* active/inactive visual state.

##### Part 1.2.2 — Nested drilldown columns

Implement scoped child columns:

```text
Arcs | Acts | Milestones | Chapters | Scenes | Beats | Stages
```

Each column only shows children of the selected parent.

##### Part 1.2.3 — Breadcrumb path

Display:

```text
Arc / Act / Milestone / Chapter / Scene / Beat / Stage
```

Rules:

* Each breadcrumb segment is clickable.
* Clicking a segment clears descendants.
* Missing descendants display as “Select [Layer]”.

##### Part 1.2.4 — Empty states

Each empty state must answer:

* What layer is empty?
* Why does that matter?
* What should the user do next?

Examples:

```text
No beats in this scene yet.
Create or generate beats before stage orchestration can run.
```

#### Acceptance Criteria

* User can traverse from arc to stage in one surface.
* Breadcrumb remains accurate through all selections.
* Empty states are layer-specific.
* No full-page dead ends.

---

## Stage 2 — Stage Orchestrator UI

Status: draft

### Objective

Expose stage-based orchestrator calls from the selected stage while preserving hierarchy context and preventing invalid calls.

### Criteria

* Orchestrator action is only enabled when a valid stage is selected.
* Request preview clearly shows what will be sent.
* User can run, cancel if supported, retry, or inspect failure.
* Generated output enters checkpoint review instead of becoming canonical immediately.

### Risks

| Severity | Risk                                                 | Mitigation                                         |
| -------- | ---------------------------------------------------- | -------------------------------------------------- |
| Critical | Stage call runs without full hierarchy context       | Disable run until full path is valid               |
| Critical | Generated artifact bypasses checkpoint review        | Route all outputs to pending checkpoint state      |
| High     | User does not know what scope the AI is operating on | Show full active path and included context preview |
| High     | Failed calls leave UI in stuck running state         | Explicit timeout/error/retry state machine         |
| Medium   | Duplicate runs produce confusing artifacts           | Show artifact versions and supersession state      |

### Dependencies

* Backend stage orchestrator endpoint.
* Artifact creation contract.
* Checkpoint status model.
* Request/response schema from plan-027.

---

### Phase 2.1 — Add Stage Readiness Panel

#### Objective

Show whether the selected stage is ready to run.

#### Parts

##### Part 2.1.1 — Stage readiness checklist

Checklist should include:

* valid hierarchy path,
* selected stage exists,
* required parent content exists,
* no blocking pending checkpoint if backend enforces serialization,
* model/router availability if exposed,
* required prompt/schema available.

##### Part 2.1.2 — Disabled-state explanations

The run button must never be disabled without explanation.

Examples:

```text
Cannot run stage: select a beat first.
Cannot run stage: this stage already has a pending checkpoint.
Cannot run stage: required scene context is missing.
```

##### Part 2.1.3 — Context preview

Show the user the narrative scope being used:

```text
Arc: ...
Act: ...
Milestone: ...
Chapter: ...
Scene: ...
Beat: ...
Stage: ...
```

Do not expose raw internal prompt text unless that is already a product requirement.

#### Acceptance Criteria

* User can tell exactly why a stage can or cannot run.
* Run button only enables for valid stage scope.
* Readiness state updates when selection changes.

---

### Phase 2.2 — Implement Orchestrator Trigger Flow

#### Objective

Allow users to trigger the backend orchestrator for the selected stage.

#### Parts

##### Part 2.2.1 — Add run action

The action must send:

* active hierarchy path,
* selected stage ID,
* stage type/key,
* user options if supported,
* checkpoint target if required by backend.

##### Part 2.2.2 — Add runtime states

Minimum UI state machine:

```text
idle
ready
queued
running
completed_pending_checkpoint
failed
cancelled
```

If streaming exists:

```text
streaming
stream_interrupted
```

##### Part 2.2.3 — Add failure handling

Failures must show:

* human-readable message,
* technical error detail if available,
* retry option,
* whether a partial artifact exists,
* whether the checkpoint queue was affected.

##### Part 2.2.4 — Add duplicate-run protection

Before running a stage, detect:

* existing pending artifact,
* accepted artifact for same stage,
* rejected artifact with unresolved revision request,
* in-progress orchestrator job.

User must be warned before creating another artifact version.

#### Acceptance Criteria

* Stage runs create pending review artifacts.
* Failed runs do not corrupt selected path.
* Duplicate runs are controlled.
* UI cannot accidentally submit a stage call twice.

---

## Stage 3 — Artifact Review and Checkpoint Workflow

Status: draft

### Objective

Build the accept/reject checkpoint workflow for artifacts generated by stage orchestration.

### Criteria

* Every generated artifact appears in a checkpoint review state.
* User can inspect artifact content and metadata.
* User can accept or reject with intentionality.
* Rejection requires a reason or structured feedback.
* Accepted artifacts become canonical according to backend rules.
* Rejected artifacts remain preserved and traceable.

### Risks

| Severity | Risk                                             | Mitigation                                                  |
| -------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Critical | Artifact acceptance mutates wrong hierarchy node | Display full artifact path and validate artifact parent IDs |
| Critical | Reject deletes evidence                          | Preserve rejected artifact and rejection reason             |
| High     | User cannot compare versions                     | Provide artifact version list per stage                     |
| High     | Accepted artifact cannot be audited later        | Decision log and checkpoint metadata                        |
| Medium   | Review UI becomes too busy                       | Separate content review, metadata, and decision controls    |

### Dependencies

* Artifact model.
* Checkpoint model.
* Accept/reject endpoints.
* Canonical write behavior from backend.

---

### Phase 3.1 — Build Pending Checkpoint Queue

#### Objective

Provide a queue of artifacts waiting for user decision.

#### Parts

##### Part 3.1.1 — Queue list

Each item must show:

* artifact title/type,
* generated timestamp,
* hierarchy path,
* stage key/name,
* status,
* originating orchestrator job,
* whether it blocks further work.

##### Part 3.1.2 — Queue filters

Minimum filters:

* all pending,
* current hierarchy path,
* current stage,
* failed/needs attention,
* accepted,
* rejected.

##### Part 3.1.3 — Blocking indicators

If a pending checkpoint blocks further stage runs, display that clearly.

Example:

```text
Blocked: this beat has a pending artifact awaiting review.
```

#### Acceptance Criteria

* User can find all pending artifacts.
* User can filter to current stage/path.
* Blocking checkpoint states are visible.

---

### Phase 3.2 — Build Artifact Review Detail

#### Objective

Allow the user to inspect generated output before deciding.

#### Parts

##### Part 3.2.1 — Artifact content viewer

Viewer must support:

* generated text/content,
* structured sections if schema-based,
* warnings/validation messages,
* empty or partial output state.

##### Part 3.2.2 — Artifact metadata panel

Show:

* artifact ID or human-readable reference,
* hierarchy path,
* stage,
* generation time,
* model/provider metadata if available,
* schema/version,
* checkpoint status,
* prior version relationship if any.

##### Part 3.2.3 — Artifact validation summary

Show whether the artifact satisfies expected output shape.

Examples:

```text
Schema valid
Missing required field: scenePurpose
Continuity warning: character appears before introduction
```

#### Acceptance Criteria

* User can inspect content and provenance.
* Invalid artifacts are visually distinct.
* Metadata makes wrong-scope acceptance easy to catch.

---

### Phase 3.3 — Implement Accept Flow

#### Objective

Let users promote a generated artifact into accepted/canonical state.

#### Parts

##### Part 3.3.1 — Accept confirmation

Before acceptance, show:

* artifact title,
* stage,
* hierarchy path,
* what canonical area will be updated,
* whether existing accepted output will be superseded.

##### Part 3.3.2 — Accept action

Accept must call backend checkpoint acceptance behavior.

UI must then:

* update artifact status,
* refresh canonical content,
* refresh hierarchy node state,
* append decision log entry,
* clear blocking pending state if applicable.

##### Part 3.3.3 — Supersession handling

If an accepted artifact replaces prior accepted output:

* prior artifact becomes superseded,
* user can still inspect it,
* decision history remains intact.

#### Acceptance Criteria

* Accepted artifacts become canonical only through checkpoint action.
* Superseded artifacts remain inspectable.
* UI refreshes without requiring page reload.

---

### Phase 3.4 — Implement Reject Flow

#### Objective

Let users reject artifacts while preserving evidence and revision intent.

#### Parts

##### Part 3.4.1 — Rejection form

Require at least one of:

* rejection reason,
* structured feedback,
* requested revision direction.

Suggested fields:

```text
Reason category:
- wrong scope
- weak prose
- continuity issue
- schema/format issue
- user intent mismatch
- other

Reviewer note:
Requested next action:
- revise same stage
- rerun with adjusted instruction
- discard from active queue
- hold for later
```

##### Part 3.4.2 — Reject action

Reject must:

* preserve artifact,
* store rejection reason,
* update checkpoint status,
* remove or retain blocking state according to backend rule,
* allow rerun/revision if supported.

##### Part 3.4.3 — Rejection history

Show rejected artifacts in the stage history, not only in a global archive.

#### Acceptance Criteria

* Rejected artifacts are never silently deleted.
* User must provide actionable rejection feedback.
* Stage history shows accepted, rejected, superseded, and pending artifacts.

---

## Stage 4 — Hierarchy-Aware Detail Workspaces

Status: draft

### Objective

Ensure each hierarchy layer has a usable detail workspace that supports traversal, context, and readiness for downstream stages.

### Criteria

* Each selected layer has a clear detail panel.
* Parent context is visible without requiring navigation away.
* Child creation is scoped to the active parent.
* Stage orchestration is only available at the stage layer.
* Higher layers can show summaries and downstream readiness.

### Risks

| Severity | Risk                                            | Mitigation                                              |
| -------- | ----------------------------------------------- | ------------------------------------------------------- |
| High     | Users cannot tell what layer they are editing   | Prominent layer label and active path                   |
| High     | Child records created under wrong parent        | Create actions only appear in scoped parent context     |
| Medium   | Detail panels become inconsistent across layers | Shared workspace shell with layer-specific slots        |
| Medium   | UI becomes form-heavy and dull                  | Use summary cards, readiness panels, and child previews |

### Dependencies

* Existing workspace shell.
* Data access for each hierarchy entity.
* Design system components.

---

### Phase 4.1 — Shared Detail Shell

#### Objective

Create a reusable detail shell for all hierarchy layers.

#### Parts

##### Part 4.1.1 — Header region

Must show:

* layer type,
* title/name,
* status,
* active path,
* parent reference.

##### Part 4.1.2 — Summary region

Must show:

* purpose/description,
* role in story structure,
* child counts,
* readiness status.

##### Part 4.1.3 — Actions region

Actions must be layer-aware:

| Layer     | Allowed Actions                                  |
| --------- | ------------------------------------------------ |
| Arc       | edit, add act, view arc summary                  |
| Act       | edit, add milestone, view act progression        |
| Milestone | edit, add chapter, view milestone target         |
| Chapter   | edit, add scene, view chapter structure          |
| Scene     | edit, add beat, view scene purpose               |
| Beat      | edit, add stage, view beat function              |
| Stage     | run orchestrator, review artifacts, view history |

#### Acceptance Criteria

* Same shell supports all seven layers.
* Stage-specific AI controls do not appear on non-stage layers.
* User always knows current layer and parent context.

---

### Phase 4.2 — Layer-Specific Panels

#### Objective

Add the minimum useful detail panels for each hierarchy layer.

#### Parts

##### Part 4.2.1 — Arc panel

Focus:

* macro story arc,
* thematic movement,
* associated acts,
* completion/readiness indicators.

##### Part 4.2.2 — Act panel

Focus:

* act-level function,
* milestones,
* act progression,
* unresolved structural gaps.

##### Part 4.2.3 — Milestone panel

Focus:

* turning point,
* narrative purpose,
* target chapter relationship,
* dependency on prior milestone.

##### Part 4.2.4 — Chapter panel

Focus:

* chapter purpose,
* scene list,
* pacing target,
* accepted artifact coverage.

##### Part 4.2.5 — Scene panel

Focus:

* scene goal,
* conflict,
* outcome,
* beat list.

##### Part 4.2.6 — Beat panel

Focus:

* beat function,
* beat-to-stage progression,
* stage readiness.

##### Part 4.2.7 — Stage panel

Focus:

* stage definition,
* orchestrator readiness,
* generated artifacts,
* checkpoint actions,
* history.

#### Acceptance Criteria

* Every hierarchy layer has a meaningful workspace.
* Stage panel is the only place where orchestrator execution occurs.
* Parent/child context remains visible.

---

## Stage 5 — State Management, Data Adapters, and Failure Hardening

Status: draft

### Objective

Make the UI maintainable by isolating hierarchy state, API adapters, checkpoint state, and orchestration runtime state.

### Criteria

* No component directly hand-builds orchestrator payloads.
* No component directly mutates checkpoint state outside adapter/service layer.
* Selection, artifacts, checkpoints, and runtime calls have separate stores/services.
* All async states are explicit.
* All destructive or canonical state changes require confirmation or backend validation.

### Risks

| Severity | Risk                                               | Mitigation                                                       |
| -------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| Critical | UI state diverges from backend checkpoint truth    | Refresh from backend after accept/reject                         |
| High     | Orchestrator payloads duplicated across components | Single payload builder/adapter                                   |
| High     | Race conditions from fast navigation during run    | Lock run to submitted path; compare returned path before display |
| Medium   | Component complexity becomes unmaintainable        | Separate stores and adapter modules                              |

### Dependencies

* Existing frontend state conventions.
* API endpoint contracts.
* Test framework.

---

### Phase 5.1 — Hierarchy Store

#### Objective

Create a dedicated state layer for active hierarchy selection and derived context.

#### Parts

##### Part 5.1.1 — Active path store

Responsibilities:

* hold active path,
* validate path,
* clear descendants,
* expose selected node summaries.

##### Part 5.1.2 — Derived context selectors

Expose:

* selected arc,
* selected act,
* selected milestone,
* selected chapter,
* selected scene,
* selected beat,
* selected stage,
* full path label,
* readiness state.

##### Part 5.1.3 — Navigation guards

Prevent:

* selecting child without parent,
* stale selected IDs,
* accidental loss of in-progress review state without warning.

#### Acceptance Criteria

* Store tests cover selection transitions.
* Components do not duplicate path logic.
* Invalid paths are repaired or blocked.

---

### Phase 5.2 — Orchestrator Adapter

#### Objective

Centralize all stage-run API behavior.

#### Parts

##### Part 5.2.1 — Payload builder

Inputs:

* active path,
* selected stage,
* optional user instructions/options.

Output:

* backend-compatible orchestrator request.

##### Part 5.2.2 — Run adapter

Responsibilities:

* submit request,
* track runtime state,
* normalize response,
* surface artifact/checkpoint result.

##### Part 5.2.3 — Error normalizer

Normalize:

* validation errors,
* model/router errors,
* network errors,
* timeout errors,
* schema errors,
* checkpoint creation failures.

#### Acceptance Criteria

* Components never build raw stage-run payloads.
* Adapter tests cover success and failure responses.
* Runtime states are deterministic.

---

### Phase 5.3 — Checkpoint Adapter

#### Objective

Centralize accept/reject behavior.

#### Parts

##### Part 5.3.1 — Fetch queue

Retrieve pending and historical checkpoints.

##### Part 5.3.2 — Accept checkpoint

Call backend accept behavior and refresh dependent state.

##### Part 5.3.3 — Reject checkpoint

Call backend reject behavior with required reason/feedback and refresh dependent state.

##### Part 5.3.4 — History loader

Load checkpoint/artifact history for selected stage.

#### Acceptance Criteria

* Accept/reject behavior is not duplicated in components.
* Queue refreshes after decisions.
* Stage history stays consistent with global queue.

---

## Stage 6 — Verification, QA, and Evidence

Status: draft

### Objective

Prove the UI correctly supports hierarchy traversal, stage orchestration, and checkpoint review before marking the plan complete.

### Criteria

* Automated tests cover core workflow.
* Manual QA script exists.
* Evidence is appended to the plan.
* Known limitations are documented.
* No plan artifact history is rewritten.

### Risks

| Severity | Risk                                                 | Mitigation                                                  |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| Critical | Happy-path only testing misses checkpoint failures   | Include reject, failed run, stale path, duplicate run tests |
| High     | UI appears complete but cannot survive real workflow | End-to-end test from arc selection to artifact decision     |
| Medium   | Evidence is scattered                                | Store test output and QA notes in plan artifact             |

### Dependencies

* Stable test data.
* Mockable orchestrator endpoint or test fixture.
* Playwright setup.

---

### Phase 6.1 — Unit and Integration Tests

#### Objective

Test state, adapters, and validation logic.

#### Parts

##### Part 6.1.1 — Hierarchy store tests

Cover:

* selecting each layer,
* clearing descendants,
* invalid path handling,
* stale node behavior.

##### Part 6.1.2 — Orchestrator adapter tests

Cover:

* valid payload,
* missing stage,
* missing parent,
* backend validation error,
* network failure,
* duplicate run guard.

##### Part 6.1.3 — Checkpoint adapter tests

Cover:

* pending queue load,
* accept success,
* reject success,
* reject without reason blocked,
* refresh after decision.

#### Acceptance Criteria

* Tests run under project test command.
* Critical state logic has coverage.
* Failure modes are tested, not only success paths.

---

### Phase 6.2 — End-to-End Tests

#### Objective

Verify user-facing workflow.

#### Parts

##### Part 6.2.1 — Traverse hierarchy

E2E path:

```text
Open workspace
Select arc
Select act
Select milestone
Select chapter
Select scene
Select beat
Select stage
Confirm breadcrumb
```

##### Part 6.2.2 — Run stage orchestrator

E2E path:

```text
Select valid stage
Open readiness panel
Run stage
Observe running state
Observe pending checkpoint artifact
```

##### Part 6.2.3 — Accept artifact

E2E path:

```text
Open pending checkpoint
Review artifact
Accept
Confirm canonical update
Confirm decision log entry
```

##### Part 6.2.4 — Reject artifact

E2E path:

```text
Open pending checkpoint
Reject without reason
Confirm blocked
Add reason
Reject
Confirm rejected history entry
Confirm stage can rerun if allowed
```

##### Part 6.2.5 — Failure handling

E2E path:

```text
Trigger failed orchestrator response
Confirm error message
Confirm retry option
Confirm no canonical mutation
```

#### Acceptance Criteria

* E2E tests cover traversal, run, accept, reject, and failure.
* Canonical mutation only occurs after accept.
* Rejected artifact remains visible in history.

---

## 3. Definition of Done

This plan is complete only when:

* Users can traverse the full hierarchy from arc to stage.
* The active path is always visible and valid.
* Stage orchestration can only be triggered from a selected valid stage.
* Generated artifacts enter checkpoint review.
* Accepting an artifact promotes it through the backend checkpoint workflow.
* Rejecting an artifact preserves it with reviewer feedback.
* Pending, accepted, rejected, and superseded artifacts are visible.
* The UI handles empty, loading, failed, stale, and duplicate-run states.
* Tests prove traversal, run, accept, reject, and failure behavior.
* Evidence is appended to the plan artifact.

---

## 4. Out of Scope

This plan does not include:

* Redesigning the backend pipeline from plan-027-v1.1-scoping.
* Changing the strict hierarchy.
* Adding new AI provider behavior.
* Adding direct provider SDK calls.
* Bypassing checkpoint review.
* Export/manuscript formatting.
* Marketplace/community features.
* General chat/Nova redesign unless required for stage orchestration.
* Non-stage-based generation.

---

## 5. Implementation Notes for Coding Agent

### Objective

Implement the hierarchy-aware UI and checkpoint workflow for Novellum’s finalized backend pipeline.

### Problem

The backend pipeline is finalized, but users need an operational UI to move through:

```text
arcs → acts → milestones → chapters → scenes → beats → stages
```

The UI must let users run stage-based orchestrator calls and manage generated artifacts through accept/reject checkpoints.

### Files

Agent must inspect before editing:

```text
src/routes/
src/lib/components/
src/lib/stores/
src/lib/server/
src/lib/types/
src/lib/api/
src/lib/features/
dev-docs/plans/plan-027-v1.1-scoping/
```

Exact files must be identified from repo inspection before implementation.

### Changes

Implement:

* hierarchy navigator,
* active path state,
* breadcrumb path,
* stage readiness panel,
* orchestrator trigger panel,
* artifact review panel,
* checkpoint queue,
* accept/reject actions,
* artifact history,
* tests.

### UI/UX

Required states:

* empty,
* loading,
* ready,
* disabled with reason,
* running,
* pending checkpoint,
* accepted,
* rejected,
* superseded,
* failed,
* stale selection.

### Data

Respect strict hierarchy:

```text
arcId → actId → milestoneId → chapterId → sceneId → beatId → stageId
```

No child may be created or selected outside its parent scope.

### Errors

Handle:

* missing parent,
* missing stage,
* invalid path,
* deleted/stale node,
* duplicate run,
* pending checkpoint block,
* orchestrator failure,
* schema validation failure,
* checkpoint accept failure,
* checkpoint reject failure.

### Tests

Add:

* unit tests for hierarchy store,
* adapter tests for orchestrator/checkpoint calls,
* Playwright tests for traversal/run/accept/reject/failure.

### Criteria

Implementation is acceptable only if canonical project state changes after checkpoint acceptance, not after generation.

### Out-of-Scope

Do not modify backend pipeline semantics unless a frontend-blocking contract defect is discovered and documented.

### Format

Return:

1. files changed,
2. implementation summary,
3. test evidence,
4. unresolved risks,
5. screenshots or route notes where applicable.

---

## 6. Evidence Log

Append-only.

| Date | Actor | Evidence                                 | Result  |
| ---- | ----- | ---------------------------------------- | ------- |
| TBD  | TBD   | `pnpm run lint`                          | Pending |
| TBD  | TBD   | `pnpm run test`                          | Pending |
| TBD  | TBD   | Playwright traversal/checkpoint workflow | Pending |

```
```

[1]: https://chatgpt.com/c/69e06f73-11c8-83ea-8c8a-826b92525460 "Arc Dashboard Feedback"
[2]: https://chatgpt.com/c/69dbe95b-2d08-83ea-876a-719912141ff1 "Improving Project Form"
[3]: https://chatgpt.com/c/6a0c74b0-9e20-83ea-9e65-898df94451e7 "Base44 Prompt for Novellum"
[4]: https://chatgpt.com/c/69ec541a-02d4-83ea-870e-eff56ff9f27d "Old form layout issue"
[5]: https://chatgpt.com/c/69e19526-2b40-83ea-a438-0b3977bf532a "Workflow Optimization Analysis"
[6]: https://chatgpt.com/c/69edf4e8-97a0-83ea-a111-a98e85982258 "Budget Review and Advice"
[7]: https://chatgpt.com/c/69fc109a-82e4-83ea-b9f3-93016cf7760a "Novellum MD Overview"
