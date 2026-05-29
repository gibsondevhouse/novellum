# Mode Keyboard Cycle — 2026-05-28

## Implementation

Handler in `handleKeydown` (NovaComposer.svelte):
- `event.key === '.'` && (`metaKey` || `ctrlKey`) → `novaMode.cycle()`, `event.preventDefault()`
- Cycle order: ask → write → agent → ask

## Test Coverage (`tests/nova/mode-routing.test.ts`)

- `cycles modes in order ask → write → agent → ask` ✓ (unit test on novaMode store)

## Quality Gates

```
pnpm check → 0 errors
pnpm test → 1310 tests passed
```
