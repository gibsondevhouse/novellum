# Closeout Guide — plan-026 stage-006 (phases 002 + 003)

> Audience: maintainer driving plan-026 to `complete`.
> Time budget: 2–3 hours of focused work (≈30 min baseline regen +
> 60 min docs sweep + 30 min showcase rebuild + 15 min plan rollup).
>
> Pre-req: stage-006 phase-001 is `complete` (token alias landed,
> reader/sidebar/Muse polish shipped, all gates green at
> 322/0 tokens · 0/0 svelte-check · lint clean · 1059/1059 tests).

---

## Phase 002 — Playwright Baseline Regen

### Why it's manual

The Playwright suite under `tests/visual/` snapshots the warm-umber
chrome, parchment Page, Muse marginalia, and Room spread. Because
the v2 refactor changed almost every pixel, the existing PNG
baselines under
`tests/visual/__screenshots__/<test-file>/<arg>.png` are stale.
Regen is mechanical, but **every regenerated baseline must be
eyeballed** — otherwise a real regression can ride in unnoticed.

### Step-by-step

1. **Make sure the dev server / built app boots cleanly.**

   ```bash
   pnpm check:tokens && pnpm check && pnpm lint && pnpm lint:css && pnpm test
   ```

   All gates must be green before touching baselines.

2. **Inventory the current baselines.**

   ```bash
   find tests/visual/__screenshots__ -name '*.png' | wc -l
   find tests/visual/__screenshots__ -name '*.png' | sort
   ```

   Note the count — you should see roughly the same number after
   regen. A dramatic delta (e.g. half as many files) means a test
   silently stopped taking a snapshot; investigate before
   continuing.
   
   ```txt
   user@host novellum % find tests/visual/__screenshots__ -name '*.png' | wc -l
      32
user@host novellum % find tests/visual/__screenshots__ -name '*.png' | sort
tests/visual/__screenshots__/visual-regression.test.ts/books-shelf.png
tests/visual/__screenshots__/visual-regression.test.ts/home-library.png
tests/visual/__screenshots__/visual-regression.test.ts/images.png
tests/visual/__screenshots__/visual-regression.test.ts/nova-context-chip-project.png
tests/visual/__screenshots__/visual-regression.test.ts/nova-context-menu-open.png
tests/visual/__screenshots__/visual-regression.test.ts/nova.png
tests/visual/__screenshots__/visual-regression.test.ts/projects.png
tests/visual/__screenshots__/visual-regression.test.ts/stories.png
tests/visual/__screenshots__/visual-regression.test.ts/worldbuilding-characters-landing.png
tests/visual/__screenshots__/visual-regression.test.ts/worldbuilding-major-arcs-selected.png
tests/visual/__screenshots__/visual-regression.test.ts/worldbuilding-timeline-key-events-placeholder.png
tests/visual/__screenshots__/visual/editor-nova-panel-conversation.test.ts/editor-nova-panel-conversation.png
tests/visual/__screenshots__/visual/editor-nova-panel-tools.test.ts/editor-nova-panel-tools.png
tests/visual/__screenshots__/visual/editor-nova-panel.test.ts/editor-nova-panel.png
tests/visual/__screenshots__/visual/editor-page-geometry.test.ts/editor-page-1280x800.png
tests/visual/__screenshots__/visual/editor-page-geometry.test.ts/editor-page-600x900.png
tests/visual/__screenshots__/visual/editor-toolbar.test.ts/editor-toolbar-1280x800.png
tests/visual/__screenshots__/visual/editor-toolbar.test.ts/editor-toolbar-900x800.png
tests/visual/__screenshots__/visual/settings-shell.test.ts/settings-shell.png
tests/visual/__screenshots__/visual/view-in-reader-handoff.test.ts/view-in-reader-handoff.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/books-shelf.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/home-library.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/images.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/nova-context-chip-project.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/nova-context-menu-open.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/nova.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/reader-empty-state.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/settings.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/stories.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/worldbuilding-characters-landing.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/worldbuilding-major-arcs-selected.png
tests/visual/__screenshots__/visual/visual-regression.test.ts/worldbuilding-timeline-key-events-placeholder.png
   ```
