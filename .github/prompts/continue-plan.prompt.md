# Continue Active Plan

Use this prompt at the start of any session where you want an agent to
**find and continue whichever Novellum plan is currently in flight**,
without telling it which one.

Compatible with: GitHub Copilot Chat, Claude Code, Codex CLI, Gemini CLI.

---

## Prompt

You are resuming work on Novellum. Discover the current plan and
continue it. Do **not** ask the user to pick a plan unless the
discovery procedure below produces no result.

### Discovery procedure (in order)

1. Read [`dev-docs/plans/ACTIVE-PLAN.md`](../../dev-docs/plans/ACTIVE-PLAN.md).
   The `## Current` section names the plan slug, status, and owner of
   the next action.
2. If `ACTIVE-PLAN.md` says `Current: none`, fall through to
   [`dev-docs/plans/MASTER-PLAN.md`](../../dev-docs/plans/MASTER-PLAN.md)
   and pick the first plan listed under `## Active Plans`.
3. If neither file exists, stop and ask the user.

### Resumption procedure

1. Open the plan's `plan.md`. Confirm it is `status: draft`,
   `in-progress`, or `review` — never start work on a `complete`
   plan.
2. In the plan's stage table, locate the first stage whose `status`
   is not `complete`. Open its `stage.md`.
3. If the stage has no phase directories yet, scaffold them from
   [`dev-docs/plans/_templates/phase.template.md`](../../dev-docs/plans/_templates/phase.template.md)
   based on the stage's stated phases (or, if none, propose a
   minimal phase plan and **wait for confirmation** before
   creating files).
4. Open the first phase whose `status` is not `complete`, then the
   first part inside that phase. If no part directories exist,
   scaffold from
   [`dev-docs/plans/_templates/part.template.md`](../../dev-docs/plans/_templates/part.template.md)
   and propose them — wait for confirmation before doing the work.
5. Follow the rules in
   [`.github/instructions/plan-conventions.instructions.md`](../instructions/plan-conventions.instructions.md):
   - Complete the part's **Pre-Implementation** checklist before
     touching code.
   - Implement the change. Respect modular boundaries
     (`eslint-plugin-boundaries`), Svelte 5 Runes-only reactivity,
     token-driven styling, ROLE → TASK → CONTEXT → CONSTRAINTS →
     OUTPUT prompt shape for any AI work.
   - Run `pnpm check`, `pnpm lint`, and the relevant `pnpm test`
     subset. Fix what you broke.
   - Complete the **Post-Implementation** checklist. Append a
     dated entry to `impl.log.md` (append-only — never edit
     existing entries). Add at least one file to `evidence/`.
   - Update the part's `status` to `review` (only the Reviewer
     Agent moves it to `complete`).
6. Roll status upward only when all children are complete: phase
   when all parts are complete; stage when all phases are complete;
   plan when all stages are complete.
7. When the plan reaches `complete`:
   - Move its line in `MASTER-PLAN.md` from `## Active Plans` to
     `## Recently Completed`.
   - In `ACTIVE-PLAN.md`, prepend the completed plan to
     `## Recently completed` and update `## Current` to the next
     plan (or `none`).

### Reporting back

After you finish (or stop for the user's next turn), reply with:

- The plan slug you resumed, the stage/phase/part you worked on,
  and the new status of each.
- A one-line summary of the change.
- The exact commands you ran and their pass/fail.
- The file(s) you added under `evidence/`.

If you got blocked, say so explicitly: which part is blocked, the
exact blocker, and what unblocks it.

---

## Notes for tool-specific agents

- **Claude Code** picks this prompt up from `.github/prompts/`
  automatically when invoked with the `continue-plan` slash command.
- **Codex CLI** users can `cat` this file into the session prompt or
  reference it via `--prompt-file`.
- **Gemini CLI** users invoke it through the existing `planner.agent.md`
  flow — the planner consults `ACTIVE-PLAN.md` first.
- **GitHub Copilot Chat** users can run it via the prompts surface
  bound to `.github/prompts/`.
