# Evidence — Define Tool Definition Contracts

**Date:** 2026-05-28
**Part:** phase-001 / part-002

## What was done

`ProposalEnvelope` interface defined and exported from `agent-tools.ts`. `AgentLoopInput` interface defined and exported from `agent-loop.ts`. Both use existing `ToolDefinition` / `ToolHandler` / `ToolResult` contracts from `nova/types.ts` unchanged.

## File evidence

- `src/modules/nova/services/agent-tools.ts` — exports `ProposalEnvelope`, `registerAgentTools`
- `src/modules/nova/services/agent-loop.ts` — exports `AgentLoopInput`, `MAX_AGENT_STEPS`
- `src/modules/nova/index.ts` — re-exports both

## Static contract check

```
tests/nova/agent-source-contracts.test.ts > Agent tools are registered at module load
  ✓ agent-tools.ts exports registerAgentTools
  ✓ agent-tools.ts exports ProposalEnvelope
  ✓ agent-loop.ts exports MAX_AGENT_STEPS = 8
```