3. **Run the suite once and triage failures into two buckets.**

   ```bash
   pnpm exec playwright test tests/visual/ 2>&1 | tee /tmp/visual-baseline.log
   open tests/visual/playwright-report/index.html
   ```

   **Do not jump straight to `--update-snapshots`.** It only
   rewrites baselines for tests that reach the
   `toHaveScreenshot()` assertion. Tests that throw earlier
   (locator errors, navigation timeouts) are left with stale
   baselines and silently keep failing on the next run.

   Sort every failure into one of two buckets:

   **Bucket A — snapshot diff (regenerable).** Error reads
   `expect(...).toHaveScreenshot(...) failed … N pixels (ratio X of all image pixels) are different`
   or `Expected an image WxH, received W'xH'`. These are pure
   pixel / geometry deltas from the v2 palette + layout shift.
   They will clear on regen.

   **Bucket B — test error (blocking).** Anything else — e.g.
   `strict mode violation`, `locator.click: …`, `Timeout
   waiting for selector`, `Error: target closed`. These must
   be fixed at the test level (or in the underlying component)
   before regen. `--update-snapshots` will silently skip them.

   **Known Bucket B failures already fixed in plan-026
   phase-001 (left here as a worked example):**

   - `editor-nova-panel.test.ts`,
     `editor-nova-panel-conversation.test.ts`, and
     `editor-nova-panel-tools.test.ts` previously failed with
     `strict mode violation: getByRole('button', { name: 'Nova' }) resolved to 2 elements`.
     The PillToolbar Nova toggle has accessible name `"Nova"`;
     the inline `Ask Nova about selected text` button in
     `src/modules/editor/components/ManuscriptEditorPane.svelte`
     matched the same substring. Resolved by switching the
     selector to
     `page.getByRole('button', { name: 'Nova', exact: true })`
     in all three test files.

   **Known Bucket B failure NOT yet fixed:**

   - `editor-nova-panel-tools.test.ts` still throws
     `page.evaluate: TypeError: Failed to fetch dynamically imported module: http://localhost:4173/src/modules/nova/index.ts`.
     The test seeds Nova history via
     `await import('/src/modules/nova/index.ts')` inside
     `page.evaluate()`. That only works against `pnpm dev`
     (Vite serves /src/*), but `playwright.config.ts` boots
     `pnpm preview` (port 4173, built bundle) so the source
     path 404s. Two viable fixes:
     1. **Run that single test against dev:** start
        `pnpm dev` in another terminal and run
        `BASE_URL=http://localhost:5173 pnpm exec playwright test tests/visual/editor-nova-panel-tools.test.ts --update-snapshots`.
     2. **Refactor the test** to seed messages via the UI
        (type into `textarea.nova-input`, send) the way
        `editor-nova-panel-conversation.test.ts` does. This is
        the durable fix.

   The two `editor-toolbar.test.ts` failures
   (`Expected an image 250px by 234px, received 1028px by 146px`)
   are Bucket A — the v2 chrome flattened the wrapped pill into
   a 52 px bar. Intentional. Will regen cleanly.

4. **Fix every Bucket B failure first.** Re-run the suite. Loop
   until the only remaining failures are pure Bucket A diffs.

5. **Clean dead baseline directories** (one-off; only the first
   time after this guide is followed). The current
   `playwright.config.ts` writes snapshots to
   `tests/visual/__screenshots__/visual/<test>.ts/<arg>.png`,
   but an earlier config wrote to
   `tests/visual/__screenshots__/<test>.ts/<arg>.png` (no
   `visual/` segment). Those unprefixed PNGs are dead —
   `--update-snapshots` will not touch them and they will not
   match any future run. As of plan-026 phase-001, 11 stale
   PNGs live under
   `tests/visual/__screenshots__/visual-regression.test.ts/`.

   Confirm, then delete:

   ```bash
   # Identify dead baselines (test-named folders directly under __screenshots__)
   find tests/visual/__screenshots__ -maxdepth 2 -name '*.test.ts' -type d

   # Delete them in their own commit so the regen commit stays clean
   git rm -r tests/visual/__screenshots__/visual-regression.test.ts
   git commit -m "test(visual): drop dead baselines from pre-snapshotPathTemplate config"
   ```

6. **Regenerate baselines.**

   ```bash
   pnpm exec playwright test tests/visual/ --update-snapshots
   ```

   Command must exit `0`. If any test still errors out (not
   just diffs), you have a leftover Bucket B failure — go back
   to step 4.

7. **Review every regenerated baseline.** This is the gating step.

   - Open the diff in your git client (`git diff --stat tests/visual/__screenshots__/`).
   - Open each `.png` and confirm it matches the v2 anatomy:

     | Surface              | What to verify                                                   |
     | -------------------- | ---------------------------------------------------------------- |
     | AppShell / Sidebar   | 208 / 56 widths, warm umber background, brass divider hairline   |
     | AppHeader            | 52 px tall, brass eyebrow + serif title + breath bar             |
     | Editor "Page"        | Parchment surface, Crimson Pro prose, candle drop cap            |
     | Nova / Muse panel    | Right-edge marginalia, brass border-left, candle resize handle   |
     | Reader "Room"        | Two-page parchment spread, candle vignette, ember ribbon, folio  |
     | Hub                  | Six narrative tiles, candle/teal spotlight gradient              |
     | Settings             | Brass eyebrow section headings, warm chips                       |
     | Suggestion overlays  | Candle-on-ink primary buttons with brass border                  |

   - **If any baseline shows a real regression** (clipped layout,
     missing element, wrong font, contrast failure), revert that
     single `.png` with `git checkout HEAD -- <path>` and fix the
     underlying component before re-running step 4.

8. **Re-run the suite headlessly to confirm green.**

   ```bash
   pnpm exec playwright test tests/visual/
   ```

   All tests must pass without `--update-snapshots`.

9. **Promote stage-006 phase-002 to `complete`.**

   Update `dev-docs/plans/plan-026-ui-v2-design-system/stage-006-regression-cleanup-docs/phase-002-baseline-regen/phase.md`
   frontmatter `status: complete`. Add an entry to its
   `part.md` impl.log (create the part folder if it doesn't
   exist yet — copy from `dev-docs/plans/_templates/`). Drop a
   git diff summary into the part's `evidence/`:

   ```bash
   git diff --stat tests/visual/__screenshots__/ \
     > dev-docs/plans/plan-026-ui-v2-design-system/stage-006-regression-cleanup-docs/phase-002-baseline-regen/part-001-regen/evidence/snapshot-diff-$(date +%Y-%m-%d).txt
   ```

10. **Commit baselines as a single, isolated commit** so future
   bisects can identify the regen point cleanly.

   ```bash
   git add tests/visual/__screenshots__/
   git commit -m "test(visual): regen baselines for plan-026 v2 chrome"
   ```

### Common pitfalls

- **Font rendering drift between OSes.** Playwright in CI uses
  Linux; running `--update-snapshots` locally on macOS produces
  baselines that fail in CI. If CI is configured for this repo,
  run the regen there (via a draft PR) instead of locally.
- **Animation timing.** Some snapshots are taken mid-transition.
  If a baseline looks "smeared," add an `await page.waitForTimeout`
  or `await page.evaluate(() => document.fonts.ready)` in the
  test before re-regenerating.
- **`--update-snapshots` masks real failures.** If you see
  `Error: <something>` in red during step 4 (not just a snapshot
  diff), the test errored. Snapshots for that test will not
  update. Fix the test, then re-run.

---

## Phase 003 — Docs Sync & Showcase Rebuild

This phase has three sub-tasks. Do them in this order — the
showcase depends on tokens being documented, and CLAUDE/AGENTS
references the architecture doc.

### Sub-task A — `dev-docs/02-architecture/frontend.md`

Open the file and ensure every section reflects v2:

- **Token palette.** Replace any cool-palette description with
  the v2 warm umber + candle / brass / ember / parchment / ink
  vocabulary. List the new tokens: `--color-candle`,
  `--color-candle-dim`, `--color-candle-deep`, `--color-candle-hsl`,
  `--color-brass`, `--color-ember`, `--color-parchment`,
  `--color-parchment-edge`, `--color-parchment-deep`,
  `--color-ink`, `--color-ink-soft`, `--color-ink-mute`.
- **Legacy alias note.** Document that `--color-nova-blue` is
  now a backwards-compat alias for `var(--color-candle)`,
  scheduled for removal in a future cleanup pass.
- **Font stack.** Mention Crimson Pro as `--font-prose`
  alongside DM Serif Display (`--font-display`) and Inter
  (`--font-sans`).
- **Chrome geometry.** 208 / 56 sidebar widths, 52 px header,
  brass eyebrow micro-anatomy (9 px / 600 / 0.18em uppercase).
- **Immersive surfaces.** Editor "Page" (parchment + Crimson Pro
  with Scene Rail), Nova "Muse" (marginalia overlay), Reader "Room"
  (two-page spread + ornament + drop cap + ember ribbon + folio).

Sanity check: `grep -n 'nova-blue\|#3b82f6\|cool palette' dev-docs/02-architecture/frontend.md`
should return no matches.

### Sub-task B — `dev-docs/04-modules/*.md`

Walk the eight module docs. For each, update any section that
references v1 surface colors, primitives, or vocabulary:

| File                      | What to update                                                    |
| ------------------------- | ----------------------------------------------------------------- |
| `editor.md`               | Page surface, Crimson Pro prose, Scene Rail, breath chips         |
| `nova.md`                 | Muse marginalia, candle resize handle, brass border-left          |
| `reader.md`               | Room two-page spread, ornament, drop cap, ember ribbon, folio     |
| `outline.md`              | Candle scene rows, brass type badges, hover affordances           |
| `continuity.md`           | Brass eyebrow on board cards, warm severity surfaces              |
| `world-building.md`       | Domain tiles spotlight, lane index brass, warm input focus        |
| `story-bible.md`          | Entity card v2 anatomy                                            |
| `settings.md`             | Brass eyebrow section headings, warm chips                        |
| `project.md`              | Hub six-tile layout, candle/teal spotlight gradient               |
| `ai.md`                   | Suggestion overlay candle-on-ink buttons, mode badges             |
| `assets.md` / `export.md` | Light touch — only update if v1 vocabulary appears                |

For each file, run:

```bash
grep -n 'nova-blue\|#3b82f6\|charcoal\|slate' dev-docs/04-modules/<file>.md
```

If nothing matches, that file is already consistent.

### Sub-task C — `CLAUDE.md` and `AGENTS.md`

These already point at AGENTS.md as the source of truth. Verify:

- `CLAUDE.md` — no font or color claims that contradict v2.
- `AGENTS.md` — runtime agents section (ContinuityAgent /
  EditAgent / RewriteAgent / StyleAgent) is accurate. Pipeline
  diagram still valid.

Both should be small edits at most; if `grep -n 'nova-blue\|cool umber\|charcoal' AGENTS.md CLAUDE.md` returns nothing, they're fine.

### Sub-task D — `/styles` showcase rebuild

The showcase route (`src/routes/styles/+page.svelte`) is the
in-app design-system reference. After plan-026 it should mirror
`novellum-docs/developer/Novellum Design System/ui_kits/novellum-v2/`.

1. **Pull the v2 source-of-truth open in another tab.**

   ```bash
   open "novellum-docs/developer/Novellum Design System/ui_kits/novellum-v2/index.html"
   ```

   (or whatever the entry preview file is — list the directory
   first if unsure).

2. **Section-by-section rebuild.** The current showcase route
   already has section scaffolding; replace each section's
   content with v2 swatches and primitive demos:

   - **Surface palette** — `--color-surface-base/-ground/-raised/-overlay/-elevated`.
   - **Editorial palette** — `--color-candle`, `--color-candle-dim`,
     `--color-candle-deep`, `--color-brass`, `--color-ember`,
     `--color-parchment`, `--color-parchment-edge`, `--color-parchment-deep`,
     `--color-ink`, `--color-ink-soft`, `--color-ink-mute`.
   - **Legacy alias note** — show that `--color-nova-blue`
     resolves to candle (small swatch with both labels).
   - **Type stack** — Inter / DM Serif Display / Crimson Pro
     samples at the four canonical sizes.
   - **Primitives demo grid** — `EditorialEyebrow`, `Logline`,
     `Ornament`, `DropCap`, `Button` variants, `Input`,
     `PillToolbar`, `Stepper`, `ToastContainer`.
   - **Chrome reference** — small static replicas of AppShell
     band, AppHeader, sidebar dual-band.
   - **Immersive surface previews** — Page parchment card,
     Muse marginalia card, Room spread card.

3. **Remove dead references** as you go: any `var(--color-nova-blue)` callsite in
   the showcase should be rewritten to its semantic v2 token
   (`var(--color-candle)` for accents, `var(--color-border-focus)`
   for focus rings, etc.). The legacy alias survives; the *new*
   showcase should not propagate it.

4. **Verify in-browser.**

   ```bash
   pnpm dev
   # navigate to http://localhost:5173/styles
   ```

   Walk each section against the v2 preview kit. Anything
   missing → fix in the showcase. Anything visually off →
   trace back to the source primitive and fix there (the
   showcase is a *reference*, not a fork).

5. **Final gate after all four sub-tasks.**

   ```bash
   pnpm check:tokens && pnpm check && pnpm lint && pnpm lint:css && pnpm test && pnpm exec playwright test
   ```

   All green.

6. **Promote stage-006 phase-003 to `complete`** (same
   pattern as phase-002 — scaffold the parts under
   `phase-003-docs-and-showcase/`, fill checklist + impl.log +
   evidence, flip frontmatter `status`).

---

## Plan-026 rollup

When phase-002 and phase-003 are both `complete`:

1. **Roll stage-006 to `complete`.**

   ```diff
   - status: in-progress
   + status: complete
   ```

   in `dev-docs/plans/plan-026-ui-v2-design-system/stage-006-regression-cleanup-docs/stage.md`.

2. **Promote any lingering in-progress stages** (003 / 004 / 005)
   to `complete` if all their phases are complete. As of the
   current snapshot:

   - stage-002 phase-002 (`phase-002-existing-primitive-tune`)
     has no scaffolded parts. Decide: either drop the phase
     (delete the stub) or scaffold a no-op
     `part-001-implicit-token-alias-cascade` that records
     "primitives implicitly retuned by the token alias landing
     in stage-006 phase-001" and mark it complete.
   - stage-003 phase-003 part-001 is still `in-progress`. Either
     finish the AppHeader work or, if it's already de-facto
     done, mark complete and drop a note in impl.log.
   - stage-005 phase-001 part-001 (Hub) and phase-003 part-001
     (Settings appearance) are marked complete; promote their
     phases.

3. **Flip plan-026 itself to `complete`.**

   ```diff
   - status: in-progress
   + status: complete
   ```

   in `dev-docs/plans/plan-026-ui-v2-design-system/plan.md`.
   Bump `version` to `1.1.0` (or whatever the next semver step
   is). Set `last_updated` to today.

4. **Update `dev-docs/plans/ACTIVE-PLAN.md`.**

   Move `plan-026-ui-v2-design-system` from the `## Current`
   section into `## Recently completed`. Advance `## Current`
   to whatever the next active plan is (consult
   `dev-docs/plans/MASTER-PLAN.md` if unsure).

5. **Update `dev-docs/plans/MASTER-PLAN.md`.**

   Move plan-026 from the **Active Plans** table to the
   **Completed Plans** table. Include the completion date and a
   one-line outcome summary.

6. **Final commit.**

   ```bash
   git add dev-docs/plans/
   git commit -m "docs(plans): close out plan-026 ui-v2-design-system"
   ```

---

## Checklist (tear-off)

Print or copy this into a scratch doc as you work.

### Phase 002 — Baseline Regen

- [ ] All gates green before regen
- [ ] Inventory snapshot count noted
- [ ] `pnpm exec playwright test tests/visual/` run; failures noted
- [ ] `pnpm exec playwright test tests/visual/ --update-snapshots` exits 0
- [ ] Every regenerated `.png` eyeballed against v2 anatomy
- [ ] Any real regression reverted + fixed at source
- [ ] Re-run without `--update-snapshots` is green
- [ ] Stage-006 phase-002 promoted to `complete` with evidence
- [ ] Baselines committed as isolated commit

### Phase 003 — Docs + Showcase

- [ ] `dev-docs/02-architecture/frontend.md` updated
- [ ] `dev-docs/04-modules/*.md` updated (file-by-file grep clean)
- [ ] `CLAUDE.md` + `AGENTS.md` verified
- [ ] `/styles` showcase rebuilt and visually verified
- [ ] Final gate (including Playwright) green
- [ ] Stage-006 phase-003 promoted to `complete` with evidence

### Plan rollup

- [ ] Stage-006 → `complete`
- [ ] Lingering in-progress stages reconciled
- [ ] `plan.md` → `status: complete`, version + date bumped
- [ ] `ACTIVE-PLAN.md` updated
- [ ] `MASTER-PLAN.md` updated
- [ ] Final commit pushed

When the last box is checked, plan-026 is done.
