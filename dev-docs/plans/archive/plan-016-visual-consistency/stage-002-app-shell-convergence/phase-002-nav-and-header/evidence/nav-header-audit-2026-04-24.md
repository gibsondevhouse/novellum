# Navigation & Header Audit (2026-04-24)

## Executive Summary

**Canonical AppShell Status**: ✅ Fully Implemented

- `AppShell.svelte` is the layout wrapper (sidebar + header + content)
- Root layout (`src/routes/+layout.svelte`) correctly uses AppShell
- AppSidebar + AppHeader injected via snippets

**Sidebar Primitive Status**: ✅ Canonical + Consistent

- `AppSidebar.svelte` = single global sidebar
- Uses `SidebarItem` (with active/hover/focus states) + `SidebarSection` (grouping)
- Active state: left border + background + medium font-weight
- Focus-visible: 2px focus ring with `--color-border-focus`
- Hover: background color using `--color-surface-glass`
- **All routes inherit from root shell through AppShell**: ✅ No route-local sidebar duplication

**Page Header Primitive Status**: ⚠️ Partially Adopted

- `PageHeader.svelte` (with eyebrow, title, description, actions, meta)
- `SectionHeader.svelte` (for subsection-level headers)
- **Current adoption**: 14 out of 53 routes use canonical header primitives
- **Gap**: 39 routes lack explicit PageHeader usage or have custom hero sections

## Route-by-Route Header Analysis

### ✅ Collection Routes (Using Canonical PageHeader)

| Route | Pattern | Header Type | Status |
| --- | --- | --- | --- |
| / | Root library collection | PageHeader custom styles | ✓ Adopted |
| /books | Collection library | PageHeader | ✓ Adopted |
| /books/[id] | Reader/export view | PageHeader (styled override) | ✓ Adopted |
| /images | Asset library | PageHeader | ✓ Adopted |
| /projects | Project hub | PageHeader custom styles | ✓ Adopted |
| /stories | Story collection | PageHeader | ✓ Adopted |
| /settings | Settings hub | PageHeader | ✓ Adopted |
| /settings/migrate | Migration utility | PageHeader | ✓ Adopted |
| /styles | Styles editor | PageHeader custom styles | ✓ Adopted |

### 🔄 Workspace Routes (Archetype-Specific Headers)

| Route | Pattern | Current Header | Status | Notes |
| --- | --- | --- | --- | --- |
| /projects/[id]/editor | Writing surface | Custom editor-toolbar header | ⚠️ Semi-canonical | Uses PageHeader internally, custom toolbars for mode switching |
| /projects/[id]/editor/[sceneId] | Scene editor | PageHeader (styled) | ✓ Adopted | Scene title + mode controls |
| /projects/[id]/outline | Planning workspace | Custom storyboard-hero | ❌ Non-canonical | Custom eyebrow/title/copy; should migrate to PageHeader |
| /projects/[id]/continuity | Review surface | ? | ? | Not yet audited |
| /projects/[id]/hub | Project dashboard | ? | ? | Not yet audited |
| /projects/[id]/world-building | Domain chooser | PageHeader (auto-header) | ✓ Adopted | SectionHeader for subsections |
| /projects/[id]/world-building/characters | Characters top section | SectionHeader | ✓ Adopted | Subsection header pattern |
| /projects/[id]/world-building/characters/[charId] | Character detail | PageHeader (wrapped in SurfacePanel) | ✓ Adopted | Breadcrumb + PageHeader pattern |
| /projects/[id]/world-building/\*/[itemId] | Entity detail pages | PageHeader (likely wrapped) | ✓ Likely adopted | Consistent with character pattern |
| /projects/[id]/arcs | Arc workspace | ? | ? | Not yet audited |

### ❓ Routes Requiring Audit

- /nova — AI assistant panel
- /projects/[id]/continuity — Consistency review
- /projects/[id]/hub — Project dashboard
- /projects/[id]/arcs — Arc workspace
- /projects/[id]/arcs/[arcId] — Arc detail

## Canonical Header States Verification

