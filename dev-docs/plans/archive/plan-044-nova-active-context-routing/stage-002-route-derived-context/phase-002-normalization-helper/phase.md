---
title: Normalization Helper
slug: phase-002-normalization-helper
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-002-route-derived-context
---

## Implementation: `activeContext` Store

The `activeContext` store has been implemented in `src/lib/stores/active-context.svelte.ts`. It leverages Svelte 5's reactive `$app/state` to derive context parameters.

### Key Logic

```typescript
get sceneId(): string | null {
    // Priority: query param > route param
    return page.url.searchParams.get('sceneId') ?? page.params.sceneId ?? null;
}
```

This ensures that:
1.  Direct route navigation (e.g., `/projects/1/editor/2`) correctly identifies Scene 2.
2.  Deep linking via query params (e.g., `/projects/1/editor?sceneId=3`) correctly identifies Scene 3.

## Quality Gate Checklist

- [x] Helper implemented? Yes.
- [x] Derives from route params? Yes.
- [x] Derives from search params? Yes.
- [x] Reactive via `$app/state`? Yes.
