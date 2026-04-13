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
- Story bible
- Outlines
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
- Story Bible
- Outliner
- Drafting Editor
- AI System
- Consistency Engine
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
Local Data Layer (Dexie / IndexedDB)
↔
External Services

- ONLYOFFICE (editing engine)
- OpenRouter (AI processing)

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

### Dexie.js (IndexedDB)

Acts as the primary data store.

Stores:

- Projects
- Characters
- Scenes
- Chapters
- Timeline events
- AI outputs (optional caching)

Requirements:

- Schema versioning
- Fast queries
- Relationship mapping between entities

---

## Editor Integration

### ONLYOFFICE Docs

Used exclusively for long-form text editing.

Responsibilities:

- Chapter drafting
- Rich text editing
- Formatting

Constraints:

- No business logic
- No state ownership
- Embedded via iframe or API

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
- Story bible editing
- Outline editing
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

## Performance Strategy

### Large Manuscript Handling

- Load chapters individually
- Avoid full-document rendering
- Lazy load story bible data
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
