# Visual Regression Baseline Evidence — 2026-04-14

## Summary

Visual regression test suite created and initial baselines captured for all 6 application-level routes using Playwright.

## Tooling Installed

| Package | Version | Purpose |
| --- | --- | --- |
| `@playwright/test` | 1.59.1 | Visual regression test runner |
| Chromium (headless) | v1217 | Browser engine for screenshot capture |

## Files Created

| File | Purpose |
| --- | --- |
| `playwright.config.ts` | Playwright configuration (viewport 1280×720, dark mode, 1% threshold) |
| `tests/visual/visual-regression.test.ts` | Test suite — 6 route baseline tests |
| `package.json` (updated) | Added `test:visual` script |
| `vitest.config.ts` (updated) | Excluded `tests/visual/` from Vitest |
| `.gitignore` (updated) | Excluded Playwright artifacts |

## Baselines Captured

All 6 application-level routes captured to `tests/visual/__screenshots__/visual-regression.test.ts/`:

| Route | Screenshot | Size |
| --- | --- | --- |
| `/` (Home/Library) | `home-library.png` | 131 KB |
| `/books` | `books-shelf.png` | 115 KB |
| `/stories` | `stories.png` | 56 KB |
| `/settings` | `settings.png` | 69 KB |
| `/images` | `images.png` | 70 KB |
| `/nova` | `nova.png` | 59 KB |

## Verification Run

```
Running 6 tests using 1 worker

  ✓  Home / Library — full page (1.6s)
  ✓  Books shelf — full page (1.6s)
  ✓  Stories — full page (1.5s)
  ✓  Settings — full page (1.6s)
  ✓  Images — full page (1.5s)
  ✓  Nova — full page (1.6s)

  6 passed (10.4s)
```

## Threshold Policy

- **`maxDiffPixelRatio: 0.01`** (1% pixel tolerance)
- Rationale: Accounts for anti-aliasing, sub-pixel rendering, and minor font rendering differences across environments while catching meaningful layout regressions (spacing, alignment, missing elements).
- Configured in `playwright.config.ts` under `expect.toHaveScreenshot`.

## Limitations

- **Project-specific routes** (`/projects/[id]/hub`, `/projects/[id]/editor`, etc.) require a valid project ID with seeded test data. These are documented as commented-out tests in the suite with instructions for manual enablement.
- **Environment sensitivity**: Screenshot baselines may differ across OS/hardware combinations. Baselines should be captured and maintained on a consistent environment (same machine or CI runner).

## Quality Gates

| Gate | Result |
| --- | --- |
| `pnpm run lint` | ✅ 0 errors |
| `pnpm run check` | ✅ 0 errors, 0 warnings |
| `pnpm run test` | ✅ 33 files, 215 tests passed |
| `pnpm run test:visual` | ✅ 6 tests passed |

## How to Run

```bash
# Start dev server first
pnpm run dev

# Run visual regression tests
BASE_URL=http://localhost:5173 pnpm run test:visual

# Update baselines after intentional visual changes
BASE_URL=http://localhost:5173 pnpm run test:visual -- --update-snapshots
```
