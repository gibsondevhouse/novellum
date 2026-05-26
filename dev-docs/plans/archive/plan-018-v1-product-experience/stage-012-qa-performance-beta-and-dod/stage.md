---
title: QA, Performance, Beta, and V1 Definition-of-Done
slug: stage-012-qa-performance-beta-and-dod
stage_number: 12
status: complete
owner: Reviewer Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-e2e-suites
  - phase-002-performance-pass
  - phase-003-v1-dod-checklist
  - phase-004-beta-assets
estimated_duration: 8d
risk_level: high
---

## Goal

Run the V1 release gate: build a focused Playwright e2e suite covering the four critical user journeys (onboarding, project lifecycle, AI key setup, word count), execute a targeted performance pass (DB indexes, lazy loading, debounce), produce the V1 Definition-of-Done checklist, and publish beta program assets. No V1 tag ships unless this stage is fully green.

> **Absorbs.** plan-016 stage-009 phase-001 (Visual Evidence / screenshot matrix) transferred here on 2026-04-28. The full screenshot matrix is recaptured against the post-V1 surfaces as part of the QA gate.

## Context (already in tree — do not duplicate)

- `playwright.config.ts` — no `webServer` block yet; server must be running externally. `testDir: './tests'`; matches `e2e/**/*.spec.ts`. `baseURL: process.env.BASE_URL || 'http://localhost:5173'`. Phase-001 adds the `webServer` config.
- `tests/e2e/arc-hierarchy-flow.spec.ts` — single existing e2e spec; serves as the style reference.
- `src/lib/server/db/schema.ts` — SQLite schema; phase-002 checks for missing indexes on `scenes`.
- `src/modules/export/components/ExportModal.svelte` — currently static import; phase-002 converts to dynamic.
- `dev-docs/qa-docs/` — directory exists with `ui-review.md`; `v1-dod-checklist.md` does not exist yet.
- `CHANGELOG.md` — created in stage-010 phase-004 with the `v1.0.0-beta.1` stub entry.
- `tests/visual/` — Playwright visual tests; `pnpm run test:visual` targets these. Stage-012 e2e tests use `pnpm run test:e2e` (new script) to avoid colliding with the visual suite runner.

## Entry Criteria

- plan-018 stages 001–011 complete (all feature work, legal, and CI pipeline are done).
- `pnpm run test` passes on `master` with no skipped tests.
- `pnpm run build` succeeds.
- `.github/workflows/ci.yml` is green on `master` (stage-010 gate).
- `playwright.config.ts` exists and recognises `tests/e2e/**/*.spec.ts` (already true per `testMatch` config).

## Exit Criteria

- `playwright.config.ts` has a `webServer` block starting `pnpm run preview` on port 4173.
- `package.json` has `"test:e2e": "playwright test tests/e2e/"` script.
- Four e2e spec files exist and pass with `pnpm run test:e2e`:
  - `tests/e2e/onboarding.spec.ts`
  - `tests/e2e/project-lifecycle.spec.ts`
  - `tests/e2e/settings-ai-key.spec.ts`
  - `tests/e2e/hub-word-count.spec.ts`
- `src/lib/server/db/schema.ts` has `idx_scenes_projectId` and `idx_scenes_chapterId` indexes (added with `CREATE INDEX IF NOT EXISTS`).
- `ExportModal` is imported dynamically in the hub layout file.
- `dev-docs/qa-docs/v1-dod-checklist.md` exists with all items as checkboxes.
- `dev-docs/release/beta-program.md` exists.
- `CHANGELOG.md` has a complete `v1.0.0-beta.1` entry (not a stub).
- `pnpm run test` passes including all new Vitest tests.
- `pnpm run check` clean.
- `pnpm run lint` clean.

## Phases

### Phase-001 — E2E suites

**Goal:** Add `webServer` to `playwright.config.ts` and create four Playwright e2e specs covering the core user journeys, written against a production preview build.

**Files:**

