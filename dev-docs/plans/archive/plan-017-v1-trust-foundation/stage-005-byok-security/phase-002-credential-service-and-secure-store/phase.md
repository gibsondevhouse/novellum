---
title: Credential Service and Secure Store
slug: phase-002-credential-service-and-secure-store
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-005-byok-security
parts:
  - part-001-server-credential-service
  - part-002-frontend-credential-client
estimated_duration: 1.5d
---

## Goal

Stop storing API keys in `localStorage`. Move credential persistence to a server-owned secure store (file-system fallback in dev/test, OS keyring in desktop builds), and expose a tightly-scoped frontend client that never sees the plaintext key after save.

## Parts

| #   | Part                                                                                                | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Server Credential Service](part-001-server-credential-service/part.md)                             | `draft` | backend     | 1d            |
| 002 | [Frontend Credential Client](part-002-frontend-credential-client/part.md)                           | `draft` | architect   | 0.5d          |

## Acceptance Criteria

- [ ] `src/lib/server/credentials/secure-store.ts` exposes `saveKey`, `loadKey`, `deleteKey`, `hasKey` with a pluggable backend (file-system implementation ships in V1).
- [ ] `src/lib/server/credentials/credential-service.ts` is the only server-side caller of `secure-store`.
- [ ] `src/lib/ai/credential-service.ts` is the sole frontend abstraction; never touches `localStorage`.
- [ ] No file under `src/` reads `novellum_openrouter_key` from `localStorage` for production code.
- [ ] `tests/ai/credential-service.test.ts` round-trips save → status → delete and asserts the key is never present in the response payload.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- The desktop OS-keyring binding (Electron `safeStorage` or platform-native crate) lands in stage-008. This phase only defines the interface and ships the file-system fallback used in dev/test/server builds.
- File-system fallback path defaults to `${appDataDir}/credentials.json` with mode 0600 on POSIX; Windows uses `DPAPI` via the future keyring adapter.
