# Nova Artifact Action Inventory

Date: 2026-06-15
Part: `part-001-inventory-nova-artifact-actions`

## Source Inventory

| Surface | Source ownership | Visible actions | Current behavior | Durability | Mutation / review risk |
| --- | --- | --- | --- | --- | --- |
| Inline author scene draft card | `src/modules/nova/components/NovaMessageLog.svelte:97`, `src/modules/nova/components/NovaSceneDraftCard.svelte:14` | Accept, Reject, Copy | `NovaMessageLog` renders `<NovaSceneDraftCard envelope={...} />` without `onAccept` or `onReject`. The card sets local `acted = 'accepted' | 'rejected'` and optionally emits callbacks, but no parent receives them. Copy writes draft prose to the clipboard when available. | Accept/Reject are local-only and lost on navigation/reload. Copy is local utility only. | High. Accept/Reject look like review decisions but do not create or transition a durable review artifact. They do not mutate manuscript content, which is correct, but the UI implies a decision happened. |
| Inline author revision pack card | `src/modules/nova/components/NovaMessageLog.svelte:102`, `src/modules/nova/components/NovaRevisionPackCard.svelte:16` | Per-issue Acknowledge, Copy JSON | `NovaMessageLog` renders `<NovaRevisionPackCard envelope={...} />` without `onAcknowledge`. Each acknowledgement updates a local `acknowledged` map and optionally emits a callback. Copy writes the full payload JSON to clipboard. | Acknowledge is local-only and lost on navigation/reload. Copy is local utility only. | Medium. Acknowledgement is non-mutating, but the visible state should be durable because it represents author review progress. |
| Legacy author outline card | `src/modules/nova/components/NovaMessageLog.svelte:98`, `src/modules/nova/components/NovaOutlineCard.svelte:25` | Copy Technical JSON | The card is intentionally read-only and tells the author to use checkpoint proposals for acceptance. Copy writes the legacy payload JSON to clipboard. | Local utility only. | Low. It avoids mutation claims, but copy says "Technical JSON" and the card exposes lifecycle/internal terms that stage 003 should polish. |
| Persisted author draft checkpoint card | `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte:136`, `src/modules/nova/services/author-draft-api.ts:110` | Accept, Reject, Regenerate | Accept calls `/api/author-draft/checkpoints/:id/accept`, refreshes the scene after server validation, and dispatches `scene-content-applied`. Reject calls `/api/author-draft/checkpoints/:id/reject` with a required reason. Existing content, dirty editor state, and stale targets require explicit confirmation or server-side conflict handling. | Durable review-gated decisions via author draft checkpoint persistence. | Accept is a manuscript mutation, but it already goes through the review-gated endpoint and editor safeguards. This is the preferred destination for inline scene draft actions. |
| Persisted outline checkpoint card | `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte:166`, `src/modules/nova/services/outline-checkpoint-actions.ts:166` | Accept, Reject, Review | Accept posts to `/api/outline/checkpoints/:id/accept` with expected version/update metadata. Reject and review update project metadata through the scoped pipeline metadata endpoint. | Durable review-gated decisions via outline checkpoint persistence. | Safe reference path for outline materialization. Inline legacy outline artifacts should remain read-only unless converted into checkpoint proposals. |

## Current Callback Gaps

- `NovaSceneDraftCard` declares `onAccept` and `onReject` props and emits them after immediately marking local `acted` state. No current caller supplies those props from the message log.
- `NovaRevisionPackCard` declares `onAcknowledge` and emits it after immediately marking local acknowledgement state. No current caller supplies that prop from the message log.
- `NovaMessageLog` only passes `projectId` to the legacy outline card. It has no action-prop contract for inline artifacts.
- Inline author artifacts come from `runAuthorPipelineTask()` and are attached to the Nova session message as parsed `PipelineArtifactEnvelope` data. They are not automatically staged into checkpoint persistence.

## Classification

| Action | Classification | Current state | Required path |
| --- | --- | --- | --- |
| Scene draft Accept | Review decision that can lead to manuscript mutation only after checkpoint review | Unwired local-only decision | Persist the inline draft as an author draft checkpoint, then require explicit checkpoint acceptance with existing stale/dirty safeguards. |
| Scene draft Reject | Review decision on draft proposal | Unwired local-only decision | Persist or locate the corresponding checkpoint, then transition it rejected with a durable reason/note. |
| Scene draft Copy | Local utility | Local clipboard effect | Keep local; show failure only if needed for accessibility. |
| Revision issue Acknowledge | Non-mutating acknowledgement / review note | Unwired local-only decision | Persist per-artifact issue acknowledgement under project-scoped metadata. Do not route through manuscript or canon mutation endpoints. |
| Revision pack Copy JSON | Local utility | Local clipboard effect | Keep local, but stage 003 should rename/hide technical wording for author-facing polish. |
| Legacy outline Copy JSON | Local utility | Local clipboard effect | Keep local; legacy card stays read-only until a separate checkpoint conversion path exists. |

## Recommended Helper APIs

- Add a small `src/modules/nova/services/artifact-action-types.ts` contract before wiring UI handlers. It should distinguish review decisions, non-mutating acknowledgements, and local utilities, and carry user-safe success/failure states.
- Add a scene-draft bridge service in stage 002 that can convert an inline `author-scene-draft` envelope into a persisted review artifact or return an `insufficient-context` result when the envelope lacks safe target context.
- Add a revision acknowledgement persistence service in stage 002 backed by project metadata. The persisted state should key by project id, artifact identity, and issue id.
- Keep optional controller audit metadata additive. Do not import plan-051 controller server modules from client code; if audit vocabulary is reused, keep it as serializable metadata.

## Edge Cases

- Legacy Nova session messages may contain inline artifacts with no project id or no reliable active scene id. Those must return a user-safe insufficient-context state rather than pretending Accept or Reject was durable.
- Scene draft envelopes may have sidecar `sceneId`, but checkpoint acceptance still must use server-side stale-target checks and editor dirty-state confirmation.
- Revision issue ids are model-produced; acknowledgement persistence should tolerate repeated ids by scoping to the artifact identity and issue id together.
- Clipboard actions can fail under browser permissions. They remain local utilities and should not be conflated with review decisions.

## Verification

- Source inspection covered:
  - `src/modules/nova/components/NovaMessageLog.svelte`
  - `src/modules/nova/components/NovaSceneDraftCard.svelte`
  - `src/modules/nova/components/NovaRevisionPackCard.svelte`
  - `src/modules/nova/components/NovaOutlineCard.svelte`
  - `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
  - `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
  - `src/modules/nova/services/author-draft-api.ts`
  - `src/modules/nova/services/outline-checkpoint-actions.ts`

No runtime behavior was changed for this inventory part.
