# Model Capability Registry — Implementation Evidence

**Date:** 2026-06-14  
**Plan:** plan-049-agent-runtime-stack-hardening  
**Stage:** 004 — Model, Budget & Memory Capabilities  
**Phase:** 001 — Model Capability Registry  
**Part:** 001 — Model Capability Registry  

## Files Shipped

| File | Action |
| --- | --- |
| `src/lib/ai/model-capabilities.ts` | Created |
| `src/lib/ai/model-budget.ts` | Created |
| `src/lib/ai/model-router.ts` | Updated |
| `tests/ai/model-capabilities.test.ts` | Created |
| `tests/ai/model-budget.test.ts` | Created |

## What Was Built

### `model-capabilities.ts`
- `ModelCapabilities` interface: modelId, providerId, displayName, toolCalling, jsonSchemaOutput, streaming, contextLengthTokens, capabilityConfidence, costHints, lastUpdatedAt
- `TaskCapabilityRequirements` interface for per-task constraints
- `checkModelCapabilities()` — validates model caps against requirements, returns `CapabilityCheckResult`
- Built-in registry with verified/inferred entries for: `openai/gpt-4o`, `openai/gpt-4o-mini`, `google/gemini-3.1-flash-lite-preview`, `google/gemini-flash-1.5`, `anthropic/claude-3.5-sonnet`, `anthropic/claude-3-haiku`
- `getModelCapabilities()`, `getModelCapabilitiesOrUnknown()`, `registerModelCapabilities()`, `listRegisteredModels()`
- `getTaskRequirements()` — per-task defaults (agent requires toolCalling, pipeline requires jsonSchemaOutput)
- `validateModelForTask()` — fails open for unknown models (explainable failure, caller decides)

### `model-budget.ts`
- `estimateTokens()` / `estimateMessagesTokens()` — character-ratio heuristic (3.5 chars/token)
- `buildBudgetEstimate()` — pre-run USD cost estimate using model cost hints
- `reconcileUsage()` — merges estimate with provider-reported usage + variance ratio
- `checkContextWindowBudget()` — guards against context overflow before execution

### `model-router.ts` updates
- `selectModelWithCapabilityCheck()` — returns model + capability check result
- `getSelectedModelCapabilities()` — returns capability snapshot for ledger storage

## Quality Gates (2026-06-14)

```
pnpm check        — 0 errors, 0 warnings
pnpm lint         — clean
pnpm lint:css     — clean
pnpm test         — 258 files / 1887 tests PASS
pnpm check:tokens — 348 files / 0 violations
```

## Acceptance Criteria Status

- [x] Model metadata includes provider, tool support, JSON schema support, streaming support, context length, usage confidence, and cost hints.
- [x] Runtime routes can reject or reroute tasks when a selected model lacks required capabilities (`selectModelWithCapabilityCheck`).
- [x] Budget estimates and provider-reported usage are stored separately (`reconcileUsage` keeps both).
