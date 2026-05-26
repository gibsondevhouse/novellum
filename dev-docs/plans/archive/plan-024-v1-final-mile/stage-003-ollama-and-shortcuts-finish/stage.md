---
title: Ollama & Shortcuts Finish
slug: stage-003-ollama-and-shortcuts-finish
stage_number: 3
status: deferred-to-v1.1
owner: Backend Agent
plan: plan-024-v1-final-mile
phases: []
estimated_duration: 1d
risk_level: low
---

## Goal

Two small features merged in v1.0.0-beta.0 that are wired but
not user-reachable:

1. **Ollama provider toggle** — the `OllamaPanel` component and
   `/api/ai` provider resolution exist, but switching the active
   provider still requires a manual preference write. Surface
   the toggle in Settings → Defaults and add an end-to-end test
   that hits `/api/ai` with `activeProvider='ollama'`.
2. **Global shortcut emitters** — `installGlobalShortcuts` and
   the `SHORTCUT_EVENT` bus are mounted in the root layout, and
   `EditorShell` listens for `save-scene` and `view-in-reader`,
   but nothing in the keyboard registry actually emits those
   action ids. Bind them to default keybindings (e.g.
   `Cmd+S` / `Cmd+Shift+R`) and surface them in the Shortcuts
   settings tab.

## Entry Criteria

- Plan-022 (Settings IA) `complete` so the Defaults tab exists.
- The dispatcher in `src/lib/keyboard/global-handler.ts` ships
  on `master` (it does, as of 2026-05-10).

## Exit Criteria

- Settings → Defaults exposes an "Active AI provider" radio /
  select with at least `openrouter` and `ollama` options; the
  selection persists via the existing preference key
  (`ACTIVE_PROVIDER_KEY`).
- A new test under `tests/ai/` boots the SvelteKit handler,
  sets `activeProvider='ollama'`, mocks the launcher, and
  asserts `/api/ai` round-trips through `OllamaProvider`.
- Keymap registry registers `save-scene` and `view-in-reader`
  with default bindings, dispatched through `SHORTCUT_EVENT`.
- Pressing the bindings inside the editor triggers autosave
  flush and the reader handoff respectively (covered by a new
  Vitest spec that simulates the event).

## Notes

- Keep the provider toggle minimal — full per-provider model
  pickers belong in stage-005 if the AI surface decision lands
  on "ship more agents".
- The shortcuts surface should reuse the existing PillNav
  pattern from plan-022; do not introduce a new UI shell.
