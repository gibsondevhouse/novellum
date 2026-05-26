---
title: Data Category Migration
slug: stage-006-data-category-migration
stage_number: 6
status: complete
owner: Backend Agent
plan: plan-022-settings-ia
phases:
  - phase-001-inline-migrate-content
  - phase-002-redirect-migrate-route
  - phase-003-tests
estimated_duration: 0.5d
risk_level: low
---

## Goal

Inline the full migration UI (currently at `/settings/migrate`) directly into `src/routes/settings/data/+page.svelte`, replacing the current stub that only links out. Add a 307 redirect at `/settings/migrate` → `/settings/data` for any existing bookmarks or hard-coded `goto` calls. Update all affected tests. **Zero behavior change** to the migration tool itself.

## Context (already in tree — do not duplicate)

- `src/routes/settings/migrate/+page.svelte` — the full, working migration UI. It uses Svelte 5 runes (`$state`, `$derived`) and imports from:
  - `$lib/migration/index.js` — `preCheck`, `migrate`, `isMigrationComplete`, `MIGRATION_COMPLETE_KEY` and related types.
  - `$lib/preferences.js` — `getPreference`.
  - `$lib/components/ui/index.js` — `PrimaryButton`, `SecondaryButton`, `PageHeader`.
  - `./evidence-log.js` — local sibling module `src/routes/settings/migrate/evidence-log.ts`, which exports `buildEvidenceLog` and `evidenceLogFilename`.
- `src/routes/settings/data/+page.svelte` — currently a stub: a `<section>` with a heading "Data Portability", a one-line description, and a link `href="/settings/migrate"`.
- `src/routes/settings/migrate/+page.ts` — **does not exist**. Must be created.
- `tests/routes/settings-migrate.test.ts` — tests the evidence log helpers; imports directly from `../../src/routes/settings/migrate/evidence-log.js`.
- `tests/settings/settings-data-page.test.ts` — currently tests the stub; asserts the link `href="/settings/migrate"` exists. These assertions will be invalid after inlining.
- `tests/settings/settings-layout.test.ts` line 60 — uses `/settings/migrate` as an "unrecognized route" to assert no pill is marked active. After the redirect ships, this test scenario should use a genuinely unrecognized path instead.
- `tests/lib/legacy-dexie-boundaries.test.ts` — lists `routes/settings/migrate/` as an allowed Dexie-import prefix. No change needed; the directory and its files still exist after this stage.
- `src/routes/projects/[id]/+layout.svelte` line 33 — calls `goto('/settings/migrate')`. This call will still work via the redirect, but the canonical URL should be updated to `/settings/data`.

## Exit Criteria

- `/settings/data` renders the full migration UI (phase state machine, table list, Start Migration button, evidence log download) with identical behavior to the former `/settings/migrate` route.
- `GET /settings/migrate` issues a 307 redirect to `/settings/data`. Verified by the new redirect test.
- `src/routes/projects/[id]/+layout.svelte` calls `goto('/settings/data')` (not `/settings/migrate`).
- `tests/settings/settings-data-page.test.ts` verifies the full UI — not the link stub.
- `tests/settings/settings-layout.test.ts` no longer uses `/settings/migrate` as its "unrecognized route" sample; uses `/settings/unknown` instead.
- `tests/routes/settings-migrate.test.ts` continues to pass (evidence-log path unchanged).
- All quality gates green: `pnpm run lint`, `pnpm run check`, `pnpm run test`.

## Phases

### Phase-001 — Inline migrate content

**Goal:** Replace the stub in `src/routes/settings/data/+page.svelte` with the complete migration UI, and update the `evidence-log` import path.

**Files to create/update:**

