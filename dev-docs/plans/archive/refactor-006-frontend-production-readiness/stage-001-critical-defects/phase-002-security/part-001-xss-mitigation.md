---
title: DOMPurify XSS Mitigation
slug: part-001-xss-mitigation
part_number: 1
status: complete
owner: frontend
assigned_to: frontend
phase: phase-002-security
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Wrap every `{@html ...}` usage in the codebase with `DOMPurify.sanitize()` to prevent XSS injection through AI-generated markdown or any other untrusted HTML string.

## Scope

**In scope:**

- Installing `isomorphic-dompurify` as a production dependency
- Updating `src/lib/ai/markdown.ts` to export a `safeHtml(raw: string): string` wrapper that chains `parseMarkdown` → `DOMPurify.sanitize`
- Replacing the direct `{@html parseMarkdown(...)}` call in `src/modules/ai/components/ChatInterface.svelte` with `{@html safeHtml(...)}`
- Grepping all `.svelte` files for additional `{@html` usages and applying the same wrapper
- Adding unit tests to `tests/ai/markdown.test.ts` for XSS vector stripping

**Out of scope:**

- Content Security Policy (CSP) header configuration (server-side concern)
- Sanitising non-HTML data inputs (handled by form validation separately)

## Implementation Steps

1. Install `isomorphic-dompurify`: `pnpm add isomorphic-dompurify` and `pnpm add -D @types/dompurify`.
2. In `src/lib/ai/markdown.ts`, add:

    ```ts

   import DOMPurify from 'isomorphic-dompurify';
   export function safeHtml(raw: string): string {
     return DOMPurify.sanitize(parseMarkdown(raw));
   }
   ```

3. In `src/modules/ai/components/ChatInterface.svelte`, replace `{@html parseMarkdown(message.content)}` with `{@html safeHtml(message.content)}`.
4. Run `grep -rn "{@html" src/` — for every match that is not already wrapped, apply `safeHtml()` or appropriate sanitisation.
5. In `tests/ai/markdown.test.ts`, add test cases:
   - Input `<script>alert(1)</script>` → output contains no `<script>` tag.
   - Input `<img src=x onerror=alert(1)>` → output strips `onerror` attribute.
   - Input `<a href="javascript:void(0)">` → `href` is removed or `javascript:` is stripped.
6. Run `pnpm run test` and confirm new tests pass.
7. Run `pnpm run lint && pnpm run check`.

## Files

**Update:**

- `src/lib/ai/markdown.ts`
- `src/modules/ai/components/ChatInterface.svelte`
- `tests/ai/markdown.test.ts`
- Any additional `.svelte` file with a bare `{@html}` usage

## Acceptance Criteria

- [ ] `grep -rn "{@html" src/` shows every match uses `safeHtml()` or equivalent DOMPurify wrapper.
- [ ] XSS vector unit tests pass: `<script>`, `onerror=`, and `javascript:` inputs are sanitised.
- [ ] `pnpm audit` shows no new high/critical vulnerabilities from added deps.
- [ ] `pnpm run lint && pnpm run check && pnpm run test` all exit 0.

## Edge Cases

- DOMPurify requires a DOM environment. On the server (SSR), `isomorphic-dompurify` provides a JSDOM fallback. Verify SSR rendering still works after the change.
- If `parseMarkdown` already escapes HTML entities before DOMPurify runs, double-escaping may corrupt the output — test with `&amp;` in the input and confirm it renders as `&`.

## Notes

The `eslint` rule `svelte/no-at-html-tags` may currently be suppressed with `<!-- svelte-ignore -->`. After this change, the suppression comment can be removed if DOMPurify is considered sufficient mitigation. Confirm the team's policy on this with the reviewer.
