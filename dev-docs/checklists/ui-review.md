# UI Review Checklist

## Linearization Standards

Before submitting a PR that affects the UI, ensure the following checks have passed:

- [ ] **Tokens Only:** No hardcoded `px` values for padding, margin, or layout widths (unless in SVGs/Canvas). Always use `--space-*` tokens.
- [ ] **No Hardcoded Colors:** All colors must reference `var(--color-*)`. No inline `#HEX` or `rgba()` unless it's a specific texture overlay blending with a token.
- [ ] **Surface Primitives:** Surfaces use `SurfaceCard` or `SurfacePanel` primitives instead of custom `div`s with manual borders and backgrounds.
- [ ] **Tonal Layering:** Layers use tonal background variations (`--color-surface-raised`, `--color-surface-overlay`) instead of stark borders.
- [ ] **Standard Controls:** All buttons must use `<PrimaryButton>`, `<GhostButton>`, or `<IconButton>`.
- [ ] **Motion Utilities:** Animations and transitions must use standard `--duration-*` and `--ease-*` tokens, or apply `.motion-*` utility classes.
- [ ] **Accessibility (A11y):** All interactive elements must show a focus ring (`var(--focus-ring)`).
- [ ] **Reduced Motion:** Ensure all new motion patterns are wrapped in `@media (prefers-reduced-motion: reduce) { transition: none; }` or rely on utilities that handle this.
