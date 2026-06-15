# Route Surface Inventory

> Date: 2026-06-15
> Status: Completed
> Reference: Plan-048 Stage 001 Phase 001 Part 001

## 1. App Shell & Navigation

| Surface | File | Description | Ownership |
| --- | --- | --- | --- |
| Root Layout | `src/routes/+layout.svelte` | Global shell, sidebar, header, Nova panel, onboarding. | Core |
| App Shell | `src/lib/components/AppShell.svelte` | Flex layout with sidebar and content column. | Core |
| App Sidebar | `src/lib/components/AppSidebar.svelte` | Collapsible navigation for primary links and active project. | Core |
| App Header | `src/lib/components/AppHeader.svelte` | Context-aware title, eyebrow, sub-navigation (pills), and global actions. | Core |
| Nova Panel | `src/modules/nova/components/NovaPanel.svelte` | Right-side AI copilot surface. | Nova |
| Project Layout | `src/routes/projects/[id]/+layout.svelte` | Project-specific data loading and context bridging. | Project |

## 2. Workspace Modules

### Editor
- **Routes:** `/projects/[id]/editor`, `/projects/[id]/editor/[sceneId]`
- **Key Components:** `EditorShell.svelte`, `SceneList.svelte`, `SceneEditor.svelte`.
- **Workflow:** Real-time drafting, scene selection via sub-header pills.

### Outline
- **Routes:** `/projects/[id]/outline`
- **Key Components:** `OutlineBoard.svelte`, `ArcCard.svelte`, `ChapterCard.svelte`.
- **Workflow:** Plot visualization and hierarchical organization.

### World Building
- **Routes:** `/projects/[id]/world-building/*` (nested sub-routes for Characters, Locations, Lore, etc.)
- **Key Components:** `WorldBuildingShell.svelte`, `CharacterList.svelte`, `LoreList.svelte`.
- **Workflow:** Entity management and canon definition.
- **Note:** Uses a dedicated sub-header with `PillNav` in `AppHeader`.

### Continuity
- **Routes:** `/projects/[id]/continuity`
- **Key Components:** `ContinuityScanner.svelte`, `ContinuityReport.svelte`.
- **Workflow:** Automated fact-checking against world-building canon.

### Story Bible
- **Routes:** `/projects/[id]/story-bible`
- **Key Components:** `StoryBibleView.svelte`.
- **Workflow:** High-level project summary and style guide.

## 3. Global Surfaces

### Project Management
- **Routes:** `/projects`, `/stories`
- **Workflow:** Project selection, creation, and deletion.

### Books & Reader
- **Routes:** `/books`, `/books/[id]`
- **Workflow:** Published-style reading experience.

### Images
- **Routes:** `/images`
- **Workflow:** Visual asset management.

### Settings
- **Routes:** `/settings/*` (Appearance, AI, Shortcuts, Backup, etc.)
- **Workflow:** Global application configuration.

### Onboarding
- **Routes:** `/onboarding`
- **Workflow:** Initial setup and guide.

## 4. Pattern Duplication & Conflicts

| Pattern | Examples | Issue |
| --- | --- | --- |
| **Empty States** | Project list, Scene list, Worldbuilding lists | Varied implementation: some use icons, some just text, differing padding. |
| **Status Indicators** | AI run status, Sync status, Save status | Multiple ways of showing "work in progress" (spinners, dots, text). |
| **Review Gates** | Outline checkpoints, Author drafts, Worldbuilding proposals | Different UI card styles and interaction patterns for accept/reject. |
| **Context Switching** | Editor scene select vs. Worldbuilding sub-sections | Both use `PillNav` but managed differently (route params vs. search params). |
| **Modals/Dialogs** | Export dialog, Project creation, Settings modals | Mixed use of full-screen overlays vs. centered dialogs. |

## 5. Shell Responsibilities vs. Module Responsibilities

- **Shell:** Sidebar navigation, global header context, theme toggling, Nova panel lifecycle.
- **Module:** Internal navigation (e.g., worldbuilding sub-tabs), domain-specific actions (e.g., scene save), local state management.

---
*Inventory captured for Plan-048 Stage 001.*
