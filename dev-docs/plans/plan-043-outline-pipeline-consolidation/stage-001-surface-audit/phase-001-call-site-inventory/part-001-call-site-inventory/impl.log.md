---
part: part-001-call-site-inventory
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [timestamp] Agent: Agent Name`

---

### [2026-06-09 00:00] Agent: Planner Agent

**Action:** Created part scaffold.

**Result:** Initialized `part.md`, `checklist.md`, `impl.log.md`, and `evidence/` for future full-plan expansion and execution.

**Notes:** No implementation work has started. Keep this log append-only when the part is executed.

---

### [2026-06-12 12:25] Agent: Codex

**Action:** Activated Plan-043 from the roadmap queue after Plan-045 review closeout and started Stage 001 / Phase 001 / Part 001.

**Result:** Parent plan, stage, phase, and part moved to `in-progress`; pre-implementation checklist completed.

**Notes:** Next step is the scoped call-site inventory for legacy and canonical outline generation/materialization paths. No source changes have been made for Plan-043 yet.

---

### [2026-06-12 12:45] Agent: Codex

**Action:** Executed the call-site inventory across source, tests, current docs, plan history, and outline-related routes/modules.

**Result:** Added `evidence/call-site-inventory-evidence-2026-06-12.md` with separate classifications for the legacy direct-apply surface, canonical checkpoint flow, tests to update, docs to sync, and risk notes for the next phase. The active legacy chain is Write mode outline prompt -> `runAuthorPipelineTask(AUTHOR_OUTLINE)` -> `author-outline` artifact -> `NovaOutlineCard` -> `/api/nova/outline/apply`; the canonical chain is `/api/ai/outline/generate` -> `outlineDraftCheckpoints.v1` -> `NovaOutlineDraftCheckpointCard` -> `/api/outline/checkpoints/{checkpointId}/accept`.

**Validation:** No runtime source changed for this part. Current gates had already passed in this session before the inventory (`pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm check:tokens`, and targeted outline/review e2e). This part is documentation/evidence-only.

**Notes:** Part moved to `review`; Phase 001 moved to `review`. Stage 001 remains `in-progress` because Phase 002 contract risk map is next.

---

### [2026-06-12 13:15] Agent: Reviewer Agent

**Action:** Reviewed the call-site inventory evidence for completeness against the Stage 001 objective.

**Result:** Approved. The inventory covers legacy apply route/client/card/message rendering, canonical checkpoint generation/review/materialization surfaces, affected tests, docs to sync, and risk notes for follow-up implementation.

**Validation:** Evidence-only review. No runtime behavior changed in this sign-off.

**Notes:** Part status moved from `review` to `complete`.

---

### [2026-06-12 15:45] Agent: Codex

**Action:** Recorded process correction after the user clarified that Reviewer runs only after plan implementation closeout.

**Result:** The earlier intermediate Reviewer entry is treated as process noise. Stage 001 evidence remains valid, but plan-level reviewer evaluation is deferred until full Plan-043 implementation closeout.

**Validation:** Documentation-only correction. No runtime behavior changed.

**Notes:** Part status remains implementation `complete`.

---
