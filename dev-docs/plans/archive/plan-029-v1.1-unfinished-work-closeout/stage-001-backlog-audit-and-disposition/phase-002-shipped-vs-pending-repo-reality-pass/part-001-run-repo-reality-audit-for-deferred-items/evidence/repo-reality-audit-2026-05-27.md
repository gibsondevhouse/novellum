# Repo Reality Audit — Deferred Commitments

> Audit date: 2026-05-27
> Method: direct file/grep/test inspection against master branch

---

## plan-019-naming-consistency

### Classification: PARTIALLY SHIPPED (organic evolution)

**Shipped behavior (no plan execution required):**

Route and module directories are now aligned for all major feature areas:

| Route (`projects/[id]/…`) | Module (`src/modules/…`) | Status |
|---------------------------|--------------------------|--------|
| `continuity/` | `continuity/` | aligned |
| `editor/` | `editor/` | aligned |
| `outline/` | `outline/` | aligned |
| `story-bible/` | `story-bible/` | aligned |
| `world-building/` | `world-building/` | aligned |

The original plan-019 pain points are resolved:
- `outliner/` → `outline/` (both route and module use `outline/`)
- `bible/` → `story-bible/` (unified)
- `consistency/` → `continuity/` (unified)

ESLint boundary patterns in `eslint.config.js` reference current module names: `module-outline` (line 68), `module-world-building` (line 72), `module-story-bible` (line 73), `module-continuity` (line 74).

**Remaining gaps (genuine pending work):**

1. **Top-level route/module mismatches**: `books/` route → `reader/` module; `stories/` route → no dedicated module; `nova/` route duplicates module entry point. No formal alignment audit has been done.
2. **No redirect stubs**: plan-019 specified `+page.ts` redirects for old route segments to preserve bookmarks. No redirects exist because old routes were never live under the old names in production.
3. **Component-level naming**: plan-019 stage-005 (component renames) was never executed — component file names inside modules have not been audited against a canonical name map.
4. **Formal canonical name map**: plan-019 stage-001 product (the name map) was never produced or signed off. A draft existed in stage-001 phase-002 part-001 but was never finalized.
5. **Documentation alignment**: plan-019 stage-002 docs pass was never executed. However, many docs were updated by plans 025, 026, 027, 028 and may be current.

**Care-package assumption check:** The care package lists plan-019 as "High confidence — execute canonical route/module/component naming alignment." The repo reality shows the heavy lifting (route/module directory names) was done by later plans. Remaining work is narrower than the original 6-stage scope.

---

## plan-021-reader-pagination

### Classification: SHIPPED

**Evidence:**

| Commitment | File | Status |
|-----------|------|--------|
| Empty state | `src/modules/reader/components/BookReaderView.svelte:125` (`.book-reader__empty` div) | shipped |
| Page margins & typography | `BookPage.svelte`, `BookSpread.svelte`, `ClassicReaderView.svelte` | shipped |
| Pagination engine | `src/modules/reader/reader-pages.ts` — `chunkSceneContent()`, `chunkByCharBudget()`, `chunkByPageBox()` | shipped |
| Page navigation UI | `ReaderModeToolbar.svelte`, `ReaderExperience.svelte`, `ReaderFullscreenShell.svelte` | shipped |
| Reader controller | `src/modules/reader/reader-controller.ts` | shipped |
| Reader store | `src/lib/stores/reader-mode.svelte.ts` | shipped |
| Reader route | `src/routes/books/[id]/+page.svelte`, `+page.ts` | shipped |

**Tests:**
- `tests/reader/reader-pages.test.ts` — pagination logic
- `tests/reader/classic-reader-deep-link.test.ts` — deep link routing
- `tests/reader/default-reader-view.test.ts` — default view
- `tests/visual/__screenshots__/…/reader-empty-state.png` — visual baseline
- `tests/visual/view-in-reader-handoff.test.ts` — handoff flow

**Care-package assumption check:** Matches repo reality. Reader was shipped via plans 027/028 fiction pipeline work.

---

## plan-024 stage-002: Release Engineering

### Classification: PENDING

**Evidence:**

