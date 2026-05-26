# Route Visual Baseline Matrix

> Current-state vs target-state visual compliance for every route family.
> Date: 2026-04-14

## Design Token System Summary

The token system is comprehensive and well-structured in `src/styles/tokens.css`:

- **Surface colors**: 7 semantic levels (`base` → `elevated`)
- **Text colors**: 4 tiers (`primary`, `secondary`, `muted`, `on-dark`)
- **Spacing**: 10-step 4px grid (`--space-1` through `--space-16`)
- **Typography**: 3 font families (sans/display/mono), 10 size steps, 4 weights
- **Radii**: 6 steps (`none` through `full`)
- **Shadows**: 5 depths (`xs` through `xl`)
- **Motion**: 6 durations + 5 easings

## UI Primitive Coverage

| Primitive | Exists | Used Consistently |
| --- | --- | --- |
| SectionHeader | Yes | Partial - only `/books` |
| SurfacePanel | Yes | Partial - `/books` only |
| SurfaceCard | Yes | Low - most pages use custom cards |
| EmptyStatePanel | Yes | Partial - `/books` empty state |
| PrimaryButton | Yes | Good |
| GhostButton | Yes | Good |
| DestructiveButton | Yes | Good |
| PageContainer | No | N/A - custom per-page max-width patterns |
| TabNavigation | No | N/A - custom in continuity |

## Route Family Baseline

### Family: Library (Home `/`, Books `/books`, Stories `/stories`)

