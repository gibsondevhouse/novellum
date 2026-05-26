# Showcase Verification — 2026-05-25

## Browser plugin checks

- Opened `http://127.0.0.1:5173/styles`.
- Confirmed page title: `Styles Showcase — Novellum`.
- Accessibility snapshot includes required sections:
  - Surface Palette
  - Editorial Palette
  - Type Stack
  - Primitives
  - Chrome Reference
  - Immersive Surfaces
- Confirmed primitive controls rendered:
  - Button variants
  - Input
  - PillToolbar
  - Stepper
  - Toast trigger buttons

## Reference kit check

- Served v2 source kit at:
  - `http://127.0.0.1:4181/developer/Novellum%20Design%20System/ui_kits/novellum-v2/index.html`
- Confirmed source page title: `Novellum v2 — Author-first UI kit`.

## Computer Use plugin checks (Google Chrome)

- Navigated to `http://127.0.0.1:5173/styles`.
- Confirmed visible content includes:
  - `Novellum v2 Surfaces, Tokens, and Primitives`
  - token swatch grids
  - legacy alias note (`--color-nova-blue` -> `var(--color-candle)`)
  - type stack samples
  - primitives grid
  - chrome geometry preview (`208px`, `56px`)
  - immersive preview cards (Page, Muse, Room)
