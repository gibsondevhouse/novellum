# Persist Last Mode Per Project — 2026-05-28

## File Created

`src/modules/nova/stores/nova-mode.svelte.ts`

## Test Coverage (`tests/nova/mode-routing.test.ts`)

- `defaults to ask when no persisted value exists` ✓
- `restores the persisted mode for the same project` ✓
- `does not leak mode between different projects` ✓
- `normalises invalid persisted values to ask` ✓
- `cycles modes in order ask → write → agent → ask` ✓

## Quality Gates

```
pnpm check → 0 errors
pnpm test → 1310 tests passed
```
