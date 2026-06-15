# Route Surface Inventory (2026-06-15)

## 1. Route Map

| Path | Workflow | Module | Shell |
| --- | --- | --- | --- |
| `/` | Onboarding/Landing | onboarding | Root |
| `/onboarding` | Onboarding | onboarding | Root |
| `/projects` | Planning | project | Root |
| `/projects/[id]` | Planning/Overview | project | Project |
| `/projects/[id]/editor` | Authoring | editor | Project -> Editor |
| `/projects/[id]/editor/[sceneId]` | Authoring | editor | Project -> Editor |
| `/projects/[id]/outline` | Planning | outline | Project |
| `/projects/[id]/world-building` | Worldbuilding | world-building | Project |
| `/projects/[id]/world-building/[category]`| Worldbuilding | world-building | Project |
| `/projects/[id]/continuity` | Reviewing | continuity | Project |
| `/projects/[id]/story-bible` | Reviewing | story-bible | Project |
| `/settings` | Admin | settings | Root |
| `/books` | Reviewing/Reading | reader | Root |
| `/stories` | Reviewing/Reading | reader | Root |
| `/images` | Reviewing/Assets | assets | Root |
| `/styles` | Admin | styles | Root |

## 2. Shell & Navigation Hierarchy

### Root Shell (`AppShell.svelte`)
- **AppHeader**: Breadcrumbs, Model Selector, Global Actions.
- **AppSidebar**:
  - Global Nav (Home, Search, Settings).
  - Active Project Section (Pinned links to Editor, Outline, WB).
  - Footer Links (Docs, Privacy, etc.).

### Project Shell (`src/routes/projects/[id]/+layout.svelte`)
- Shared project context provider.
- Handles Project-level modals (Edit, Delete, Export).
- Layout for all project-nested routes.

### Editor Shell (`EditorShell.svelte`)
- Grid layout with Navigator (left), Editor (center), and Compass (right).
- Mode-specific views (Planning, Writing, Revision).
- Integrated Nova triggers.

### Nova Panel (`NovaPanel.svelte`)
- Global right-anchored panel for AI interactions.
- Context-aware based on active route/scene.

## 3. Review Gate Surfaces (Mutation Review)

| Component | Workflow | Responsibility |
| --- | --- | --- |
| `NovaAuthorDraftCheckpointCard.svelte` | Authoring | Review and apply generated prose. |
| `NovaOutlineDraftCheckpointCard.svelte` | Planning | Review and apply generated outline structure. |
| `WorldbuildingProposalCard.svelte` | Worldbuilding | Review and apply generated entities/lore. |
| `NovaRevisionPackCard.svelte` | Authoring | Review line edits or stylistic revisions. |
| `WorldbuildingProposalDiffView.svelte` | Worldbuilding | Side-by-side diff for worldbuilding changes. |

## 4. Pattern Observations (Candidates for Unification)

### Empty States
- **Status**: Fragmented.
- **Examples**: `EmptyCharacterState.svelte`, `EmptyFactionState.svelte`, `LandmarkEmptyState.svelte`, etc.
- **Candidate**: `EmptyStatePanel.svelte` (UI Primitive).

### Detail Headers
- **Status**: Multiple variants.
- **Examples**: `CharacterDetailHeader.svelte`, `FactionDetailHeader.svelte`, `EntityDetailHeader.svelte` (UI).
- **Candidate**: Consolidate onto `EntityDetailHeader` or a single `SurfaceHeader` pattern.

### Proposal/Checkpoint Cards
- **Status**: Similar logic (Accept/Reject/Diff) but different visual implementations between Nova cards and Worldbuilding cards.
- **Candidate**: Standardize on a "ReviewGateCard" or "CheckpointCard" primitive.

### Workspace Shells
- **Status**: `IndividualsWorkspaceShell.svelte` vs `WorkspaceShell.svelte` (UI).
- **Candidate**: Use `WorkspaceShell` for all module hubs.

## 5. Source Reference Summary

- **Routes**: `src/routes/`
- **Shells**: `src/lib/components/AppShell.svelte`, `src/routes/projects/[id]/+layout.svelte`, `src/modules/editor/components/EditorShell.svelte`
- **Nova Components**: `src/modules/nova/components/`
- **World-Building Components**: `src/modules/world-building/components/`
- **UI Primitives**: `src/lib/components/ui/`
