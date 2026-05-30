---
plan: plan-031-nova-vscode-copilot-parity
last_updated: 2026-05-28
status: draft
audience: Codex / Claude / Jules / Reviewer agents
---


# Agent Handoff

## Required execution order

1. Stage 001 — Compact Sidepanel Shell
2. Stage 002 — Modes Refactor
3. Stage 003 — Attachments
4. Stage 004 — Agentic Tool Loop
5. Stage 005 — Verification, Docs, and Closeout

Do not start Stage 004 before Stage 002 mode routing is implemented. Do not mark any stage complete until all child phases and parts are complete.

## Reporting format

For every part, report:

1. Files changed.
2. Behavior changed.
3. Tests added or updated.
4. Commands run.
5. Evidence file names created.
6. Known limitations.
7. Whether the part is ready for reviewer signoff.

## Stop conditions

Stop and report immediately if any of these occur:

- You need to add a direct provider SDK.
- You need to expose API keys client-side.
- A tool handler appears to need direct manuscript/editor mutation.
- A file attachment path cannot enforce `.md/.txt` and 100KB limits.
- Agent loop cannot be capped or aborted.
- Ask mode needs tool execution to pass tests.
- Existing repo APIs for project entities cannot be verified.
- You find stale plan-030 requirements that contradict plan-031 guardrails.

## Implementation rules

- Use Svelte 5 Runes for new Svelte state.
- Use existing `/api/db/*` paths for server data access.
- Respect module boundaries and barrel exports.
- Use tokens rather than raw pixels except where existing tests require measurement helpers.
- Keep generated AI outputs proposal-only.
- Add tests in the mirrored `tests/nova/` or `tests/ai/` area.
- Place evidence in the exact part evidence directory.
- Append to `impl.log.md`; do not rewrite prior entries.

## Reviewer rules

Reviewer Agent must not approve completion unless:

- Part checklist is fully checked.
- Evidence directory contains at least one artifact.
- Tests or waiver are recorded.
- No stop condition is unresolved.
- Status rollup is accurate.