### PageHeader Component

**DOM Structure**:

```html
<header class="page-header">
  <div class="page-header__heading">
    {eyebrow} + {title} + {description}
  </div>
  <div class="page-header__right">
    {actions} + {meta}
  </div>
</header>
```

**Styling**:

- Padding: `padding-bottom: var(--space-6)` + border bottom
- Typography: `--font-display` for title, `--text-sm` uppercase for eyebrow, `--text-base` muted for description
- Uses flex layout with responsive wrap + gap handling
- Max-width: `64ch` on heading
- Border: `1px solid var(--color-border-default)` (breathable rgba)

**Observations**: ✅ Correct per design-system.md canonical rules

### SidebarItem States

**Active State**:

- Left border: `2px solid var(--color-teal)`
- Background: `var(--color-surface-glass)`
- Font weight: `var(--font-weight-medium)`

**Hover State**:

- Background: `var(--color-surface-glass)`
- Transition: 100ms standard easing

**Focus-Visible State**:

- Outline: `2px solid var(--color-border-focus)`
- Outline-offset: `-2px` (internal focus ring)
- Background: `var(--color-surface-glass)`

**Observations**: ✅ Correct per design-system.md; all three states use correct tokens

## Accessibility (a11y) Status

### Skip-Link

- ✅ Present in AppShell: `<a class="skip-link" href="#main-content">Skip to content</a>`
- ✅ Focus-visible with proper positioning and styling
- ✅ Keyboard accessible (Tab brings it into view)

### Sidebar Navigation

- ✅ `<nav id="sidebar-nav-content" aria-label="Primary navigation links">`
- ✅ Toggle button: `aria-label` + `aria-expanded` + `aria-controls`
- ✅ Active states: `aria-current="page"` on active links
- ✅ Locked items: `aria-label="{label} (locked)"`
- ✅ Search input: `aria-label="Search projects"`

### Main Content

- ✅ `<main id="main-content" class="main-content" aria-label="Main content">`
- ✅ Proper landmark structure for keyboard navigation

### Observations

- ✅ Navigation structure meets accessibility-a11y skill standards
- ✅ ARIA labels present on all interactive elements
- ✅ Keyboard focus order is logical

## Findings Summary

### Part 001: Sidebar & Nav Rail

**Status**: ✅ **COMPLETE**

- AppShell correctly uses AppSidebar as the canonical sidebar
- All routes inherit this through the root layout
- Active/hover/focus states are consistent and use correct tokens
- Accessibility structure is sound
- No route-local sidebar duplication

**Recommendation**: ✅ Part 001 → `complete` (no code changes needed)

### Part 002: Page Header Pattern

**Status**: ⚠️ **NEEDS STANDARDIZATION**

- 14 routes have adopted PageHeader
- 39 routes lack explicit headers or use custom hero sections
- Three categories need action:
  1. **Workspace headers** (outline storyboard, editor header): Should migrate to PageHeader (archetype-specific wrapping allowed)
  2. **Unaudited routes**: Need header audit (nova, continuity, hub, arcs)
  3. **Custom styling**: Routes using `:global(.page-header)` overrides should consolidate into token-based pattern

**Immediate Actions**:

1. Standardize outline storyboard hero → PageHeader primitive
2. Audit remaining 5 unaudited workspace routes
3. Document header pattern for each archetype
4. Ensure all routes use canonical primitive or documented archetype variant

## Next Steps

**Part 001**: Move to `complete` (sidebar is standardized)

**Part 002 Implementation Order**:

1. Standardize outline storyboard header (`/projects/[id]/outline`)
2. Audit and standardize remaining workspace routes (`/nova`, `/projects/[id]/hub`, `/projects/[id]/continuity`, `/projects/[id]/arcs`)
3. Document archetype-specific header patterns in design-system.md
4. Validate all routes pass checks

**Exit Criteria**:

- ✅ Every route has an explicit header or documented exception
- ✅ No route-local header CSS outside of documented patterns
- ✅ Sidebar/header states are identical across all routes
- ✅ pnpm run check passes
