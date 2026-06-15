# Capability Classification Evidence — 2026-06-11

## Classification Model

Each product Nova Agent tool receives exactly one capability class:

- `read_only`: Queries existing local project state. No persistence or lifecycle transitions.
- `review_artifact_generation`: Creates or returns draft/proposal artifacts that still require author review before canon or manuscript mutation.
- `mutation_command`: Applies, rejects, or otherwise records an author decision. These must be UI-issued or trusted app commands, not model-callable tools.

Advertisement recommendation:

- `allow_model`: Safe to advertise to the model loop.
- `allow_model_with_guard`: Safe only if the policy contract keeps the tool in review-artifact scope and blocks escalation into accept/apply behavior.
- `deny_model`: Must not be advertised to the model loop.

## Tool Classification Matrix

| Tool ID | Capability class | Advertisement | Rationale |
| --- | --- | --- | --- |
| `project.get_summary` | `read_only` | `allow_model` | Handler performs a GET-only project lookup and does not persist changes. |
| `project.list_scenes` | `read_only` | `allow_model` | Handler performs a GET-only scene list lookup scoped by project. |
| `project.list_characters` | `read_only` | `allow_model` | Handler performs a GET-only character list lookup scoped by project. |
| `project.list_locations` | `read_only` | `allow_model` | Handler performs a GET-only location list lookup scoped by project. |
| `project.get_scene` | `read_only` | `allow_model` | Handler performs a GET-only scene lookup. It can expose manuscript content to the model, but it does not mutate state. |
| `propose.outline` | `review_artifact_generation` | `allow_model_with_guard` | Calls `/api/ai` and returns an ephemeral `ProposalEnvelope`. No local apply path is called. |
| `propose.scene_draft` | `review_artifact_generation` | `allow_model_with_guard` | Calls `/api/ai` and returns an ephemeral `ProposalEnvelope`. No local apply path is called. |
| `authorDraft.get_scene_draft_context` | `read_only` | `allow_model` | Handler reads server-built author draft context; no persistence. |
| `authorDraft.generate_scene_draft_checkpoint` | `review_artifact_generation` | `allow_model_with_guard` | Persists a checkpoint review artifact in `project_metadata`, but does not update `scenes.content` or canonical worldbuilding tables. Guard needed because `forceRegenerate` can supersede an active review checkpoint. |
| `authorDraft.list_checkpoints` | `read_only` | `allow_model` | Handler lists existing checkpoints and lifecycle state; no persistence. |
| `authorDraft.accept_checkpoint` | `mutation_command` | `deny_model` | Calls the author-draft accept route, which updates `scenes.content`, `scenes.wordCount`, `scenes.updatedAt`, and marks the checkpoint accepted. Optional `forceOverwrite` can bypass stale-target protection. |
| `authorDraft.reject_checkpoint` | `mutation_command` | `deny_model` | Calls the author-draft reject route, which records an author decision by mutating checkpoint lifecycle, reason, and timestamp. It does not change prose, but it is still a review decision. |

## Allow / Deny Sets For Stage 002

Recommended model-callable IDs:

- `project.get_summary`
- `project.list_scenes`
- `project.list_characters`
- `project.list_locations`
- `project.get_scene`
- `propose.outline`
- `propose.scene_draft`
- `authorDraft.get_scene_draft_context`
- `authorDraft.generate_scene_draft_checkpoint`
- `authorDraft.list_checkpoints`

Recommended model-denied IDs:

- `authorDraft.accept_checkpoint`
- `authorDraft.reject_checkpoint`

## Edge-Case Decisions

- Rejecting a checkpoint is classified as `mutation_command` even though it does not alter scene prose. The reason is product semantics: rejection is an author review decision, not model exploration.
- Generating an author-draft checkpoint is classified as `review_artifact_generation`, not `mutation_command`, because it only creates material for later review. The follow-up policy should still consider blocking or ignoring model-supplied `forceRegenerate` to avoid model-driven churn of active review artifacts.
- `project.get_scene` is `read_only` despite exposing existing manuscript content. This plan is about mutation boundaries; context exposure remains governed by the separate context discipline and route-scoping rules.
- `propose.outline` and `propose.scene_draft` are `review_artifact_generation` even though their artifacts are ephemeral rather than persisted. They still produce author-reviewable content and do not call an accept/apply API.

## Source-Contract Implications

Stage 002 should turn this classification into code by adding one of:

- Tool-definition metadata such as `capability: 'read_only' | 'review_artifact_generation' | 'mutation_command'`, or
- A central policy map keyed by tool ID.

The advertisement surface should filter out `mutation_command` tools before sending definitions to `/api/nova/agent` or the experimental `/api/ai` agentic path.

New tests should fail if any denied model tool ID is advertised, and source-contract tests should fail if model-callable tool modules import accept/reject helpers directly.
