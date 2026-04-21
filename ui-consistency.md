# UI Consistency Plan: The Professional Media Gallery Experience

This document outlines the strategic refactor of Novellum into a premium, media-centric production suite. The goal is to move beyond "functional lists" to an **immersive, cinematic gallery experience** inspired by high-end media platforms (Netflix, Apple TV, Linear).

## 1. The Gallery Design Pillars

### 1.1 Cinematic Immersion
- **Luminance Depth**: Use `var(--color-surface-base)` (#0a0a0a) as the infinite canvas. Layers are built with subtle luminance increases, never harsh borders.
- **Glassmorphism**: Utilize `var(--color-surface-glass)` for floating navigation and overlays to maintain context.
- **Visual Primacy**: Every entity (Book, Character, Scene) must have a visual representation. Text-only cards are deprecated.

### 1.2 The "Spotlight" Hero
- Every hub starts with a **Spotlight Section**: High-impact imagery, large typography (`var(--font-display)`), and minimal primary actions.
- Backgrounds should use subtle gradients or blurred artwork to create atmospheric depth.

### 1.3 Fluid Motion & Interaction
- **The "Lift"**: Interactive cards use `var(--duration-slow)` and `var(--ease-editorial)` for a tactile, spring-like hover state (slight scale + shadow expansion).
- **Graceful Entry**: Page transitions use `var(--duration-page)` with a subtle translate-up and fade-in.

---

## 2. Phase 1: Infrastructure (The Gallery Foundation)

### 2.1 Enhanced Tokens
- [ ] Add `--radius-xl: 16px` and `--radius-2xl: 24px` to `tokens.css` for softer, premium containers.
- [ ] Define `--gradient-spotlight`: A radial gradient that anchors the hero sections.

### 2.2 Reusable Gallery Components
- [ ] **`GlassContainer`**: A new primitive for overlays and floating headers.
- [ ] **`MediaScroller`**: Generalize `CollectionRow` into a snippet-based horizontal scroller with magnetic snapping.
- [ ] **`EntityPoster`**: A standardized card format with high aspect ratios (2:3 or 16:9), supporting background imagery and metadata overlays.

---

## 3. Phase 2: Hub Transformation (The Premiere Look)

### 3.1 The Home Library (`/`)
- [ ] **Refine**: Current "Home Library" is the baseline. Enhance the Hero with a subtle background glow and transition the "Continue Reading" section into a true spotlight.

### 3.2 Projects & Books Hubs (`/projects`, `/books`, `/stories`)
- [ ] **Layout**: Shift from list-rows to an **Immersive Grid**.
- [ ] **Interaction**: On hover, posters should reveal "Quick Look" metadata (Word count, last edit, progress %) via a glass overlay.
- [ ] **Headers**: Replace static headers with a dynamic "Breadcrumb-Title" pattern that feels like a gallery sub-menu.

---

## 4. Phase 3: Project Workspace (The Production Suite)

### 4.1 The Project Hub (`/projects/[id]/hub`)
- [ ] **Cinematic Dashboard**: Convert metrics (Word count, arcs) into visual "Status Rings" or elegant progress bars that feel like premium instrumentation.
- [ ] **Action Bar**: Convert to a floating `GlassContainer` at the bottom or top of the viewport.

### 4.2 World Building & Bible
- [ ] **Character Gallery**: Replace lists with "Portrait Cards".
- [ ] **Lore Maps**: Use large-scale `SurfaceCard` components that act as visual windows into the world.
- [ ] **Atmospheric Panels**: Sidebars should use `var(--color-surface-ground)` with zero-border transitions to the main content.

---

## 5. Phase 4: Workflow Surfaces (Editorial Polish)

### 5.1 The Editor (`/editor`)
- [ ] **Focus Mode**: A truly borderless experience where the "Chrome" (UI) fades out during active writing.
- [ ] **Typography**: Ensure editorial fonts match the "Display" aesthetic for headings.

### 5.2 The Outliner (`/outline`)
- [ ] **StoryBoarding**: Refactor the Kanban into a "Storyboard View" where beats look like film frames.

---

## 6. Phase 5: Verification & Quality Gates

### 6.1 Performance & Fluidity
- [ ] Ensure `will-change` is used judiciously on transform/opacity transitions to maintain 60fps during gallery scrolls.
- [ ] Verify image lazy-loading to keep initial load cinematic and fast.

### 6.2 Token Audit
- [ ] Strict enforcement: No color should exist outside the `surface-base` to `surface-elevated` range.
