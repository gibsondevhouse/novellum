# Stage-003 Implementation Log — Defaults Category

Status: complete
Owner: Architect Agent
Date: 2026-05-03

## Decision Log

### 1. Redirect lives in `+page.server.ts` (not `+page.ts`)

The Default Home Page redirect is implemented in a new `src/routes/+page.server.ts`. The existing universal `src/routes/+page.ts` is **untouched**. Two reasons:

- The client-side `src/lib/preferences.ts` short-circuits to the default during SSR (`isBrowser()` guard returns the fallback). Running the redirect in a universal `load` would always force the `'library'` branch on first paint.
- A server-only loader is the only place where (a) the synchronous server preferences service can be called and (b) the SQLite `db` handle can be queried — both required to resolve the `'last-project'` branch deterministically.

The server file imports `getPreference` from `$lib/server/preferences/preferences-service.js` (synchronous, not the async client helper) and `db` from `$lib/server/db/index.js`. SvelteKit guarantees `+page.server.ts` only runs server-side, so no resolver-loop risk.

### 2. `'last-read'` reuses the existing `app.readerMode` payload — no new key

The `'last-read'` branch reads `app.readerMode` (the same key `reader-mode.svelte.ts` already persists to) and pulls `lastBookId` out of the existing `{ mode, lastBookId, pageIndex }` shape. No new pref key was added for the last-read book id. Type guard: `typeof remote.lastBookId === 'string' && remote.lastBookId.length > 0`. Empty/missing values fall through to `{}` (no redirect, lands on Library).

### 3. AI Model UI primitive: disabled radiogroup pill (not `<select>`)

Used the same `role="radiogroup"` + `<button role="radio" aria-checked>` primitive as the other three subsections, with `disabled={onlyOneModel}` on the single pill and a `<p class="picker__caption">More models coming soon.</p>` beneath the group.

Rationale:

- Visual consistency with the three sibling pickers — all four subsections share one primitive, which is the architectural intent of the stage-002 picker pattern.
- A `<select>` would be the only form control on the page and would feel structurally out of place beside the three pill rows. It also forces a different focus / interaction model (native dropdown) that conflicts with the radiogroup vocabulary the rest of the panel teaches.
- `disabled` on the button is honoured by jsdom and real browsers: clicks are no-ops, `aria-disabled` is implied via the disabled state, and the pill still reads the active model id (it remains `aria-checked="true"` since `getSelectedModel()` returns the only available id). When `AVAILABLE_MODELS` grows beyond one entry, the section becomes interactive automatically with no markup changes.

The setter delegates to the existing `setSelectedModel()` exported by `src/lib/stores/model-selection.svelte.js`. **No new pref key** — the existing `app.selectedModel` is the canonical default. `model-selection.svelte.ts` was not modified (it already exported `setSelectedModel`, `getSelectedModel`, and `AVAILABLE_MODELS`).

### 4. Dev-only logging removed in favor of silent fallbacks

The spec describes optional `dev`-gated `console.warn` for resolution failures. Implementation drops the logging entirely because:

- `$app/environment` is not aliased in `vitest.config.ts` and would have required either a new mock file or an inline `vi.mock` per test (Vite resolves the import during transform, before `vi.mock` factories run).
- The catches are silent by intent — best-effort, fall-back-to-library is the spec's contract. Logging adds no user-facing value and complicates the test surface.

If dev-only logging becomes useful later, it can be added with a `tests/__mocks__/app-environment.ts` shim and a vitest alias entry; this is a deliberate non-change, not an oversight.

### 5. Quality gates and final test counts

| Gate | Result | Notes |
| --- | --- | --- |
| `pnpm run lint` | ✅ 0 errors, 1 warning | Single pre-existing warning in `tests/nova/chat-service.test.ts` (unrelated). Boundaries clean. |
| `pnpm run check` | ✅ 0 errors, 0 warnings | Down from 3 pre-existing errors at end of stage-002 — stage-003 itself introduces zero. |
| `pnpm run test` | ✅ 782/782 (was 755 pre-stage; +27 new — 8 store + 10 redirect + 9 page) | |
| `pnpm run test:visual` | ✅ 21/21 | `settings-shell.png` baseline frames `/settings/appearance` (unchanged); no Defaults baseline regenerated, no new visual test added — matches spec. |

## Deviations from Spec

- **Spec says**: log resolution failures via `console.warn` when `dev` is true. **Implementation**: silent catches, `$app/environment` import dropped. Rationale in Decision 4.
- **Spec mentions** "labelled `<select>` (or pill list)" as alternatives for the AI Model picker. **Implementation**: pill list (disabled radiogroup). Rationale in Decision 3.
- All other deliverables match the spec verbatim.

## Deliverables

### Created

- `src/lib/stores/defaults.svelte.ts` — singleton store, `hydrate()` / `getDefault*()` / `setDefault*()` for home page, reader view, project type. SSR-safe; idempotent hydrate; concurrent-call deduplication via in-flight promise.
- `src/routes/+page.server.ts` — server load that reads `app.defaults.homePage` from the synchronous server preferences service and conditionally throws `redirect(307, ...)`. `try/catch` blocks scope to I/O calls only; redirects throw outside the catches.
- `tests/settings/defaults-store.test.ts` — 8 unit tests (defaults, hydrate, idempotency, concurrent dedup, all three setters).
- `tests/settings/default-home-page.test.ts` — 10 unit tests covering the full branch matrix (library / last-read resolvable / last-read missing / last-read no payload / last-read throw / last-project resolvable / last-project no row / last-project throw / undefined pref / malformed pref).
- `tests/settings/defaults-page.test.ts` — 9 component tests covering subsection structure, default-checked state, click-to-persist for each of the three writable pickers, the disabled-single-option AI model state, the disabled pill not invoking `setSelectedModel`, and a no-emoji guard on pill labels.

### Modified

- `src/routes/settings/defaults/+page.svelte` — replaced the stage-001 placeholder body with four picker subsections following the stage-002 primitive pattern. Hydrates `defaults` on mount; reads `selectedModel` via `getSelectedModel()` from `model-selection.svelte.js` and refreshes after `setSelectedModel`.

### Untouched (per spec)

- `src/lib/stores/model-selection.svelte.ts` — already exported `setSelectedModel`; no edits.
- `src/lib/stores/reader-mode.svelte.ts` — `lastBookId` is read from the existing `app.readerMode` payload server-side without modifying the store.
- `src/routes/+page.ts`, `+page.svelte` — untouched.
- `src/modules/settings/services/themeService.ts`, `ThemeSelector.svelte` — untouched.
