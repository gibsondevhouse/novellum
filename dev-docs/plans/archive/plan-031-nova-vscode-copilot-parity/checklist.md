---
plan: plan-031-nova-vscode-copilot-parity
last_updated: 2026-05-28
status: draft
---


# Global Checklist

## Pre-Implementation

- [ ] `plan.md` has been reviewed by the human owner.
- [ ] ACTIVE-PLAN and MASTER-PLAN tracker snippets have been applied or consciously deferred.
- [ ] plan-030 stage 002/003 supersession note has been applied or consciously deferred.
- [ ] Branch is confirmed as `feat/nova-development`.
- [ ] plan-030 stage 001 context grounding contract is treated as companion baseline.
- [ ] Implementation agents understand no manuscript auto-mutation is allowed.
- [ ] Implementation agents understand OpenRouter-only and server-side-key constraints.

## Stage 001 — Compact Sidepanel Shell

- [ ] Current density baseline captured.
- [ ] Missing tokens fixed and `pnpm check:tokens` passes.
- [ ] Header/status pill compressed.
- [ ] Footer/body spacing consolidated.
- [ ] Composer starts as compact single-line auto-grow input.
- [ ] Single action row implemented.
- [ ] Message bubbles and empty state densified.
- [ ] Nova visual baselines rebaselined once and evidence recorded.

## Stage 002 — Modes Refactor

- [ ] `NovaMode = 'ask' | 'write' | 'agent'` introduced.
- [ ] Old Chat/Scribe user-facing labels removed or migrated.
- [ ] Last-used mode persists per project.
- [ ] Mode pill exists in action row.
- [ ] `Cmd+.` cycle behavior implemented or explicitly deferred with rationale.
- [ ] Ask mode prompt and resolver route are tool-free.
- [ ] Write mode route generates proposals.
- [ ] Existing Scribe outline functionality migrated to Write.
- [ ] Mode routing tests pass.

## Stage 003 — Attachments

- [ ] `NovaAttachment` model added.
- [ ] Attachment session lifecycle supports add/remove/clear-on-new-chat.
- [ ] Attach popover has Project and Upload tabs.
- [ ] Project entity candidates load from existing repository/API paths.
- [ ] File upload accepts only `.md/.txt` ≤100KB.
- [ ] Client and server validation reject invalid payloads.
- [ ] Attachment chips render and are dismissible.
- [ ] Attachments are included as `'user-attached'` context.
- [ ] Disclosure pill counts user-attached items separately.
- [ ] Attachment tests and visual coverage pass.

## Stage 004 — Agentic Tool Loop

- [ ] plan-030 constraint lift is recorded in plan docs and trackers.
- [ ] Tool contracts are defined and typed.
- [ ] Read-only project summary tool registered.
- [ ] Entity read tools registered.
- [ ] Proposal envelope reuse/adaptation completed.
- [ ] Proposal tools registered.
- [ ] Agent mode parses `tool_use` blocks.
- [ ] Tool router dispatches and feeds `tool_result` messages back.
- [ ] Agent max-step cap defaults to 8 or documented lower value.
- [ ] User abort path works.
- [ ] Tool chips and result summaries render inline.
- [ ] Agentic loop tests pass.
- [ ] No-mutation import source-contract test passes.

## Stage 005 — Verification, Docs, and Closeout

- [ ] `pnpm check` passes or has accepted waiver.
- [ ] `pnpm lint` passes or has accepted waiver.
- [ ] `pnpm lint:css` passes or has accepted waiver.
- [ ] `pnpm test` passes or has accepted waiver.
- [ ] `pnpm test:visual` or targeted Nova visual suite passes or has accepted waiver.
- [ ] `pnpm check:tokens` passes or has accepted waiver.
- [ ] `dev-docs/04-modules/nova.md` updated.
- [ ] `dev-docs/03-ai/pipeline.md` updated.
- [ ] ACTIVE-PLAN updated.
- [ ] MASTER-PLAN updated.
- [ ] plan-030 reconciliation note applied.
- [ ] Closeout summary prepared.
- [ ] Reviewer signoff appended to impl logs.

## Completion Guardrail

- [ ] No part is marked `complete` without checklist completion, evidence, and reviewer signoff.
