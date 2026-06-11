---
title: Context Source Design
slug: phase-001-context-source-design
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-route-derived-context
---

## Proposed Design: `activeContext` Store

We will implement a centralized reactive store in `src/lib/stores/active-context.svelte.ts` that consolidates context resolution logic.

### Store Specification

```typescript
import { page } from '$app/state';

class ActiveContextStore {
	/**
	 * Canonical Project ID.
	 * Derived from /projects/[id] route parameter.
	 */
	get projectId(): string | null {
		return page.url.pathname.startsWith('/projects/') ? (page.params.id ?? null) : null;
	}

	/**
	 * Canonical Scene ID.
	 * Derived from ?sceneId query param (override) or [sceneId] route parameter.
	 */
	get sceneId(): string | null {
		return page.url.searchParams.get('sceneId') ?? page.params.sceneId ?? null;
	}

	/**
	 * Canonical Chapter ID.
	 * Derived from ?chapterId query param (override) or [chapterId] route parameter.
	 */
	get chapterId(): string | null {
		return page.url.searchParams.get('chapterId') ?? page.params.chapterId ?? null;
	}
}

export const activeContext = new ActiveContextStore();
```

### Implementation Strategy

1.  **Create Store**: Implement `src/lib/stores/active-context.svelte.ts`.
2.  **Layout Refactor**: Update `src/routes/+layout.svelte` to use `activeContext` for passing props to `NovaPanel`.
3.  **Component Hardening**: Update `NovaPanel` and `NovaComposer` to optionally use the store directly or accept props (for flexibility/testing).
4.  **Legacy Cleanup**: Deprecate `src/lib/stores/active-project.svelte.ts` in favor of `activeContext.projectId`.

## Benefits

- **Consistency**: Nova will now stay grounded when navigating to `/projects/[id]/editor/[sceneId]` without needing `?sceneId=...`.
- **Centralization**: One place to update if route patterns change.
- **Testability**: The store can be tested by mocking `$app/state`.