- `playwright.config.ts` — add `webServer` block.
- `package.json` — add `test:e2e` script.
- `tests/e2e/onboarding.spec.ts` — new file.
- `tests/e2e/project-lifecycle.spec.ts` — new file.
- `tests/e2e/settings-ai-key.spec.ts` — new file.
- `tests/e2e/hub-word-count.spec.ts` — new file.

**Implementation:**

`playwright.config.ts` — add to `defineConfig`:

```ts
webServer: {
  command: 'pnpm run preview',
  url: 'http://localhost:4173',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
},
```

Also update `use.baseURL` to read `process.env.BASE_URL || 'http://localhost:4173'` so the preview server is the default target (was `5173`).

`package.json` — add script:

```json
"test:e2e": "playwright test tests/e2e/"
```

`tests/e2e/onboarding.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Onboarding flow', () => {
  test('navigates through all steps and ends at /', async ({ page }) => {
    // Force onboarding by clearing the flag if the app supports a reset URL param;
    // otherwise navigate directly to /onboarding.
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/onboarding/);

    // Step through each onboarding step until the final completion action.
    // Use .getByRole or .getByTestId — never hard-code class selectors.
    const continueButton = page.getByRole('button', { name: /continue|next|get started/i });

    // Step through all steps until no more continue buttons or redirect occurs.
    let steps = 0;
    while ((await continueButton.count()) > 0 && steps < 10) {
      await continueButton.click();
      steps++;
      // If redirect happened, break.
      if (!page.url().includes('onboarding')) break;
    }

    // After completing onboarding, should be at root or /projects.
    await expect(page).not.toHaveURL(/onboarding/);
  });
});
```

`tests/e2e/project-lifecycle.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Project lifecycle', () => {
  test('creates a project, opens the editor, and navigates to export', async ({ page }) => {
    await page.goto('/');

    // Create a new project.
    const newProjectButton = page.getByRole('button', { name: /new project/i });
    await newProjectButton.click();

    // Fill in the project title.
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('E2E Test Novel');
    await page.getByRole('button', { name: /create|save/i }).click();

    // Should be in the project hub or editor.
    await expect(page).toHaveURL(/projects\//);

    // Open the editor (navigate to it if in hub).
    const editorLink = page.getByRole('link', { name: /editor|write/i });
    if ((await editorLink.count()) > 0) {
      await editorLink.click();
    }

    // Type into the editor.
    const editorArea = page.locator('[contenteditable="true"]').first();
    await editorArea.click();
    await page.keyboard.type('Once upon a time in a workspace far away.');

    // Autosave indicator should appear (saved / autosaved / check).
    await expect(page.getByText(/saved|autosaved/i).or(page.locator('[data-testid="autosave-status"]'))).toBeVisible({ timeout: 5000 });

    // Navigate to export.
    const exportLink = page.getByRole('button', { name: /export/i }).or(page.getByRole('link', { name: /export/i }));
    await exportLink.click();
    await expect(page.getByRole('dialog').or(page.locator('[data-testid="export-modal"]'))).toBeVisible();
  });
});
```

`tests/e2e/settings-ai-key.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('AI key configuration', () => {
  test('enters a key in Settings → AI and sees the configured state', async ({ page }) => {
    await page.goto('/settings/ai');
    await expect(page).toHaveURL(/settings\/ai/);

    // Find the API key input.
    const keyInput = page.getByLabel(/api key|openrouter/i).or(page.locator('input[type="password"]').first());
    await keyInput.fill('sk-or-test-key-e2e');

    // Save.
    const saveButton = page.getByRole('button', { name: /save|apply/i });
    await saveButton.click();

    // Expect a "configured" or success indicator.
    await expect(
      page.getByText(/configured|saved|key saved/i)
        .or(page.locator('[data-testid="key-status-configured"]'))
    ).toBeVisible({ timeout: 3000 });
  });
});
```

