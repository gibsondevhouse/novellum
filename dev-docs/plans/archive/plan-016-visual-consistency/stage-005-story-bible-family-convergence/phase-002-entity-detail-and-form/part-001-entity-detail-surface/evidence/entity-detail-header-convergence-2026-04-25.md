# Stage 005 Phase 002 Part 001 — Entity Detail Surface Convergence

**Captured:** 2026-04-25 19:55 EDT
**Auditor / Implementer:** Stylist Agent

## Outcome

Promoted two new shared primitives and migrated all six entity detail headers to consume them.

### New Primitives

- [src/lib/components/ui/EntityDetailHeader.svelte](../../../../../../../src/lib/components/ui/EntityDetailHeader.svelte) —
  canonical detail-header layout. Owns the 220–260px / 1fr grid, identity / attributes
  rhythm, and shared CSS for `.dossier-eyebrow`, `.entity-name`, `.entity-role`,
  `.entity-summary`, `.role-row`, `.role-separator`, `.identity-tags`, `.attribute-item`,
  `.attribute-label`, `.attribute-value`, `.input-inline`. Exposes `media`, `identity`,
  and `attributes` snippets, plus `attributesColumns` (2 | 3) and `ariaLabel`.
- [src/lib/components/ui/EntityHeaderPhoto.svelte](../../../../../../../src/lib/components/ui/EntityHeaderPhoto.svelte) —
  shared photo placeholder + upload affordance. Single source of truth for
  `.photo-placeholder`, `.photo-image`, `.upload-photo-btn`, with `placeholderLabel`,
  `uploadLabel`, `uploadDisabled`, and `onUpload` props.

### Migrations (six headers)

| Component                    | Before (LOC) | After (LOC) | Reduction |
| ---------------------------- | ------------ | ----------- | --------- |
| `FactionDetailHeader`        | 228          | 123         | -46%      |
| `LineageDetailHeader`        | 93           | 111         | -19% (CSS removed; stayed thin) |
| `CharacterDetailHeader`      | 347          | 152         | -56%      |
| `RealmDetailHeader`          | 297          | 72          | -76%      |
| `LandmarkDetailHeader`       | 289          | 72          | -75%      |
| `LoreEntryDetailHeader`      | 246          | 102         | -59%      |
| **Total**                    | **1500**     | **632**     | **-58%**  |

### Visual Parity

- All six headers now share one grid, one breakpoint contract, one set of identity /
  attribute typography, one input-inline treatment, and one photo upload affordance
  (with optional disabled state).
- Entity-specific class names (`.character-header`, `.faction-header`, `.lineage-header`,
  `.lore-header`) removed; the canonical `.entity-detail-header` is the single owner.
- `LoreEntryDetailHeader` keeps a small local `.lore-type-badge` style for its
  badge variant (instead of a photo). This is the only intentional deviation
  and is scoped tightly to a single component.

### Public API Preserved

Each entity-specific header file retains its existing prop signature, so no route or
parent component changes are required:

- `<FactionDetailHeader faction onFieldChange onPhotoUpload />`
- `<LineageDetailHeader lineage onFieldChange onPhotoUpload />`
- `<CharacterDetailHeader character onFieldChange onPhotoUpload />`
- `<RealmDetailHeader realm photoUrl onPhotoUpload uploadDisabled />`
- `<LandmarkDetailHeader landmark photoUrl onPhotoUpload uploadDisabled />`
- `<LoreEntryDetailHeader entry formatMeta />`

### Gates

- eslint on the eight touched files (2 new primitives + 6 migrated headers): clean.
- `pnpm run check`: 0 errors / 0 warnings.
- `pnpm run check:tokens`: 247 files / 0 violations (was 245 before; +2 new primitives).
- `pnpm test --run`: 39 files / 261 tests passing.

## Carry-forward

Part 002 (Entity Form Surface) is **not** included in this part. Form convergence
spans 11 components / ~3,116 LoC with materially different internal layout primitives
(some use the `Input` primitive, others use raw `.field` / `.input` / `.label`
markup) and bespoke validation. That work is queued for the next implementation
window with a concrete plan in the Part 002 part.md.
