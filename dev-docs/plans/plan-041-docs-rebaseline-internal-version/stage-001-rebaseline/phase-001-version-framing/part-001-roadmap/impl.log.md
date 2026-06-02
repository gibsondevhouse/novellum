# impl.log — part-001-roadmap

## 2026-06-01 — Rebaseline `dev-docs/01-project/roadmap.md`

- Deleted the old roadmap and recreated it from scratch with reframed
  language: V1/V1.1/V2 are now described as **internal development milestones**,
  not public releases.
- Added a top-of-page versioning convention note explicitly stating that no
  public release has shipped, and the first public release will be tagged
  `desktop-v1.0.0`.
- Rolled `Last verified` to 2026-06-01.
- Reorganized Shipped into themed subsections: Foundation, Internal V1
  milestones, Internal V1.1 milestones, UI and design system (internal v2),
  Settings/accounts/trust, AI agents and Nova, Reader/navigation/theming,
  Codebase health.
- Added bullets for the closed plans 030 (Nova production refactor), 031 (VS
  Code Copilot parity), 032 (Worldbuilding generation engine), 034 (World Building
  workflow refactor), 035 (JSON double-encoding fix), 036 (Context-priority
  generation), 037 (Agentic worldbuild scan), 038 (Novel Engine v1).
- "In flight" now reads "No active plan as of 2026-06-01."
- New "Drafted (skeleton plans)" section references plan-039 and plan-040.
- Pruned "Manuscript export UI" and "Documentation re-baseline" from Deferred
  — both now have plans (plan-039 and plan-041 respectively).
- "Out of scope" preserved: cloud sync, multi-author, mobile, custom-trained models.

Evidence: see `evidence/roadmap-diff-summary.md`.