- **Update** `src/routes/settings/data/+page.svelte`:
  - Replace the entire file content with the Svelte 5 script + markup + styles currently in `src/routes/settings/migrate/+page.svelte`.
  - Change the `<title>` in `<svelte:head>` from "Data — Novellum" to "Data — Novellum" (keep as-is; the layout already sets "Novellum").
  - Update the `evidence-log` import from `./evidence-log.js` → `../migrate/evidence-log.js` (the file stays in its current location; only the importer moves).
  - All other imports (`$lib/migration/…`, `$lib/preferences.js`, `$lib/components/ui/…`) remain unchanged — they use `$lib` aliases that resolve from anywhere in `src/`.
  - The `<PageHeader>` inside the component already supplies its own `eyebrow`, `title`, and `description`. Do **not** add an outer heading — the component is self-contained.
  - All Svelte 5 rune patterns (`$state`, `$derived`, `onMount`) carry over verbatim.
- **Update** `src/routes/settings/migrate/+page.svelte`:
  - Gut the file body to a minimal redirect-notice shell so it is a valid Svelte component while `+page.ts` handles the actual redirect before it renders:

    ```svelte
    <svelte:head>
        <title>Redirecting… — Novellum</title>
    </svelte:head>
    ```

  - Remove all `<script>` content, markup, and `<style>` blocks. The component will never be shown to users (redirect fires first), but SvelteKit requires a sibling `.svelte` for routes that have a `+page.ts`.

**Acceptance checklist:**

- [ ] `src/routes/settings/data/+page.svelte` renders the full migration UI (all phases: loading, precheck, migrating, complete, already-complete, error).
- [ ] No compilation errors (`pnpm run check`).
- [ ] `../migrate/evidence-log.js` import resolves correctly — `buildEvidenceLog` and `evidenceLogFilename` are reachable from the data page.
- [ ] `pnpm run lint` passes (boundaries: the data page is inside `routes/settings/data/`, which is not subject to Dexie-boundary restrictions).

---

### Phase-002 — Redirect migrate route

**Goal:** Install a SvelteKit server-side redirect so any request to `/settings/migrate` is permanently redirected to `/settings/data`. Update the one hard-coded `goto` call in the project layout.

**Files to create/update:**

- **Create** `src/routes/settings/migrate/+page.ts`:

  ```ts
  import { redirect } from '@sveltejs/kit';

  export const load = () => {
      throw redirect(307, '/settings/data');
  };
  ```

  Use 307 (Temporary Redirect) to remain consistent with the existing `/settings` → `/settings/appearance` redirect in `src/routes/settings/+page.ts`.

- **Update** `src/routes/projects/[id]/+layout.svelte` line 33:
  - Change `goto('/settings/migrate')` → `goto('/settings/data')`.
  - This is the only remaining `goto` call targeting the old route in `src/`. The redirect would have handled it silently, but updating the source avoids a round-trip and keeps the codebase canonical.

**Acceptance checklist:**

- [ ] `src/routes/settings/migrate/+page.ts` exists and exports a `load` function that throws `redirect(307, '/settings/data')`.
- [ ] `src/routes/projects/[id]/+layout.svelte` references `/settings/data`, not `/settings/migrate`.
- [ ] `grep -r "goto.*settings/migrate" src/` returns zero matches.
- [ ] `pnpm run check` passes with no type errors on the new `+page.ts`.

---

### Phase-003 — Tests

**Goal:** Update existing tests that assert against the old stub or the old URL, and add a new redirect test.

**Files to create/update:**

- **Rewrite** `tests/settings/settings-data-page.test.ts`:
  - Remove the three stub assertions (heading "Data Portability", link `href="/settings/migrate"`, description text about linking out).
  - Replace with assertions that verify the full migration UI:
    - The `<PageHeader>` renders with eyebrow "Data Portability" and title "Migrate Data" (use `getByRole('heading', { name: /Migrate Data/i })` or `querySelector`).
    - On initial mount, `phase` starts as `'loading'` — a loading status message is visible (`Checking databases…`). Mock `isMigrationComplete` and `preCheck` from `$lib/migration/index.js` using `vi.mock`.
    - The `already-complete` phase: mock `isMigrationComplete` to resolve `true`; assert the "Migration already complete." banner renders.
  - Keep `beforeEach` / `afterEach` lifecycle scaffolding.
  - All new tests use Svelte 5 `mount` / `unmount` / `flushSync` (same pattern as the existing file).

