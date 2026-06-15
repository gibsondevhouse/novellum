---
title: Model Capability Registry
slug: part-001-model-capability-registry
part_number: 1
status: complete
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-model-capability-registry
started_at: '2026-06-14'
completed_at: '2026-06-14'
estimated_duration: TBD
---

## Objective

Add capability-aware model routing and budget tracking for agent runtime tasks.

## Scope

**In scope:**

- Add a local model capability registry for supported provider models and task requirements.
- Track required capabilities for tool calling, JSON schema output, streaming, long context, and low-cost background execution.
- Add token and cost estimate helpers with provider-reported usage reconciliation.

**Out of scope:**

- Automatically purchasing or provisioning model access.
- Calling external pricing APIs during every run.

## Implementation Steps

1. Define model capability and task requirement types.
2. Extend model routing to validate selected model capabilities before execution.
3. Add token/cost estimate helpers and runtime usage reconciliation.
4. Add settings or diagnostics hooks only where needed to explain failures.
5. Save capability registry evidence under this part.

## Files

**Create:**

- `src/lib/ai/model-capabilities.ts`
- `src/lib/ai/model-budget.ts`
- `tests/ai/model-capabilities.test.ts`
- `tests/ai/model-budget.test.ts`
- `evidence/model-capability-registry-2026-06-11.md`

**Update:**

- `src/lib/ai/model-router.ts`
- `src/lib/ai/constants.ts`
- `src/lib/ai/providers/types.ts`
- `src/lib/stores/model-selection.svelte.ts`
- `src/lib/server/agent-runtime/run-ledger.ts`
- `src/modules/nova/services/agent-loop.ts`
- `tests/ai/provider-types.test.ts`
- `tests/nova/agent-loop.test.ts`

**Reference:**

- `src/lib/ai/providers/openrouter-provider.ts`
- `src/lib/ai/providers/ollama-provider.ts`
- `src/routes/settings/ai/+page.svelte`
- `src/modules/settings/components/OpenRouterPanel.svelte`
- `src/modules/settings/components/OllamaPanel.svelte`

## Acceptance Criteria

- [ ] Model metadata includes provider, tool support, JSON schema support, streaming support, context length, usage confidence, and cost hints.
- [ ] Runtime routes can reject or reroute tasks when a selected model lacks required capabilities.
- [ ] Budget estimates and provider-reported usage are stored separately.

## Edge Cases

- Provider catalog responses may omit pricing or tool support details.
- Local Ollama models may have unknown capabilities until configured by the user.

## Notes

When uncertain, fail explainably or require user confirmation instead of silently choosing a weaker model.