| Surface | Shell | Container | Header | Cards | Empty State | Tokens | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` (Home) | Root shell | Custom 1100px | Custom serif h1 hero | LibraryHeroCard (custom) | None | Partial | Medium |
| `/books` | Root shell | .library-hub 1100px | SectionHeader | LibraryHeroCard in SurfacePanel | EmptyStatePanel | Good | Low |
| `/stories` | Root shell | Custom 960px | Custom serif h1 | None | Custom placeholder | Partial | Medium |

**Current gaps**:

- `/` uses custom hero layout without SectionHeader. Uses `--text-5xl` serif heading directly.
- `/stories` uses a different max-width (960px vs 1100px) and custom heading style.
- Card treatment differs: `/` stacks cards without a SurfacePanel wrapper.

**Target contract**:

- All library pages use consistent max-width centering (1100px).
- `/books` is the gold standard — SectionHeader + SurfacePanel + EmptyStatePanel.
- `/` may keep its hero treatment as intentional editorial surface (no change needed).
- `/stories` should align to 1100px container when content is added.

### Family: Reader (`/books/[id]`)

| Surface | Shell | Container | Header | Cards | Tokens | Severity |
| --- | --- | --- | --- | --- | --- | --- |
| `/books/[id]` | Root shell | Custom 880px | Custom hero (cover + title) | Chapter sections | Partial | Low |

**Current gaps**:

- Uses hardcoded `5px 10px` padding on status badge (line 215).
- Container width is 880px (appropriate for reading — narrower is intentional).
- "Back to Library" link uses `--color-teal` (correct).

**Target contract**:

- Reading surface is intentionally narrower. 880px is acceptable.
- Fix hardcoded `5px 10px` padding to use `--space-1 --space-2`.
- Otherwise compliant.

### Family: Project Core (Hub, Workspace, Outline, Arcs)

| Surface | Shell | Container | Header | Cards | Tokens | Severity |
| --- | --- | --- | --- | --- | --- | --- |
| Hub | Project shell | Custom 1000px | ProjectHubHero (custom) | Custom `.hub-card` | Partial | High |
| Workspace | Project shell | Custom 1000px | Custom mode headers | Custom detail cards | Low | High |
| Outline | Project shell | Custom 480-800px range | Custom split pane | HierarchyNavigator | Low | Medium |
| Arcs | Project shell | Custom 420px | Custom arc header | Custom arc cards | Partial | Medium |

**Current gaps**:

- Hub uses custom `.hub-card` instead of `SurfaceCard`. Has hardcoded `6px` height on progress bar and `4px` translateX.
- Workspace uses entirely custom card/detail components. No token usage for color assignments.
- Outline uses custom split-pane layout with hardcoded min/max widths.
- Arcs pages use narrow 420px container.

**Target contract**:

- Hub dashboard cards should use `SurfaceCard` variant system.
- Hub progress bar dimensions are incidental (6px height is acceptable for a thin progress track).
- Workspace custom layout is justified by its complex mode-switching UI.
- Outline split-pane with hardcoded widths is justified for its editorial context.
- Arcs 420px is intentionally narrow for the form-based content.

### Family: Editor (`/projects/[id]/editor`, `/projects/[id]/editor/[sceneId]`)

| Surface | Shell | Container | Layout | Tokens | Severity |
| --- | --- | --- | --- | --- | --- |
| Editor list | Project shell | Full-width 3-column grid | Sidebar (200px) + Editor (1fr) + AI (0/280px) | Partial | Medium |
| Scene detail | Project shell | Editor fill | TipTap editor area | Partial | Low |

**Current gaps**:

- Three-column layout uses hardcoded `200px` and `280px` grid columns and `calc(100vh - 120px)`.
- These are layout chrome dimensions, not content spacing — justified for editor layout.

**Target contract**:

- Editor is a specialized three-panel layout; fixed pixel dimensions for panels are acceptable.
- Scene list items should use consistent token-based spacing.
- AI panel width (280px) matches `--panel-width` token — already aligned.

### Family: Analysis (Continuity, Consistency)

| Surface | Shell | Header | Tabs | Tokens | Severity |
| --- | --- | --- | --- | --- | --- |
| Continuity | Project shell | Custom serif h1 | Custom tab-bar | Partial | Medium |
| Consistency | Project shell | Redirect | N/A | N/A | None |

**Current gaps**:

- Tab bar uses custom `.tab-bar` / `.tab` styling instead of a shared primitive.
- Tab active state uses `2px solid transparent` (hardcoded border width).

**Target contract**:

- Tab navigation pattern should become a shared primitive or at minimum use token-based values.
- `2px` border is incidental for tab underline — matches `--border-width-md`.

### Family: Knowledge (Bible, World-Building)

| Surface | Shell | Container | Header | Cards | Tokens | Severity |
| --- | --- | --- | --- | --- | --- | --- |
| Bible hub | Project shell | N/A (redirect) | N/A | N/A | N/A | None |
| WB Characters | Project shell | Inherited | Back-link + h1 + action | CharacterCard (custom) | Partial | Medium |
| WB Plot Threads | Project shell | Inherited | Custom | Custom | Low | Medium |
| WB Hub | Project shell | Inherited | Grid layout | Entity nav cards | Partial | Low |

**Current gaps**:

- Bible pages redirect to world-building equivalents — no visual surface to audit.
- Character/entity pages use custom card components without SurfaceCard.
- WB hub uses `minmax(160px, 1fr)` grid for entity navigation — acceptable layout pattern.
- No consistent page container pattern across knowledge routes.

**Target contract**:

- Entity listing pages should adopt page container (1000px or matching project shell).
- Edit/Delete buttons use GhostButton — already compliant.
- `+ Add Character` uses PrimaryButton — already compliant.

### Family: Utility (Settings, Styles, Nova, Images)

| Surface | Shell | Container | Tokens | Severity |
| --- | --- | --- | --- | --- |
| Settings | Root shell | Custom 1200px | Good | Low |
| Styles | Root shell | Custom 800px | Reference page | None |
| Nova | Root shell | Custom | Partial | Low |
| Images | Root shell | Custom 1100px | Good | Low |

**Current gaps**:

- Settings uses 1200px (wider than standard 1100px) — justified for grid-based settings cards.
- Styles page is the design system showcase — exempt from consistency requirements.
- Images mirrors the Library pattern (1100px max-width).

**Target contract**:

- Settings wider container is acceptable for its grid layout.
- All utility pages should use token-based spacing.

## Hardcoded Value Audit

**Zero hardcoded hex colors** found in any route `.svelte` file.

**Hardcoded pixel values** found (categorized):

### Acceptable (layout chrome / media queries)

- `max-width: 1100px` (Library, Books, Images) — consistent page width
- `max-width: 1000px` (Hub, Workspace, Project layout) — consistent project width
- `max-width: 880px` (Reader) — intentionally narrower for reading
- `max-width: 960px` (Stories) — should align to 1100px
- `max-width: 1200px` (Settings) — wider for grid
- Media queries (`640px`, `767px`, `768px`) — standard breakpoints
- Editor grid columns (`200px`, `280px`, `calc(100vh - 120px)`) — panel dimensions
- Outline constraints (`480px`, `800px`) — split-pane bounds
- Arcs form (`420px`) — narrow form context
- Styles page (`800px`, `500px`) — showcase exempt

### Needs remediation

- `/books/[id]` line 215: `padding: 5px 10px` — should use `--space-1 --space-2`
- `/projects/[id]/hub` line 211: `height: 6px` — progress bar, acceptable but could use a custom property
- `/projects/[id]/hub` line 256: `translateX(4px)` — micro-animation, acceptable

## Severity Summary

| Severity | Count | Description |
| --- | --- | --- |
| High | 2 | Hub dashboard cards, Workspace custom styling |
| Medium | 7 | Home hero, Stories container, Characters cards, Plot threads, Continuity tabs, Editor spacing, Outline |
| Low | 5 | Reader badge padding, Settings width, Nova, Images, Arcs |
| None | 4 | Styles (exempt), Bible redirects, Consistency redirect, Project redirect |

## Compliance Status

| Route Family | Surfaces | Compliant | Needs Work | Exempt |
| --- | --- | --- | --- | --- |
| Root | 3 | 3 | 0 | 0 |
| Library | 3 | 1 | 2 | 0 |
| Reader | 2 | 1 | 1 | 0 |
| Project Core | 12 | 4 | 8 | 0 |
| Editor | 4 | 2 | 2 | 0 |
| Analysis | 4 | 2 | 2 | 0 |
| Knowledge | 18 | 10 | 8 | 0 |
| Utility | 8 | 6 | 0 | 2 |
| **Total** | **54** | **29** | **23** | **2** |
