---
title: Core Entity Routes
slug: phase-001-core-entity-routes
phase_number: 1
status: draft
owner: Backend Agent
stage: stage-002-api-routes
parts:
  - part-001-projects-api
  - part-002-content-entities-api
estimated_duration: 1d
---

## Goal

> Build API routes for the project entity and the four content entities (chapters, scenes, beats, scene snapshots) — the most heavily used tables in the application.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Projects API Route](part-001-projects-api/part.md) | `draft` | Backend Agent | 0.33d |
| 002 | [Content Entities API Routes](part-002-content-entities-api/part.md) | `draft` | Backend Agent | 0.67d |

## Acceptance Criteria

- [ ] `GET /api/db/projects` returns all projects ordered by `createdAt DESC`
- [ ] `GET /api/db/projects/[id]` returns one project or 404
- [ ] `POST /api/db/projects` creates a project, returns 201 with full entity
- [ ] `PUT /api/db/projects/[id]` updates and returns updated entity
- [ ] `DELETE /api/db/projects/[id]` deletes and returns 204
- [ ] Same CRUD contract satisfied for `chapters`, `scenes`, `beats`, `scene_snapshots`
- [ ] `GET /api/db/chapters?projectId=X` returns filtered chapters ordered by `order ASC`
- [ ] `GET /api/db/scenes?projectId=X` and `?chapterId=X` filtering works
- [ ] `GET /api/db/beats?sceneId=X` filtering works
- [ ] All routes return `{ error: string }` on validation failure (400)

## Notes

> Part 001 establishes the full route pattern (request parsing, validation, response shape, error handling) that Part 002 replicates for content entities. Implement Part 001 first and use it as the template.
