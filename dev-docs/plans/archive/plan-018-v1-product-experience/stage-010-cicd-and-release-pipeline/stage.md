---
title: CI/CD and Release Pipeline
slug: stage-010-cicd-and-release-pipeline
stage_number: 10
status: complete
owner: Backend Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-ci-workflow
  - phase-002-release-workflow
  - phase-003-visual-tests-workflow
  - phase-004-version-tooling
  - phase-005-dependabot
estimated_duration: 4d
risk_level: medium
---

## Goal

Stand up a complete CI/CD and release pipeline: upgrade the existing PR gate, create a `workflow_dispatch` release workflow that builds and signs Tauri installers for macOS/Windows/Linux, add a scheduled visual-regression workflow, establish a canonical version source consumed across the app, and enable Dependabot for supply-chain hygiene.

## Context (already in tree — do not duplicate)

- `.github/workflows/ci.yml` — existing PR gate: checkout, pnpm 9, Node **20**, install, check, lint, lint:css, token enforcement, test, build. **Node version is upgraded to 22 in phase-001.**
- `.github/workflows/desktop-build.yml` — unsigned desktop build triggered by `desktop-v*` tags; matrix: `macos-14` + `windows-latest`; uses `dtolnay/rust-toolchain@stable`. Provides the matrix shape to replicate in phase-002.
- `vite.config.ts` — no `define` block yet. Phase-004 adds `PACKAGE_VERSION` injection.
- `package.json` — `version: "0.0.1"`. Scripts include `version:sync`, `fetch:node`, `desktop:build`, `tauri`.
- `scripts/sync-tauri-version.mjs` — syncs `package.json` version into `src-tauri/tauri.conf.json`.
- `playwright.config.ts` — reads `process.env.BASE_URL || 'http://localhost:5173'`; no `webServer` block; runs `tests/visual/**` and `tests/e2e/**`.
- No `CHANGELOG.md` exists yet.
- No `.github/dependabot.yml` exists yet.

## Entry Criteria

- plan-017 stage-008 complete (`desktop-build.yml` produces installer artifacts without errors).
- plan-018 stages 001–005 complete (export, editor, hub, settings, and AI test suites exist and pass).
- `pnpm run test` passes on `master`.
- `pnpm run build` succeeds on `master`.

## Exit Criteria

- `.github/workflows/ci.yml` updated: Node 22, pnpm store cache step added; all ten gates present.
- `.github/workflows/release.yml` created: `workflow_dispatch` with `version` input; `validate` → `build` (macOS/Windows/Linux matrix) → `release` job chain; `TAURI_PRIVATE_KEY` + `TAURI_KEY_PASSWORD` referenced as secrets; release draft created.
- `.github/workflows/visual-tests.yml` created: triggers on push to `master` and weekly schedule; starts preview server, runs `pnpm run test:visual`, uploads Playwright report on failure.
- `.github/dependabot.yml` created: `npm` and `github-actions` ecosystems, weekly cadence, reviewer `gibsondevhouse`.
- `src/lib/version.ts` exports `APP_VERSION: string` (injected at build time).
- `vite.config.ts` has `define: { 'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version) }`.
- `scripts/generate-changelog.mjs` reads `git log` since last tag and outputs a Markdown entry.
- `package.json` has `"changelog": "node scripts/generate-changelog.mjs"` script.
- `CHANGELOG.md` exists with a `v1.0.0-beta.1` stub entry.
- `tests/ci/workflow-lint.test.ts` — uses `js-yaml` to parse all three new workflow files; passes with `pnpm run test`.
- `tests/ci/version.test.ts` — asserts `APP_VERSION` is a non-empty string; passes with `pnpm run test`.
- `pnpm run check` clean after `vite.config.ts` changes.
- `pnpm run lint` clean on all new/modified files.

## Phases

### Phase-001 — CI workflow update

**Goal:** Upgrade the existing `ci.yml` to Node 22, add a pnpm store cache step, and verify all gates are present in the correct order.

**Files:**

- `.github/workflows/ci.yml` — upgrade Node version; add cache step.

**Implementation:**

Change `node-version: 20` to `node-version: 22`.

Insert a pnpm store cache step between `pnpm/action-setup@v4` and `actions/setup-node@v4`:

