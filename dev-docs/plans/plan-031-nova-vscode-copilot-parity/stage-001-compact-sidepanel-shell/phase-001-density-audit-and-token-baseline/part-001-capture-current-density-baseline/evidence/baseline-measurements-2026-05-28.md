# Density Baseline Measurements — 2026-05-28

## Current Nova Sidepanel Measurements

### Spacing / Chrome

| Area | Property | Current value | Token |
|---|---|---|---|
| Header | padding | `12px 16px 8px` | `var(--space-3) var(--space-4) var(--space-2)` |
| Session tray | padding | `8px 16px 12px` | `var(--space-2) var(--space-4) var(--space-3)` |
| Body | padding | `16px` all sides | `var(--space-4)` |
| Footer | padding | `12px 16px` | `var(--space-3) var(--space-4)` |
| Greeting card | padding | `20px` | `var(--space-5)` |
| Greeting card top margin | margin-top | `12px` | `var(--space-3)` |

### Composer

| Element | Property | Current value |
|---|---|---|
| Textarea | `min-height` | `84px` (3 rows) |
| Textarea | `max-height` | `220px` |
| Send button | `width / height` | `40px × 40px` |
| Mode label + select | layout | Two-row: mode label above, select below |
| Shell | layout | Two distinct rows (mode row + input row) |

### Greeting Card

| Property | Value |
|---|---|
| Title font size | `var(--text-2xl)` = 24px |
| Body max-width | `28ch` |
| Starter prompt padding | `var(--space-2) var(--space-3)` |

### Close Button

| Property | Value | Issue |
|---|---|---|
| Width / height | `var(--space-7)` × `var(--space-7)` | `--space-7` **not defined** in tokens.css |

### Status Dots

| Element | Property | Current | Issue |
|---|---|---|---|
| `.nova-checking-dot` | `width / height` | `6px` (hardcoded) | Should use `--size-dot-small` |
| `.nova-header-status-dot` | `width / height` | `6px` (hardcoded) | Should use `--size-dot-small` |

## Token Violations (pre-fix)

`pnpm check:tokens` reported 11 violations across 3 files:

| File | Line | Rule | Description |
|---|---|---|---|
| NovaComposer.svelte | L293 | RULE-T1 | `rgba(255,255,255,0.03)` in `.nova-composer__shell` box-shadow |
| NovaComposer.svelte | L293 | RULE-T5 | Raw box-shadow in `.nova-composer__shell` |
| NovaComposer.svelte | L366 | RULE-T1 | `rgba(240,187,112,0.25)` in `.nova-action-send` box-shadow |
| NovaComposer.svelte | L367 | RULE-T1 | `rgba(255,255,255,0.32)` in `.nova-action-send` box-shadow |
| NovaMessageLog.svelte | L189 | RULE-T1 | `rgba(255,255,255,0.03)` in `.nova-bubble` box-shadow |
| NovaMessageLog.svelte | L189 | RULE-T5 | Raw box-shadow in `.nova-bubble` |
| NovaPanel.svelte | L391 | RULE-T1 | `rgba(0,0,0,0.44)` in panel lateral shadow |
| NovaPanel.svelte | L392 | RULE-T1 | `rgba(255,255,255,0.02)` in panel lateral shadow |
| NovaPanel.svelte | L518 | RULE-T5 | Raw box-shadow in `.nova-header-status-dot` |
| NovaPanel.svelte | L557 | RULE-T1 | `rgba(0,0,0,0.22)` in greeting card shadow |
| NovaPanel.svelte | L558 | RULE-T1 | `rgba(255,255,255,0.04)` in greeting card shadow |

## Density Deltas for Phase 002 (Header/Body/Footer Compression)

The following are the specific measurements that Phase 002 needs to reduce:

1. **Greeting card title** `var(--text-2xl)` (24px) → target `var(--text-lg)` (18px) or `var(--text-xl)` (20px)
2. **Textarea starting height** 84px (3 rows) → target single-line auto-grow (~36px start)
3. **Session tray** currently a separate strip below the header → can be merged into header or action row
4. **Greeting card margin-top** `var(--space-3)` → `0` (remove extra gap before greeting)
5. **Mode selector** currently a separate full-width row → move to action row in Phase 003

## Visual Test Status

Existing visual tests in `tests/visual/`:
- `editor-nova-panel.test.ts` — snapshot test is **skipped** (pinned `test.skip`, reason: streaming UI doesn't reach pixel-stable state in headless Chromium). Two behavioral tests run: constrained layout (280px) and compact viewport (375px).
- `editor-nova-panel-conversation.test.ts` — status unknown (not run this session)
- `editor-nova-panel-tools.test.ts` — status unknown (not run this session)

The two running behavioral tests verify that composer controls remain within panel bounds at constrained widths.
