# Novellum — Architecture Overview

## Overview

Novellum is built as a **local-first, modular application** with cloud-assisted AI capabilities.

The architecture is designed to:

- Keep all creative work locally owned and accessible
- Minimize latency during writing and navigation
- Use cloud AI only when necessary
- Maintain strict separation between projects
- Enable scalable feature expansion

---

## Core Architectural Principles

### 1. Local-First Design

All critical data is stored locally:

- Projects
- World building data
- Outlines and Workspace data
- Drafts
- Metadata

Benefits:

- Offline capability
- Instant load times
- User data ownership
- Reduced cloud dependency

---

### 2. Cloud-Assisted AI

AI is used as an external compute layer.

- No project data is permanently stored in the cloud
- Context is constructed and sent per request
- Responses are parsed and applied locally

This ensures:

- Privacy
- Cost control
- Flexible model usage

---

### 3. Modular System Design

Each major feature is isolated into its own module:

- Project Management
- World Building (formerly Story Bible)
- Workspace (formerly Outliner)
- Drafting Editor
- AI System
- Consistency (formerly Consistency Engine)
- Export System

Modules communicate through defined interfaces, not shared state.

**This principle is a hard constraint, not a guideline.** The enforced rules — import boundaries, file responsibility limits, prohibited patterns, and ESLint tooling configuration — are fully specified in:

> [`dev-docs/modular-boundaries.md`](modular-boundaries.md)

All coding agents must read that document before implementing any source files.

---

### 4. Project Isolation

Each novel is a completely independent dataset.

- No cross-project contamination
- Separate storage namespaces
- Independent AI context construction

---

## High-Level System Diagram

UI Layer (SvelteKit)
↓
Application Logic Layer
↓
API Client (fetch → /api/db/*)
↓
SvelteKit Server (Node.js via adapter-node)
↓
SQLite (novellum.db via better-sqlite3)

External Services:

- OpenRouter (AI processing)

Portability Layer (browser-only):

- Dexie / IndexedDB → .novellum.zip export/import

---

## Frontend Layer

### SvelteKit Responsibilities

- Routing between modules
- Component rendering
- State orchestration
- UI interaction handling

The frontend acts as the **control center** for all operations.

---

## Local Data Layer

Novellum uses a **dual-layer** data architecture:

### SQLite (Server-Side — Live Data)

The primary data store is a server-side SQLite database (`novellum.db`) accessed via `better-sqlite3`. All browsers connecting to the SvelteKit server share the same dataset.

- Location: `src/lib/server/db/` (schema, migrations, singleton client)
- REST API: `/api/db/*` routes provide CRUD for all 16 entity tables
- JSON arrays (traits, goals, characterIds, etc.) are stored as TEXT and (de)serialized at the API boundary via `serialize.ts`
- WAL mode enabled for concurrent read performance
- DB path configurable via `NOVELLUM_DB_PATH` env var (default: `./novellum.db`)

Stores:

- Projects, Chapters, Scenes, Beats
- Characters, Character Relationships, Locations
- Lore Entries, Plot Threads, Timeline Events
- Consistency Issues, Export Settings
- Scene Snapshots, Story Frames, Acts, Arcs

### Dexie.js (IndexedDB — Portability)

Retained for the browser-to-browser portability ZIP workflow (plan-006). Dexie is **not** the live data store — it serves as the backing store for `.novellum.zip` export/import only.

- Schema: `src/lib/db/schema.ts` (version 11)
- AppDB class: `src/lib/db/index.ts`
- Module repositories no longer read/write Dexie — they call the SQLite REST API via `src/lib/api-client.ts`

### Migration Path

A one-time IndexedDB → SQLite migration utility is available at `/settings/migrate` for users with existing browser data.

---

## Editor Integration

### TipTap

Used for long-form text editing (rich text drafting).

Responsibilities:

- Chapter and scene drafting
- Rich text editing
- Formatting

Constraints:

- No business logic
- No state ownership

---

## AI Integration Layer

### OpenRouter

Used as a model routing layer for AI operations.

Responsibilities:

- Processing prompts
- Returning structured outputs

Constraints:

- Stateless
- No persistent memory
- No direct access to project data

---

## AI Request Flow

User Action
↓
Context Builder
↓
Prompt Template
↓
OpenRouter API Call
↓
Response Parser
↓
UI Suggestion Layer

---

### Context Builder

Constructs scoped input using:

- Relevant characters
- Scene metadata
- Outline nodes
- Prior text (limited window)

---

### Prompt Template

Defines:

- Role (editor, drafter, etc.)
- Task
- Constraints
- Output format

---

### Response Parser

Converts AI output into:

- Suggestions
- Structured edits
- Flags or warnings

---

## Offline Strategy

### Fully Available Offline

- Project creation
- World building editing
- Workspace / Outline editing
- Chapter drafting
- Navigation

### Requires Internet

- AI-assisted features
- Model-based editing
- Large-scale analysis

---

### Offline Fallback Behavior

- Queue AI requests
- Notify user when connection returns
- Allow manual retry

---

## Portability — Manual Backup and Restore

Novellum supports **browser-to-browser portability** through a manual backup/restore ZIP workflow. This is the V1 portability contract, entirely client-side with no cloud dependency.

### Archive Format

Backup archives use the `.novellum.zip` extension and contain:

- `manifest.json` — versioned metadata, table counts, SHA-256 checksums
- `db/<table>.json` — one file per Dexie table (JSON array of rows)
- `kv/localStorage.json` — allowlisted localStorage planning keys

### Compatibility Policy

- **Format version** and **DB schema version** are embedded in the manifest
- Import rejects archives from newer format or schema versions (forward-version protection)
- Import allows equal or older versions with warnings for schema drift
- SHA-256 checksums are verified before any restore writes

### Restore Semantics

- V1 uses **replace-only** policy: imported data replaces existing project state
- All DB writes run inside a single Dexie transaction for atomicity
- On failure, existing data remains intact (fail-fast rollback)
- localStorage keys are restored outside the transaction (best-effort)

### Error Taxonomy

All portability failures surface explicit error codes: `MISSING_MANIFEST`, `MALFORMED_MANIFEST`, `MISSING_REQUIRED_FIELD`, `FUTURE_FORMAT_VERSION`, `FUTURE_DB_SCHEMA_VERSION`, `INVALID_TABLE_COUNTS`, `INVALID_CHECKSUMS`, `CHECKSUM_MISMATCH`.

---

## Performance Strategy

### Large Manuscript Handling

- Load chapters individually
- Avoid full-document rendering
- Lazy load world building data
- Cache frequently accessed entities

---

### Expected Scale

- 200,000+ word novels
- Dozens of characters
- Complex timelines

---

## Deployment Architecture

### Web (PWA)

- SvelteKit frontend
- Service worker for offline support

---

### Desktop (Tauri)

- Native wrapper for:
  - macOS
  - Windows
  - Linux

- Local file system access
- Offline-first operation

---

### Optional Cloud Sync

- ElectricSQL or similar

Used for:

- Cross-device syncing
- Backup

Not required for core functionality

---

## Security Considerations

- All sensitive data stored locally
- API keys managed securely
- No automatic cloud persistence
- Explicit user control over AI usage

---

## Future Scalability

The architecture supports:

- Plugin systems
- Multi-book universes
- Collaboration features
- Advanced AI pipelines
- Custom export pipelines

---

## Summary

Novellum’s architecture is designed to:

- Prioritize speed and ownership through local-first design
- Use AI as a controlled, external assistant
- Maintain modular, scalable systems
- Support large, complex writing projects without degradation