```yaml
      - name: Get pnpm store directory
        id: pnpm-cache
        run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
```

Verify the final step order is:
1. `actions/checkout@v4`
2. `pnpm/action-setup@v4` (version: 9)
3. Get pnpm store directory
4. Setup pnpm cache
5. `actions/setup-node@v4` (node-version: 22, cache: pnpm)
6. `pnpm install --frozen-lockfile`
7. `pnpm run check`
8. `pnpm run lint`
9. `pnpm run lint:css`
10. `pnpm run check:tokens`
11. `pnpm run test`
12. `pnpm run build`

No other structural changes to `ci.yml`.

**Acceptance checklist:**

- [ ] `node-version` is `22` in `ci.yml`.
- [ ] pnpm store cache step (get directory + `actions/cache@v4`) is inserted before `setup-node`.
- [ ] All twelve job steps are present in the order listed above.
- [ ] YAML is valid (verified by `tests/ci/workflow-lint.test.ts`).

---

### Phase-002 — Release workflow

**Goal:** Create `.github/workflows/release.yml` — a `workflow_dispatch`-triggered workflow that runs all CI gates, then builds signed Tauri installers for macOS/Windows/Linux, creates a GitHub release draft, and attaches artifacts.

**Files:**

- `.github/workflows/release.yml` — new file.

**Implementation:**

```yaml
# Required repository secrets:
#   TAURI_PRIVATE_KEY  — base64-encoded Tauri updater private key
#   TAURI_KEY_PASSWORD — passphrase for TAURI_PRIVATE_KEY
# Generate keys: pnpm tauri signer generate
# Signing docs: https://tauri.app/distribute/updater/#signing

name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g. 1.0.0 or 1.0.0-beta.1)'
        required: true
        type: string

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run check
      - run: pnpm run lint
      - run: pnpm run lint:css
      - run: pnpm run test
      - run: pnpm run build

  build:
    needs: validate
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: macos-14
            target: aarch64-apple-darwin
            artifact_glob: 'src-tauri/target/release/bundle/dmg/*.dmg'
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            artifact_glob: 'src-tauri/target/release/bundle/msi/*.msi'
          - os: ubuntu-22.04
            target: x86_64-unknown-linux-gnu
            artifact_glob: 'src-tauri/target/release/bundle/appimage/*.AppImage'
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}
      - name: Cache cargo
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            src-tauri/target
          key: ${{ runner.os }}-cargo-${{ hashFiles('src-tauri/Cargo.lock') }}
      - name: Install Linux system dependencies
        if: runner.os == 'Linux'
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev \
            libayatana-appindicator3-dev librsvg2-dev
      - run: pnpm install --frozen-lockfile
      - run: pnpm run version:sync
      - name: Fetch bundled Node runtime
        run: pnpm run fetch:node
        env:
          TARGET_TRIPLES: ${{ matrix.target }}
      - run: pnpm run build
      - name: Build desktop installer
        run: pnpm tauri build --target ${{ matrix.target }}
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
      - uses: actions/upload-artifact@v4
        with:
          name: novellum-${{ matrix.target }}-${{ github.event.inputs.version }}
          path: ${{ matrix.artifact_glob }}
          if-no-files-found: error

  release:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: release-artifacts/
      - name: Extract CHANGELOG entry
        id: changelog
        run: |
          awk '/^## \[${{ github.event.inputs.version }}\]/{found=1; next} found && /^## \[/{exit} found{print}' CHANGELOG.md > release-notes.txt
          echo "RELEASE_NOTES<<EOF" >> $GITHUB_OUTPUT
          cat release-notes.txt >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
      - name: Create GitHub release draft
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ github.event.inputs.version }}
          name: Novellum v${{ github.event.inputs.version }}
          body: ${{ steps.changelog.outputs.RELEASE_NOTES }}
          draft: true
          files: release-artifacts/**/*
```

**Acceptance checklist:**

- [ ] `workflow_dispatch` with `version` input (required string) is defined.
- [ ] `validate` job runs all CI gates (check, lint, lint:css, test, build) before `build`.
- [ ] `build` matrix includes macOS (`aarch64-apple-darwin`), Windows (`x86_64-pc-windows-msvc`), and Linux (`x86_64-unknown-linux-gnu`).
- [ ] `TAURI_PRIVATE_KEY` and `TAURI_KEY_PASSWORD` are referenced as `secrets.*` — no hardcoded values.
- [ ] `release` job creates a draft (`draft: true`) — not a published release.
- [ ] Signing key comment block is present at the top of the file.
- [ ] YAML is valid (verified by `tests/ci/workflow-lint.test.ts`).

