
# plan-031 — Nova VS Code Copilot Parity

Status: `draft`  
Branch: `feat/nova-development`  
Target path: `dev-docs/plans/plan-031-nova-vscode-copilot-parity/`

## Purpose

This package contains the complete planning scaffold for plan-031. It is ready to copy into the repo before implementation begins.

The plan upgrades Nova into a compact VS Code Copilot-style sidepanel with three explicit modes, real attachments, and a bounded Agent-mode tool loop. It supersedes plan-030 stages 002 and 003 while preserving plan-030 stage 001 as the companion context-grounding contract.

## How to use

1. Copy this directory into `dev-docs/plans/`.
2. Apply the tracker snippets under `tracker-updates/` to `ACTIVE-PLAN.md`, `MASTER-PLAN.md`, and the plan-030 reconciliation note.
3. Assign Stage 001 to the first implementation agent.
4. Do not mark any part `in-progress` until work actually starts.
5. Do not mark any part `complete` until its checklist is done, evidence exists, and a Reviewer Agent signoff is appended to `impl.log.md`.

## Execution order

1. `stage-001-compact-sidepanel-shell`
2. `stage-002-modes-refactor`
3. `stage-003-attachments`
4. `stage-004-agentic-tool-loop`
5. `stage-005-verification-docs-closeout`

Stage 004 must not start until Stage 002 mode routing is stable. Stage 003 should land before Stage 004 if Agent mode needs user-attached context during tool execution.

## Hard stop conditions

- A tool handler imports editor or manuscript mutation paths.
- A proposed implementation sends API keys to client code.
- A file upload path accepts anything outside `.md/.txt` or above 100KB.
- Agent mode can run without an iteration cap or abort path.
- Ask mode advertises or executes tools.
- Generated content is applied directly to manuscript/editor state.

## Included root artifacts

- `plan.md` — full initiative plan.
- `checklist.md` — global execution checklist.
- `validation-matrix.md` — gate-to-evidence mapping.
- `agent-handoff.md` — instructions for coding agents.
- `plan-explanation.md` — original source explanation for traceability.
- `prompts/` — stage execution prompts.
- `tracker-updates/` — snippets for ACTIVE-PLAN, MASTER-PLAN, and plan-030 reconciliation.
- `TREE.md` — generated file tree.
