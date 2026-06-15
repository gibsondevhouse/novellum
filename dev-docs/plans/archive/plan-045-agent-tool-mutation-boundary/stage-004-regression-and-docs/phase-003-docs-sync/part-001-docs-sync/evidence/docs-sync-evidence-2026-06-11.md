# Docs Sync Evidence — 2026-06-11

## Scope

Updated developer and user documentation so Nova Agent mode is described as read/generate only for model-callable tools, with accept/reject/apply reserved for explicit UI or trusted app actions.

## Updated Files

- `dev-docs/03-ai/agents-map.md` — Last verified updated for plan 045; mutation boundary section documents `agent-tools.ts`, `agent-mutation-tools.ts`, `listModelCallableTools()`, and trusted UI/app mutation owners.
- `novellum-docs/user/nova.md` — explains that Nova can create review artifacts but cannot accept, reject, or apply checkpoints on its own.
- `novellum-docs/user/ai-setup.md` — adds review-gated changes language while preserving local-first and BYOK framing.

## Validation

- `pnpm check` — passed, `svelte-check found 0 errors and 0 warnings`.
- `pnpm lint` — passed.
- `pnpm lint:css` — passed.
- `pnpm test` — passed, `240` files / `1756` tests.
- `pnpm check:tokens` — passed, `347` files scanned / `0` violations.
- `pnpm test:e2e --grep "vibe-author review-gate flow|outline generation review gate|vibe-worldbuild checkpoint flow" --project=chromium` — passed, `5` tests.

## Result

Docs no longer imply that a model tool can silently apply manuscript or canon changes. Future tool authors have a clear policy: model-callable tools may read and generate review artifacts; lifecycle decisions and projection into manuscript/canon state must remain trusted app actions.
