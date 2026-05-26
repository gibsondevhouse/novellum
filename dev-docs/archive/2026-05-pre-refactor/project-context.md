# Project Context Guide

This document is a complete guide to the files and systems involved in the active project system in Novellum. It covers route-based project resolution, core project module structure, database schemas, and user interfaces mapping a project's data.

## 1. Active Project State

Novellum uses the URL to determine the active project, preventing issues with global state mismatch when a user navigates or opens multiple tabs.

- **`src/lib/stores/active-project.svelte.ts`**
  This store derives the active project ID purely from SvelteKit's `$app/state`. It exports a helper function `getActiveProjectId()` which retrieves `page.params.id`. Since it reads reactively from the URL, `id` stays perfectly synced with the URL state.

- **`src/modules/project/stores/project-hub.svelte.ts`**
  Handles localized or page-specific state for the Project Hub view (e.g., displaying project overview dashboards, fetching structural metrics).

## 2. Database Schema (Project Entity & Relationships)

Projects form the root of the data hierarchy. Almost all core content entities require a `projectId` foreign key, ensuring strong multi-tenant scoping within the local database.

Found in **`src/lib/server/db/schema.ts`**:

- **Core Project Table**: `projects` (Fields: `id`, `title`, `coverUrl`, `genre`, `logline`, `synopsis`, `targetWordCount`, `status`, `createdAt`, `updatedAt`)
- **Direct Children**:
  - `chapters`, `scenes` (with indirect child `beats`)
  - `characters`, `locations`, `lore_entries`
  - `plot_threads`, `timeline_events`
  - `consistency_issues`, `export_settings`
  - `scene_snapshots`, `story_frames`, `acts`, `arcs`

All relationships enforce `projectId` bounds, which are highly indexed for fast retrieval (`idx_[table]_projectId`).

## 3. Project Business Logic & Services

The heavy lifting of data queries and operations is stored in the `project` module's services:

- **`src/modules/project/services/project-repository.ts`**
  Manages fetching, updating, and saving `projects` metadata. Interfaces with SQLite to perform CRUD operations on the `projects` table.
- **`src/modules/project/services/chapter-repository.ts`**
  Handles chapter data associated with a project.
- **`src/modules/project/services/hub-metrics-service.ts`**
  Calculates project-wide statistics and metrics, such as word counts across chapters, overall progress against `targetWordCount`, and structural highlights for dashboards.

## 4. UI Components

The project module defines components for displaying and editing project properties at various levels, mostly located in **`src/modules/project/components/`**:

- **Card / Library Views**:
  - `LibraryHeroCard.svelte`, `LibraryHeroCardSkeleton.svelte`
  - `ProjectCard.svelte`, `ProjectCardSkeleton.svelte`
  - `ProjectCreateCard.svelte`
- **Forms & Dialogs**:
  - `CreateProjectForm.svelte`, `EditProjectForm.svelte`
  - `DeleteProjectDialog.svelte`
- **Fields Sections**:
  - UI splits editing into logical segments: `ProjectCoreFields.svelte`, `ProjectStoryFields.svelte`, `ProjectAdvancedFields.svelte`.
- **Hero & Hub Displays**:
  - `ProjectHubHero.svelte`, `ProjectHeroContent.svelte`, `ProjectHeroCover.svelte`, `ProjectHeroSynopsis.svelte`
  - `StructuralMetricCard.svelte`, `StructuralMetricsCarousel.svelte`

## 5. Routing

The application utilizes SvelteKit filesystem routing to organize pages around a chosen project.

Located at **`src/routes/projects/[id]/`**:

- **`+layout.svelte` / `+layout.ts`**: Provides the structural shell for an open project. Fetches project data via project API/repository ensuring nested routes have access to project metadata.
- **`+page.svelte` / `+page.ts`**: Defaults navigation or redirects to the dashboard home of the project.
- **Feature Sub-routes** (shipped):
  - `/hub` — Project Hub dashboard
  - `/outline` — Outline surface
  - `/arcs` — Arc-level planning
  - `/world-building` — Personae / Atlas / Archive / Threads / Chronicles
  - `/bible` — Story bible entry point
  - `/consistency` — Consistency analysis pass
  - `/continuity` — Continuity UI
  - `/editor` — Manuscript writer

## Summary

The Novellum project system is deeply centralized yet modular: Data strictly adheres to `projectId` foreign keys, UI interactions are scoped down via standard modules (`src/modules/project`), routing explicitly reflects project identity (`/projects/[id]`), and the active state inherently matches the URL path (`active-project.svelte.ts`).
