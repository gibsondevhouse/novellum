# Prompt System

> Last verified: 2026-05-07

Every prompt Novellum sends to an LLM follows a fixed five-section template. This is enforced by [prompt-builder.ts](../../src/lib/ai/prompt-builder.ts) and tested per agent.

## Template

```text
ROLE
  You are the Novellum <AgentName>.

TASK
  <single-responsibility objective>

CONTEXT
  <scoped JSON from the Context Engine>

CONSTRAINTS
  - <explicit negatives>
  - Do not invent facts outside CONTEXT.
  - <agent-specific rules>

OUTPUT FORMAT
  <strict schema, usually JSON>
```

The literal role definitions and constraint sets live in [src/lib/ai/constants.ts](../../src/lib/ai/constants.ts).

## PromptBuilder

[src/lib/ai/prompt-builder.ts](../../src/lib/ai/prompt-builder.ts) is responsible for:

1. Looking up the agent's role + base constraints from `constants.ts`.
2. Asking the Context Engine for a context payload (see [context-engine.md](./context-engine.md)).
3. Serializing context with stable key order via [serializer.ts](../../src/lib/ai/serializer.ts).
4. Concatenating the five sections in fixed order.
5. Returning a request payload for the Model Router.

It does **not** call OpenRouter directly. That is the Model Router + `/api/ai` proxy.

## Output parsing

Each agent file owns its own parser:

- Inputs: raw LLM string response.
- Validates against a Zod schema (declared in [types.ts](../../src/lib/ai/types.ts)).
- Returns the typed output or throws a typed parser error.

Parser errors do **not** retry silently. They surface to the UI so the author knows the model misbehaved.

## Style presets

[style-presets.ts](../../src/lib/ai/style-presets.ts) ships curated tone/voice templates that StyleAgent and RewriteAgent consume. Users may override or add their own via the Settings → AI surface; persisted in the `writing_styles` table.

## System prompts (user-customizable)

Stored in the `system_prompts` SQLite table and editable in Settings. They are appended to the ROLE section, not used to override CONSTRAINTS.

## Credential storage

OpenRouter API key:

- Stored via OS keyring (`@napi-rs/keyring`).
- Read only by [credential-service.ts](../../src/lib/ai/credential-service.ts).
- Accessed only in server-side code (`/api/ai/*`, `/api/settings/ai-key`).
- Explicitly excluded from `.novellum.zip` backups — see the credential-exclusion test under [tests/backup/](../../tests/backup/).

## See also

- [pipeline.md](./pipeline.md)
- [agents-map.md](./agents-map.md)
- [context-engine.md](./context-engine.md)