| Task | Expected | Current State |
|------|----------|---------------|
| task-06 smoke installer | Packaged DMG/MSI pass smoke script | `desktop-build.yml` produces unsigned DMG (comment: "Code-signing/notarisation is plan-018 stage-010 work — deferred") |
| task-07 keyring verify | BYOK keys round-trip in packaged shell | Not verified against packaged build |
| task-08 brand icons | Final brand set in `src-tauri/icons/` | Default Tauri icon sizes present (128, 64, 32, Square variants) — no evidence of custom brand artwork |
| task-09 signing certs | Apple Developer ID + Windows Authenticode | `release.yml` has `TAURI_SIGNING_PRIVATE_KEY` only; no Apple/Windows code-signing secrets; no notarization steps |
| task-10 CI tag dry-run | `release.yml` dry-run on throwaway tag | `release.yml` exists with universal-apple-darwin target but no evidence of successful tag-based dry-run |

**Workflows present:** `release.yml`, `desktop-build.yml`, `ci.yml`
**Missing:** Apple notarization, Windows Authenticode, brand icon replacement, formal smoke/keyring verification records.

**Care-package assumption check:** Correctly identified as pending.

---

## plan-024 stage-003: Ollama & Shortcuts Finish

### Classification: SHIPPED

**Ollama provider toggle:**

| Evidence | Location |
|----------|----------|
| Settings → AI tabbed interface | `src/routes/settings/ai/+page.svelte` — openrouter/ollama/lm-studio tabs (lines 20-55) |
| OllamaPanel with activeProvider state | `src/modules/settings/components/OllamaPanel.svelte` — `activeProvider` rune (line 20), `set-active` API call (line 165) |
| Provider resolution | `src/routes/api/ai/+server.ts` |
| Ollama launcher | `src/lib/server/ai/ollama-launcher.ts` |
| Ollama provider | `src/lib/ai/providers/ollama-provider.ts` |
| Tests | `tests/ai/ollama-launcher.test.ts`, `tests/ai/ollama-provider.test.ts` |

**Global shortcut emitters:**

| Evidence | Location |
|----------|----------|
| `save-scene` registered with `Meta+S` default | `src/lib/keyboard/keymap-registry.ts:163-166` |
| `view-in-reader` registered | `src/lib/keyboard/keymap-registry.ts:170` |
| SHORTCUT_EVENT bus | `src/lib/keyboard/global-handler.ts:31` |
| Dispatch handler | `src/lib/keyboard/global-handler.ts:102-103` |
| EditorShell listener | `src/modules/editor/components/EditorShell.svelte:277-281` |
| Root layout installation | `src/routes/+layout.svelte` |
| Tests | `tests/lib/keyboard/keymap-registry.test.ts`, `tests/settings/settings-shortcuts-page.test.ts` |

**Minor gap:** `view-in-reader` does not appear in shortcuts settings page grep results — may not be user-visible in the settings UI.

**Care-package assumption check:** Correctly assumed pending, but repo shows shipped.

---

## plan-024 stage-006: Documentation Re-baseline

### Classification: PARTIALLY PENDING (shipped-with-doc-drift)

| Document | Last Verified | Current? |
|----------|--------------|----------|
| `dev-docs/01-project/roadmap.md` | 2026-05-10 | **stale** — pre-dates plan-027/028 completion |
| `dev-docs/03-ai/agents-map.md` | 2026-05-26 | current |
| `AGENTS.md` | 2026-05-13 | **stale** — pre-dates plans 025-028 |
| `dev-docs/release/beta-program.md` | needs check | likely stale |
| `novellum-docs/user/` | — | 11 pages present: ai-setup, backup-restore, editor, export, faq, install, keyboard-shortcuts, local-first, nova, quick-start, worldbuilding |

The 4 required user-facing pages (Export, AI privacy, Backup & restore, Nova) are covered by existing files. Content currency not verified.

**Care-package assumption check:** Correctly identified as pending. Some docs updated by later plans; remaining gap is date roll-forward and content reconciliation.

---

## Summary Matrix

| Deferred Item | Classification | Remaining Work |
|--------------|---------------|----------------|
| plan-019 (full) | **partially shipped** | Narrow: top-level route/module audit, component name audit, formal name map, docs alignment pass |
| plan-021 (full) | **shipped** | None — retire plan with evidence |
| plan-024 stage-002 | **pending** | Full: signing, notarization, brand icons, smoke/keyring verify, CI dry-run |
| plan-024 stage-003 | **shipped** | Minor: verify view-in-reader in shortcuts settings UI |
| plan-024 stage-006 | **partially pending** | Narrow: roadmap.md, AGENTS.md date roll-forward; beta-program.md review; content reconciliation |
