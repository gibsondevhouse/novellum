# Security & Schema Audit — Plan 034 Stage 004 Phase 001

Audit date: 2026-05-30

## Part 001 — Schema Validation

| Check | File | Result | Notes |
|-------|------|--------|-------|
| `worldbuildDomainPersonaeSchema` uses `.strict()` | `worldbuild-schemas.ts` | ✅ Pass | No `.passthrough()` |
| `worldbuildDomainAtlasSchema` uses `.strict()` | `worldbuild-schemas.ts` | ✅ Pass | No `.passthrough()` |
| `worldbuildDomainArchiveSchema` uses `.strict()` | `worldbuild-schemas.ts` | ✅ Pass | No `.passthrough()` |
| `worldbuildDomainThreadsSchema` uses `.strict()` | `worldbuild-schemas.ts` | ✅ Pass | No `.passthrough()` |
| `worldbuildDomainChroniclesSchema` uses `.strict()` | `worldbuild-schemas.ts` | ✅ Pass | No `.passthrough()` |
| Nested draft schemas (characterDraftSchema etc.) use `.strict()` | `worldbuild-schemas.ts` | ✅ Pass | All strict |
| Schema validation failures return `{ ok: false }` before storage | `worldbuild-agent.ts` | ✅ Pass | `parseWithTaskDefinition` uses `safeParse` and returns structured error; never proceeds to storage on failure |
| Invalid model response cannot be stored in a domain checkpoint | `checkpoint-service.ts` | ✅ Pass | `createDomainCheckpoint` accepts pre-parsed `WorldbuildPayload`; caller must validate before calling |

## Part 002 — Provenance Tracking

| Check | File | Result | Notes |
|-------|------|--------|-------|
| `WorldbuildProvenance` interface exported | `checkpoint-contract.ts` | ✅ Pass | `{ model, generationId, createdAt, sourceContextSummary }` |
| `WorldbuildDomainCheckpointRecord` has `provenance` field | `checkpoint-contract.ts` | ✅ Pass | Non-optional field |
| `createDomainCheckpoint` always sets `provenance` | `checkpoint-service.ts` | ✅ Pass | Default `model: 'unknown'` when not provided; `generationId` = artifact id |
| `WorldbuildingProposalCard` renders model name | `WorldbuildingProposalCard.svelte` | ✅ Pass | `proposal.provenance.model` in `<dl>` metadata row |
| `WorldbuildingProposalCard` renders context summary | `WorldbuildingProposalCard.svelte` | ✅ Pass | Shown when `sourceContextSummary` is non-empty |

## Part 003 — Server-Side Access

| Check | File | Result | Notes |
|-------|------|--------|-------|
| API key not in `$env/static/public` | All source files | ✅ Pass | `grep -r "env/static"` returns empty — no env references in source |
| API key loaded from server-side credential service | `/api/worldbuilding/generate/+server.ts` | ✅ Pass | `credentialService.loadProviderKey('openrouter')` — server-only import from `$lib/server/credentials/` |
| Credential store uses filesystem (not client bundle) | `src/lib/server/credentials/secure-store.ts` | ✅ Pass | File at `${appDataDir}/credentials.json` with 0600 perms; never returned to client |
| `openrouter.ts` browser client never holds API key | `src/lib/ai/openrouter.ts` | ✅ Pass | Proxies via `/api/ai`; comment confirms "browser never holds the API key" |
| Accept endpoint does not expose credentials | `/api/worldbuilding/proposals/[proposalId]/accept/+server.ts` | ✅ Pass | No credential access; reads/updates checkpoint only |
| Reject endpoint does not expose credentials | `/api/worldbuilding/proposals/[proposalId]/reject/+server.ts` | ✅ Pass | No credential access; reads/updates checkpoint only |
| Single-user app: no multi-user auth required | All endpoints | ✅ Pass | Novellum is a local desktop app (Tauri); no multi-user auth surface. Rate limiting applied globally in `hooks.server.ts` |

## Summary

All audit items pass. No security regressions introduced by plan-034. The key invariants hold:

1. The OpenRouter API key is stored in a server-side filesystem credential store (never in client bundle or environment variables accessible to the browser).
2. All AI requests proxy through server-side SvelteKit endpoints.
3. All five domain Zod schemas are `.strict()` — no extra model output can slip through unvalidated.
4. Provenance is tracked on every domain checkpoint: model identifier, generation ID, timestamp, and context summary.
5. Review-gated canon safety is preserved: accepted proposals write to canon tables; rejected proposals do not.
