# Implementation Snippets

These are intentionally small and must be adapted to actual repo types/functions. Do not paste blindly if names do not exist.

## SvelteKit Legacy Route Redirect

```ts
// src/routes/<legacy-route>/+page.ts
import { redirect } from '@sveltejs/kit';

export function load() {
	throw redirect(308, '/<canonical-route>');
}
```

## Reader Page Index Runes Pattern

```svelte
<script lang="ts">
	type ReaderPage = {
		index: number;
		html: string;
	};

	let {
		pages = []
	}: {
		pages: ReaderPage[];
	} = $props();

	let pageIndex = $state(0);

	const pageCount = $derived(pages.length);
	const hasPages = $derived(pageCount > 0);
	const currentPage = $derived(hasPages ? pages[pageIndex] : null);
	const canGoPrevious = $derived(pageIndex > 0);
	const canGoNext = $derived(pageIndex < pageCount - 1);

	function goPrevious() {
		if (!canGoPrevious) return;
		pageIndex -= 1;
	}

	function goNext() {
		if (!canGoNext) return;
		pageIndex += 1;
	}

	$effect(() => {
		if (pageIndex >= pageCount) {
			pageIndex = Math.max(0, pageCount - 1);
		}
	});
</script>
```

## Reader Empty State Branch

```svelte
{#if !hasPages}
	<section class="reader-empty-state" aria-label="Empty reader">
		<p>No readable pages are available for this book yet.</p>
	</section>
{:else}
	<!-- Existing reader page rendering stays here. -->
{/if}
```

## Shortcut Editable-Target Guard

```ts
function shouldIgnoreShortcutTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;

	const tagName = target.tagName.toLowerCase();

	return (
		tagName === 'input' ||
		tagName === 'textarea' ||
		tagName === 'select' ||
		target.isContentEditable
	);
}
```

## Shortcut Conflict Detection Shape

```ts
type ShortcutBinding = {
	id: string;
	key: string;
	modifiers: string[];
};

export function findShortcutConflict(
	next: ShortcutBinding,
	existing: ShortcutBinding[]
): ShortcutBinding | null {
	return (
		existing.find((binding) => {
			if (binding.id === next.id) return false;
			if (binding.key !== next.key) return false;
			if (binding.modifiers.length !== next.modifiers.length) return false;

			return binding.modifiers.every((modifier) => next.modifiers.includes(modifier));
		}) ?? null
	);
}
```

## Final Disposition Table

```md
| Plan/stage | Final disposition | Evidence | Notes |
|---|---|---|---|
| plan-019-naming-consistency | completed / retired / superseded | <links> | <reason> |
| plan-021-reader-pagination | completed / retired / superseded | <links> | <reason> |
| plan-024 stage-002 release engineering | completed / retired / superseded | <links> | <reason> |
| plan-024 stage-003 Ollama + shortcuts finish | completed / retired / superseded | <links> | <reason> |
| plan-024 stage-006 docs rebaseline | completed / retired / superseded | <links> | <reason> |
```
