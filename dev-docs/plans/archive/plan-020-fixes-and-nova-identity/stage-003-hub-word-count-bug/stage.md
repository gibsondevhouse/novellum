---
title: Hub Word Count Bug
slug: stage-003-hub-word-count-bug
stage_number: 3
status: complete
owner: Backend Agent
plan: plan-020-fixes-and-nova-identity
phases:
  - phase-001-fix-hub-load
  - phase-002-tests
estimated_duration: 0.5d
risk_level: low
---

## Goal

The project hub must display the true word count across all scenes, computed from scene content rather than the stale `wordCount` DB field — which defaults to `0` for all scenes that have never been opened in the editor since migration.

## Context (already in tree — do not duplicate)

- Bug location: `src/routes/projects/[id]/+page.ts` line 11. The reduction reads `s.wordCount ?? 0` from the SQLite field, which defaults to `0`. Autosave (editor) is the only writer of this field. Scenes migrated from Dexie or never opened in the editor will always show 0.
- Correct pattern already used in the editor: `src/modules/editor/+page.svelte` line 287 computes `countWords(scene.content ?? '')` — from `scene.content`, not the stored field.
- Scene content is stored as HTML (ProseMirror output); raw `split(/\s+/)` on HTML will count tag names as words. Must strip tags first.
- `scenes` is already fetched in the load function via `getScenesByProjectId(project.id)`, which returns `content` alongside `wordCount`.

## Exit Criteria

- `src/routes/projects/[id]/+page.ts` computes `currentWordCount` from `scene.content` using HTML-stripped word splitting.
- A project whose scenes have `wordCount = 0` in the DB but non-empty `content` returns the correct count from the load function.
- `pnpm run test -- tests/routes/projects-hub-word-count.test.ts` passes.
- `pnpm run test` — full suite green, no regression.
- `pnpm run lint` — zero boundary violations.
- `pnpm run check` — no TypeScript errors.

## Phases

### Phase-001 — Fix hub load

**Goal:** Replace the `wordCount`-field read in `src/routes/projects/[id]/+page.ts` with a content-based computation that strips HTML before splitting.

**Files:**

- `src/routes/projects/[id]/+page.ts` — the only change required.

**Implementation:**

Replace lines 11 in `+page.ts`:

```ts
// Before
const currentWordCount = scenes.reduce((sum, s) => sum + (s.wordCount ?? 0), 0);
```

```ts
// After — strip HTML tags/entities before word-splitting
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ');
}
const currentWordCount = scenes.reduce((sum, s) => {
  const plain = stripHtml(s.content ?? '').trim();
  return sum + (plain ? plain.split(/\s+/).filter((w) => w.length > 0).length : 0);
}, 0);
```

Place `stripHtml` as a module-level private function directly above the `load` export. Do not export it — it is an implementation detail of this file only.

**Acceptance checklist:**

- [ ] `src/routes/projects/[id]/+page.ts` no longer references `s.wordCount` for the hub total.
- [ ] `stripHtml` is a module-private function (not exported).
- [ ] A scene with `content = '<p>Hello world</p>'` and `wordCount = 0` contributes `2` to the total.
- [ ] A scene with `content = null` and `wordCount = 0` contributes `0` (no crash).
- [ ] `pnpm run check` — TypeScript clean.
- [ ] `pnpm run lint` — zero boundary violations.

### Phase-002 — Tests

**Goal:** Write a Vitest unit test that exercises the hub load function directly, confirming correct word count when scenes have content but `wordCount = 0` in the DB.

**Files:**

- `tests/routes/projects-hub-word-count.test.ts` (new).

**Test strategy:** Mock `getScenesByProjectId` and `apiGet` (the two async calls in the load function). Feed scenes with `wordCount: 0` but real `content`. Assert that `currentWordCount` in the returned data equals the expected word count computed from content.

```ts
// Sketch — implementer fills in imports and mock wiring
vi.mock('$modules/editor/services/scene-repository.js', () => ({
  getScenesByProjectId: vi.fn(),
}));
vi.mock('$lib/api-client.js', () => ({
  apiGet: vi.fn().mockResolvedValue([]),
}));

it('computes word count from content when wordCount field is 0', async () => {
  (getScenesByProjectId as Mock).mockResolvedValue([
    { id: '1', wordCount: 0, content: '<p>Hello world</p>' },
    { id: '2', wordCount: 0, content: '<p>Three more words here</p>' },
  ]);
  // load() requires parent() to return { project: { id: 'proj-1' } }
  const result = await load({ parent: async () => ({ project: { id: 'proj-1' } }) } as any);
  expect(result.currentWordCount).toBe(6); // 2 + 4
});

it('returns 0 for scenes with null content', async () => {
  (getScenesByProjectId as Mock).mockResolvedValue([
    { id: '1', wordCount: 0, content: null },
  ]);
  const result = await load({ parent: async () => ({ project: { id: 'proj-1' } }) } as any);
  expect(result.currentWordCount).toBe(0);
});

it('strips HTML tags before counting', async () => {
  (getScenesByProjectId as Mock).mockResolvedValue([
    { id: '1', wordCount: 0, content: '<p class="lead"><strong>One</strong> two</p>' },
  ]);
  const result = await load({ parent: async () => ({ project: { id: 'proj-1' } }) } as any);
  expect(result.currentWordCount).toBe(2); // "One" + "two", not "p", "strong", etc.
});
```

**Acceptance checklist:**

- [ ] `tests/routes/projects-hub-word-count.test.ts` created with the three cases above (content-based count, null content, HTML stripping).
- [ ] `pnpm run test -- tests/routes/projects-hub-word-count.test.ts` exits 0 with all three tests green.
- [ ] `pnpm run test` — full suite green (846+ tests).
- [ ] `pnpm run lint` — zero boundary violations.

## Out of Scope

- Updating the `Scene.wordCount` DB field on hub load (that would cause a write on every page load; autosave in the editor is the correct owner of that field).
- Changes to the editor's word count logic — it already uses `countWords(scene.content)` correctly.
- Migrating existing `wordCount = 0` rows in SQLite — the hub will now always compute live from content.
