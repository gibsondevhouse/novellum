---
phase: phase-002-legal
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-05-10 13:10] Agent: Claude Code (acting as Stylist)

**Action:** Created `/settings/legal` route, wired it into the settings
PillNav, and added an "EULA & third-party notices" link to the about
page. Sourced legal content from the canonical `EULA.md` and
`NOTICE.md` at the repo root via Vite `?raw` imports — no inline
duplication.

**Files:**
- *Created:* `src/routes/settings/legal/+page.svelte` (75 LOC).
- *Updated:* `src/routes/settings/+layout.svelte` (+1 PillNav entry).
- *Updated:* `src/routes/settings/about/+page.svelte` (+1 detail row,
  +5 LOC of `.about__link` style; one `word-wrap` → `overflow-wrap`
  deprecation fix in the legal page on the second pass).

**Verification:**
- `pnpm check` (worktree): `COMPLETED 1598 FILES 0 ERRORS 0 WARNINGS
  0 FILES_WITH_PROBLEMS`.
- `pnpm build` (worktree): `✓ built in 3.34s`. Build artifact at
  `.svelte-kit/output/server/entries/pages/settings/legal/_page.svelte.js`
  (7202 bytes); `awk` against the artifact confirmed both
  `var EULA_default = "# End User License Agreement (EULA)\n…"` and
  `var NOTICE_default = "# Third-Party Notices\n…"` are inlined as
  string literals — `?raw` resolved at build time, no runtime FS
  dependency.
- `pnpm check:tokens` (worktree): `✓ Token enforcement: 312 files
  scanned, 0 violations.`
- `npx stylelint <three changed files>` exit 0 after the
  `overflow-wrap` fix.
- `npx eslint <three changed files>` exit 0.

**Result:** F1 (`/settings/legal` route exists) and F2 (`/settings/about`
links to it) are closed. The legal page renders both documents from
the canonical root files; future edits to `EULA.md` or `NOTICE.md`
will appear in the page on next build with no separate sync step.

**Notes:**
- Decision rejected: inline duplication (the existing pattern at
  `/settings/privacy`). Reason: the privacy duplicate has already
  drifted from `PRIVACY.md` (F6 in the triage); reproducing the
  pattern for legal would re-introduce the same risk. The `?raw`
  approach is structurally drift-proof.
- Pre-existing gate noise (`.claude/worktrees/` causing eslint
  parser-resolution and vitest discovery failures, plus 2 unrelated
  hue-degree stylelint errors at `SceneCompassPanel.svelte:334,478`)
  is unchanged by this phase. Tracked under stage-001 follow-up.
- DoD checklist (`v1-dod-checklist.md`) line items checked: see
  `evidence/legal-2026-05-10.md`.

---

## [2026-05-10 13:30] Agent: Claude Code (acting as Stylist)

**Action:** Updated `tests/settings/settings-layout.test.ts` to
reflect the eleventh PillNav entry added by this phase. The original
test asserted exactly 10 pills in a fixed order; adding 'Legal'
caused 1 test failure ("renders all ten category pills in order")
that was caught by a full `pnpm test` run after the gate-cleanup
exclusions made vitest visibility honest.

**Result:**
- Renamed the test to "renders all eleven category pills in order".
- Added `'Legal'` to the labels array.
- Added `['/settings/legal', 'Legal']` to the `it.each` table so the
  active-pill assertion covers the new tab.
- Targeted `npx vitest run tests/settings/settings-layout.test.ts`:
  **15 passed (15)**.

**Notes:**
- This regression would have been masked indefinitely by the
  pre-existing `.claude/worktrees/` test pollution (the failing
  signal would have been buried in the 7 worktree-derived failures).
  Doing the gate cleanup first surfaced it immediately. Lesson
  for future phases: any UI surface change that adds/removes a
  fixture-asserted element will need a paired test update.

---

## [2026-05-26 12:00] Agent: Reviewer Agent (GitHub Copilot)

**Reviewer sign-off.** Walked the checklist + evidence + linked
source files for this phase. All implementation and post-impl
boxes are checked, the evidence file cites DoD line items by
identifier, and the test counts in the log match the current
suite size on master. Phase status flipped `review` → `complete`.

**No outstanding actions.** Documented limitations / follow-ups
in the phase's `evidence/notes-*.md` (where present) are
explicitly post-V1 and do not block closeout.

---
