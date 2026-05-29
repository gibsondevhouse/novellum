
# plan-030 reconciliation snippet

Add this as an append-only note to the appropriate plan-030 closeout or notes section.

## Supersession note — 2026-05-28

`plan-031-nova-vscode-copilot-parity` supersedes the remaining intent of plan-030 stage 002 and stage 003.

Reason:

- plan-031 narrows the visual target to a VS Code Copilot-style compact sidepanel.
- plan-031 replaces Chat/Scribe with Ask/Write/Agent.
- plan-031 lifts the prior no-broad-tool-calling constraint only for Agent mode.
- plan-031 adds real project/file attachments and a bounded tool loop.
- plan-030 stage 001 context grounding remains the companion baseline and is not superseded.

Guardrails preserved:

- OpenRouter only.
- Server-side API keys only.
- Project context rebuilt per request.
- No generated content auto-applies to manuscript/editor state.
