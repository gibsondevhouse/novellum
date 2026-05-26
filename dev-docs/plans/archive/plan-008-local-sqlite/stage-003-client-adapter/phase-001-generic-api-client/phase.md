---
title: Generic API Client
slug: phase-001-generic-api-client
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-003-client-adapter
parts:
  - part-001-fetch-client
estimated_duration: 0.5d
---

## Goal

> Build a typed, reusable `ApiClient` helper at `src/lib/api-client.ts` that wraps `fetch` with consistent error handling, JSON parsing, and base URL resolution — used by all repository rewrites in Phase 002.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Fetch Client](part-001-fetch-client/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] `ApiClient` provides typed `get`, `post`, `put`, `del` methods
- [ ] All methods throw a descriptive `Error` on non-2xx responses
- [ ] All methods handle JSON (de)serialization automatically
- [ ] Base URL is determined from `window.location.origin` (browser) or `http://localhost:5173` (default fallback)
- [ ] `pnpm check` passes

## Notes

> The client must work in both browser and SSR contexts. For SSR (server-side SvelteKit load functions), use absolute URL. For client-side calls in components or stores, use relative paths (`/api/db/...`). The simplest approach is to always use relative paths since all fetch calls originate from the browser.
