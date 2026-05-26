# Workspace Family Inventory — 2026-04-24

Audit-first inventory for Plan-016 Stage 004 (Workspace Family Convergence). Produced before implementation so each part can carry exact `Files > Update` targets instead of wildcard sweeps, per plan conventions.

## Intent vs. Reality

Stage 004 framing assumes four sibling workspace routes (Arc, Act, Chapter, Scene). The shipped architecture is different, and this inventory re-anchors the scope.

- The "Arc workspace" is not yet a real workspace. It lives at [src/routes/projects/[id]/arcs/+page.svelte](../../../../../src/routes/projects/%5Bid%5D/arcs/+page.svelte) and [src/routes/projects/[id]/arcs/[arcId]/+page.svelte](../../../../../src/routes/projects/%5Bid%5D/arcs/%5BarcId%5D/+page.svelte) as a placeholder "future-shell" hero with static roadmap cards.
- The actual Act / Chapter / Scene planning workspace is consolidated at [src/routes/projects/[id]/outline/+page.svelte](../../../../../src/routes/projects/%5Bid%5D/outline/+page.svelte), which routes its inspector content through three clarity panels under `$modules/outliner/components`.
- Scene editing (the "Scene workspace" writing surface) lives at [src/routes/projects/[id]/editor/[sceneId]/+page.svelte](../../../../../src/routes/projects/%5Bid%5D/editor/%5BsceneId%5D/+page.svelte) and belongs to Stage 006 (Editor Surface Correction), not Stage 004.

## Surface Map

| Workspace scope | Route / primary component | Shell markup today | Hero/header today | Inspector today | Notes |
| --- | --- | --- | --- | --- | --- |
| Arc overview | [src/routes/projects/[id]/arcs/+page.svelte](../../../../../src/routes/projects/%5Bid%5D/arcs/+page.svelte) | Local `.future-shell` grid | Local `.future-hero` block | N/A | Placeholder only; no real data yet. |
| Arc detail | [src/routes/projects/[id]/arcs/[arcId]/+page.svelte](../../../../../src/routes/projects/%5Bid%5D/arcs/%5BarcId%5D/+page.svelte) | Local `.future-shell` grid | Local `.future-hero` block | N/A | Placeholder only; no real data yet. |
| Act / Chapter / Scene planning | [src/routes/projects/[id]/outline/+page.svelte](../../../../../src/routes/projects/%5Bid%5D/outline/+page.svelte) | Local `.outline-shell` + `.outline-workspace` grid | Shared `PageHeader` + local `.storyboard-metrics` hero metrics | Three clarity panels (see below) | Real workspace; sidebar is `HierarchyNavigator`. |
| Act inspector content | [src/modules/outliner/components/ActClarityPanel.svelte](../../../../../src/modules/outliner/components/ActClarityPanel.svelte) | Local panel layout inside `SurfacePanel` | N/A | Acts as inspector body | Scope-specific fields plus beats. |
| Chapter inspector content | [src/modules/outliner/components/ChapterClarityPanel.svelte](../../../../../src/modules/outliner/components/ChapterClarityPanel.svelte) | Local panel layout | N/A | Acts as inspector body | Scope-specific fields plus scenes list. |
| Scene inspector content | [src/modules/outliner/components/SceneClarityPanel.svelte](../../../../../src/modules/outliner/components/SceneClarityPanel.svelte) | Local panel layout | N/A | Acts as inspector body | Scope-specific fields plus beats list. |

## Primitive Gaps

Stage 004 assumes these shared primitives exist; they do not.

- **WorkspaceShell**: No `src/lib/components/ui/WorkspaceShell.svelte` present. Both `outline` and `arcs` implement their own shell CSS inline.
- **WorkspaceHero**: No shared workspace hero. `outline` uses `PageHeader` with local `.storyboard-metrics`; `arcs/*` uses a bespoke gradient hero.
- **WorkspaceInspector**: No shared inspector container. Clarity panels compose their own headers, sections, and footers locally.
- **WorkspaceEmptyState**: No shared workspace-level empty state; `outline` inlines `.outline-main-empty` copy.

## Interaction Inventory

- **Selection**: Driven by outliner store (`setSelectedAct`, `setSelectedChapter`, `setSelectedScene`) inside [HierarchyNavigator.svelte](../../../../../src/modules/outliner/components/HierarchyNavigator.svelte).
- **Create-new**: Inline only today — `onAddAct`, `onAddScene`, `onAddBeat` all happen in-place via the navigator or clarity panels. No drawers or modals.
- **Edit**: Inline editing within clarity panels, persisted via `updateAct / updateChapter / updateScene`.
- **Focus / hover / active / disabled**: Each surface sets its own focus ring and hover styles via tokens; no shared interaction contract.

## Re-scoped Stage 004 Intent

Based on this audit, Stage 004 parts should target the real surfaces:

- **Phase 001 — Workspace Shell Parity**: Promote a canonical `WorkspaceShell` and a canonical workspace `Hero` (with metrics slot). Migrate `outline` and both `arcs` routes onto the shell. The Scene editing surface is explicitly out of scope (Stage 006).
- **Phase 002 — Inspector Parity**: Promote a canonical `WorkspaceInspector` (header, sections, metadata row, action footer) and migrate `ActClarityPanel`, `ChapterClarityPanel`, and `SceneClarityPanel` onto it while keeping their scope-specific fields as slotted content.
- **Phase 003 — Interaction Parity**: Document the inline-only create/edit decision in canonical rules and converge selection, hover, active, disabled, and focus treatments across the three clarity panels and the outline sidebar.

## Next Actions

1. Mark Stage 004 and its three phases `in-progress`.
2. Rewrite the three `part.md` files with the file-specific scope derived above.
3. Execute Phase 001 first (shell + hero), then Phase 002 (inspector), then Phase 003 (interactions), with gate passes after each part.
