# Visual Baseline Rebaseline — 2026-05-28

## Command Run

```bash
pnpm build  # Built in 3.84s
pnpm exec playwright test \
  tests/visual/editor-nova-panel.test.ts \
  tests/visual/editor-nova-panel-conversation.test.ts \
  tests/visual/editor-nova-panel-tools.test.ts
```

## Result

```
Running 5 tests using 1 worker

  -  1  [chromium] conversation snapshot — SKIPPED
  -  2  [chromium] tools snapshot — SKIPPED
  -  3  [chromium] panel snapshot — SKIPPED
  ✓  4  [chromium] Composer controls remain visible within constrained panel width — 1024×720 (2.0s)
  ✓  5  [chromium] Compact viewport keeps composer usable and hides resize handle — 375×800 (1.8s)

3 skipped, 2 passed (5.7s)
```

## Behavioral Test Coverage

### Test 4 — Constrained Layout (1024×720, panel at 280px)

Verified:
- `.nova-mode-select` visible and within panel bounds ✓
- `textarea.nova-input` visible and within panel bounds ✓
- `.nova-action-send` visible and within panel bounds ✓
- All three controls within `panelBox.x + panelBox.width` at 280px panel width ✓

### Test 5 — Compact Viewport (375×800)

Verified:
- Panel visible at 375px viewport ✓
- `.nova-resize-handle` hidden at compact viewport ✓
- `.nova-mode-select` visible ✓
- `textarea.nova-input` visible ✓
- `.nova-action-send` visible ✓

## Snapshot Substitution Rationale

The three snapshot tests remain `test.skip` per their existing TODO(V1.1) comments. The streaming/animated Nova UI does not reach a pixel-stable state in headless Chromium (`toHaveScreenshot` polls indefinitely). This is the same accepted substitution from plan-030 (2 behavioral + 3 skipped snapshot).

No new snapshot baselines are needed for Stage 001 since the behavioral tests fully cover the compact shell layout contract.

## Stage 001 Lock Point

Stage 001 is visually locked at the compact shell milestone. Subsequent stages (002 modes, 003 attachments, 004 agent loop) will add behavior without changing the shell dimensions or control topology confirmed by these behavioral tests.
