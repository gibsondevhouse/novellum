# Page Header Migration Evidence (2026-04-24)

## Scope

Introduced a canonical top-level page-header primitive and migrated representative routes with known header drift.

## Canonical primitive introduced

- New component: `src/lib/components/ui/PageHeader.svelte`
- Exported via: `src/lib/components/ui/index.ts`

Primitive capabilities:

- `eyebrow`, `title`, `description` content contract.
- `actions` snippet slot for CTA controls.
- `meta` snippet slot for summary/auxiliary cards.

## Route migrations completed

- `src/routes/stories/+page.svelte`
- `src/routes/images/+page.svelte`
- `src/routes/settings/+page.svelte`
- `src/routes/settings/migrate/+page.svelte`

Each route removed local top-level header structure and now renders `PageHeader`.

## Adoption query

Command:

```sh
grep -RE "PageHeader" -n src/routes | head -n 120
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
src/routes/stories/+page.svelte:9:      import { SurfacePanel, SectionHeader, PrimaryButton, GhostButton, Input, PageHeader } from '$lib/components/ui/index.js';
src/routes/stories/+page.svelte:40:     <PageHeader
src/routes/stories/+page.svelte:49:     </PageHeader>
```

## Validation

Command results captured after migration:

- `pnpm run check` -> `svelte-check found 0 errors and 0 warnings`
- `pnpm run lint` -> completed without reported ESLint errors
- `pnpm run check:tokens` -> `242 files scanned, 0 violations`

## Status

- Part remains `in-progress` because route-local headers still exist in additional surfaces and screenshot evidence has not yet been captured.
