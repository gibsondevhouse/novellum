# Svelte 5 Runes Production Best Practices

This instruction file defines the standard for all Svelte 5 component and reactivity logic within Novellum. Agents must adhere to these rules to ensure production-level quality and maintainability.

## 1. Core Reactivity (Runes)
- **`$state`**: Use exclusively for data that triggers UI updates. Do not use for static data.
- **`$derived`**: Use for values that compute from other state. This is cached. **Rule:** Never use `$effect` to synchronize or derive state. Always use `$derived`.
- **`$effect`**: Treat as an escape hatch. Only use for external side effects (e.g., direct DOM manipulation, third-party library initialization, analytics).
- **`$props`**: Destructure props directly. **Rule:** Do NOT use `export let`.
  ```ts
  let { name, age, value = $bindable() } = $props();
  ```

## 2. Universal Reactivity & Architecture
- Move complex domain logic and shared state out of `.svelte` files and into classes inside `.svelte.ts` files. This replaces the older Svelte Store paradigm and improves testability.
  ```typescript
  // Example: counter.svelte.ts
  export class Counter {
    count = $state(0);
    double = $derived(this.count * 2);
    increment() { this.count++; }
  }
  ```

## 3. Snippets over Slots
- Replace all legacy `<slot />` usages with `{#snippet}` and `{@render}`. Snippets are more flexible, performant, and can be passed as props.

## 4. Event Handlers
- Use standard HTML attributes for events: `onclick={fn}` instead of the legacy `on:click={fn}`. Svelte 5 uses event delegation under the hood for performance.

## 5. Performance Gotchas
- **Fine-Grained Updates:** Svelte 5 updates DOM nodes directly based on proxy tracking. If an effect only needs one property of an object, use a `$derived` for that property first to avoid over-triggering the effect.
- **Avoid Object Destructuring in Markup:** Destructuring reactive objects in the template breaks reactivity bindings. Access properties directly (`object.property`).
