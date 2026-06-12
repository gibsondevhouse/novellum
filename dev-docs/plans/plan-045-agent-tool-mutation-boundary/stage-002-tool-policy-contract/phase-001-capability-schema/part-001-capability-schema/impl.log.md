---
part: part-001-capability-schema
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

### [2026-06-11 20:01 EDT] Agent: Codex

**Action:** Added an explicit capability schema to Nova Agent tool definitions.

**Result:** `ToolDefinition` now requires `capability`; `registerTool()` rejects invalid capabilities; all product and test tools declare `read_only`, `review_artifact_generation`, or `mutation_command`. Added `evidence/capability-schema-evidence-2026-06-11.md`.

**Validation:** `pnpm check` passed with 0 errors / 0 warnings. `pnpm lint` passed. `pnpm test tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts` passed (4 files / 31 tests).

**Notes:** Part is ready for Reviewer Agent sign-off. Next phase should filter model advertisement to exclude `mutation_command`.

---
