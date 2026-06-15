# Responsive & A11y Regression Evidence — 2026-06-15

## Browser Evidence

- Desktop screenshot: `browser-desktop-primary-workflows-2026-06-15.png`
  - URL: `/projects/2424d456-319e-4c51-aef2-0c58dea8297e/editor?panel=ai`
  - Viewport: 1440 x 900
  - Coverage: sidebar, chapter navigation, editor toolbar, scene surface, and Nova panel.
- Mobile screenshot: `browser-mobile-primary-workflows-2026-06-15.png`
  - URL: `/projects/2424d456-319e-4c51-aef2-0c58dea8297e/world-building/characters`
  - Viewport: 390 x 844
  - Coverage: project header, collapsed sidebar, worldbuilding subnav, and personae workspace cards.

Both captures reported `document.body.scrollWidth` equal to `window.innerWidth`,
so no horizontal overflow was present in the verified viewport.

## Automated Gates

- `pnpm check` — passed, 0 errors and 0 warnings.
- `pnpm lint` — passed.
- `pnpm lint:css` — passed.
- `pnpm check:tokens` — passed, 348 files scanned, 0 violations.
- `pnpm test` — passed, 262 files / 1898 tests.
- `pnpm build` — passed after keeping Nova tool routing browser-safe.
- Targeted E2E:
  - `pnpm exec playwright test tests/e2e/project-lifecycle.spec.ts tests/e2e/outline-generation-review.spec.ts tests/e2e/vibe-author-review-gates.spec.ts tests/e2e/vibe-worldbuild-checkpoints.spec.ts tests/e2e/manuscript-export.spec.ts tests/e2e/onboarding.spec.ts tests/e2e/settings-ai-key.spec.ts --project=chromium`
  - Passed, 9 tests.

## Reviewer Handoff

Review should focus on:

- `src/lib/navigation-state.ts` route classification and its store/Nova consumers.
- `src/lib/review-gate-labels.ts` and the review-card copy updates.
- The `src/modules/nova/services/tool-router.ts` server-boundary fix; dispatch remains client-safe and still blocks mutation commands by default.
- Browser evidence screenshots for desktop editor + Nova and mobile worldbuilding.

Plan status remains `review`; no Reviewer Agent sign-off has been fabricated.
