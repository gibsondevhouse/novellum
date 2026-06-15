# Plan 040 Assumptions and Decisions

## Decisions

1. **Generation mode:** v1 presents a single author action, `Generate outline`, but implementation may use a two-pass internal service: structure spine first, scene intent cards second. The author receives one reviewable checkpoint.
2. **Persistence:** generated outlines are stored as project metadata / pipeline checkpoints unless implementation discovery proves a dedicated table is necessary.
3. **Materialization:** acceptance is server-only and transactional. Checkpoint lifecycle changes to accepted only after hierarchy writes commit successfully.
4. **Conflict policy:** populated outlines block destructive accept in v1. Review-only generation may be allowed, but accepting over existing hierarchy is not allowed without a dedicated future merge/replace plan.
5. **Hierarchy compatibility:** author-visible output remains Arc → Act → Chapter → Scene. If the current DB requires milestone/beat/stage rows, the materialization adapter creates safe defaults or documents a required contract change.

## Assumptions to Verify in Stage 001

- Exact hierarchy table/service names and parent-child requirements.
- Existing project metadata pipeline route operation semantics.
- How plan-038 reads scene intent for draft context.
- Current Nova component insertion point for the outline generation panel.
- Existing docs paths under `dev-docs/03-ai/` and `dev-docs/04-modules/`.

## Severity Notes

- Any path that can create hierarchy records before explicit accept is **Critical**.
- Any direct provider SDK call or client-side key exposure is **Critical**.
- Invalid model output that is accepted into hierarchy is **High**.
- Incomplete Nova failure/recovery states are **Medium** unless they can cause silent writes.
