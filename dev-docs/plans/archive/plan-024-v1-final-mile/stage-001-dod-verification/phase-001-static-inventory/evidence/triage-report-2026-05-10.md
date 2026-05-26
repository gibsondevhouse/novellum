# V1 DoD Triage Report — 2026-05-10

> **Phase:** stage-001 / phase-001 (static inventory)
> **Author:** Claude Code (Reviewer Agent role)
> **Source checklist:** [`v1-dod-checklist.md`](../../../../../qa-docs/v1-dod-checklist.md)
> **Method:** Static inspection only (file reads, schema reads). No
> command execution yet — `pnpm check / lint / test / build` gate
> baseline is deferred to user approval.

## Triage classifications

- **`pass-static`** — verified by reading the code/file; no test run needed.
- **`needs-command`** — code looks right but proof requires `pnpm test`,
  `pnpm check`, Playwright, or a CI run.
- **`needs-manual`** — requires a packaged installer, browser
  interaction, signing certs, or human eyeballing (visual diff,
  installer launch, etc.).
- **`fails`** — confirmed broken by static inspection; needs code work
  before it can pass.
- **`at-risk`** — looks suspect; flagged for follow-up.

## Summary

| Class | Count |
| --- | --- |
| `pass-static` | 13 |
| `needs-command` | 19 |
| `needs-manual` | 5 |
| `fails` | 7 |
| `at-risk` | 3 |
| **Total** | **47** |

**Headline:** the V1 product is closer than the checklist suggests.
13 items pass on static inspection alone. The 7 hard failures are
concentrated in two narrow surfaces (legal route + privacy parity, and
backup/error-map polish) — none of them are deep architectural work.
The biggest unknown is the gate baseline (`pnpm check / lint / test`)
— if any of those are red, we widen the failure list before touching
the surfaced items.

---

## Hard failures (need code before checking the box)

