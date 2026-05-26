# Page Header Migration Wave 2 (2026-04-24)

## Summary

Expanded canonical `PageHeader` adoption into additional top-level routes with pronounced header drift.

## Routes migrated in this wave

- `src/routes/projects/+page.svelte`
- `src/routes/styles/+page.svelte`

## Migration notes

- Replaced route-local top-level heading blocks with `PageHeader`.
- Preserved route identity by keeping local hero/surface wrappers and moving controls/summary into `actions` and `meta` slots.
- Removed obsolete route-local heading CSS selectors no longer used after migration.

## Adoption snapshot

Command:

```sh
grep -RE "PageHeader" -n src/routes | head -n 200
```

Output:

```text
src/routes/settings/+page.svelte:3:     import { PageHeader } from '$lib/components/ui/index.js';
src/routes/settings/+page.svelte:11:    <PageHeader
src/routes/settings/+page.svelte:28:    </PageHeader>
src/routes/settings/migrate/+page.svelte:5:     import { PrimaryButton, SecondaryButton, PageHeader } from '$lib/components/ui/index.js';
src/routes/settings/migrate/+page.svelte:75:    <PageHeader
src/routes/settings/migrate/+page.svelte:92:    </PageHeader>
src/routes/images/+page.svelte:3:       import { PageHeader } from '$lib/components/ui/index.js';
src/routes/images/+page.svelte:11:      <PageHeader
src/routes/images/+page.svelte:28:      </PageHeader>
src/routes/projects/+page.svelte:12:        import { SectionHeader, PrimaryButton, GhostButton, Input, EmptyStatePanel, PageHeader } from '$lib/components/ui/index.js';
src/routes/projects/+page.svelte:53:                <PageHeader
src/routes/projects/+page.svelte:66:                </PageHeader>
src/routes/styles/+page.svelte:7:       import PageHeader from '$lib/components/ui/PageHeader.svelte';
src/routes/styles/+page.svelte:122:     <PageHeader
src/routes/styles/+page.svelte:133:     </PageHeader>
src/routes/stories/+page.svelte:9:      import { SurfacePanel, SectionHeader, PrimaryButton, GhostButton, Input, PageHeader } from '$lib/components/ui/index.js';
src/routes/stories/+page.svelte:40:     <PageHeader
src/routes/stories/+page.svelte:49:     </PageHeader>
```

## Validation

- `pnpm run check` -> 0 errors / 0 warnings
- `pnpm run lint` -> completed without reported errors
- `pnpm run check:tokens` -> 242 files scanned, 0 violations
