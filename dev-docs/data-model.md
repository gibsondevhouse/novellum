# Novellum — Data Model

## Overview

The Novellum data model defines how all story elements are structured, stored, and related.

It is designed to:

- Enable fast local queries
- Support AI context construction
- Maintain continuity across the story
- Scale to full-length novels and beyond

All data is stored locally using IndexedDB (via Dexie.js).

---

## Core Design Principles

### 1. Entity-Based Structure

All story components are modeled as structured entities.

Examples:

- Project
- Character
- Chapter
- Scene
- Location
- TimelineEvent

Each entity has:

- A unique ID
- Defined fields
- Relationships to other entities

---

### 2. Relational Thinking (Without a Traditional DB)

Relationships are stored via IDs:

- Characters reference other characters
- Scenes reference chapters and locations
- Timeline events reference related entities

This allows:

- Flexible querying
- Efficient updates
- AI-friendly context building

---

### 3. AI-Readable Structure

Data is designed to be easily serialized into prompts:

- Clean field naming
- Predictable structure
- Minimal nesting where possible

---

## Core Entities

---

### Project

```ts
Project {
  id: string
  title: string
  genre: string
  logline: string
  synopsis: string
  targetWordCount: number
  createdAt: number
  updatedAt: number
}


⸻

Character

Character {
  id: string
  name: string
  role: string
  traits: string[]
  goals: string[]
  flaws: string[]
  relationships: CharacterRelationship[]
  arcs: string[]
  notes: string
  tags: string[]
}


⸻

CharacterRelationship

CharacterRelationship {
  targetCharacterId: string
  type: string
  description: string
}


⸻

Chapter

Chapter {
  id: string
  projectId: string
  title: string
  order: number
  summary: string
  sceneIds: string[]
  wordCount: number
  createdAt: number
  updatedAt: number
}


⸻

Scene

Scene {
  id: string
  chapterId: string
  title: string
  summary: string
  povCharacterId: string
  locationId: string
  timelineEventId: string
  order: number
  text: string
  wordCount: number
}


⸻

Location

Location {
  id: string
  name: string
  description: string
  tags: string[]
  notes: string
}


⸻

TimelineEvent

TimelineEvent {
  id: string
  timestamp: number
  title: string
  description: string
  relatedEntityIds: string[]
}


⸻

LoreEntry

LoreEntry {
  id: string
  title: string
  category: string
  description: string
  rules: string[]
  relatedEntityIds: string[]
}


⸻

PlotThread

PlotThread {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "resolved"
  relatedSceneIds: string[]
}


⸻

Derived Data (Computed, Not Stored)

These are calculated at runtime:
	•	Chapter word counts (sum of scenes)
	•	Project progress percentage
	•	Active plot threads
	•	Character appearance frequency
	•	Timeline ordering

⸻

Indexing Strategy

To ensure performance, index:
	•	projectId
	•	chapterId
	•	order
	•	povCharacterId
	•	timelineEventId

⸻

Relationships Overview

Project
  ├── Chapters
  │     ├── Scenes
  │           ├── Character (POV)
  │           ├── Location
  │           └── TimelineEvent
  │
  ├── Characters
  │     └── Relationships (to other characters)
  │
  ├── Locations
  ├── TimelineEvents
  ├── LoreEntries
  └── PlotThreads


⸻

AI Context Construction

When building AI input, the system should:

For Drafting

Include:
	•	Current scene
	•	Previous scene or chapter
	•	POV character
	•	Relevant lore

⸻

For Continuity Checking

Include:
	•	Full character profiles (relevant only)
	•	Timeline events
	•	Plot threads
	•	Scene text

⸻

For Editing

Include:
	•	Scene or chapter text only
	•	Style constraints

⸻

Versioning Strategy

Each entity should support versioning:
	•	Store updatedAt
	•	Optional revision snapshots for chapters
	•	Allow rollback for drafts

⸻

Storage Constraints
	•	Avoid deeply nested objects
	•	Prefer flat structures with references
	•	Keep text fields separate from metadata where possible

⸻

Future Extensions

The data model supports:
	•	Multi-book universes
	•	Shared lore across projects
	•	Collaboration layers
	•	Tag-based querying systems
	•	Advanced analytics

⸻

Summary

The Novellum data model is designed to:
	•	Represent complex narrative structures
	•	Enable fast local operations
	•	Support AI-assisted workflows
	•	Maintain consistency across long-form fiction

```
