# Component Inventory Audit Log

**Date:** 2026-04-14
**Plan Phase:** Stage 001 - Phase 001 - Part 001

## 1. Hardcoded Units (`px`)
Found 69 matches for hardcoded `px` values within `src/lib/components`. These are predominantly used for:
- **Borders:** `1px`, `2px`, and `3px` solid borders across multiple components (`AiPanel`, `RewriteOptionsModal`, `PlanningSurfaceBody`, `SuggestionCard`).
- **Dimensions:** Widths and heights such as `280px` (sidebar/panels), `min(600px, 90vw)` (modals), and `16px` (icons).
- **Spacing/Padding:** Hardcoded paddings and margins like `1px`, `2px`, `5px`, and `14px` instead of relying on token variables like `--space-1` or `--space-2`.
- **Box Shadows:** Numerous hardcoded shadow offsets and blur radii (e.g., `0 8px 32px`, `-14px 0 48px`).

## 2. `LibraryHeroCard` Variants
The `LibraryHeroCard` component is not located in the shared UI lib; it resides in a domain-specific module at `src/modules/project/components/LibraryHeroCard.svelte`. Currently, it acts as a standalone "hero card" for the Books shelf rather than a shared layout primitive.

## 3. `AppSidebar` Collapse Logic
- **State Management:** Uses Svelte 5 Runes with a local `$state(false)` for the `collapsed` variable.
- **CSS Implementation:** The state toggles a `.collapsed` class on the `<aside>` element.
- **Visual Changes:**
  - The width transitions from `--sidebar-width` to `64px`.
  - The `.toggle-btn` becomes centrally justified.
  - Labels (`.sidebar-item__label`, `.sidebar-section__label`) and locks (`.sidebar-item__lock`) are hidden via `display: none`.

## 4. Button Styles and States
Button implementations are heavily fragmented:
- **Global Tokens:** `styles/components.css` provides basic `.btn-primary` and `.btn-ghost` classes.
- **Isolated Styles:** Components define their own button classes extensively (e.g., `.btn-icon`, `.btn-delete`, `.btn-cta`, `.btn-save`, `.btn-cancel`, `.btn--primary`, `.btn--secondary`).
- **Interaction States:** Hover (`:hover`), focus (`:focus-visible`), and disabled (`:disabled`) states are manually defined within almost every component instead of being centralized in a shared Svelte component primitive.

## 5. Svelte 5 Runes Compliance
A search for `export let` within `src/lib/components` yielded 0 results. The components in this directory are fully migrated to Svelte 5 `$props()` and `$state()`.
