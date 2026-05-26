---
title: Provider Abstraction
slug: phase-001-provider-abstraction
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-005-byok-security
parts:
  - part-001-provider-interface
  - part-002-openrouter-implementation
estimated_duration: 1d
---

## Goal

Introduce an `AiProvider` interface that decouples the application from a specific vendor SDK and re-implement the existing OpenRouter integration behind it. This is the structural prerequisite for the credential service (phase-002), the route refactor (phase-003), and the settings flow (phase-004).

## Parts

| #   | Part                                                                                          | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Provider Interface](part-001-provider-interface/part.md)                                     | `draft` | ai          | 0.5d          |
| 002 | [OpenRouter Implementation](part-002-openrouter-implementation/part.md)                       | `draft` | ai          | 0.5d          |

## Acceptance Criteria

- [ ] `src/lib/ai/providers/types.ts` defines `AiProvider` with `validateKey`, `listModels`, `complete`, `stream` and explicit input/output types.
- [ ] `src/lib/ai/providers/openrouter-provider.ts` implements `AiProvider` against `https://openrouter.ai/api/v1`.
- [ ] No call site outside `src/lib/ai/providers/**` uses `fetch` directly against OpenRouter.
- [ ] Vitest suite `tests/ai/openrouter-provider.test.ts` exercises every method against a mocked `fetch`.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Interface must be future-proof for Ollama / Anthropic / OpenAI but only OpenRouter ships in V1.
- This phase does not change how keys are stored or read; that is phase-002.
