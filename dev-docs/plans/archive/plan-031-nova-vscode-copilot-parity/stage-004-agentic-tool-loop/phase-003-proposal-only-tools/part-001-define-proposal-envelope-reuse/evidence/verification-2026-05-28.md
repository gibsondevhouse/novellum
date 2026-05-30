# Evidence — Define Proposal Envelope Reuse

**Date:** 2026-05-28
**Part:** phase-003 / part-001

## What was done

`ProposalEnvelope` interface defined in `agent-tools.ts`:

```typescript
export interface ProposalEnvelope {
    kind: 'agent-proposal';
    proposalType: 'outline' | 'scene_draft' | 'revision_pack' | string;
    content: string;
    metadata?: Record<string, unknown>;
}
```

Proposal tools return this envelope as their `output`. The envelope requires explicit user acceptance — it is never auto-applied to manuscript or editor state.

## File evidence

- `src/modules/nova/services/agent-tools.ts` — `ProposalEnvelope` export

## Contract verified by source-contract test

```
tests/nova/agent-source-contracts.test.ts
  ✓ agent-tools.ts exports ProposalEnvelope
```