`tests/e2e/hub-word-count.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Hub word count', () => {
  test('shows a word count > 0 after creating a project with content', async ({ page }) => {
    await page.goto('/');

    // Create project.
    await page.getByRole('button', { name: /new project/i }).click();
    await page.getByLabel(/title/i).fill('Word Count Test Novel');
    await page.getByRole('button', { name: /create|save/i }).click();

    // Open editor and add content to a scene.
    const editorLink = page.getByRole('link', { name: /editor|write/i });
    if ((await editorLink.count()) > 0) await editorLink.click();

    const editorArea = page.locator('[contenteditable="true"]').first();
    await editorArea.click();
    await page.keyboard.type('The quick brown fox jumped over the lazy dog. '.repeat(10));
    // Wait for autosave.
    await page.waitForTimeout(2000);

    // Navigate back to the hub.
    await page.goto('/');
    // Find the project card and check word count.
    const projectCard = page.getByText('Word Count Test Novel').locator('..').locator('..');
    const wordCountEl = projectCard.getByText(/\d+\s*(words?|w)/i);
    await expect(wordCountEl).toBeVisible({ timeout: 5000 });

    const text = await wordCountEl.textContent();
    const count = parseInt(text?.match(/\d+/)?.[0] ?? '0', 10);
    expect(count).toBeGreaterThan(0);
  });
});
```

**Acceptance checklist:**

- [ ] `playwright.config.ts` has a `webServer` block pointing to `pnpm run preview` on port 4173.
- [ ] `package.json` has `"test:e2e"` script.
- [ ] All four spec files exist in `tests/e2e/`.
- [ ] Each spec uses `getByRole` or `getByLabel` selectors — no class-name or CSS selectors.
- [ ] Specs do not hardcode credentials or project IDs.
- [ ] `pnpm run build && pnpm run test:e2e` completes without spec failures (or documents known-flaky steps in `impl.log.md`).

---

### Phase-002 — Performance pass

**Goal:** Add missing SQLite indexes on the `scenes` table, convert the `ExportModal` import to dynamic, and verify debounce is used in worldbuilding analysis triggers.

**Files:**

- `src/lib/server/db/schema.ts` — add index definitions.
- The hub layout file that imports `ExportModal` — convert to dynamic import.
- Worldbuilding analysis trigger files (search for `analyzeWorldbuilding` or similar) — verify debounce; add if missing.

**Implementation:**

**DB indexes.** Open `src/lib/server/db/schema.ts`. Search for existing `CREATE INDEX` statements. If `idx_scenes_projectId` is absent, add after the `scenes` table DDL:

```sql
CREATE INDEX IF NOT EXISTS idx_scenes_projectId ON scenes (projectId);
CREATE INDEX IF NOT EXISTS idx_scenes_chapterId ON scenes (chapterId);
```

If a migration system is in use (e.g. versioned `PRAGMA user_version` migrations), add a new migration version with these two `CREATE INDEX IF NOT EXISTS` statements. If the schema is applied fresh on first launch (no incremental migrations), adding to the schema DDL directly is sufficient.

**ExportModal lazy loading.** Find the hub layout or page file that has:

```ts
import ExportModal from '$modules/export/components/ExportModal.svelte';
```

Replace with a dynamic import:

```ts
import { onMount } from 'svelte';
let ExportModal: typeof import('$modules/export/components/ExportModal.svelte')['default'] | undefined;
onMount(async () => {
  const mod = await import('$modules/export/components/ExportModal.svelte');
  ExportModal = mod.default;
});
```

Render the modal conditionally: `{#if ExportModal && showExport}<svelte:component this={ExportModal} .../>{/if}`.

This moves `ExportModal` (and its driver dependencies) out of the initial bundle and into a lazily-loaded chunk.

**Debounce verification.** Search for worldbuilding analysis triggers:

```sh
grep -rn "analyzeWorldbuilding\|worldbuildingAnalysis\|runAnalysis" src/ --include="*.svelte" --include="*.ts"
```

If any trigger fires directly on `$effect` or `on:input` without debounce, wrap it with the project's existing `debounce` utility (or add a 500 ms debounce using `setTimeout` + `clearTimeout` pattern). Document in `impl.log.md` which sites were checked and whether changes were needed.

**Acceptance checklist:**

