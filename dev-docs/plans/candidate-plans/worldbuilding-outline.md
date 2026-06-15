# Priority 1 for Worldbuilding + Outline should be these two items:

Proposal review flow for worldbuilding scan looks unwired in the product UI.

- Evidence: proposal state refresh exists but has no callers outside its own store in worldbuild-suggestion-state.svelte.ts:84.
- Evidence: proposal review tile exists in WorldbuildingProposedTile.svelte, but no route references it.
- Evidence: pending-count selectors are only defined in the same store and not consumed by routes (worldbuild-suggestion-state.svelte.ts:135).

Release risk: scan suggestions can be generated in backend/storage but not surfaced for consistent author review.
Worldbuilding Generate UX promises generation-state transitions, but action only opens Nova prompt.
Evidence: domain Generate buttons and status widget are rendered in src/routes/projects/[id]/world-building/+page.svelte and src/routes/projects/[id]/world-building/+page.svelte, same pattern in help route src/routes/projects/[id]/world-building/help/+page.svelte and src/routes/projects/[id]/world-building/help/+page.svelte.
Evidence: generate action is just mode switch + seeded prompt open in Nova (worldbuilding-generate-actions.ts:34, worldbuilding-generate-actions.ts:42, worldbuilding-generate-actions.ts:43, worldbuilding-generate-actions.ts:66).
Evidence: generation state machine exists but transitions are not invoked by routes/actions (worldbuilding-generation-state.svelte.ts:49).
Release risk: user sees status affordances that do not reflect real execution, creating trust mismatch.
After those, highest polish items in Outline:

Outline checkpoint review panel exposes internal runtime metadata and raw payload.
Raw identifiers and internals shown directly: src/routes/projects/[id]/outline/+page.svelte, src/routes/projects/[id]/outline/+page.svelte, src/routes/projects/[id]/outline/+page.svelte, src/routes/projects/[id]/outline/+page.svelte, src/routes/projects/[id]/outline/+page.svelte, src/routes/projects/[id]/outline/+page.svelte.
Full payload dump: src/routes/projects/[id]/outline/+page.svelte, src/routes/projects/[id]/outline/+page.svelte.
Polish need: translate task/pipeline jargon to author-facing labels and gate raw payload behind explicit advanced/debug mode.
Outline queue list also shows raw lifecycle and task keys.
src/routes/projects/[id]/outline/+page.svelte
src/routes/projects/[id]/outline/+page.svelte
Polish need: use readable labels (for example Draft, In Review, Accepted) and task display names.
Worldbuilding character persistence path still logs raw console errors in route.
src/routes/projects/[id]/world-building/characters/individuals/+page.svelte
src/routes/projects/[id]/world-building/characters/individuals/+page.svelte
Polish need: keep user-facing error handling, remove noisy console output in production path or route through structured logger.
