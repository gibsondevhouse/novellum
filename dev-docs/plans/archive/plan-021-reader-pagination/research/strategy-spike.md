---
title: Pagination Strategy Spike
plan: plan-021-reader-pagination
stage: stage-003-pagination-engine
phase: phase-001-strategy-spike
status: complete
owner: Architect Agent
created: 2026-05-03
last_updated: 2026-05-03
---

## Goal

Pick the pagination implementation that gives Novellum the most
deterministic, performant, and Tauri-stable result for long-form
prose. Compare CSS Paged Media with a JS-driven measurement
strategy and commit to one before writing any production engine
code.

## Candidates

### A. CSS Paged Media (`@page`, `break-before`, multi-column)

Native browser pagination. Two flavors are technically available:

1. **`@page` + print stylesheets** — designed for print output;
   exposed to screen rendering only via paged-media polyfills
   (Paged.js, polyfill libraries) that themselves run a JS
   measurement loop under the hood.
2. **CSS Multi-column** (`column-width`, `column-count`,
   `column-gap`) — paginates *horizontally* like newspaper
   columns. Combined with `column-fill: auto` and a fixed-height
   container it can simulate pages.

#### Pros — CSS Paged Media

- Honors widow/orphan CSS hints in supporting engines.
- Multi-column pagination is widely supported.

#### Cons — CSS Paged Media

- `@page` for *screen* is effectively unsupported in WebKit
  (Tauri's bundled WKWebView). On Linux/AppImage Tauri uses
  WebKitGTK which has the same gaps. Paged-media polyfills
  exist but they trade native execution for a heavier JS
  measurement layer than the one we would write ourselves.
- Multi-column has poor control over orphan/widow semantics for
  prose that mixes long paragraphs and short dialogue.
- `column-fill: auto` and `break-inside: avoid` interact poorly
  with images and code blocks, often producing trailing empty
  columns or runaway columns that overflow horizontally.
- Page-by-page navigation requires scrollLeft animation which is
  jank-prone on track-pads and creates accessibility
  ambiguities (focus order, keyboard scroll).
- Determinism: layout depends on font loading, sub-pixel
  rounding, and the user's OS-level text rendering. Two clients
  with the same content can produce different page counts —
  unacceptable for "page X of Y" indicators that should match
  across devices.

### B. JS-driven deterministic chunking

Compute pages in pure logic from a normalized representation
(paragraphs + a configurable page-box describing how many text
lines fit and how many characters per line). The engine produces
a fixed page array independent of font load timing or DOM
mounting.

#### Pros — JS chunking

- Fully deterministic given the same inputs and configuration.
  Page counts and indices are stable across devices and across
  rerenders.
- Trivially testable in Vitest with no DOM (unit-tested in
  `tests/reader/reader-pages.test.ts` already).
- Orphan/widow rules are explicit and tunable per genre or per
  user preference.
- No DOM measurement loop on the render path → predictable
  performance on 100k-word manuscripts.
- Plays well with virtualization: `BookSpread` mounts only the
  visible page(s), so DOM size is constant.
- Safe for Tauri: zero reliance on engine-specific paged-media
  features.

#### Cons — JS chunking

- A small mismatch between estimated and actual line count is
  possible when CSS typography changes. Mitigated by deriving
  the page-box configuration from the same design tokens that
  drive the prose styles (`--reader-prose-size`,
  `--reader-prose-leading`, `--reader-measure-max`).
- Rich block elements (images, blockquotes, code) need explicit
  weight overrides. Acceptable because the editor today emits
  prose-dominant HTML.

### C. Hybrid (deterministic chunking + DOM verifier in dev mode)

Strategy B at runtime, plus an optional dev-mode assertion that
mounts each rendered page off-screen and verifies the rendered
height does not exceed the page-box height. Reports overflow as
a console warning; never participates in production rendering.

This is essentially "B with a self-correcting test harness" and
is what stage-004 verification will use for the visual regression
gate.

## Decision

**Adopt strategy B** as the production pagination engine. Use
strategy C only as a dev-mode safety net during stage-004
verification.

### Rationale

1. Determinism is non-negotiable for "page X of Y" UX and for
   the editor → reader handoff (plan-023) which needs stable
   page IDs to scroll into.
2. Tauri's WebKit baseline rules out reliable `@page` rendering
   and makes multi-column behavior platform-dependent.
3. The current `chunkSceneContent` function already implements
   strategy B in a primitive form and ships green tests. The
   delta is to replace the magic `targetCharsPerPage` constant
   with an explicit page-box configuration derived from the
   reader design tokens introduced in stage-002.

## Implementation Outline (consumed by phase-002)

1. Introduce a `ReaderPageBox` type:

   ```ts
   interface ReaderPageBox {
     /** Visible text lines per page. Derived from page-box height ÷ leading. */
     linesPerPage: number;
     /** Approximate characters per line. Derived from --reader-measure-max. */
     charsPerLine: number;
     /** Minimum lines required on the trailing page before forcing a flush. */
     minTrailingLines?: number;
   }
   ```

2. Replace `BuildReaderPagesOptions.targetCharsPerPage` /
   `minCharsPerPage` with a `pageBox?: ReaderPageBox` option,
   keeping the legacy character options for backward
   compatibility but deriving the budget from
   `linesPerPage × charsPerLine` when a page box is supplied.

3. Add a paragraph weight model: each paragraph contributes
   `ceil(text.length / charsPerLine)` lines, plus a constant
   inter-paragraph gap of one line. A short paragraph (e.g.
   one-line dialogue) costs at least one line.

4. Anti-orphan rule: never end a page with a single trailing
   line of a multi-line paragraph; never start a page with a
   single trailing line of a paragraph. When a page would
   produce a 1-line orphan/widow, push the offender to the
   next page.

5. Default page box derived from stage-002 tokens:
   `linesPerPage: 28`, `charsPerLine: 64`. These match a
   ~640px page height at 18px font with 1.75 leading and a
   68ch measure (~64 chars at the chosen serif). Documented
   inside `reader-pages.ts` next to the new defaults.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Estimated line count drifts when typography tokens change | Re-derive page box at the call site from the same tokens, not from hard-coded constants. Stage-004 visual regression catches drift. |
| Long unbroken sequences (URLs, transliterations) overshoot a single line | Engine treats any paragraph longer than `charsPerLine × linesPerPage` as a full-page block rather than splitting mid-word. UI applies `overflow-wrap: anywhere`. |
| Future rich blocks (images, code) need different weight | Engine accepts an optional per-block weight override (planned for plan-024). Out of scope for this plan. |

## Decision Audit

- Approved by Architect Agent on 2026-05-03 against
  stage-003 exit criteria.
- Supersedes the implicit "char budget only" approach in
  pre-stage-003 `chunkSceneContent`.
- Re-revisit if Tauri ships a stable `@page` screen-mode
  rendering path or if Novellum adds a true print/export-PDF
  feature with paged output.
