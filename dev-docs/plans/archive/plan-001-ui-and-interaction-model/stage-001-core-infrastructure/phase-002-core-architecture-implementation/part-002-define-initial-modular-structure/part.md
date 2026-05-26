---
title: Define Initial Modular Structure
slug: part-002-define-initial-modular-structure
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-core-architecture-implementation
started_at: 2026-04-12
completed_at: 2026-04-12
estimated_duration: 1d
---

## Objective

Give each module directory a typed `index.ts` barrel export and a `types.ts` stub, establishing the contract that downstream stages will import from. No implementation logic is added here — only the shape of each module's public API.

## Scope

**In scope:**

- `index.ts` barrel export per module (re-exporting from `types.ts`)
- `types.ts` stub per module with placeholder exported types
- `src/lib/index.ts` barrel for shared utilities

**Out of scope:**

- Implementing any UI components or business logic
- Svelte stores (deferred to individual module parts)

## Implementation Steps

1. For each module (`project`, `bible`, `outliner`, `editor`, `ai`):
   - Create `src/modules/<module>/types.ts` with a comment block describing the module and one placeholder exported type
   - Create `src/modules/<module>/index.ts` that re-exports everything from `types.ts`
2. Create `src/lib/index.ts` that re-exports from `src/lib/db/index.ts`
3. Create `src/stores/index.ts` as an empty barrel (placeholder for future stores)
4. Run `pnpm run check` — no errors expected

## Files

**Create:**

- `src/modules/project/types.ts`
- `src/modules/project/index.ts`
- `src/modules/bible/types.ts`
- `src/modules/bible/index.ts`
- `src/modules/outliner/types.ts`
- `src/modules/outliner/index.ts`
- `src/modules/editor/types.ts`
- `src/modules/editor/index.ts`
- `src/modules/ai/types.ts`
- `src/modules/ai/index.ts`
- `src/lib/index.ts`
- `src/stores/index.ts`

## Acceptance Criteria

- [ ] All ten module files (`types.ts` + `index.ts` per module) created
- [ ] Each `types.ts` has at least one named export (even if a placeholder `// TODO` type)
- [ ] `import { db } from '$lib'` resolves correctly (via `src/lib/index.ts`)
- [ ] `pnpm run check` exits with zero errors
- [ ] `pnpm run lint` exits with zero errors

## Edge Cases

- SvelteKit path alias `$lib` maps to `src/lib/` by default in `svelte.config.js` — verify this is configured before creating the lib barrel

## Notes

Placeholder type example for `src/modules/project/types.ts`:

```ts
// Project module public types
// TODO: expand in stage-002

export type ProjectId = number;
```

Keep types minimal — the goal is establishing the import contract, not over-engineering shapes that will change during implementation.
