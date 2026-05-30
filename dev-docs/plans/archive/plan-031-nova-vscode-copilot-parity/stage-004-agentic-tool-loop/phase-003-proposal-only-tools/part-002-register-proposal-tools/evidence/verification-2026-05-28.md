# Evidence — Register Proposal Tools

**Date:** 2026-05-28
**Part:** phase-003 / part-002

## What was done

Two proposal tools registered in `agent-tools.ts`:

- `propose.outline` — calls `/api/ai` to generate an outline proposal, returns `ProposalEnvelope { proposalType: 'outline', content }`
- `propose.scene_draft` — calls `/api/ai` to generate a scene draft, returns `ProposalEnvelope { proposalType: 'scene_draft', content }`

Both use `generateProposal(instruction, projectContext, outputType)` which posts to `/api/ai` (existing server-side proxy). Neither tool modifies any store, editor state, or manuscript data. The returned envelope is surfaced as a tool-result chip requiring explicit user action.

## File evidence

- `src/modules/nova/services/agent-tools.ts` — `propose.outline`, `propose.scene_draft`, `generateProposal`

## Source contract confirmation

No editor/manuscript mutation imports present. All 6 source contract tests pass for agent-tools.ts.
