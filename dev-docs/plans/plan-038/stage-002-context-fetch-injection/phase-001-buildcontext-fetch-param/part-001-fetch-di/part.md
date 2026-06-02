---
title: Fetch Dependency Injection for buildContext
slug: part-001-fetch-di
part_number: 1
status: complete
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-001-buildcontext-fetch-param
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Allow `buildContext` to accept a caller-supplied `fetch` function so that server-side route
handlers (which must use `event.fetch` for relative URLs) can use it without breaking
existing client-side callers.

## Scope

**Update:**

- `src/lib/ai/context-engine.ts` — add optional `options?: { fetch?: typeof fetch }` third param
  to `buildContext`; pass it down to every `apiGet` call via a local `fetchFn` variable.
- `src/routes/api/ai/+server.ts` — pass `event.fetch` to `buildContext` in `handleTask`.

**No changes needed:**

- `src/lib/ai/continuity-agent.ts` and other client-side callers — they call `buildContext`
  with two args; the default `globalThis.fetch` fallback keeps them working.

## Implementation Steps

1. In `context-engine.ts`, change:
   ```ts
   export async function buildContext(task: AiTask, projectId: string): Promise<AiContext>
   ```
   to:
   ```ts
   export async function buildContext(
     task: AiTask,
     projectId: string,
     options?: { fetch?: typeof globalThis.fetch },
   ): Promise<AiContext>
   ```
2. At the top of `buildContext`, define:
   ```ts
   const fetchFn = options?.fetch ?? globalThis.fetch;
   ```
3. Replace all `apiGet(...)` calls in the function body with versions that pass `fetchFn`.
   Since `apiGet` uses module-level `fetch`, extract a local helper:
   ```ts
   async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
     let url = path;
     if (params) { url += '?' + new URLSearchParams(params).toString(); }
     const res = await fetchFn(url);
     if (!res.ok) throw new ApiError(res.statusText, res.status);
     return res.json() as Promise<T>;
   }
   ```
   Use `get(...)` in place of `apiGet(...)` within `buildContext`.
4. In `src/routes/api/ai/+server.ts`, update `handleTask` signature to receive `event`
   (already available) and change:
   ```ts
   const ctx = await buildContext(task, body.projectId as string);
   ```
   to:
   ```ts
   const ctx = await buildContext(task, body.projectId as string, { fetch: event.fetch });
   ```
   Note: `handleTask` already takes `(body, signal)` — verify `event` is accessible or
   thread it as an additional parameter.

## Acceptance Criteria

- [ ] `buildContext` TypeScript signature accepts optional third options arg.
- [ ] All `apiGet` calls in `context-engine.ts` use the injected fetch.
- [ ] `/api/ai/+server.ts` passes `event.fetch`.
- [ ] Client-side callers (`continuity-agent.ts`, etc.) compile without changes.
- [ ] `pnpm check` — 0 errors.
- [ ] `pnpm test` — all tests pass.

## Edge Cases

- `getOrUndefined` and other helpers inside `context-engine.ts` that call `apiGet` must all
  receive the local `fetchFn` — audit all call sites before finishing.
- If `handleTask` doesn't have direct access to `event`, the function signature must be
  extended to accept it — check the existing handler shape first.

## Notes

The `apiGet` module import can remain; it just won't be used inside `buildContext` anymore
(other callers can keep using it). No need to modify `api-client.ts`.
