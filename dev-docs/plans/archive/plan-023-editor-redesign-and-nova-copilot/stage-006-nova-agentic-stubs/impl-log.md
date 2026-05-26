---
part: stage-006-nova-agentic-stubs
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-05-03 07:15] Agent: AI Agent

**Action:** Executed all five phases of plan-023 stage-006 — `ToolStatus` extended with `not-yet-supported`; tool registry, four stub tool definitions, registry-driven dispatcher, module-local feature flag, flag-gated `tools` payload in `chat-service`, and `tool-call`/`tool-result` rendering in `NovaPanel`. Added/extended seven test files and one visual baseline; appended an "Agentic Tools" section to `dev-docs/agents-map.md`.

**Result:**

- New files:
  - `src/modules/nova/services/tool-registry.ts`
  - `src/modules/nova/services/stub-tools.ts`
  - `src/modules/nova/services/feature-flags.ts`
  - `tests/nova/tool-registry.test.ts`
  - `tests/nova/stub-tools.test.ts`
  - `tests/nova/feature-flags.test.ts`
  - `tests/nova/nova-panel-tools.test.ts`
  - `tests/visual/editor-nova-panel-tools.test.ts`
  - `tests/visual/__screenshots__/visual/editor-nova-panel-tools.test.ts/editor-nova-panel-tools.png`
- Modified files:
  - `src/modules/nova/types.ts` — `ToolStatus` extended; `ToolHandler` exported.
  - `src/modules/nova/services/tool-router.ts` — replaced stub with registry dispatch (registered → handler; unregistered → `unimplemented`; throw → `error`).
  - `src/modules/nova/services/chat-service.ts` — flag-gated `tools` payload; stage-006 comment.
  - `src/modules/nova/components/NovaPanel.svelte` — `tool-call` / `tool-result` cases + chip styles using existing tokens.
  - `src/modules/nova/index.ts` — module-load `registerStubTools()`; new exports for registry, stub-tools, and feature-flags surfaces (`clearTools` deliberately not exported).
  - `tests/nova/tool-router.test.ts` — rewritten for registry-driven dispatch (registered / unregistered / throwing-handler paths).
  - `tests/nova/chat-service.test.ts` — flag-off / flag-on payload-shape suite added.
  - `dev-docs/agents-map.md` — appended "Agentic Tools (scaffolded — not yet wired)" section.
- Deleted files: none.
- Test counts:
  - vitest: **728 passed / 728 total** (was 686/686 before stage-006; +42 new tests across registry, router rewrites, stub-tools, feature-flags, chat-service flag suite, and panel-tools).
  - visual: **20 baselines passing** (was 19/19 before; +1 baseline `editor-nova-panel-tools.png` at 1280×800).
- Quality gates: `pnpm run lint` clean (only the pre-existing chat-service `no-unreachable` warning, untouched), `pnpm run check` 0 errors, full vitest 728/728, visual 20/20.

**Notes — Five required decisions:**

1. **Extend `ToolStatus` with `not-yet-supported` (chosen)** — kept `unimplemented` for *unregistered* ids, reserved `not-yet-supported` for *registered-but-stubbed* handlers. Documented in the agents-map "Status semantics" subsection.
2. **Module-load registration via `index.ts` (chosen)** — `registerStubTools()` runs as a top-level side effect when the Nova barrel loads, matching the singleton ergonomics of `novaSession`. Tests that need an empty registry call `clearTools()` directly on `tool-registry.js`; `clearTools` is intentionally NOT exported from `index.ts`.
3. **Module-local feature flag (chosen)** — `src/modules/nova/services/feature-flags.ts`. No global `$lib/feature-flags` system exists today; if/when one lands, `experimental.nova.agentic` migrates there. The flag reads `import.meta.env.PUBLIC_NOVELLUM_NOVA_AGENTIC` (truthy: `1`/`true`/`on`/`yes`, case-insensitive, with whitespace tolerance) plus an in-memory override for tests.
4. **Attach `tools` to OpenRouter payload when flag on, but do not yet thread tool-call deltas through `dispatchTool` (chosen)** — `chat-service.ts` adds `payload.tools = listTools()` only when `isNovaAgenticEnabled()` is true; a `// stage-006: tool dispatch is not yet wired end-to-end` comment marks the seam. `OpenRouterClient` itself was not touched.
5. **Visual baseline strategy: dynamic-import seed (chosen)** — the test goes to `/projects/<id>/editor`, opens the panel via the toolbar button, then calls `page.evaluate(async () => { const mod = await import('/src/modules/nova/index.ts'); mod.novaSession.append(...); })` to inject one `tool-call` + one `tool-result` message. This avoids `/api/ai` mocking entirely (no SSE plumbing, no fake stream) and keeps the baseline focused on tool-call rendering. `@ts-expect-error` is used to suppress the dev-server-only import path at compile time.

**Notes — Implementation observations:**

- `import.meta.env` access pattern in `feature-flags.ts` had to be a direct property access (`import.meta.env.PUBLIC_NOVELLUM_NOVA_AGENTIC`) — destructuring through an intermediate variable yields a Vitest-snapshotted env object that doesn't reflect `vi.stubEnv` calls. Direct access goes through Vitest's runtime proxy and works correctly. Recorded an inline comment in the source.
- `tool-result` messages encode the tool status in `toolPayload` (matches the `ToolResult` shape), not in `NovaMessage.status`. Stage-006 added two helper functions in `NovaPanel.svelte` (`getToolResultStatus`, `getToolResultError`) to read those defensively.
- Boundaries diff: zero. The new files all live under `src/modules/nova/**`; no cross-module imports introduced (the registry/stub-tools/feature-flags modules each import only their own module's types or tool-registry sibling).
- `dispatchTool`'s "non-Error throw" branch has one explicit `// eslint-disable` removed (originally added for `throw 'string-thrown';` in tests) — TypeScript-eslint did not actually flag it under our config, so the disable was unnecessary and was dropped during cleanup of the test file.
- Pre-existing warning `tests/nova/chat-service.test.ts:114 — Unused eslint-disable directive` is unrelated to this stage and was not touched.

**Deviations from the spec:** none material. Two minor refinements:

- `tool-result` rendering reads the displayed status from `toolPayload.status` rather than `message.status`, because `NovaMessageStatus` (`pending`/`streaming`/`complete`/`error`/`aborted`) does not include `not-yet-supported`. The chip shows the *tool* status; this matches how `dispatchTool` returns a `ToolResult` and is what consumers will pass when they wire real tool calls. The chip still falls back to `'unknown'` if `toolPayload` is malformed.
- The visual test mounts the editor route, then seeds messages via `page.evaluate(import('/src/modules/nova/index.ts'))` instead of mocking `/api/ai`. Recorded as decision 5.

---
