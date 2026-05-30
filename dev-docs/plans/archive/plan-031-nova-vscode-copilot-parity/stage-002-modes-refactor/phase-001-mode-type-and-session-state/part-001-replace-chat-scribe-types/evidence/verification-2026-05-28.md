# Replace Chat/Scribe Types — 2026-05-28

## Changes

- `src/modules/nova/types.ts`: Added `NovaMode = 'ask' | 'write' | 'agent'` and `WriteSubAction = 'outline' | 'scene' | 'revision'`
- `src/lib/ai/types.ts`: Added `'write' | 'agent'` to `TaskType` union
- `src/modules/nova/stores/nova-session.svelte.ts`: `appendUnsupportedScribeAction` → `appendUnsupportedWriteAction`
- `src/modules/nova/components/NovaComposer.svelte`: Removed `NovaChatMode = 'chat' | 'scribe'`; uses `NovaMode` from types

## Verification

```
pnpm check → 1689 files, 0 errors
pnpm lint → clean
pnpm test → 1310 tests passed (191 files)
```

No user-facing Chat/Scribe mode labels remain in Nova UI. TypeScript catches invalid mode literals. All mode callsites use the canonical `NovaMode` type.
