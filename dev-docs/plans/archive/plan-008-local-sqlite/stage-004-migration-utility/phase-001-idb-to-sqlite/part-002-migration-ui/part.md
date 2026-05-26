---
title: Migration UI
slug: part-002-migration-ui
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-idb-to-sqlite
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Build the `/settings/migrate` page that guides the user through the one-time IndexedDB → SQLite migration with a pre-check warning, progress display, and completion summary — consistent with the application's visual language.

## Scope

**In scope:**

- SvelteKit route at `src/routes/settings/migrate/+page.svelte`
- Pre-check phase: show per-table Dexie entity counts + SQLite existing row counts
- Conflict warning banner if any SQLite table already has rows
- "Start Migration" primary action (disabled until user confirms understanding if conflict exists)
- Live progress: per-table status (pending / migrating / done / error) with row counts
- Completion summary: total migrated, error count, CTA to return to projects
- Error list: expandable per-entity error details if any errors occurred

**Out of scope:**

- Authentication
- Scheduling or deferred migration
- Email or notification on completion

## Implementation Steps

1. Create `src/routes/settings/` directory if it doesn't exist
2. Create `src/routes/settings/migrate/+page.svelte`
3. On mount: call `MigrationService.preCheck()` to populate pre-check table
4. Render pre-check table: columns = Table Name | Dexie Rows | SQLite Rows | Status
5. If any SQLite table has rows > 0: show warning banner "SQLite already contains data. Starting migration will overwrite existing records."
6. "Start Migration" button: triggers `MigrationService.migrate(callbacks)`
7. Progress: use Svelte `$state` to track per-table status; update via callbacks
8. Completion state: success message with counts; "Go to Projects" link
9. Use shared `ContentFrame` and design tokens — no custom one-off layout
10. Add link to `/settings/migrate` from the app settings area (or `/projects` page utility bar for discoverability during rollout)

## Files

**Create:**

- `src/routes/settings/migrate/+page.svelte`

**Update:**

- Relevant nav/settings entry point to surface the migration link (audit where settings links currently live)

## Acceptance Criteria

- [ ] Page loads without errors at `/settings/migrate`
- [ ] Pre-check table populates with correct counts from both Dexie and SQLite
- [ ] Conflict warning displays when SQLite tables are non-empty
- [ ] Migration runs when "Start Migration" is clicked; progress updates live
- [ ] Completion state shows total rows migrated
- [ ] No regression on existing routes
- [ ] `pnpm check` and `pnpm lint` pass

## Edge Cases

- If Dexie is empty (fresh install, never used): pre-check shows all zeros, "Start Migration" still works (no-op), completion message reflects 0 rows
- If the user navigates away mid-migration: migration continues in background (no cancellation in V1); state is lost but DB is not corrupted
- Long-running migration (many snapshots): progress updates must not freeze the UI — use `async` batching with `await` yields between tables

## Notes

> This page is a utility surface, not a primary workspace. Keep the layout simple and purposeful — information density over decorative composition. Use `ContentFrame` for consistent centering and width constraint.