- [ ] `idx_scenes_projectId` and `idx_scenes_chapterId` are present in the schema (either in DDL or as a migration).
- [ ] `ExportModal` is imported dynamically in the hub layout; no static import remains.
- [ ] Worldbuilding analysis trigger sites were audited; debounce is present or documented as unnecessary.
- [ ] `pnpm run check` clean after changes.
- [ ] `pnpm run lint` clean — dynamic import does not create a boundary violation.

---

### Phase-003 — V1 DoD checklist

**Goal:** Create `dev-docs/qa-docs/v1-dod-checklist.md` — a comprehensive, checkbox-per-item Definition-of-Done document that the Reviewer Agent signs off against before any V1 tag is cut.

**Files:**

- `dev-docs/qa-docs/v1-dod-checklist.md` — new file.

**Implementation:**

The checklist uses GitHub-style checkboxes (`- [ ]`). Every item must be independently verifiable by a human or CI run. Structure:

```markdown
# V1 Definition-of-Done Checklist

> All items must be checked before the `v1.0.0` tag is created.
> Reviewer Agent sign-off required on each category.

## Core Writing (Editor)

- [ ] TipTap editor loads without errors on first open.
- [ ] Typing text in the editor does not produce visible lag on a 5,000-word scene.
- [ ] Autosave fires and the status indicator updates ("Saved") within 3 seconds of stopping typing.
- [ ] Bold, italic, and undo/redo keyboard shortcuts work.
- [ ] Scene word count updates in real time as the user types.
- [ ] Creating a new scene navigates to the empty editor without errors.
- [ ] Deleting a scene prompts for confirmation and removes it from the outline.

## Export

- [ ] All four export profiles render in the `ExportModal` profile selector.
- [ ] Markdown export downloads a valid `.md` file with YAML frontmatter.
- [ ] DOCX export downloads a valid `.docx` file with chapter headings.
- [ ] EPUB export downloads a valid `.epub` file with OPF metadata.
- [ ] `<script>` tags in scene content are escaped in EPUB output.
- [ ] Metadata fields (title, author) pre-fill from the project and are editable.
- [ ] Selecting a subset of chapters produces a partial export.

## AI (Nova)

- [ ] With a valid API key configured, Nova sidebar opens and accepts a prompt.
- [ ] Nova response streams token by token without blocking the editor.
- [ ] Context disclosure shows what data was sent to the AI provider.
- [ ] With no API key, Nova shows a "Configure your AI key" message (no crash).
- [ ] `INVALID_KEY` error surfaces the user-friendly message from `error-map`.
- [ ] `RATE_LIMIT` error surfaces the user-friendly retry message.
- [ ] Nova suggestions are not auto-applied; user must explicitly accept.

## Onboarding

- [ ] Navigating to `/onboarding` completes all steps without errors.
- [ ] After completing onboarding, the first-launch flag is persisted (refreshing does not repeat onboarding).
- [ ] Skipping onboarding (if applicable) lands on the project hub.

## Trust and Data

- [ ] Manual backup (Settings → Backup) creates a `.novellum.zip` in the expected location.
- [ ] Restore from a valid backup imports all projects correctly.
- [ ] Data location is displayed in Settings (user can find their database file).
- [ ] Privacy policy is accessible at `/settings/privacy`.
- [ ] Privacy policy text matches `PRIVACY.md`.

## Legal

- [ ] `LICENSE` file exists at repository root.
- [ ] `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md` exist at repository root.
- [ ] `/settings/legal` route renders EULA and NOTICE content.
- [ ] `/settings/about` shows the correct `APP_VERSION` and a link to `/settings/legal`.
- [ ] `NOTICE.md` lists all seven key third-party packages.

## CI/CD

- [ ] `ci.yml` is green on `master` (check, lint, lint:css, test, build).
- [ ] `release.yml` workflow runs without errors in a dry-run (validate + build jobs).
- [ ] `visual-tests.yml` completes without failures on `master`.
- [ ] `tests/ci/workflow-lint.test.ts` passes.
- [ ] `CHANGELOG.md` has a complete entry for `v1.0.0-beta.1`.

## Performance

- [ ] Hub loads in under 2 seconds on the `large-novel` fixture (100 chapters / 500 scenes).
- [ ] No UI freeze during Markdown or DOCX export of a 100k-word project.
- [ ] `idx_scenes_projectId` and `idx_scenes_chapterId` indexes are present in the schema.
- [ ] `ExportModal` is loaded lazily (not in the initial bundle).

## E2E Suites

- [ ] `tests/e2e/onboarding.spec.ts` passes.
- [ ] `tests/e2e/project-lifecycle.spec.ts` passes.
- [ ] `tests/e2e/settings-ai-key.spec.ts` passes.
- [ ] `tests/e2e/hub-word-count.spec.ts` passes.

---

_Reviewer Agent sign-off:_ `[ ]` All items above are checked. Ready for V1 tag.
```

