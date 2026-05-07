# AI Setup (BYOK)

> Last verified: 2026-05-07

Novellum is **bring-your-own-key** for AI. We don't host a model; we don't broker tokens. You sign up with [OpenRouter](https://openrouter.ai), generate an API key, and paste it into Novellum.

## Why OpenRouter

OpenRouter is a single endpoint that proxies many providers (OpenAI, Anthropic, etc.). One key, many models. You stay in control of cost and provider.

## Setup steps

1. Go to [openrouter.ai](https://openrouter.ai) and create an account.
2. Add credit to your account (OpenRouter is pay-as-you-go).
3. Create an API key. Copy it.
4. In Novellum, open **Settings → AI**.
5. Paste the key.
6. Click **Save**. Novellum validates the key against OpenRouter and shows the configured status.

Your key is stored in your OS keyring — never in the database, never in backups, never on disk in plain text.

## Choosing a model

OpenRouter exposes many models. Novellum's Model Router picks reasonable defaults per task type, but you can override defaults in **Settings → AI** as the surface evolves (tracked under [plan-022-settings-ia](../../dev-docs/plans/plan-022-settings-ia/plan.md)).

Cheaper, faster models work well for line edits and continuity checks. Larger models help on rewrite and brainstorm-style tasks. Pick what fits your budget.

## Verifying it works

After saving the key, open **Nova** and ask anything. If you see a reply, you're set.

## Removing your key

- **Settings → AI → Remove key.** This deletes the entry from the OS keyring.
- Your project data is unaffected.

## Cost control tips

- AI calls only happen when you trigger them. There is no background polling.
- Continuity checks and style scans send scoped context, not the full manuscript.
- For drafting, prefer shorter prompts and smaller context windows when possible.

## Privacy

- Novellum does not log or proxy your prompts. They go directly from the local SvelteKit server (the desktop sidecar) to OpenRouter.
- OpenRouter's privacy policy applies to the messages you send through it.
