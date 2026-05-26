# Frontend Context

Architecture decisions, navigation rules, and data flow documentation for the Novellum frontend.

## Navigation Boundary Rule (enforced)

The global sidebar (`AppSidebar`) handles only surface-level navigation. It contains:

- **GLOBAL items:** Home, Nova, Images, Styles
- **PROJECTS items:** Books, Stories
- **ACTIVE PROJECT items:** Hub, Workspace, World Building, Continuity, Outline, Editor

Scene-to-scene navigation, chapter lists, entity detail navigation, and any in-surface sub-navigation are managed within the surface's own content area.

No surface-specific sub-items (scenes, chapters, entities, beat cards) are ever added to `AppSidebar` or `ActiveProjectSection`.

## Workspace Data Flow

- **Workspace → Editor:** Clicking a scene in `HierarchyNavigator` navigates to `/projects/[id]/editor/[sceneId]`. The scene ID is passed as a URL param; the Editor loads the full scene from Dexie.
- **Workspace → Outline (future):** The act/chapter/scene hierarchy in workspace Dexie tables is the source for the future compiled Outline surface. No implementation yet.
- **World Building → Workspace:** Entity names and lore from World Building tables are available as reference context in Workspace (future concern; documented for intent).

## Editor Data Flow

- **Editor landing:** `/projects/[id]/editor` loads all scenes for the project; user selects a scene from the left panel list. Scene content is loaded and edited in the center panel.
- **Editor scene view:** `/projects/[id]/editor/[sceneId]` loads a single scene with full Tiptap-based `DocumentEditorFrame`.
- Scene navigation within the Editor is the responsibility of the Editor content area — not the global sidebar.

## Outline Workspace Interaction Model

- **Create/edit affordance**: Inline only. No modals or drawers for creating or editing acts, chapters, or scenes. New rows are added in-place via the `+ Add` affordances on `HierarchyNavigator`, `ActGroup`, and `ChapterGroup`. Rename happens by clicking the title and editing in place.
- **Selection contract**: Selection state is owned by `$modules/outliner/stores/outliner.svelte.js` (`setSelectedAct`, `setSelectedChapter`, `setSelectedScene`). The clarity panel rendered in the outline main area reflects the deepest active selection (Scene → Chapter → Act → empty state).
- **Visual taxonomy**: Chapter selection uses `--color-teal`; scene selection uses `--color-nova-blue`. Acts are not "selected" with an accent — they expand/collapse instead.
- **Hover / focus parity**: Sidebar buttons all use `var(--focus-ring)` for focus and `5% --color-text-primary` mix for hover. Divergences must be deliberate and documented.