**Acceptance checklist:**

- [ ] `dev-docs/qa-docs/v1-dod-checklist.md` exists.
- [ ] Document has at least 7 categories with checkboxes.
- [ ] Every item is independently verifiable (no vague "works correctly" entries).
- [ ] A reviewer sign-off line exists at the bottom.
- [ ] No placeholder text (`TODO`, `[[`) in the document.

---

### Phase-004 — Beta assets

**Goal:** Create the beta program document, a feedback structure, and update `CHANGELOG.md` with a complete `v1.0.0-beta.1` entry.

**Files:**

- `dev-docs/release/beta-program.md` — new file.
- `CHANGELOG.md` — replace the stub entry with a complete entry.

**Implementation:**

`dev-docs/release/beta-program.md`:

```markdown
# Novellum V1 Beta Program

## Overview

The Novellum V1 beta is a closed program for fiction writers who want early access in exchange for structured feedback. Beta builds are full-featured; limitations are listed below.

## How to Join

1. Request access via GitHub Issues (label: `beta-request`) or the designated feedback channel.
2. Accepted testers receive a direct download link for the beta installer.
3. Testers agree to the EULA and acknowledge the Beta Tester Addendum.

## Beta Test Flow

Every tester should complete the following in order:

1. **Install** — download and install the macOS `.dmg` or Windows `.msi` build.
2. **Onboarding** — complete the onboarding flow; report any confusing steps.
3. **Write** — create a project, add at least one chapter and three scenes, type 500+ words.
4. **AI** — configure an OpenRouter key; test the Nova sidebar with at least three prompts.
5. **Export** — export the project in at least two formats (e.g. Markdown + DOCX).
6. **Backup & Restore** — trigger a manual backup, then restore it.
7. **Report** — file a GitHub Issue for every bug, friction point, or missing feature.

## Feedback Channels

- **GitHub Issues** — primary channel. Use the `beta-feedback` label.
- **Discussions** — for open-ended questions or feature suggestions.
- Do not share beta builds publicly.

## Known V1 Limitations

- No cloud sync or account system (by design — local-first).
- No Scrivener or Word import.
- Linux build is CI-only; official Linux support is post-V1.
- No mobile or tablet support.
- AI context is limited to scene + adjacent scenes; full-manuscript context is post-V1.
- Worldbuilding cross-linking is read-only in V1 (edit UI is post-V1).
- No collaborative editing.

## Pricing-Readiness Checklist

- [ ] Stripe (or payment processor) account created.
- [ ] Founder license tier defined (lifetime 1.x updates, limited seats).
- [ ] Standard license tier defined (all 1.x updates).
- [ ] License key generation and validation mechanism chosen.
- [ ] Pricing page / landing page published.
- [ ] Purchase flow tested end-to-end.
- [ ] License key storage in Novellum confirmed not to conflict with data privacy policy.
```

`CHANGELOG.md` — replace the stub `v1.0.0-beta.1` entry with the complete entry below (keep the `# Changelog` header and `## All notable changes...` intro line, replace only the stub section):

