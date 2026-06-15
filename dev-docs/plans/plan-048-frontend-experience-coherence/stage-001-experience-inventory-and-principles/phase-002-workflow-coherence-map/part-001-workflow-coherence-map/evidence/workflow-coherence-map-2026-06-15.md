# Workflow Coherence Map (2026-06-15)

## Purpose

This map turns the route inventory into the author workflows that plan-048 must preserve and clarify. Later stages should use it as the contract for route context, shell behavior, review gates, empty states, and release evidence.

## Workflow Principles

1. **Context first**: every project workspace must make the active project visible, and editor-like surfaces must also expose the active chapter, scene, or review artifact when one exists.
2. **Nova is contextual assistance**: project-scoped Nova should inherit the visible route context. The fullscreen `/nova` route is exploratory and must not imply it has the same scene or project grounding as embedded workspace Nova.
3. **Review gates are product commitments**: outline checkpoints, author drafts, revision packs, and worldbuilding proposals must remain explicitly accepted or rejected by the author before manuscript or canon mutation.
4. **Empty states should start work**: no-data surfaces should offer concrete next actions for building canon, outlining, drafting, importing, or configuring AI.
5. **Completion is visible**: successful author actions should leave an inspectable record through cards, status copy, updated counts, or export/download affordances.
6. **Recovery is local and explainable**: stale context, failed generation, failed export, or missing AI configuration must surface the blocked action and the next recoverable step.

## Primary Journeys

| Journey | Entry point | Active context | Expected Nova behavior | Review gate | Failure state | Success signal |
| --- | --- | --- | --- | --- | --- | --- |
| Start or resume a project | `/projects`, `/projects/[id]` | Project ID, project metadata, health summary | Global assistance can explain project status; project-scoped actions should open with the current project loaded | None unless AI creates a proposal | Missing project or stale active-project store should route back to project selection or show an empty project state | Hub metrics, next-step card, save/backup/export status, and sidebar project links align |
| Build canon | `/projects/[id]/world-building` and category routes | Project ID, worldbuilding domain, selected entity where applicable | Nova can guide a domain or generate reviewable proposals with project/domain context | Worldbuilding proposals and diff/merge cards require explicit accept/reject | Dependency guard, generation failure, stale proposal, or duplicate/conflict state remains visible | Domain count changes, proposal leaves actionable queue, accepted canon is inspectable |
| Outline from worldbuilding | `/projects/[id]/outline` | Project ID, story hierarchy selection, active worldbuild checkpoint where selected | Nova can create outline checkpoints and explain readiness; it cannot apply the outline directly | Outline checkpoint review card requires accept/reject | Stale/conflicting checkpoint, insufficient context, or failed run remains reviewable | Hierarchy updates only after acceptance; checkpoint lifecycle is recorded |
| Draft from outline | `/projects/[id]/editor` and `/projects/[id]/editor/[sceneId]` | Project ID, chapter, scene, editor mode, current draft text | Nova can draft or revise against the visible scene and can create author draft checkpoints | Author draft and revision packs require explicit accept/reject | Stale scene content, external overwrite, failed generation, or missing scene selection blocks apply | Scene text changes only after acceptance; editor selection and status reflect the update |
| Revise and check continuity | `/projects/[id]/editor`, `/projects/[id]/continuity`, Nova panel | Project ID, selected scene or project review scope | Nova can suggest edits, rewrites, style changes, and continuity findings | Suggestions remain inspectable; mutation requires author action | Missing selected text/scene or insufficient context should be explicit | Accepted manual edits or review artifacts stay tied to the originating context |
| Export manuscript | Project hub export action and export dialog | Project ID, chapter/scene selection, format/profile settings | Nova is not required; export is a trusted app flow | No AI review gate, but selected chapters/scenes must be intentional | Empty selection, unavailable chapters, desktop/browser delivery failure | Download or desktop save completes with selected profile and file type |
| Recover from errors | Any workspace route | The route context that failed and the local runtime artifact where available | Nova can explain diagnostics only from explicit local context | No mutation without normal review gate | Technical detail, retry, reject/dismiss, or diagnostics export is visible | Author can retry, reject, navigate away, export diagnostics, or continue local work |

## Cross-Surface Contracts

### Project Hub

- The hub is the project command center, not a marketing page.
- Status cards should point to editor, outline, worldbuilding, export, backup, and AI readiness.
- Export actions belong at the project level because they need whole-project context.

### Editor

- The editor is the canonical drafting surface.
- The editor shell owns chapter/scene navigation, writing controls, and scene-scoped Nova handoffs.
- Focus mode may reduce shell chrome, but it must not hide review-gate state for pending scene mutations.

### Outline

- The outline owns story hierarchy, worldbuild-to-outline checkpoint review, and stage run readiness.
- Selection state must survive route refreshes only when it still belongs to the active project.
- Generated hierarchy changes remain pending until the author accepts the checkpoint.

### Worldbuilding

- The worldbuilding landing page is a domain launcher with counts, readiness, help, and Nova generation controls.
- Domain/category routes own entity-specific editing and proposal review.
- Generate controls must explain disabled dependency states without implying the model can mutate canon directly.

### Nova

- Embedded Nova is the primary product assistant for contextual author work.
- `/nova` remains a legacy/exploratory fullscreen route and should disclose that it may be less context-rich.
- Context disclosure copy must match the same route-derived contract used by stores and shells.

### Settings and Onboarding

- Settings owns AI credential readiness, data portability, appearance, defaults, privacy, and updates.
- Onboarding should route authors toward project creation/configuration, not toward detached Nova use.

## Workflow Gaps For Later Stages

| Gap | Impact | Target stage |
| --- | --- | --- |
| `GEMINI.md`, `MASTER-PLAN.md`, and `ACTIVE-PLAN.md` can drift on the active plan | Assistants may resume the wrong implementation slice | Stage 004 tracker reconciliation |
| The fullscreen `/nova` route and embedded Nova panel have different capability expectations | Authors may overestimate the context available in global chat | Stage 002 route and panel contract |
| Review cards share safety semantics but not one visible state language | Accept/reject/stale/conflict states feel inconsistent across outline, author draft, and worldbuilding | Stage 003 review surface unification |
| Empty states are module-specific and unevenly action-oriented | New projects can feel like dead ends instead of guided workflows | Stage 003 journey unification |
| Release engineering is still externally blocked | GEMINI Phase 4 cannot honestly be marked complete without signing credentials and brand assets | Stage 004 evidence and tracker closeout |

## Acceptance Mapping

- Primary author journeys are mapped from entry to completion in the journey table.
- Required context, review gates, failure states, and completion signals are specified per journey.
- Frontend principles are captured as constraints for route, shell, review, empty-state, and release-evidence stages.
