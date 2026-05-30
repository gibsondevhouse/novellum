# AI Pipeline Docs Update — 2026-05-28

## File updated

`dev-docs/03-ai/pipeline.md`

## Changes made

- Updated "last verified" to 2026-05-28 (plan-031 stage-005)
- Replaced plan-030 "Nova mode/workflow boundaries" section with plan-031 reality:
  - Mode routing table (ask/write/agent → actual code paths)
  - Agent loop pseudocode (8-step cap, abort, tool dispatch)
  - Attachment context scope ('user-attached' additive, not RAG replacement)
  - No-mutation guarantee (source-contract test reference)
  - Updated enforcement test list
- Updated Server boundary section to document both /api/ai and /api/nova/agent endpoints

## Acceptance criteria

- [x] Pipeline docs describe the real implemented flow
- [x] Tool-calling docs include guardrails and source-contract testing
- [x] No direct provider SDK or client-key behavior documented or implied
