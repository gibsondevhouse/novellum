---
title: Licensing, Privacy, and Legal
slug: stage-011-licensing-privacy-legal
stage_number: 11
status: complete
owner: Planner Agent
plan: plan-018-v1-product-experience
phases:
  - phase-001-license
  - phase-002-legal-docs
  - phase-003-in-app-surfaces
  - phase-004-app-error
estimated_duration: 3d
risk_level: medium
---

## Goal

Produce the legal, licensing, and privacy artifacts required before a paid V1 release: a proprietary `LICENSE` file, a full EULA/TERMS/PRIVACY/SECURITY/NOTICE document set, in-app surfaces that expose them inside the Settings Trust Center, and a shared `AppError` / `error-map` primitive that replaces raw `Error` throws throughout the Nova and export pipelines.

## Context (already in tree — do not duplicate)

- `src/routes/settings/` — Settings shell created in stage-004; sub-routes `/settings/privacy/+page.svelte` and `/settings/about/+page.svelte` exist but contain placeholder content.
- `src/modules/nova/` — Nova AI assistant module (stage-005); error states currently use raw `Error` throws.
- `src/modules/export/` — Export pipeline (stage-001); raw `Error` throws in driver and assembler services.
- `README.md` — will have the proprietary license badge after stage-009 phase-003; this stage must keep it consistent.
- `package.json` — `"license"` field may be `"UNLICENSED"` or absent; phase-001 establishes the correct posture.
- No `LICENSE`, `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, or `NOTICE.md` exist yet.

## Entry Criteria

- plan-018 stage-004 complete (Settings shell exists; `/settings/privacy` and `/settings/about` routes are renderable).
- plan-018 stage-009 complete (user docs reference licensing and privacy artifacts).
- `pnpm run check` and `pnpm run lint` pass on the current tree (verify before starting).

## Exit Criteria

- `LICENSE` file exists at the repository root — full proprietary text, All Rights Reserved, copyright 2026 Gibson Dev House.
- `README.md` license badge reads `![License](https://img.shields.io/badge/license-Proprietary-red)`.
- `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, `NOTICE.md` exist at the repository root — all contain real content (not stubs); legally-sensitive sections marked with `<!-- LEGAL_REVIEW_REQUIRED: [reason] -->`.
- `NOTICE.md` lists key third-party packages: SvelteKit, Svelte, TipTap, better-sqlite3, Tauri, Vite, pnpm — each with license type.
- `/settings/privacy/+page.svelte` contains real privacy section content mirroring `PRIVACY.md` (data storage, AI prompt routing, no telemetry, no cloud sync, no keys in backups).
- `/settings/about/+page.svelte` shows license type (Proprietary) and links to the new `/settings/legal` route.
- `/settings/legal/+page.svelte` exists — renders EULA text and third-party notices from `NOTICE.md`.
- `src/lib/app-error.ts` exports `AppError` class with `code`, `message`, `userMessage`, `recoverable`, and optional `context` fields.
- `src/lib/error-map.ts` exports `getAppError(code: string): AppError` covering at minimum: `INVALID_KEY`, `RATE_LIMIT`, `CONTEXT_TOO_LARGE`, `NETWORK_ERROR`, `EXPORT_FAILED`, `BACKUP_FAILED`.
- Nova error boundary and export pipeline replace raw `Error` throws with `AppError` instances from `error-map`.
- `tests/lib/app-error.test.ts` passes: constructors, `recoverable` flag, error-map lookup returns correct `userMessage`.
- `pnpm run test` passes including new tests.
- `pnpm run check` clean — no TypeScript errors.
- `pnpm run lint` clean — no boundary violations.

## Phases

### Phase-001 — License file

**Goal:** Create the proprietary `LICENSE` file and ensure the README badge is consistent with it.

**Files:**

- `LICENSE` — new file at repository root.
- `README.md` — add/verify license badge (coordinate with stage-009 phase-003; if stage-009 already added the badge, confirm it is correct and do not duplicate).

**Implementation:**

`LICENSE` content:

```
Copyright 2026 Gibson Dev House. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL

This software and its source code are the exclusive property of Gibson Dev House.
No part of this software may be reproduced, distributed, modified, or transmitted
in any form or by any means without the prior written permission of Gibson Dev House.

RESTRICTED USE

You may use this software only under the terms of a valid license agreement issued
by Gibson Dev House. Unauthorized use, copying, or distribution of this software,
or any portion of it, may result in severe civil and criminal penalties.

NO WARRANTY

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
IN NO EVENT SHALL GIBSON DEV HOUSE BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER
LIABILITY ARISING FROM USE OF THIS SOFTWARE.

For licensing inquiries, contact: legal@gibsondevhouse.com
<!-- LEGAL_REVIEW_REQUIRED: Verify contact address and finalize warranty disclaimer language with counsel. -->
```

`package.json` — set `"license": "SEE LICENSE IN LICENSE"` (the npm convention for proprietary packages). Do not use `"UNLICENSED"` which signals a different intent.

`README.md` — confirm or add the badge line:
```markdown
![License](https://img.shields.io/badge/license-Proprietary-red)
```

**Acceptance checklist:**

- [ ] `LICENSE` file exists at repository root.
- [ ] `LICENSE` contains "All Rights Reserved" and "Copyright 2026 Gibson Dev House".
- [ ] `LICENSE` contains at least one `<!-- LEGAL_REVIEW_REQUIRED: ... -->` marker.
- [ ] `package.json` `"license"` field is `"SEE LICENSE IN LICENSE"`.
- [ ] `README.md` license badge is present and renders the `Proprietary` label.

---

### Phase-002 — Legal document set

**Goal:** Create `EULA.md`, `TERMS.md`, `PRIVACY.md`, `SECURITY.md`, and `NOTICE.md` with real content. Mark legally-sensitive sections for counsel review.

**Files:**

- `EULA.md` — new file.
- `TERMS.md` — new file.
- `PRIVACY.md` — new file.
- `SECURITY.md` — new file.
- `NOTICE.md` — new file.

**Implementation:**

All files use a consistent document header: `# [Title]`, `**Effective Date:** TBD — Subject to legal review`, `<!-- LEGAL_REVIEW_REQUIRED: Effective date and jurisdiction must be set before V1 publication. -->`.

`EULA.md` — End-User License Agreement. Sections: Grant of License (single-device, non-transferable), Restrictions (no reverse engineering, no redistribution), Updates (covered under the purchased license tier — Founder: lifetime 1.x; Standard: all 1.x updates), Termination, Disclaimer of Warranties, Limitation of Liability, Governing Law. Mark the Governing Law and Limitation of Liability sections with `<!-- LEGAL_REVIEW_REQUIRED: ... -->`.

`TERMS.md` — Terms of Service covering: acceptance of terms, permitted use (personal fiction writing), prohibited use (automated scraping, resale), intellectual property (user retains all rights to their manuscript), AI usage (user accepts responsibility for prompts sent to their chosen provider), no warranty for AI output accuracy, dispute resolution. Mark the dispute resolution clause with `<!-- LEGAL_REVIEW_REQUIRED: Arbitration vs. litigation clause — jurisdiction-specific. -->`.

`PRIVACY.md` — Privacy Policy. The following facts must appear verbatim (mirrored in `/settings/privacy`):
1. Your projects are stored locally on your device. Novellum does not upload your manuscripts to any server.
2. Automatic backups are created locally. No backup data leaves your device.
3. Your AI API key is stored locally in your OS configuration. It is never transmitted to Novellum servers.
4. When you use the AI assistant, your prompts and the selected context are sent only to the AI provider you configured (e.g. OpenRouter). Novellum does not receive, log, or store these prompts.
5. Novellum collects no telemetry, crash reports, or usage analytics unless you opt in to a future diagnostics feature (which will be clearly disclosed).
6. There is no cloud sync. Your data does not leave your machine except through your own exports or the AI provider you choose.

Mark the "future diagnostics" clause with `<!-- LEGAL_REVIEW_REQUIRED: Confirm no analytics are currently collected before shipping. -->`.

`SECURITY.md` — Security policy in GitHub standard format. Sections: Supported Versions (V1.x is supported; all prior versions are unsupported), Reporting a Vulnerability (email security@gibsondevhouse.com; expected response within 5 business days; do not file public GitHub issues for security vulnerabilities), Disclosure Policy (coordinated disclosure; CVE requested where applicable). Mark the contact address with `<!-- LEGAL_REVIEW_REQUIRED: Confirm security contact mailbox is monitored before V1. -->`.

`NOTICE.md` — Third-Party Notices. Intro paragraph: "Novellum includes or depends on the following open-source packages. Each is used in compliance with its respective license." Then a table:

| Package | License | Source |
|---|---|---|
| SvelteKit | MIT | https://github.com/sveltejs/kit |
| Svelte | MIT | https://github.com/sveltejs/svelte |
| TipTap | MIT | https://github.com/ueberdosis/tiptap |
| better-sqlite3 | MIT | https://github.com/WiseLibs/better-sqlite3 |
| Tauri | MIT / Apache 2.0 | https://github.com/tauri-apps/tauri |
| Vite | MIT | https://github.com/vitejs/vite |
| pnpm | MIT | https://github.com/pnpm/pnpm |

Add a note: "This list covers key direct dependencies. A full dependency inventory is available in `pnpm-lock.yaml`." Mark with `<!-- LEGAL_REVIEW_REQUIRED: Verify license compatibility for all production deps, not just the key packages listed here. -->`.

**Acceptance checklist:**

- [ ] All five files exist at repository root.
- [ ] Each file has a document header with effective date stub.
- [ ] `PRIVACY.md` contains all six privacy facts verbatim.
- [ ] `NOTICE.md` lists all seven packages in the table with correct license types.
- [ ] Every legally-sensitive section is marked with `<!-- LEGAL_REVIEW_REQUIRED: ... -->`.
- [ ] No file contains `TODO` or `[[` placeholder markers.

---

### Phase-003 — In-app legal surfaces

**Goal:** Replace placeholder content in `/settings/privacy/+page.svelte` and `/settings/about/+page.svelte`. Create `/settings/legal/+page.svelte` rendering EULA text and third-party notices.

**Files:**

- `src/routes/settings/privacy/+page.svelte` — replace placeholder with real privacy content.
- `src/routes/settings/about/+page.svelte` — add license type and link to `/settings/legal`.
- `src/routes/settings/legal/+page.svelte` — new file.
- `src/routes/settings/legal/+layout.svelte` — new file if needed to fit the settings shell.

**Implementation:**

All components use Svelte 5 syntax (`$props()`, `$state`, `$derived`). No legacy Svelte 4 stores. Use only existing `src/lib/components/ui/*` primitives.

`/settings/privacy/+page.svelte` — replace placeholder with six real sections, each as a `<section>` with a heading and paragraph text:
1. Your Manuscripts — projects are stored locally only.
2. Backups — backups are created locally only.
3. AI API Key — stored locally; never sent to Novellum servers.
4. AI Prompts — sent only to your chosen AI provider.
5. No Telemetry — no usage analytics collected.
6. No Cloud Sync — data does not leave your machine.

Mirror the exact privacy facts from `PRIVACY.md`. Add a link: "Read the full [Privacy Policy](/PRIVACY.md)" (links to the raw file; this is sufficient for V1).

`/settings/about/+page.svelte` — add:
- App name: Novellum
- Version: `{APP_VERSION}` (import from `$lib/version.js`)
- License type: Proprietary — All Rights Reserved
- Link: `<a href="/settings/legal">View EULA & Third-Party Notices</a>`
- Copyright: © 2026 Gibson Dev House

`/settings/legal/+page.svelte` — render EULA text and third-party notices. Since the content is static, inline it directly (do not fetch from the filesystem at runtime — that would require a server route). Structure:

```svelte
<script lang="ts">
  // Static legal content — update from EULA.md and NOTICE.md when either changes.
</script>

<article class="legal-document">
  <h1>End-User License Agreement</h1>
  <!-- EULA full text inlined here -->

  <h1>Third-Party Notices</h1>
  <!-- NOTICE.md table inlined here -->
</article>
```

Use the `.legal-document` CSS class scoped to the component for readable document typography (max-width, line-height). Do not add new design tokens — use existing typography tokens.

`/settings/legal/+layout.svelte` — create only if the settings shell requires a layout file for this nested route. If the parent settings layout already applies, skip this file.

**Acceptance checklist:**

- [ ] `/settings/privacy/+page.svelte` renders six real privacy sections with headings.
- [ ] `/settings/about/+page.svelte` renders `APP_VERSION`, license type, and a link to `/settings/legal`.
- [ ] `/settings/legal/+page.svelte` renders EULA text and third-party notices (no blank sections).
- [ ] All three files use Svelte 5 syntax — no `export let`, no `writable()`.
- [ ] `pnpm run check` clean after changes.
- [ ] `pnpm run lint` clean — no boundary violations.

---

### Phase-004 — AppError and error map

**Goal:** Create `AppError` and `error-map` primitives. Replace raw `Error` throws in the Nova error boundary and export pipeline with typed `AppError` instances.

**Files:**

- `src/lib/app-error.ts` — new file.
- `src/lib/error-map.ts` — new file.
- `src/modules/nova/` — update error-throw sites (identify via `grep 'throw new Error' src/modules/nova/`).
- `src/modules/export/services/` — update error-throw sites (identify via `grep 'throw new Error' src/modules/export/`).
- `tests/lib/app-error.test.ts` — new test file.

**Implementation:**

`src/lib/app-error.ts`:

```ts
export class AppError extends Error {
  readonly code: string;
  readonly userMessage: string;
  readonly recoverable: boolean;
  readonly context?: unknown;

  constructor(opts: {
    code: string;
    message: string;
    userMessage: string;
    recoverable: boolean;
    context?: unknown;
  }) {
    super(opts.message);
    this.name = 'AppError';
    this.code = opts.code;
    this.userMessage = opts.userMessage;
    this.recoverable = opts.recoverable;
    this.context = opts.context;
  }
}
```

`src/lib/error-map.ts`:

```ts
import { AppError } from './app-error.js';

const ERROR_MAP: Record<string, Omit<ConstructorParameters<typeof AppError>[0], 'code'>> = {
  INVALID_KEY: {
    message: 'The provided API key is invalid or has been revoked.',
    userMessage: 'Your AI key doesn\'t seem to be working. Please check Settings → AI and re-enter your OpenRouter key.',
    recoverable: true,
  },
  RATE_LIMIT: {
    message: 'The AI provider rate limit has been exceeded.',
    userMessage: 'The AI is busy right now. Please wait a moment and try again.',
    recoverable: true,
  },
  CONTEXT_TOO_LARGE: {
    message: 'The assembled context exceeds the model\'s context window.',
    userMessage: 'The selected context is too large for this AI model. Try reducing the context scope in Nova.',
    recoverable: true,
  },
  NETWORK_ERROR: {
    message: 'A network request to the AI provider failed.',
    userMessage: 'Couldn\'t reach the AI provider. Check your internet connection and try again.',
    recoverable: true,
  },
  EXPORT_FAILED: {
    message: 'Manuscript export failed during compilation or driver execution.',
    userMessage: 'Export failed. Your manuscript was not modified. Please try again or choose a different format.',
    recoverable: true,
  },
  BACKUP_FAILED: {
    message: 'Backup archive creation failed.',
    userMessage: 'Backup failed. Your project data is safe, but no backup file was created. Check available disk space.',
    recoverable: true,
  },
};

export function getAppError(code: string, context?: unknown): AppError {
  const template = ERROR_MAP[code];
  if (!template) {
    return new AppError({
      code: 'UNKNOWN',
      message: `Unknown error code: ${code}`,
      userMessage: 'An unexpected error occurred. Please try again.',
      recoverable: false,
      context,
    });
  }
  return new AppError({ code, ...template, context });
}
```

**Nova and export updates:** Search for `throw new Error(` in `src/modules/nova/` and `src/modules/export/services/`. For each site:
- If the error maps to one of the six codes above, replace with `throw getAppError('CODE', { originalError: e })`.
- If it does not map (e.g. "Project not found" in the assembler), replace with `throw new AppError({ code: 'NOT_FOUND', message: ..., userMessage: 'The project could not be found.', recoverable: false })`.
- Do not change catch sites in UI components in this phase — only the throw sites in services.

`tests/lib/app-error.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { AppError } from '$lib/app-error.js';
import { getAppError } from '$lib/error-map.js';

describe('AppError', () => {
  it('constructs with all required fields', () => {
    const err = new AppError({
      code: 'TEST',
      message: 'internal message',
      userMessage: 'user-facing message',
      recoverable: true,
    });
    expect(err.code).toBe('TEST');
    expect(err.message).toBe('internal message');
    expect(err.userMessage).toBe('user-facing message');
    expect(err.recoverable).toBe(true);
    expect(err.name).toBe('AppError');
  });

  it('is an instance of Error', () => {
    const err = new AppError({ code: 'X', message: 'x', userMessage: 'x', recoverable: false });
    expect(err).toBeInstanceOf(Error);
  });

  it('recoverable flag is false for non-recoverable errors', () => {
    const err = new AppError({ code: 'FATAL', message: 'fatal', userMessage: 'fatal', recoverable: false });
    expect(err.recoverable).toBe(false);
  });
});

describe('getAppError', () => {
  it('returns correct userMessage for INVALID_KEY', () => {
    const err = getAppError('INVALID_KEY');
    expect(err.code).toBe('INVALID_KEY');
    expect(err.userMessage).toContain('OpenRouter key');
    expect(err.recoverable).toBe(true);
  });

  it('returns correct userMessage for EXPORT_FAILED', () => {
    const err = getAppError('EXPORT_FAILED');
    expect(err.code).toBe('EXPORT_FAILED');
    expect(err.userMessage).toContain('format');
  });

  it('returns an UNKNOWN error for unrecognised codes', () => {
    const err = getAppError('NOT_A_REAL_CODE');
    expect(err.code).toBe('UNKNOWN');
    expect(err.recoverable).toBe(false);
  });

  it('attaches context when provided', () => {
    const err = getAppError('RATE_LIMIT', { retryAfter: 30 });
    expect(err.context).toEqual({ retryAfter: 30 });
  });
});
```

**Acceptance checklist:**

- [ ] `AppError` is exported from `src/lib/app-error.ts` with `code`, `message`, `userMessage`, `recoverable`, and optional `context`.
- [ ] `getAppError` is exported from `src/lib/error-map.ts` and covers all six error codes.
- [ ] `getAppError('NOT_A_REAL_CODE')` returns an `AppError` with `code: 'UNKNOWN'` and `recoverable: false`.
- [ ] Raw `throw new Error(` in Nova services and export services are replaced with `AppError` throws.
- [ ] All `tests/lib/app-error.test.ts` tests pass.
- [ ] `pnpm run check` clean — no TypeScript errors.
- [ ] `pnpm run lint` clean — `AppError` import in modules must go through `$lib`, not a relative path that crosses boundaries.

## Out of Scope

- UI components for error display (`ErrorNotice.svelte`, `RecoveryAction.svelte`) — deferred to a dedicated UI polish pass.
- Server-side error logging utility (`src/lib/server/errors/logging.ts`) — deferred.
- Update policy page or pricing tiers — documented in `EULA.md` but no dedicated route.
- `GET /api/settings/license` API route — deferred; not required for V1 UI surfaces.
- Translating legal documents — V1 is English only.
- Open-core or source-available licence consideration — licence posture is Proprietary (All Rights Reserved) for V1.

## Notes

- Source: [market-readiness-pt2.md §28, §29, §30, §36](../../research/market-readiness-pt2.md).
- Activation strategy: V1 ships **no activation** or a **lightweight license file**, not heavy DRM (research §28). Decision recorded in evidence.
- Legal copy review (human/lawyer) happens outside the agent loop but is a prerequisite for stage-012 V1 tag.
