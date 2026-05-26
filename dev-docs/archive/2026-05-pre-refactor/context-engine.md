# Novellum — Context Engine

## Overview

The Context Engine is responsible for selecting, filtering, and assembling the exact information sent to AI agents.

It determines:

- what the AI sees
- how much it sees
- how relevant that information is

This system is critical for:

- output quality
- consistency
- performance
- cost control

Poor context = poor results  
Precise context = high-quality, predictable output

---

## Core Responsibilities

The Context Engine must:

- identify relevant entities
- rank importance of data
- enforce size limits
- serialize context consistently
- support multiple context policies

---

## Core Principles

### 1. Relevance Over Volume

More context is not better.

The engine must prioritize:

- most relevant
- most recent
- most connected

---

### 2. Deterministic Selection

Given the same input, the engine should produce the same context.

No randomness in selection.

---

### 3. Structured Output

All context must be:

- labeled
- predictable
- machine-readable

---

### 4. Hard Size Limits

Context must respect:

- token limits
- performance constraints

The system must truncate or compress when necessary.

---

## Context Construction Flow

```text
Task Trigger
  ↓
Context Policy Selection
  ↓
Entity Retrieval
  ↓
Relevance Ranking
  ↓
Filtering & Truncation
  ↓
Serialization


⸻

Context Policies

⸻

scene_only

Used for:
	•	line edits
	•	rewrite tasks

Includes:
	•	current scene text only

⸻

scene_plus_adjacent

Used for:
	•	drafting
	•	scene continuation

Includes:
	•	current scene
	•	previous scene summary OR next scene summary
	•	chapter summary
	•	POV character

⸻

chapter_scope

Used for:
	•	chapter review
	•	summarization

Includes:
	•	all scenes in chapter (summarized if needed)
	•	chapter metadata
	•	active plot threads

⸻

continuity_scope

Used for:
	•	consistency validation

Includes:
	•	target text
	•	relevant characters
	•	relevant timeline events
	•	relevant lore rules
	•	open plot threads

⸻

outline_scope

Used for:
	•	outline generation
	•	structure expansion

Includes:
	•	project premise
	•	act structure
	•	chapter list
	•	major characters
	•	major plot threads

⸻

Entity Retrieval

The engine must retrieve only relevant entities.

Retrieval Sources
	•	Characters
	•	Scenes
	•	Chapters
	•	Locations
	•	Timeline events
	•	Lore entries
	•	Plot threads

⸻

Retrieval Rules
	•	Match by ID when explicit
	•	Match by relationship (linked entities)
	•	Match by proximity (same chapter, nearby scenes)
	•	Match by tags (optional future feature)

⸻

Relevance Ranking

Each entity should be scored based on:
	•	direct reference in target text
	•	relationship to POV character
	•	recency in timeline
	•	frequency of appearance
	•	explicit user selection

⸻

Example Scoring

score = (
  directReference * 5 +
  relationshipStrength * 3 +
  timelineProximity * 2 +
  frequency * 1
)

Higher score = higher priority inclusion

⸻

Filtering Strategy

After ranking:
	•	include top N entities
	•	discard low-relevance items
	•	enforce maximum counts

Example limits:
	•	max 3–5 characters
	•	max 2–3 lore entries
	•	max 3 timeline events

⸻

Truncation Strategy

If text exceeds limits:
	•	summarize older scenes
	•	truncate long descriptions
	•	keep full text for current scene only

⸻

Serialization Format

Context must be serialized consistently.

Example

{
  "scene": {
    "summary": "Arin confronts rival in marketplace",
    "text": "...",
    "povCharacter": "Arin"
  },
  "characters": [
    {
      "name": "Arin",
      "traits": ["impulsive", "loyal"]
    }
  ],
  "timeline": [
    {
      "event": "Festival Day",
      "timestamp": 1023
    }
  ],
  "lore": [
    "Magic is illegal in public spaces"
  ]
}


⸻

Context Compression

When context is too large:

Techniques
	•	summarize previous scenes
	•	reduce character fields to essentials
	•	collapse lists into bullet-style strings
	•	remove low-priority metadata

⸻

Context Layers

The engine should support layered context:

Core Layer
	•	target text
	•	immediate entities

⸻

Supporting Layer
	•	related characters
	•	relevant lore
	•	timeline context

⸻

Peripheral Layer (optional)
	•	distant references
	•	low-priority entities

⸻

Caching Strategy

Frequently used context should be cached:
	•	chapter summaries
	•	character summaries
	•	timeline snapshots

Benefits:
	•	faster response times
	•	reduced computation

⸻

User Overrides

The user should be able to:
	•	pin characters to context
	•	force include specific lore
	•	exclude certain entities

⸻

Failure Handling

If context cannot be built properly:
	•	fall back to minimal context
	•	notify user if necessary
	•	allow retry

⸻

Privacy Constraints
	•	never include hidden system prompts
	•	never include unrelated user data
	•	minimize sensitive content sent externally

⸻

Future Enhancements
	•	semantic search for relevance
	•	embedding-based retrieval
	•	cross-project context (shared universes)
	•	adaptive context sizing based on model

⸻

Summary

The Context Engine is the intelligence filter of Novellum.

It ensures that:
	•	AI receives only what it needs
	•	irrelevant data is excluded
	•	outputs remain consistent and accurate
	•	performance and cost are controlled

This system transforms AI from:

guessing based on text

into:

reasoning based on structured knowledge

---

This is one of the *most important* pieces you now have.

Without it, AI is a storyteller.
With it, AI becomes a **continuity-aware co-author**.
```
