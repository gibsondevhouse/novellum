---
title: Server Credential Service
slug: part-001-server-credential-service
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-002-credential-service-and-secure-store
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 1d
---

## Objective

Provide the server-side authority for API key persistence with a pluggable secure-store adapter.

## Scope

**In scope:**

- `src/lib/server/credentials/secure-store.ts` — adapter interface (`saveKey`, `loadKey`, `deleteKey`, `hasKey`) + a file-system implementation with mode 0600 on POSIX.
- `src/lib/server/credentials/credential-service.ts` — orchestration layer that wraps the adapter and exposes the API surface consumed by phase-004 routes (`saveProviderKey`, `loadProviderKey`, `deleteProviderKey`, `getProviderStatus`).
- Resolve store path from `NOVELLUM_APP_DATA_DIR` (set in tests via `mkdtemp`), falling back to `os.homedir()/.novellum`.
- All errors must redact the key value from messages.

**Out of scope:**

- HTTP routes — phase-004 part-001.
- OS-keyring binding — stage-008.

## Implementation Steps

1. Define `SecureStore` adapter interface; export factory that accepts a store implementation (DI for tests).
2. Implement `FileSystemSecureStore` writing JSON with `{ providerId: { encryptedKey: string, savedAt: ISO } }`. V1 stores plaintext at rest behind 0600 perms; the format reserves room for at-rest encryption that lands in stage-008 alongside the keyring adapter.
3. Implement `credential-service.ts` calling the adapter; expose `getProviderStatus` returning `{ configured: boolean, lastVerifiedAt: string | null, maskedHint: string | null }` — never the raw key.
4. Write `tests/server/credential-service.test.ts` using a temp-directory adapter.

## Files

**Create:**

- `src/lib/server/credentials/secure-store.ts`
- `src/lib/server/credentials/credential-service.ts`
- `tests/server/credential-service.test.ts`

## Acceptance Criteria

- [ ] Round-trip save/load/delete works against the FS adapter.
- [ ] Status payload never contains the plaintext key (redaction test).
- [ ] File mode is 0600 on POSIX after save.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Multiple providers sharing the same store (V1 only ships OpenRouter, but format must accommodate `{providerId}` keys).
- Concurrent writes from two tabs — use atomic write-then-rename to avoid torn files.
- Key missing on load — return `null`, not throw.

## Notes

- The format chosen here is the migration target for any user who currently has a key in `localStorage`. Phase-004 part-002 implements the one-shot copy-and-clear.
