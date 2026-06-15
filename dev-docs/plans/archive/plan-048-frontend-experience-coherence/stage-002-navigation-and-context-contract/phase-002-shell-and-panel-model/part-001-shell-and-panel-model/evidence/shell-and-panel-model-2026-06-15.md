# Shell And Panel Model (2026-06-15)

## Shell Responsibilities

| Layer | Current owner | Responsibility |
| --- | --- | --- |
| Root shell | `src/lib/components/AppShell.svelte` | Skip link, sidebar slot, header slot, main content region, and Nova panel offset padding. |
| Global sidebar | `src/lib/components/AppSidebar.svelte` | Primary navigation, project search, active project shortcuts, settings links, footer links, and collapse state. |
| Header | `src/lib/components/AppHeader.svelte` | Visible route title, project/editor/worldbuilding subnavigation, model selector on `/nova`, project creation, theme toggle, Nova panel toggle, and settings shortcut. |
| Project layout | `src/routes/projects/[id]/+layout.svelte` | Project-scoped modal actions, manuscript export, JSON export, project edit/delete, and last-project persistence. |
| Editor shell | `src/modules/editor/components/EditorShell.svelte` | Drafting grid, scene/chapter selection integration, editor state, autosave, focus mode, version history, and scene-scoped author draft surfaces. |
| Nova panel | `src/modules/nova/components/NovaPanel.svelte` | Fixed project-aware assistant panel, AI key readiness, context disclosure, starter prompts, author draft engine, composer, retry, and responsive resize behavior. |

## Implemented Alignment

- Nova panel route classification now uses `deriveRouteContext` instead of local regex checks.
- Editor, worldbuilding, and chapter-like routes share one subheader offset decision for Nova panel placement.
- Root layout continues to pass the canonical `activeContext` IDs into Nova, so the panel and route stores read from the same visible-route contract.
- Existing panel offset behavior remains intact: desktop content flexes away from the panel; compact viewports keep the panel as an overlay.

## No Broad Refactor Needed

The source audit did not justify replacing `AppShell`, `AppSidebar`, `AppHeader`, project layout, or `EditorShell`. Their responsibilities are already separated well enough for plan-048:

- global navigation stays in the sidebar and header;
- project-scoped modal/export actions stay in the project layout;
- workspace-specific tools stay in module shells;
- Nova remains a right-side assistant panel with explicit context disclosure.

The concrete risk found in this stage was route/context drift, so the code change was scoped to the route context helper and Nova panel route classification.

## Validation

Command:

```text
pnpm exec vitest run tests/lib/navigation-state.test.ts tests/lib/active-context.test.ts tests/nova/nova-panel.test.ts tests/nova/context-disclosure-pill.test.ts
```

Result:

```text
Test Files  4 passed (4)
Tests       30 passed (30)
```

The Nova panel tests continue to cover accessible panel identity, context disclosure tray, resize behavior, shell offset publishing, and compact viewport behavior.
