---
title: Fetch Client
slug: part-001-fetch-client
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-generic-api-client
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Create a minimal, typed fetch wrapper at `src/lib/api-client.ts` that encapsulates request construction, response parsing, and error surfacing for all `/api/db/*` repository calls.

## Scope

**In scope:**

- `apiGet<T>(path: string, params?: Record<string, string>): Promise<T>`
- `apiPost<T>(path: string, body: unknown): Promise<T>`
- `apiPut<T>(path: string, body: unknown): Promise<T>`
- `apiDel(path: string): Promise<void>`
- Consistent error: throw `Error` with message from `{ error: string }` response body or HTTP status text
- Query param serialization via `URLSearchParams`

**Out of scope:**

- Authentication headers
- Request retry logic
- Request cancellation / AbortController (V1)
- Caching

## Implementation Steps

1. Create `src/lib/api-client.ts`
2. Define `BASE = ''` (empty string — relative URL, browser resolves against current origin)
3. Implement `apiGet<T>`: construct URL with `URLSearchParams`, `fetch(url)`, parse JSON, throw on error
4. Implement `apiPost<T>`: `fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })`, parse JSON response, throw on error
5. Implement `apiPut<T>`: same as POST but `method: 'PUT'`
6. Implement `apiDel`: `method: 'DELETE'`, expect 204, no JSON parse
7. Export all four functions as named exports
8. Export `ApiError` class that extends `Error` and carries `status: number`

## Files

**Create:**

- `src/lib/api-client.ts`

## Acceptance Criteria

- [ ] `apiGet<Project[]>('/api/db/projects')` resolves to typed array
- [ ] `apiGet` with `params` appends correct query string
- [ ] Non-2xx response throws `ApiError` with `status` and message from response body
- [ ] `apiDel` resolves `void` on 204, throws on error
- [ ] No imports from Dexie or `$lib/db` in this file
- [ ] `pnpm check` passes

## Edge Cases

- 404 with body `{ error: "not found" }` must throw `ApiError` with `status: 404` and message `"not found"`
- Network failure (fetch throws) must propagate naturally — no swallowing
- `apiDel` on 404 can optionally succeed silently (idempotent delete) — document decision

## Notes

> Keep this file minimal. It is a thin transport layer, not a state management system. Caching, optimistic updates, and loading state are handled at the store/component layer.
