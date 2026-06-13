# Hidden Caller Sweep Evidence

Date: 2026-06-12
Agent: Codex
Plan: plan-046-pipeline-checkpoint-contract-reconciliation
Stage: stage-003-legacy-adapter-or-retirement
Phase: phase-003-hidden-caller-sweep
Part: part-001-hidden-caller-sweep

## Commands

```bash
rg -n "family: ['\"]vibe-worldbuild|family: ['\"]vibe-author|/api/nova/outline/apply|/api/worldbuilding/proposals|acceptProposal\(|rejectProposal\(|operation: ['\"]upsert|outlineDraftCheckpoints\.v1|authorDraftCheckpoints\.v1|vibe-worldbuild-scan" src tests dev-docs/03-ai -g '!tests/visual/**' -g '!**/node_modules/**'
```

```bash
rg -n "family: ['\"]vibe-worldbuild|parserVersion: ['\"]1\.0\.0|PipelineArtifactEnvelope|createPipelineArtifactEnvelope|operation: ['\"]upsert" tests/e2e tests/ai tests/world-building tests/nova -g '!tests/visual/**'
```

## Findings

- Active code callers of `/api/worldbuilding/proposals/{proposalId}/accept` and `/reject` are limited to `worldbuilding-proposal-service.ts`, which now sends project context.
- `WorldbuildingProposalCard.svelte` and `WorldbuildingProposedTile.svelte` now pass `proposal.projectId` through accept/reject callbacks.
- No active source caller invokes `/api/nova/outline/apply`; remaining mentions are docs and explicit retirement tests.
- Remaining `family: "vibe-worldbuild"` matches are task-catalog/type-contract fixtures, not project-metadata checkpoint fixture envelopes.
- E2E checkpoint upserts now use current worldbuild or outline checkpoint contracts.

## Active Doc Correction

`dev-docs/03-ai/worldbuild-generation.md` previously described scan proposal
acceptance as if it were the staged checkpoint accept helper. It now separates:

- staged worldbuild checkpoint accept through generic project metadata with `operation: "accept"`;
- scan proposal accept through `/api/worldbuilding/proposals/{proposalId}/accept` with `{ projectId }`;
- scan proposal reject through `/api/worldbuilding/proposals/{proposalId}/reject` with `{ projectId, reason }`.

## Historical References

Archived plan files and route-retirement tests may continue to mention old
contracts. Those references are historical or explicit failure coverage and do
not represent supported active callers.
