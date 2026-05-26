# E2E + CI evidence — 2026-05-26

## Playwright e2e suite

Command: `pnpm playwright test tests/e2e --reporter=list`

Result: **6 passed (9.2s)** at HEAD `fb6aa2b` (master).

- ✅ `tests/e2e/onboarding.spec.ts` → closes **OB1**, **E1**
- ✅ `tests/e2e/project-lifecycle.spec.ts` → closes **OB3**, **E2**
- ✅ `tests/e2e/settings-ai-key.spec.ts` → closes **E3**
- ✅ `tests/e2e/hub-word-count.spec.ts` → closes **E4**
- ✅ `tests/e2e/arc-hierarchy-flow.spec.ts` (bonus, not on DoD)

## CI workflow status (master)

`gh run list --branch master`:

- ✅ CI (ci.yml) — last 5 runs all `success`, latest at 2026-05-26T04:36Z → closes **CI1**
- ⚠️ Visual Regression Tests — last 3 cron runs at stale sha `2cec15b` failed (pre-baseline-regen). Fresh `workflow_dispatch` triggered 2026-05-26T05:20Z at current master `fb6aa2b`; awaiting result for **CI3**.
- ❌ Release (release.yml) — never run; trigger is `push: tags: v*.*.*` only. No `workflow_dispatch`. **CI2** dry-run is structurally impossible without creating a real tag. Decision required: either add `workflow_dispatch` to release.yml + re-run, or treat first real RC tag as the dry-run.
