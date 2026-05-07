# Nova — Your AI Copilot

> Last verified: 2026-05-07

**Nova** is Novellum's AI assistant. Chat-style. Project-aware. BYOK (you bring your own OpenRouter key).

## What Nova can do

- **Answer questions** about your project, grounded in your characters, locations, lore, and the current scene.
- **Suggest** edits, rewrites, continuity checks, and stylistic adjustments via specialized agents under the hood.
- **Draft** ideas for you to copy/paste into the editor.

## What Nova will not do

- **Edit your manuscript silently.** Every change to your scenes goes through your hands.
- **Send your full manuscript to the model.** Nova uses scoped context — only what the agent needs for the task.
- **Keep your work on a server.** Your data stays local. Only the messages you explicitly send go to OpenRouter.

## Setup

1. Open **Settings → AI**.
2. Paste your **OpenRouter** API key.
3. Save. Nova is now ready.

For OpenRouter setup details, see [ai-setup.md](./ai-setup.md).

## How to use Nova

Open the **Nova** workspace from the sidebar (or, in upcoming editor changes, the right-side panel). Ask in plain English:

- *"Is this scene consistent with what we know about Marin?"*
- *"Rewrite this paragraph in a more clipped voice."*
- *"What hasn't paid off from the threads we set up in chapter 3?"*

Nova will reply with structured suggestions you can review and apply manually.

## The agents behind Nova

Nova routes your request to the right specialized agent:

- **Continuity** — "does this match the established facts?"
- **Edit** — line-level improvements.
- **Rewrite** — alternative phrasings of a passage.
- **Style** — tone/voice consistency.

Four more agents are planned (Brainstorm, Outline, Draft, Summarize) and are not yet shipped. You will see them appear in future releases.

## Privacy and safety

- Your API key is stored in your operating system's keyring (macOS Keychain / Windows Credential Manager / libsecret on Linux). It is never bundled into backups.
- Each request to OpenRouter is initiated by you. Novellum does not poll the model in the background.
- You can revoke the key any time from **Settings → AI**.

## Troubleshooting

- **"Nova isn't answering."** Confirm Settings → AI → status shows "Configured". Re-validate the key.
- **"The reply doesn't match my world."** Check that the relevant characters/locations/lore are filled in — Nova grounds replies on what it can see in the project. See [worldbuilding.md](./worldbuilding.md).
- **"Nova introduced facts I didn't write."** Open a bug report. The agents are constrained against this; if it happens, the team wants to know.