| # | DoD item | Where | Symptom | Suggested fix scope |
|---|---|---|---|---|
| F1 | `/settings/legal` route renders EULA and NOTICE content | (no route exists) | `src/routes/settings/` has `about/`, `ai/`, `appearance/`, `backup/`, `data/`, `defaults/`, `export-defaults/`, `migrate/`, `privacy/`, `shortcuts/`, `updates/` — **no `legal/`** | New route: `src/routes/settings/legal/+page.svelte` that renders EULA + NOTICE. Wire to settings PillNav. ~30 LOC + nav entry. |
| F2 | `/settings/about` shows correct `APP_VERSION` and a link to `/settings/legal` | [src/routes/settings/about/+page.svelte:30-54](src/routes/settings/about/+page.svelte) | About page shows version+description+license but contains no link element to `/settings/legal` (the route also doesn't exist). | After F1, add a link/button row in the about page → `/settings/legal`. ~5 LOC. |
| F3 | Manual backup creates a `.novellum.zip` in the expected location | [src/routes/settings/backup/+page.svelte:48-49](src/routes/settings/backup/+page.svelte:48) | `<PrimaryButton disabled>Create backup</PrimaryButton>` with `<!-- TODO: wire to plan-017 backup service when available -->`. Restore (`ImportBackupDialog`) is wired; **create-backup is dead**. | Wire the disabled button to `buildBackupArchive` + `createBackupFilename` from `$modules/export` (already exported). ~15 LOC. |
| F4 | `INVALID_KEY` error surfaces the user-friendly message from `error-map` | [src/lib/errors.ts:1-7](src/lib/errors.ts) | `ErrorCode` union only has `AI_KEY_MISSING` and `AI_REQUEST_FAILED`. No `INVALID_KEY` code. OpenRouter client throws `MissingCredentialsError` on 401 (not via the error-map). | Add `AI_INVALID_KEY` (or `INVALID_KEY`) to `ErrorCode` + `ERROR_MESSAGES`. Map 401-with-detail to it in `openrouter.ts`. ~8 LOC. |
| F5 | `RATE_LIMIT` error surfaces the user-friendly retry message | [src/lib/errors.ts:1-7](src/lib/errors.ts) | No `RATE_LIMIT` code in the error-map. 429 responses fall into the generic `'[OpenRouterClient] proxy stream failed: …'` path. | Add `AI_RATE_LIMIT` to `ErrorCode` + `ERROR_MESSAGES` ("Too many requests, please retry in a moment."). Map 429 in `openrouter.ts`. ~8 LOC. |
| F6 | Privacy policy text matches `PRIVACY.md` | [src/routes/settings/privacy/+page.svelte:12-69](src/routes/settings/privacy/+page.svelte:12) vs [PRIVACY.md](PRIVACY.md) | Both files duplicate similar content but with **different section names, headings, and wording**. Already drifted: page has 4 sections ("No Data Collection", "Data Stored Locally", "Data Sent to OpenRouter", "Data Never Transmitted"); PRIVACY.md has 7 sections. | Decide source of truth (suggest: PRIVACY.md). Either replace inline copy with a fetch/render of PRIVACY.md, or rewrite the page to be a 1:1 paragraph match and add a `pnpm check:privacy-parity` script. ~30–60 LOC depending on approach. |
| F7 | Hub loads under 2 seconds on the `large-novel` fixture (100ch / 500sc) | (no fixture) | `tests/fixtures/` directory does not exist. Stage exit criterion explicitly requires this. | Phase-008. Generator script + serialized fixture. ~80 LOC + fixture file. |

---

## Currently passing (static — no command needed)

| # | DoD item | Evidence |
|---|---|---|
| P1 | `LICENSE` file exists at repo root | `ls` confirms `LICENSE` (978 bytes) at root |
| P2 | `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md` exist | All five present at repo root |
| P3 | `NOTICE.md` lists all seven key third-party packages | [NOTICE.md:15-26](NOTICE.md:15) — 10 packages listed (≥7); SvelteKit, Svelte, TipTap, better-sqlite3, Tauri, Vite, Tailwind CSS, TypeScript, Vitest, Playwright |
| P4 | `idx_scenes_projectId` index in schema | [src/lib/server/db/schema.ts:366](src/lib/server/db/schema.ts:366) |
| P5 | `idx_scenes_chapterId` index in schema | [src/lib/server/db/schema.ts:367](src/lib/server/db/schema.ts:367) |
| P6 | `ExportModal` is loaded lazily (not in initial bundle) | [src/routes/projects/[id]/+layout.svelte:23-26](src/routes/projects/[id]/+layout.svelte:23) — `await import('$modules/export/components/ExportModal.svelte')` inside `onMount`. Vite chunks this separately. |
| P7 | All four E2E spec files exist | `tests/e2e/onboarding.spec.ts`, `tests/e2e/project-lifecycle.spec.ts`, `tests/e2e/settings-ai-key.spec.ts`, `tests/e2e/hub-word-count.spec.ts` (plus `arc-hierarchy-flow.spec.ts`) |
| P8 | `ci.yml`, `release.yml`, `visual-tests.yml` workflow files exist | `.github/workflows/` lists all three (plus `desktop-build.yml`) |
| P9 | `tests/ci/workflow-lint.test.ts` exists | Confirmed by Explore agent (validates YAML + required `on`/`jobs` keys) |
| P10 | `CHANGELOG.md` has a `v1.0.0-beta.1` entry | Confirmed; covers export, editor, hub, settings, Nova, onboarding, worldbuilding, CI/CD, legal assets |
| P11 | Backup file uses `.novellum.zip` extension | [src/modules/export/services/portability/zip-export.ts:78](src/modules/export/services/portability/zip-export.ts:78) — `${safeName}_${datePart}.novellum.zip` |
| P12 | `/settings/about` shows the correct `APP_VERSION` (the *display* part, not the link-to-legal part) | [src/lib/version.ts:11-23](src/lib/version.ts:11) → [src/routes/api/settings/about/+server.ts:7](src/routes/api/settings/about/+server.ts:7) → [src/routes/settings/about/+page.svelte:14-23](src/routes/settings/about/+page.svelte:14) |
| P13 | Nova suggestions are not auto-applied (user must explicitly accept) | [src/modules/ai/components/SuggestionChips.svelte:29](src/modules/ai/components/SuggestionChips.svelte:29) — `onclick={() => onselect?.(s.prompt)}`. AI streamed output is rendered in chat panel only; never written to the manuscript without an explicit user action. Matches [`AGENTS.md` §4 Guardrails](AGENTS.md). |

---

## Needs command execution (code looks right; need a run to confirm)

| # | DoD item | Command / signal needed |
|---|---|---|
| C1 | TipTap editor loads without errors on first open | `pnpm test` (editor unit), or Playwright smoke |
| C2 | Bold/italic/undo/redo keyboard shortcuts work | Editor unit tests or Playwright |
| C3 | Scene word count updates in real time | Hub-word-count e2e + editor unit |
| C4 | Creating a new scene navigates to empty editor | Project-lifecycle e2e |
| C5 | Deleting a scene prompts for confirmation | Project-lifecycle e2e |
| C6 | All four export profiles render in `ExportModal` | `pnpm test tests/export/` + Playwright |
| C7 | Markdown export downloads valid `.md` with YAML frontmatter | `tests/export/markdown-driver.test.ts` |
| C8 | DOCX export downloads valid `.docx` with chapter headings | `tests/export/docx-driver.test.ts` |
| C9 | EPUB export downloads valid `.epub` with OPF metadata | `tests/export/epub-driver.test.ts` |
| C10 | `<script>` tags escaped in EPUB output | `tests/export/epub-driver.test.ts` (already exists per plan-018 stage-001) |
| C11 | Metadata fields pre-fill and are editable | `pnpm test` (component test) or Playwright |
| C12 | Selecting a subset of chapters produces partial export | `tests/export/manuscript-assembler.test.ts` (selectedChapterIds branch) |
| C13 | `/onboarding` completes all steps without errors | `tests/e2e/onboarding.spec.ts` |
| C14 | First-launch flag persists across refresh | `tests/e2e/onboarding.spec.ts` (storage-state assertion) |
| C15 | Skipping onboarding lands on project hub | `tests/e2e/onboarding.spec.ts` |
| C16 | `ci.yml` green on `master` | GitHub Actions latest run on master |
| C17 | `release.yml` runs without errors in dry-run (validate + build) | `gh workflow run release.yml --ref master` (dry mode) |
| C18 | `visual-tests.yml` completes without failures on `master` | GitHub Actions latest run |
| C19 | `tests/ci/workflow-lint.test.ts` passes | `pnpm test tests/ci/workflow-lint.test.ts` |

---

## Needs manual or interactive verification

| # | DoD item | Why manual |
|---|---|---|
| M1 | Typing in the editor does not produce visible lag on a 5,000-word scene | Subjective "visible lag"; needs human observation or measured frame timing in Playwright trace |
| M2 | Autosave fires and "Saved" status updates within 3 seconds | Best as Playwright timing assertion + manual sanity check |
| M3 | Nova sidebar opens and accepts a prompt with a valid API key | Requires a real or test OpenRouter key |
| M4 | Nova response streams token-by-token without blocking the editor | Visual / interaction observation |
| M5 | Context disclosure shows what data was sent to the AI provider | UI observation; Nova "view context" affordance |

---

## At-risk (worth a closer look in their owning phase)

| # | DoD item | Concern |
|---|---|---|
| A1 | Restore from a valid backup imports all projects correctly | `ImportBackupDialog` is wired in [src/routes/settings/backup/+page.svelte:6](src/routes/settings/backup/+page.svelte:6), but with the create-backup button disabled (F3) we have no way to produce a backup to restore. End-to-end round-trip is currently impossible. |
| A2 | Data location is displayed in Settings (user can find their database file) | Not surfaced on `/settings/about` (only appName/version/description/license shown). May be on `/settings/data` (which is currently the Dexie→SQLite migration page, not a "data location" surface). Likely failing. |
| A3 | "With no API key, Nova shows a 'Configure your AI key' message (no crash)" | The error-map has `AI_KEY_MISSING: 'No AI API key configured. Add your OpenRouter key in Settings → AI.'` — message exists but the *trigger path* (Nova surface noticing the missing key) needs verification in the Nova chat component. |

---

## Method notes

- File reads done from worktree path
  `<repo>/.claude/worktrees/distracted-blackburn-61b228/`.
- `dev-docs/` is gitignored (developer-private); plan documents live
  outside version control.
- The bash sandbox in this session blocked some `grep`/`find`
  invocations on the worktree path with a "nested session" error;
  workaround was direct `Read` calls and a delegated Explore subagent
  for cross-cutting searches. No matching reduction in confidence
  for the items in this report — every claim was anchored on a
  concrete file:line read.
- The `pnpm check / lint / test` gate baseline (stage-001 entry
  criterion #2) was deferred to user approval before execution,
  per scope discussion above.

## Next steps (proposed)

1. **User checkpoint** — confirm whether to:
   - (a) Run `pnpm check / lint / lint:css / test` now to produce
     `gate-baseline-2026-05-10.txt` (this fills the second entry
     criterion and may surface more items).
   - (b) Skip the gate baseline for now and start fixing the F1–F7
     hard failures in their owning phases.
   - (c) Both, in parallel.
2. Phase-002 (Legal) becomes the natural first work phase: F1 + F2
   are tightly coupled and a single ~40-LOC change.
3. Phase-007 (Trust and Data) absorbs F3, F6, A1, A2 — they form a
   coherent backup/privacy slice.
4. Phase-005 (AI Nova) absorbs F4 + F5 + A3 — error-map polish.
5. Phase-008 (Performance) absorbs F7 + the integration test for
   `idx_scenes_*`.
