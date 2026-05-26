# Composite Patterns Inventory - 2026-04-24

## Focus Composite: SectionHeader

Decision policy for this phase:

- Promote shared primitive when the pattern appears in multiple module components with equivalent structure.
- Keep module-local only when the pattern is single-use or encodes domain-specific semantics that cannot be represented by shared props/snippets.

## Composite Decision Register

- `SectionHeader`: **Promote shared primitive**. Converged all known `src/modules/**/*.svelte` consumers in this part.
- `Metadata Row`: **Intentional module-local** in current modules. Existing usages are context-coupled and do not yet share a stable API surface.
- `Entity Card`: **Intentional module-local** in current modules. Variants remain archetype-specific and would overfit a shared primitive today.
- `Stat Card`: **Intentional module-local** in current modules. Current usage remains sparse and domain-tuned.
- `List Row`: **Intentional module-local** in current modules. Rows are heavily tied to domain semantics and selection behaviors.
- `Inspector Panel`: **Intentional module-local (deferred)**. Out of scope for this part; covered by Stage 004 inspector shell contract work.
- `Workspace Hero Card`: **Intentional module-local (deferred)**. Out of scope for this part; covered by Stage 004 workspace shell/layout work.

Initial inventory snapshot (`class="section-header"` in `src/modules/**/*.svelte`):

- `src/modules/bible/components/ContinuityPanel.svelte`
- `src/modules/bible/components/LineageMembersPanel.svelte`
- `src/modules/bible/components/FactionMembersPanel.svelte`
- `src/modules/bible/components/CharacterCorePanel.svelte`
- `src/modules/bible/components/RelationshipPanel.svelte`
- `src/modules/bible/components/RealmForm.svelte`
- `src/modules/bible/components/LineageRelationshipPanel.svelte`
- `src/modules/bible/components/FactionRelationshipPanel.svelte`
- `src/modules/bible/components/LineageStoryFunctionPanel.svelte`
- `src/modules/bible/components/VoicePanel.svelte`
- `src/modules/bible/components/LandmarkForm.svelte`
- `src/modules/bible/components/LineageContinuityPanel.svelte`
- `src/modules/bible/components/StoryFunctionPanel.svelte`
- `src/modules/bible/components/FactionCoreIdentityPanel.svelte`
- `src/modules/bible/components/LineageCoreIdentityPanel.svelte`
- `src/modules/bible/components/FactionCulturePanel.svelte`
- `src/modules/bible/components/FactionStoryFunctionPanel.svelte`
- `src/modules/bible/components/FactionContinuityPanel.svelte`
- `src/modules/bible/components/LineageInheritanceCulturePanel.svelte`
- `src/modules/bible/components/FactionCurrentStatePanel.svelte`
- `src/modules/bible/components/LineageCurrentStatePanel.svelte`
- `src/modules/bible/components/NarrativeStatePanel.svelte`
- `src/modules/project/components/ProjectCreateCard.svelte`

## Batch 1 Implemented

- `src/modules/bible/components/CharacterCorePanel.svelte`
- `src/modules/bible/components/NarrativeStatePanel.svelte`

Changes in batch 1:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 1):

- `pnpm exec eslint src/modules/bible/components/CharacterCorePanel.svelte src/modules/bible/components/NarrativeStatePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 2 Implemented

- `src/modules/bible/components/ContinuityPanel.svelte`
- `src/modules/bible/components/VoicePanel.svelte`

Changes in batch 2:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batches 1 + 2):

- `pnpm exec eslint src/modules/bible/components/CharacterCorePanel.svelte src/modules/bible/components/NarrativeStatePanel.svelte src/modules/bible/components/ContinuityPanel.svelte src/modules/bible/components/VoicePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 3 Implemented

- `src/modules/bible/components/StoryFunctionPanel.svelte`
- `src/modules/bible/components/RelationshipPanel.svelte`

Changes in batch 3:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 3):

- `pnpm exec eslint src/modules/bible/components/StoryFunctionPanel.svelte src/modules/bible/components/RelationshipPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 4 Implemented

- `src/modules/bible/components/FactionCoreIdentityPanel.svelte`
- `src/modules/bible/components/LineageRelationshipPanel.svelte`

Changes in batch 4:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 4):

- `pnpm exec eslint src/modules/bible/components/FactionCoreIdentityPanel.svelte src/modules/bible/components/LineageRelationshipPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 5 Implemented

- `src/modules/bible/components/FactionCulturePanel.svelte`
- `src/modules/bible/components/LineageCoreIdentityPanel.svelte`

Changes in batch 5:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 5):

- `pnpm exec eslint src/modules/bible/components/FactionCulturePanel.svelte src/modules/bible/components/LineageCoreIdentityPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 6 Implemented

- `src/modules/bible/components/FactionContinuityPanel.svelte`
- `src/modules/bible/components/LineageContinuityPanel.svelte`

Changes in batch 6:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 6):

- `pnpm exec eslint src/modules/bible/components/FactionContinuityPanel.svelte src/modules/bible/components/LineageContinuityPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 7 Implemented

- `src/modules/bible/components/FactionCurrentStatePanel.svelte`
- `src/modules/bible/components/LineageCurrentStatePanel.svelte`

Changes in batch 7:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 7):

- `pnpm exec eslint src/modules/bible/components/FactionCurrentStatePanel.svelte src/modules/bible/components/LineageCurrentStatePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 8 Implemented

- `src/modules/bible/components/FactionMembersPanel.svelte`
- `src/modules/bible/components/LineageMembersPanel.svelte`

Changes in batch 8:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 8):

- `pnpm exec eslint src/modules/bible/components/FactionMembersPanel.svelte src/modules/bible/components/LineageMembersPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 9 Implemented

- `src/modules/bible/components/FactionStoryFunctionPanel.svelte`
- `src/modules/bible/components/LineageStoryFunctionPanel.svelte`

Changes in batch 9:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 9):

- `pnpm exec eslint src/modules/bible/components/FactionStoryFunctionPanel.svelte src/modules/bible/components/LineageStoryFunctionPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 10 Implemented

- `src/modules/bible/components/FactionRelationshipPanel.svelte`
- `src/modules/bible/components/LineageInheritanceCulturePanel.svelte`

Changes in batch 10:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippet.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 10):

- `pnpm exec eslint src/modules/bible/components/FactionRelationshipPanel.svelte src/modules/bible/components/LineageInheritanceCulturePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 11 Implemented

- `src/modules/bible/components/RealmForm.svelte`
- `src/modules/bible/components/LandmarkForm.svelte`

Changes in batch 11:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved collapse controls by rendering existing `GhostButton` controls via `actions` snippets.
- Preserved small uppercase dossier heading styling via scoped title overrides.

Validation snapshot (batch 11):

- `pnpm exec eslint src/modules/bible/components/RealmForm.svelte src/modules/bible/components/LandmarkForm.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 12 Implemented

- `src/modules/project/components/ProjectCreateCard.svelte`

Changes in batch 12:

- Replaced local section header wrappers with shared `SectionHeader` primitive.
- Preserved modal card's compact section-heading rhythm via scoped `create-section-header` overrides.

Validation snapshot (batch 12):

- `pnpm exec eslint src/modules/project/components/ProjectCreateCard.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)
- `grep class="section-header" src/modules/**/*.svelte` → no matches ✅

## Next Batch Proposal

- No remaining `class="section-header"` consumers in `src/modules/**/*.svelte`.

Reasoning:

- The initial composite inventory target for `SectionHeader` convergence is now exhausted.
- Next step is part-level completion workflow after reviewer sign-off.
