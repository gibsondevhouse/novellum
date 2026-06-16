# Review Card Copy Cleanup Evidence

Date: 2026-06-15

## Implementation Evidence

- `NovaOutlineDraftCheckpointCard.svelte` now displays generated time through `formatArtifactTimestamp()`.
- Context hash, prompt version, and schema version moved behind `Advanced details`.
- Schema mismatch copy is reviewer-safe: `This proposal uses an older outline format. Review carefully before accepting.`
- `NovaAuthorDraftCheckpointCard.svelte` uses `formatSceneDisplayLabel()` so default metadata avoids full scene UUID display.
- The author draft checkpoint card renamed `Sidecar` to `Author notes` and `Used canon refs` to `Referenced canon`.

## Verification

- `tests/nova/nova-review-card-copy.test.ts` covers source-level copy contracts.
- `tests/nova/NovaOutlineDraftCheckpointCard.test.ts` still covers hierarchy, source context, and lifecycle variants.
- Final targeted Vitest run: 276 files / 1941 tests passed.

## Review Boundary

This part is ready for Reviewer Agent evaluation. It is not complete until reviewer sign-off is real.
