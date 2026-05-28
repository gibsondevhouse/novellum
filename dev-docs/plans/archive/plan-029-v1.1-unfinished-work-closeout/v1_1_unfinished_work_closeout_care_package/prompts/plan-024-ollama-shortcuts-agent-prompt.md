# plan-024 Stage 003 Ollama + Shortcuts Agent Prompt

```md
1. Objective
Close `plan-024` stage-003 by finishing Ollama provider behavior and shortcut settings/dispatch behavior.

2. Problem
Ollama support and shortcuts are deferred. The repo already has an Ollama provider path and an in-house global shortcut system. Finish and verify these systems; do not replace them.

3. Files
Primary:
- root `+layout.svelte`
- `global-handler.ts`
- `keymap-registry.ts`
- shortcut settings `+page.svelte`
- `ollama-provider.ts`
- `openrouter-provider.ts`
- provider orchestration `+server.ts`
- affected tests

4. Changes
- Verify root layout installs global shortcut dispatcher once.
- Verify dispatcher ignores text inputs/contenteditable targets.
- Verify shortcut registry persistence and conflict behavior.
- Finish shortcut recording/editing UI using Svelte 5 runes.
- Verify Ollama provider path works through same provider abstraction/API surface.
- Preserve OpenRouter behavior and server-side key boundary.

5. UI/UX
- Shortcut settings must show current binding, recording state, conflict state, and save/cancel behavior.
- Ollama unavailable state must be actionable and non-crashing.

6. Data
- No DB schema changes unless existing shortcut persistence already requires it.
- If persistence exists, use existing registry/storage path.
- Do not expose API keys client-side.

7. Errors
- Duplicate shortcut must produce a clear conflict state.
- Invalid recording must not save.
- Ollama daemon unavailable must show controlled error.
- Unknown provider response must not crash UI.

8. Tests
- Unit test conflict detection.
- Unit test input/contenteditable shortcut ignore behavior.
- Test shortcut persistence using existing storage harness.
- Test Ollama unavailable response.
- Run `pnpm lint`.
- Run `pnpm lint:css`.
- Run `pnpm check`.
- Run `pnpm test`.

9. Criteria
- Shortcuts can be recorded/edited safely.
- Global dispatcher behaves predictably.
- Ollama path works or fails gracefully.
- Existing provider abstraction preserved.
- Trackers updated.

10. Out-of-scope
- Replacing shortcut library.
- New provider architecture.
- New AI features.
- Client-side key storage.
- UI redesign beyond finishing the current settings surface.

11. Format
Return:
- Files changed.
- Shortcut behavior matrix.
- Ollama behavior matrix.
- Tests run/results.
- Remaining blockers.
```
