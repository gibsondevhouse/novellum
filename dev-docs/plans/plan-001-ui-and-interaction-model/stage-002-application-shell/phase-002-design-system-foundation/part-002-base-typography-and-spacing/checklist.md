---
part: part-002-base-typography-and-spacing
phase: phase-002-design-system-foundation
stage: stage-002-application-shell
---

# Checklist — Base Typography & Spacing

## Pre-Implementation

- [x] `part-001-css-token-layer` is `complete`
- [x] All `--text-*`, `--font-*`, `--leading-*` tokens confirmed in `src/styles/tokens.css`

## Post-Implementation

- [x] `html` default styles use token variables — confirmed in DevTools Computed tab
- [x] `h1`–`h4` render at correct sizes on a test route
- [ ] Inter font loads correctly in dev browser — **DEFERRED** (browser visual test)
- [ ] JetBrains Mono renders correctly in any `<code>` element — **DEFERRED** (browser visual test)
- [x] No hardcoded pixel or hex values added in `app.css`
- [x] `pnpm run lint` exits with zero errors
- [ ] Screenshot of typography test page added to `evidence/` — **DEFERRED** (browser visual test)
- [x] `impl.log.md` updated with completion entry