---

### Phase-003 — Visual tests workflow

**Goal:** Create `.github/workflows/visual-tests.yml` — runs `pnpm run test:visual` on push to `master` and weekly, uploading the Playwright report on failure.

**Files:**

- `.github/workflows/visual-tests.yml` — new file.

**Implementation:**

```yaml
name: Visual Tests

on:
  push:
    branches: [master]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday at 06:00 UTC

jobs:
  visual:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium
      - name: Build app
        run: pnpm run build
      - name: Start preview server
        run: pnpm run preview &
      - name: Wait for server
        run: npx wait-on http://localhost:4173 --timeout 60000
      - name: Run visual tests
        run: pnpm run test:visual
        env:
          BASE_URL: http://localhost:4173
      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ github.run_id }}
          path: tests/visual/playwright-report/
          retention-days: 7
```

Note: `playwright.config.ts` already reads `process.env.BASE_URL || 'http://localhost:5173'`, so `BASE_URL=http://localhost:4173` correctly targets the preview server. No changes to `playwright.config.ts` are needed in this phase.

**Acceptance checklist:**

- [ ] Workflow triggers on `push` to `master` and weekly `schedule`.
- [ ] Chromium browser is installed via `playwright install --with-deps chromium` before tests run.
- [ ] Preview server is started and `wait-on` confirms port 4173 before test run.
- [ ] Playwright report is uploaded as an artifact only on failure.
- [ ] YAML is valid (verified by `tests/ci/workflow-lint.test.ts`).

---

### Phase-004 — Version tooling

**Goal:** Create a canonical `APP_VERSION` export injected at build time by Vite, a changelog generation script, and the initial `CHANGELOG.md`. Add test coverage for both.

**Files:**

- `src/lib/version.ts` — new file.
- `vite.config.ts` — add `define` block.
- `scripts/generate-changelog.mjs` — new file.
- `package.json` — add `changelog` script.
- `CHANGELOG.md` — new file.
- `tests/ci/version.test.ts` — new test.
- `tests/ci/workflow-lint.test.ts` — new test.

**Implementation:**

`src/lib/version.ts`:

```ts
// APP_VERSION is injected at build time by Vite via the define block in vite.config.ts.
// In dev mode, Vite replaces the reference at bundle time; the fallback '0.0.0-dev'
// is a safety net for environments where the define block is absent.
export const APP_VERSION: string =
  (import.meta.env.PACKAGE_VERSION as string | undefined) ?? '0.0.0-dev';
```

`vite.config.ts` — add `define` to `defineConfig`. Import `readFileSync` at the top of the file and read `package.json` before the config object:

```ts
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

export default defineConfig({
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
  },
  // ...existing plugins, ssr, build config unchanged...
});
```

`scripts/generate-changelog.mjs`:

```js
#!/usr/bin/env node
/**
 * Usage: node scripts/generate-changelog.mjs [version]
 * Reads git log since the last tag and prints a CHANGELOG.md entry to stdout.
 */
import { execSync } from 'child_process';

const version = process.argv[2] ?? 'UNRELEASED';

const since = (() => {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
})();

const range = since ? `${since}..HEAD` : 'HEAD';
const log = execSync(`git log ${range} --oneline --no-decorate`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => `- ${line}`)
  .join('\n');

const date = new Date().toISOString().slice(0, 10);
const entry = `## [${version}] — ${date}\n\n${log || '- No changes logged.'}\n`;

process.stdout.write(entry);
```

`package.json` — add to `scripts`:

```json
"changelog": "node scripts/generate-changelog.mjs"
```

`CHANGELOG.md`:

```markdown
# Changelog

All notable changes to Novellum are documented here.

## [1.0.0-beta.1] — TBD

