---
title: Strip rawOutput from Generate Response
slug: part-002-strip-raw-output
part_number: 2
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-context-and-response-hardening
started_at: ~
completed_at: ~
estimated_duration: 0.1d
---

## Objective

Remove `rawOutput` from the JSON response of `/api/author-draft/checkpoints/generate`.
Returning raw LLM text to the browser is wasteful (potentially large) and a
prompt-injection surface — if an adversary injects instructions into LLM output, having
it reflected to the client is an unnecessary attack vector.

## Scope

**Update:**

- `src/routes/api/author-draft/checkpoints/generate/+server.ts`

## Implementation Steps

Change the success response from:

```ts
return json({ checkpoint, rawOutput });
```

to:

```ts
return json({ checkpoint });
```

If `rawOutput` is used for debugging, gate it behind an environment variable:

```ts
const body = dev ? { checkpoint, rawOutput } : { checkpoint };
return json(body);
```

The `dev` import comes from `$app/environment`.

## Acceptance Criteria

- [ ] Production response body no longer includes `rawOutput`.
- [ ] Client-side `author-draft-api.ts` wrapper updated if it currently destructures `rawOutput`.
- [ ] TypeScript type for the response narrowed accordingly.
- [ ] `pnpm check` — 0 errors.

## Notes

The `dev`-gated approach is preferred — it preserves debugging ability without shipping
raw LLM content to end users.
