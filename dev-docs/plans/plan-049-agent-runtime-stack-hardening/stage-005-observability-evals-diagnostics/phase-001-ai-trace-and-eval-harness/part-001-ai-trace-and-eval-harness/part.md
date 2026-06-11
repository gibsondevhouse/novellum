---
title: AI Trace & Eval Harness
slug: part-001-ai-trace-and-eval-harness
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-ai-trace-and-eval-harness
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Add local tracing and eval coverage for agent runtime behavior without requiring live provider calls or cloud telemetry.

## Scope

**In scope:**

- Capture redacted trace events for prompt assembly, model selection, provider call, tool call, parser result, artifact creation, review transition, and usage reconciliation.
- Add deterministic fixtures and eval runners for core agent flows.
- Add tests that verify trace redaction and eval contract behavior.

**Out of scope:**

- Remote telemetry, SaaS dashboards, or automatic upload.
- Storing raw API keys or unredacted credentials in traces.

## Implementation Steps

1. Define trace event types and redaction policy.
2. Add trace writing through the runtime ledger.
3. Build fixture-driven eval runners for core agent contracts.
4. Add tests that assert output shape, parser handling, review-gate boundaries, and cost guard behavior.
5. Save trace and eval evidence under this part.

## Files

**Create:**

- `src/lib/server/agent-runtime/trace.ts`
- `src/lib/server/agent-runtime/evals.ts`
- `tests/agent-runtime/trace.test.ts`
- `tests/agent-runtime/evals.test.ts`
- `tests/fixtures/ai-runtime/outline-generation.json`
- `tests/fixtures/ai-runtime/author-draft.json`
- `tests/fixtures/ai-runtime/worldbuild-proposal.json`
- `tests/fixtures/ai-runtime/tool-routing.json`
- `evidence/ai-trace-and-eval-harness-2026-06-11.md`

**Update:**

- `src/lib/ai/prompt-builder.ts`
- `src/lib/ai/providers/openrouter-provider.ts`
- `src/lib/ai/providers/ollama-provider.ts`
- `src/modules/nova/services/tool-router.ts`
- `src/lib/ai/pipeline/outline-draft-contract.ts`
- `src/lib/ai/pipeline/author-draft-contract.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`

**Reference:**

- `tests/ai/pipeline/contracts.test.ts`
- `tests/ai/pipeline/outline-draft-contract.test.ts`
- `tests/ai/pipeline/author-agent.test.ts`
- `tests/ai/pipeline/worldbuild-agent.test.ts`
- `tests/nova/tool-router.test.ts`

## Acceptance Criteria

- [ ] Runtime-critical prompts, model metadata, tool calls, parser outcomes, and usage are traceable with redaction.
- [ ] Eval fixtures cover outline, author draft, worldbuilding, tool routing, budget rejection, and malformed provider output.
- [ ] Tests can run without live provider calls.

## Edge Cases

- Streaming provider failures may emit partial content before an error.
- Malformed JSON repairs must be traceable without storing unnecessary full context.

## Notes

Evals should protect runtime contracts, not judge prose quality.