```markdown
## [1.0.0-beta.1] — 2026-Q2

### Added
- **Export pipeline** — four manuscript profiles (Standard Manuscript, Reader Copy, Ebook Draft, Plain Text Archive) with Markdown, DOCX, and EPUB drivers. Real manuscript metadata (title, author, subtitle, synopsis, copyright, dedication). Per-profile front matter and back matter flags.
- **Writing-first editor** — TipTap-based prose surface with autosave, scene word count, and keyboard shortcuts. No lag on 5,000-word scenes.
- **Project Hub** — trust-first project list with word count, last-modified date, and quick-access backup link.
- **Settings Trust Center** — AI key management (OpenRouter BYOK), privacy disclosure panel, backup schedule controls, About + Legal routes.
- **Nova AI Assistant** — context-scoped AI sidebar powered by your OpenRouter key. Context policy: scene + adjacent scenes. No auto-apply; all suggestions are explicit.
- **Onboarding flow** — first-launch guide with persistent completion flag.
- **Worldbuilding suite** — Personae, Atlas, Archive, Threads, and Chronicles modules with vertical-domain module boundaries.
- **Navigation and design system** — frozen token set, dark theme, accessibility-reviewed components.
- **Documentation** — user docs (`novellum-docs/user/`) and developer docs (`novellum-docs/developer/`).
- **CI/CD pipeline** — PR gate (`ci.yml`), release workflow with macOS/Windows/Linux Tauri builds (`release.yml`), scheduled visual regression workflow, Dependabot.
- **Legal** — `LICENSE` (Proprietary), `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md`.
- **Error primitives** — `AppError` class and `error-map` with six named error codes replacing raw `Error` throws in Nova and export services.
- **AppVersion** — `APP_VERSION` injected at build time; shown in Settings → About.

### Known Issues (Beta)
- Linux `.AppImage` build is CI-produced and not officially supported.
- No Scrivener / Word import.
- AI context window limited to scene + adjacent scenes.
- Worldbuilding cross-link edit UI deferred to post-V1.
```

**Acceptance checklist:**

- [ ] `dev-docs/release/beta-program.md` exists with How to Join, Beta Test Flow, Feedback Channels, Known Limitations, and Pricing-Readiness Checklist sections.
- [ ] Pricing-Readiness Checklist has at least 6 checkbox items.
- [ ] `CHANGELOG.md` `v1.0.0-beta.1` entry is complete — lists all major feature additions, not a stub.
- [ ] `CHANGELOG.md` has a Known Issues section for beta.
- [ ] `dev-docs/release/` directory is created (create it if it does not exist; `CHANGELOG.md` lives at root, not here).

## Out of Scope

- Formal load testing or memory profiling beyond the index and debounce checks in phase-002.
- Automated beta distribution or Tauri updater wiring (requires signing keys provisioned in stage-010).
- Bug-fix cycles — defects found during beta are tracked as GitHub Issues and addressed in patch releases, not in this stage.
- V1 acceptance demo execution — the DoD checklist is the gate; no separate demo ceremony is required.
- Creating `tests/fixtures/large-novel.json` (the 100k-word fixture) — deferred; e2e specs are scoped to what the preview build can exercise without a pre-seeded fixture.
  - Beta success criteria met:
    - ≥ 80% install without help.
    - ≥ 80% create a project.
    - ≥ 80% understand BYOK after onboarding.
    - ≥ 80% can export.
    - ≥ 80% can create a backup.
    - **Zero manuscript-loss bugs.**
    - **Zero credential leaks.**
- V1 Definition-of-Done checklist (research §40) signed off by Reviewer.
- V1 acceptance demo (research §43) executed end-to-end on a clean machine: install → onboard → create novel → write 2k words → AI assist → close → reopen → export DOCX → backup → delete project → restore → confirm credential exclusion in backup.

## Notes

- Source: [market-readiness-pt2.md §34, §35, §38, §39, §40, §43](../../research/market-readiness-pt2.md).
- Pricing readiness (research §39) is informational here; pricing/positioning is finalized outside the agent loop.
- Public website / sales page (research §37) is out of scope for this plan; if the website lives in this repo it can be added in a follow-up plan.
- This stage is the final gate. No V1 tag ships if any acceptance criterion above is unmet.
