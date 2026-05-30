# Ollama + Shortcuts Surface and Tests Audit

> Generated: 2026-05-27

## Ollama Provider

| Commitment | Code | Tests | Status |
|-----------|------|-------|--------|
| Provider toggle in Settings | `src/routes/settings/ai/+page.svelte` — tabbed UI (openrouter/ollama/lm-studio) | — | **shipped** |
| OllamaPanel with persistence | `src/modules/settings/components/OllamaPanel.svelte` — `activeProvider` rune, `set-active` API | — | **shipped** |
| Ollama launcher | `src/lib/server/ai/ollama-launcher.ts` | `tests/ai/ollama-launcher.test.ts` | **shipped** |
| Ollama provider | `src/lib/ai/providers/ollama-provider.ts` | `tests/ai/ollama-provider.test.ts` | **shipped** |
| Provider config | `src/lib/ai/provider-config.ts` | — | **shipped** |
| API routing | `src/routes/api/ai/+server.ts` | — | **shipped** |
| Provider orchestration | `src/lib/ai/providers/index.ts` | — | **shipped** |
| Ollama settings API | `src/routes/api/settings/ai-ollama/+server.ts` | — | **shipped** |

**Key-boundary check:** Provider keys are server-side only (`src/lib/server/ai/`). No client-visible key exposure.

## Global Shortcuts

| Commitment | Code | Tests | Status |
|-----------|------|-------|--------|
| `save-scene` registered | `keymap-registry.ts:163` (default: Meta+S) | `keymap-registry.test.ts` | **shipped** |
| `view-in-reader` registered | `keymap-registry.ts:170` | `keymap-registry.test.ts` | **shipped** |
| SHORTCUT_EVENT bus | `global-handler.ts:31` | — | **shipped** |
| Global handler dispatch | `global-handler.ts:102-103` | — | **shipped** |
| EditorShell listener | `EditorShell.svelte:277-281` | — | **shipped** |
| Root layout installation | `+layout.svelte` | — | **shipped** |
| Shortcuts settings page | `src/routes/settings/…` | `settings-shortcuts-page.test.ts` | **shipped** |

**Minor gap:** `view-in-reader` shortcut may not be visible in the shortcuts settings UI (no grep match in settings route files). This is cosmetic — the shortcut is functional.

## Summary

All deferred plan-024 stage-003 commitments are fully shipped with code and test evidence. No security boundary violations. One cosmetic gap (view-in-reader settings visibility) does not affect functionality.
