# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.

---

### [2026-05-27 21:25] Agent: Codex

**Action:** Implemented baseline-first project grounding (`project_summary` policy), merged baseline into scene/outline requests, expanded prompt serialization for project baseline fields/counts, and added regressions.

**Result:** Nova now receives project baseline context whenever `projectId` exists, including projects with zero scenes; full test suite passes.

**Notes:** Disclosure compression/truncation currently inferred from warnings in sidepanel path.