### Added
- Export pipeline: four manuscript profiles (Standard Manuscript, Reader Copy, Ebook Draft, Plain Text Archive) with Markdown, DOCX, and EPUB drivers.
- Writing-first editor with autosave, scene word count, and TipTap prose surface.
- Project Hub with trust indicators, backup access, and per-project word count.
- Settings Trust Center: AI key management, privacy disclosures, backup schedule.
- Nova AI Assistant (V1 context policy: scene + adjacent scenes).
- Onboarding flow with first-launch flag persistence.
- Worldbuilding suite: Personae, Atlas, Archive, Threads, and Chronicles modules.
- Navigation shell and design system token freeze.
- Documentation tracks: user docs and developer docs.
- CI/CD pipeline: PR gate, release workflow, visual regression workflow.
- Licensing, privacy, and legal artifacts (LICENSE, EULA, PRIVACY, TERMS, NOTICE).
```

`tests/ci/version.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('APP_VERSION', () => {
  it('is a non-empty string', async () => {
    const { APP_VERSION } = await import('$lib/version.js');
    expect(typeof APP_VERSION).toBe('string');
    expect(APP_VERSION.length).toBeGreaterThan(0);
  });
});
```

`tests/ci/workflow-lint.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

const WORKFLOWS = [
  '.github/workflows/ci.yml',
  '.github/workflows/release.yml',
  '.github/workflows/visual-tests.yml',
];

describe('GitHub Actions workflow YAML validity', () => {
  for (const filePath of WORKFLOWS) {
    it(`parses without error: ${filePath}`, () => {
      const content = readFileSync(filePath, 'utf-8');
      expect(() => load(content)).not.toThrow();
      const parsed = load(content) as { on: unknown; jobs: unknown };
      expect(parsed).toHaveProperty('on');
      expect(parsed).toHaveProperty('jobs');
    });
  }
});
```

Note: `js-yaml` is already a transitive dependency of several dev tools; if not resolvable, add it as `devDependencies`: `pnpm add -D js-yaml @types/js-yaml`.

**Acceptance checklist:**

- [ ] `src/lib/version.ts` exports `APP_VERSION` as `string` with `'0.0.0-dev'` fallback.
- [ ] `vite.config.ts` has `define: { 'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version) }`.
- [ ] `pnpm run check` clean after `vite.config.ts` changes.
- [ ] `scripts/generate-changelog.mjs` outputs a valid Markdown block when run (`node scripts/generate-changelog.mjs 1.0.0-test`).
- [ ] `pnpm run changelog` is listed in `package.json` `scripts`.
- [ ] `CHANGELOG.md` exists with at least the `[1.0.0-beta.1]` entry.
- [ ] `tests/ci/version.test.ts` passes with `pnpm run test`.
- [ ] `tests/ci/workflow-lint.test.ts` passes for all three workflow files.

---

### Phase-005 — Dependabot

**Goal:** Create `.github/dependabot.yml` to enable weekly automated dependency PRs for npm packages and GitHub Actions, with `gibsondevhouse` as reviewer.

**Files:**

- `.github/dependabot.yml` — new file.

**Implementation:**

```yaml
version: 2

updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: '06:00'
      timezone: America/New_York
    reviewers:
      - gibsondevhouse
    labels:
      - dependencies
    open-pull-requests-limit: 5
    ignore:
      # Deliberate: major version bumps require a conscious upgrade decision.
      - dependency-name: '*'
        update-types: ['version-update:semver-major']

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: '06:00'
      timezone: America/New_York
    reviewers:
      - gibsondevhouse
    labels:
      - dependencies
      - github-actions
```

**Acceptance checklist:**

- [ ] `.github/dependabot.yml` exists.
- [ ] Both `npm` and `github-actions` ecosystems are configured.
- [ ] Reviewer `gibsondevhouse` is set on both entries.
- [ ] Major version updates are ignored (no surprise breaking upgrades).
- [ ] YAML is valid (`js-yaml` parses without error).

## Out of Scope

- Code-signing key provisioning (provisioned outside this plan; the workflow references secrets that must be seeded manually).
- macOS notarization via Apple Developer Program (deferred post-V1).
- Automated semantic versioning or conventional-commits enforcement.
- Multi-environment (staging) deployments — no staging environment at V1.
- Docker or container builds.
- Adding `test:backup`, `test:migration`, or `test:export` npm scripts (deferred; stage-012 may add them if suites are created).