- **Update** `tests/settings/settings-layout.test.ts`:
  - Line 60: change `'http://localhost/settings/migrate'` → `'http://localhost/settings/unknown'`.
  - The test intent ("marks no pill active for unrecognized routes") remains correct; only the sample URL changes so it is genuinely unrecognized after the redirect is in place.

- **Create** `tests/settings/settings-migrate-redirect.test.ts` (new):
  - Import the `load` function from `../../src/routes/settings/migrate/+page.ts`.
  - Assert that calling `load()` throws a SvelteKit redirect with status `307` and location `/settings/data`.
  - Use the `redirect` matcher pattern already established in `tests/settings/settings-redirect.test.ts` (the `/settings` → `/settings/appearance` redirect test).

- **No change needed:**
  - `tests/routes/settings-migrate.test.ts` — imports `evidence-log.js` from its original path `src/routes/settings/migrate/evidence-log.ts`, which has not moved. Test remains valid.
  - `tests/lib/legacy-dexie-boundaries.test.ts` — `routes/settings/migrate/` is still an allowed prefix (the directory still exists with `+page.svelte` and `+page.ts`). No update required.

**Acceptance checklist:**

- [ ] `tests/settings/settings-data-page.test.ts` passes with at least 3 assertions covering the full migration UI (loading state, already-complete banner, Migrate Data heading).
- [ ] `tests/settings/settings-migrate-redirect.test.ts` passes; redirect status is 307 and location is `/settings/data`.
- [ ] `tests/settings/settings-layout.test.ts` passes; no references to `/settings/migrate` remain in the file.
- [ ] `tests/routes/settings-migrate.test.ts` continues to pass (evidence-log path unchanged).
- [ ] `pnpm run test` — all suites green.
- [ ] `pnpm run test:coverage` — preferences service and migration service remain ≥ 80% line coverage.

---

## Decision Log

| Decision | Choice | Rationale |
| --- | --- | --- |
| Inline vs. import-component strategy | Inline (copy script + markup + styles verbatim) | `/settings/migrate/+page.svelte` is not a named component — it's a route file. Extracting it into a reusable component is a refactor out of scope for this stage. Direct copy keeps the diff minimal and reviewable. |
| Where `evidence-log.ts` lives | Stay at `src/routes/settings/migrate/evidence-log.ts` | Moving it would break `tests/routes/settings-migrate.test.ts` and require an additional file move. Using a relative `../migrate/evidence-log.js` import from the data page is a minor cost for zero test churn on that file. |
| Redirect status code | 307 (Temporary) | Consistent with the existing `/settings` → `/settings/appearance` redirect. Keeps the pattern uniform; can be upgraded to 301 in a later cleanup stage once the route is stable. |
| `goto` in projects layout | Update to `/settings/data` | Eliminates a round-trip for a known, owned call site. Leaves no `settings/migrate` references in `src/` after this stage. |
| `+page.svelte` at migrate route | Keep as minimal shell | SvelteKit requires a sibling `.svelte` file when a `+page.ts` is present. Shell is one `<svelte:head>` line; redirect fires before the component renders. |

## Out of Scope

- Any behavioral change to the migration tool (preCheck, migrate, evidence log, phase state machine).
- Moving or renaming `evidence-log.ts` — file stays in `src/routes/settings/migrate/`.
- Modifying `src/lib/migration/` internals.
- Visual baseline updates — the migration tool UI is functional/stateful; it does not have a stable resting state suitable for a Playwright screenshot baseline.
- Updating `tests/lib/legacy-dexie-boundaries.test.ts` — the allowed prefix list remains valid.
- Adding new preferences or SQLite schema — this stage is purely a route relocation.
