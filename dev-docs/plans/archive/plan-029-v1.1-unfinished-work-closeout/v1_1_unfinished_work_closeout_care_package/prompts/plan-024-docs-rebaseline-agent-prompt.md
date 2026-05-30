# plan-024 Stage 006 Docs Rebaseline Agent Prompt

```md
1. Objective
Complete `plan-024` stage-006 docs rebaseline and reconcile closeout documentation.

2. Problem
Plan and architecture docs must reflect what is actually implemented after the V1.1 unfinished-work closeout. Trackers must show one terminal state with no ambiguous carry-over.

3. Files
Primary:
- `plan.md`
- `dev-docs/plans/ACTIVE-PLAN.md`
- `dev-docs/plans/MASTER-PLAN.md`
- `AGENTS.md`
- `CLAUDE.md`
- release docs
- reader docs
- shortcut/provider/db docs if present

4. Changes
- Update closeout statuses with evidence.
- Mark each deferred plan/stage as completed, retired, or superseded.
- Align docs to actual repo behavior:
  - Svelte 5 runes
  - `/api/db/*` server SQLite access
  - raw `better-sqlite3`
  - deterministic client-side reader pagination
  - in-house shortcut dispatcher/registry
  - OpenRouter provider abstraction and Ollama provider path
  - existing Tauri release workflows
- Remove or qualify stale claims.

5. UI/UX
- No UI changes.

6. Data
- No data changes.

7. Errors
- If implementation evidence is missing, mark `needs repo verification`.
- Do not assert completion without file/test evidence.

8. Tests
- Run docs lint if available.
- Run `pnpm lint`, `pnpm check`, and `pnpm test` if docs changes affect imports/examples.
- Validate links and file references.

9. Criteria
- ACTIVE and MASTER trackers agree.
- Every deferred item has a terminal disposition.
- Docs match actual implementation.
- No ambiguous carry-over remains.

10. Out-of-scope
- New roadmap planning.
- New features.
- Architecture redesign.
- Marketing copy.

11. Format
Return:
- Docs changed.
- Final disposition table.
- Evidence links.
- Stale claims removed/updated.
- Remaining `needs repo verification` items.
```
