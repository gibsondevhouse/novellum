---
part: part-001-advertisement-filter
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

### [2026-06-11 20:03 EDT] Agent: Codex

**Action:** Filtered model-advertised Nova tools to exclude mutation commands.

**Result:** Added `listModelCallableTools()` and routed both `runAgentLoop()` and the experimental agentic chat payload through it. Full registry access remains available through `listTools()` for internal use. Added tests that explicitly deny `authorDraft.accept_checkpoint` and `authorDraft.reject_checkpoint` from model-advertised payloads. Added `evidence/advertisement-filter-evidence-2026-06-11.md`.

**Validation:** `pnpm check` passed with 0 errors / 0 warnings. `pnpm lint` passed. `pnpm test tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts` passed (4 files / 33 tests).

**Notes:** Part is ready for Reviewer Agent sign-off. Phase 003 should harden source-contract tests so model-callable tool code cannot import accept/reject mutation helpers.

---
