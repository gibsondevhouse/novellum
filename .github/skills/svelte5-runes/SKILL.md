# Skill: Svelte 5 Runes

**Description:** Provides expertise and strict guidelines for implementing and managing reactive state using Svelte 5 Runes. This skill is critical for frontend tasks to ensure compliance with the `runes: true` compiler enforcement in the project.

**Capabilities:**

- Implementing local component state using `$state` and `$state.raw`.
- Creating derived state using `$derived` and `$derived.by`.
- Managing side effects securely using `$effect`, `$effect.pre`, and `$effect.tracking`.
- Identifying and refactoring legacy Svelte 3/4 reactivity (e.g., `$:`, `export let`, `writable` stores) to Svelte 5 equivalents.
- Passing state safely through props and event callbacks.

**Usage:** Agents must activate this skill whenever modifying `.svelte` files or creating new components/shared state to ensure modern, correct reactive patterns are used without violating Svelte 5 constraints.