# Card Architecture — part-002

## Component surface

```text
NovaMessageLog
└─ (message.role === 'nova' && message.artifact)
   ├─ artifact.kind === 'author-scene-draft'
   │  └─ <NovaSceneDraftCard envelope />
   │       ├─ Accept   → onAccept?(envelope)
   │       ├─ Reject   → onReject?(envelope)
   │       └─ Copy     → navigator.clipboard.writeText(payload.prose)
   └─ artifact.kind === 'author-revision-pack'
      └─ <NovaRevisionPackCard envelope />
          └─ for each issue (sorted by AUTHOR_SEVERITY_ORDER):
             Acknowledge → onAcknowledge?(issue.id, envelope)
```

## Guardrails enforced at the source level

- No `editor`-store import path.
- No call to `insertText`, `applyEdit`, `manuscriptStore`,
  `editorStore`.
- Svelte 5 Runes only — `$props`, `$state`, `$derived`. No
  `export let`. No `$:` reactivity.
- Every visual value resolves to a `var(--token)`; global
  `pnpm check:tokens` continues to pass at 0 violations.

## Accept-pipeline contract (forward link)

`onAccept` deliberately surfaces the **envelope**, not just the prose,
so the downstream editor accept-pipeline (future plan) can keep the
provenance fields (`taskKey`, `family`, `stage`, `model`,
`createdAt`) for ledgering. The Stylist layer never mutates the
manuscript itself; that integration is owned by a separate editor
plan and is intentionally out of scope here.
