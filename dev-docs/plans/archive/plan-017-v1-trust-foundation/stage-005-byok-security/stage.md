---
title: BYOK Security
slug: stage-005-byok-security
stage_number: 5
status: complete
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases:
  - phase-001-provider-abstraction
  - phase-002-credential-service-and-secure-store
  - phase-003-openrouter-client-refactor
  - phase-004-settings-ai-key-flow
  - phase-005-model-selection-and-status
estimated_duration: 5d
risk_level: high
---

## Goal

Make BYOK credential handling commercially acceptable: no API key in `localStorage`, no key material in logs/exports/backups, a single provider abstraction, and a secure-store adapter ready for desktop OS keyring integration.

## Phases

| #   | Phase                                                                                                  | Status  | Est. Duration |
| --- | ------------------------------------------------------------------------------------------------------ | ------- | ------------- |
| 001 | [Provider Abstraction](phase-001-provider-abstraction/phase.md)                                        | `draft` | 1d            |
| 002 | [Credential Service and Secure Store](phase-002-credential-service-and-secure-store/phase.md)          | `draft` | 1.5d          |
| 003 | [OpenRouter Client Refactor](phase-003-openrouter-client-refactor/phase.md)                            | `draft` | 0.5d          |
| 004 | [Settings AI-Key Flow](phase-004-settings-ai-key-flow/phase.md)                                        | `draft` | 1d            |
| 005 | [Model Selection and Status](phase-005-model-selection-and-status/phase.md)                            | `draft` | 1d            |

## Entry Criteria

- Stage 001 complete (credential logging removed, redaction test in place).
- Stage 004 complete (backup excludes credentials confirmed by test).

## Exit Criteria

- `src/lib/ai/providers/types.ts` defines the `AiProvider` interface (`validateKey`, `listModels`, `complete`, `stream`).
- `src/lib/ai/providers/openrouter-provider.ts` is the only OpenRouter implementation; `src/lib/ai/openrouter.ts` is either removed or reduced to a thin re-export.
- `src/lib/ai/credential-service.ts` is the sole frontend credential abstraction. Direct `localStorage` reads of `novellum_openrouter_key` are removed from the codebase.
- `src/lib/server/credentials/secure-store.ts` provides a desktop-secure-storage adapter (file-system fallback in dev/test, OS keyring in desktop mode).
- New API routes exist with validation:
  - `POST /api/settings/ai-key` — save/delete/test a key locally.
  - `GET /api/settings/ai-status` — returns masked status (configured/not-configured), never the key.
  - `GET /api/ai/models` — returns provider model list.
- `src/routes/api/ai/+server.ts` no longer falls back to `OPENROUTER_API_KEY` env. Mock-response path is removed or guarded behind explicit dev-only flag.
- `.env.example` no longer exposes `VITE_OPENROUTER_API_KEY` for production paths.
- `src/lib/stores/model-selection.svelte.ts` reads from preferences/settings, not `localStorage`.
- `ApiSettings.svelte` shows masked status only; cannot reveal a stored key after save.
- Tests pass:
  - `tests/ai/credential-redaction.test.ts` (extended) — keys absent from logs, console, API responses, exports, backups.
  - `tests/ai/openrouter-provider.test.ts` — provider behavior with mocked fetch.
  - `tests/ai/credential-service.test.ts` — save/delete/status round-trips.

## Notes

- Source: [market-readiness-pt1.md §7](../../research/market-readiness-pt1.md).
- Provider interface must be future-proof for Ollama/Anthropic/OpenAI but only ship OpenRouter in V1.
- The desktop secure-store adapter is interfaced in this stage; the actual OS-keyring binding lands in Stage 008 once the packaging shell is selected.
- AI UX refinements (missing-key state, context disclosure, error states) belong to plan-018 stage-005.
