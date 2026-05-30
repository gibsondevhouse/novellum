## 2026-05-30

Created WorldbuildingReadinessBadge.svelte with 'first' | 'dependent' | 'ready' variants. Badge variant is derived at runtime: dependencyIds.length === 0 → 'first'; all deps have records → 'ready'; else 'dependent'. Rendered in the domain tile title row. All styles use --color-brass, --color-success, --color-text-muted design tokens. pnpm check:tokens passes with 0 violations.
