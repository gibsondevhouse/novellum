# Novellum — AI Pipeline

## Overview

The Novellum AI pipeline defines how AI requests are constructed, executed, parsed, and presented to the user.

The goal is not to create a single generic “AI writer.”
The goal is to build a controlled system of specialized AI operations that support the author without taking over authorship.

The pipeline must be:

- Context-aware
- Role-specific
- Structured
- Reversible
- Author-controlled

---

## Core AI Principles

### 1. Scoped Context Only

AI should never receive the full manuscript by default.

Each request must use only the minimum relevant context needed for the task.

Benefits:

- Better output quality
- Lower token cost
- Faster responses
- Reduced hallucination risk
- More consistent role behavior

---

### 2. Role-Based Operations

AI is divided into distinct operational roles.

Examples:

- Brainstormer
- Outliner
- Drafter
- Continuity Checker
- Line Editor
- Polish Assistant

Each role has:

- A specific purpose
- Defined input boundaries
- Required output format
- Explicit behavioral constraints

---

### 3. Author Approval Required

AI may suggest, flag, rewrite, or generate.
It may not silently apply changes.

Every AI result must be:

- Visible
- Reviewable
- Acceptable or dismissible
- Reversible after acceptance

---

## High-Level Pipeline

```text
User Action
  ↓
Task Resolver
  ↓
Context Builder
  ↓
Prompt Builder
  ↓
Model Router
  ↓
AI Response
  ↓
Response Parser
  ↓
Suggestion Layer
  ↓
Author Decision


⸻

Pipeline Stages

1. User Action

The pipeline begins when the author triggers an AI action.

Examples:
	•	“Brainstorm chapter ideas”
	•	“Draft this scene”
	•	“Check continuity”
	•	“Line edit this passage”
	•	“Summarize this chapter”

The user action determines:
	•	AI role
	•	context scope
	•	expected output format

⸻

2. Task Resolver

The Task Resolver translates the user action into a structured internal task.

Example:

{
  taskType: "draft_scene",
  role: "drafter",
  targetEntityId: "scene_014",
  contextPolicy: "scene_plus_adjacent",
  outputFormat: "draft_block"
}

Responsibilities:
	•	identify task type
	•	select role
	•	define context policy
	•	define output contract

⸻

3. Context Builder

The Context Builder gathers the minimum necessary information for the task.

Possible context sources:
	•	Project metadata
	•	Chapter summary
	•	Scene summary
	•	POV character profile
	•	Relevant lore entries
	•	Relevant timeline events
	•	Prior chapter or prior scene
	•	Style constraints
	•	User instruction text

Context should be:
	•	filtered
	•	ranked by relevance
	•	size-limited
	•	serialized predictably

⸻

Context Policies

Five named policies (`scene_only`, `scene_plus_adjacent`, `chapter_scope`, `continuity_scope`, `outline_scope`) map task types to scoped entity sets. Full policy definitions — including what each includes, filters, and truncates — are specified in [`context-engine.md`](context-engine.md).

⸻

4. Prompt Builder

The Prompt Builder assembles the final prompt using a five-section structure: ROLE, TASK, CONTEXT, CONSTRAINTS, OUTPUT FORMAT. Prompt generation must be deterministic in shape even if content changes. Full template definitions, per-agent variants, constraint enforcement patterns, and output validation rules are specified in [`prompt-system.md`](prompt-system.md).

⸻

5. Model Router

The Model Router selects which model to use based on task type.

Selection factors:
	•	latency sensitivity
	•	context size
	•	quality requirements
	•	cost thresholds
	•	task complexity

Example Routing Rules
	•	Brainstorming:
	•	fast, low-cost model
	•	Line editing:
	•	high-quality language model
	•	Continuity checking:
	•	high-reasoning model
	•	Long chapter analysis:
	•	long-context model

The routing layer must remain abstract so models can be swapped without changing workflow logic.

⸻

6. AI Response

The AI returns a structured result.

The result should never be treated as raw final content by default.

All response types should be normalized into one of these categories:
	•	suggestion set
	•	drafted text
	•	issue list
	•	rewrite options
	•	summary block
	•	structured outline expansion

⸻

7. Response Parser

The Response Parser converts raw model output into application-safe data.

Responsibilities:
	•	validate schema
	•	reject malformed results
	•	extract structured fields
	•	sanitize formatting
	•	separate generated prose from commentary

Example parsed result:

{
  type: "issue_list",
  items: [
    {
      severity: "warning",
      category: "timeline",
      message: "Character appears in two places on the same day.",
      relatedEntityIds: ["char_02", "scene_11", "timeline_07"]
    }
  ]
}

The parser is a safety boundary.
No unparsed AI output should directly mutate user data.

⸻

8. Suggestion Layer

Parsed AI output is shown in the UI as suggestions, not auto-applied changes.

Possible UI forms:
	•	inline rewrite cards
	•	issue panels
	•	side-by-side diff view
	•	outline insertion preview
	•	chapter summary blocks

Every suggestion should support:
	•	accept
	•	reject
	•	copy
	•	regenerate

⸻

9. Author Decision

The author remains the final authority.

Allowed outcomes:
	•	accept suggestion
	•	reject suggestion
	•	partially apply suggestion
	•	request regeneration
	•	edit before applying

This keeps Novellum aligned with author-in-the-loop design.

⸻

Output Contracts

Each task type should map to a strict output contract.

Brainstorm

{
  "ideas": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}

Draft

{
  "draftText": "string"
}

Continuity Check

{
  "issues": [
    {
      "severity": "info|warning|critical",
      "category": "timeline|character|lore|plot",
      "message": "string"
    }
  ]
}

Line Edit

{
  "suggestions": [
    {
      "original": "string",
      "replacement": "string",
      "reason": "string"
    }
  ]
}


⸻

Failure Handling

The AI pipeline must fail gracefully.

Failure modes:
	•	timeout
	•	invalid output
	•	empty response
	•	rate limit
	•	model unavailable
	•	over-context request

Required handling:
	•	show clear user-facing error
	•	preserve user work
	•	allow retry
	•	optionally downgrade to fallback model

⸻

Logging and Observability

The system should track:
	•	task type
	•	selected model
	•	token usage estimate
	•	response success/failure
	•	parse success/failure
	•	user acceptance rate

This data helps improve routing, prompts, and UI design over time.

⸻

Privacy and Safety

The AI pipeline must follow these rules:
	•	send minimal required context
	•	never store manuscript content remotely by default
	•	never expose hidden system prompts to the user
	•	never auto-apply destructive edits
	•	never silently rewrite accepted text

⸻

Future Extensions

The pipeline should later support:
	•	multi-step chained workflows
	•	critique followed by rewrite
	•	chapter-to-chapter continuity sweeps
	•	series-level memory systems
	•	user-selectable model profiles
	•	custom writing style packs

⸻

Summary

The Novellum AI pipeline exists to make AI useful without making it intrusive.

It transforms user intent into:
	•	scoped context
	•	controlled prompt construction
	•	structured model output
	•	author-reviewed suggestions

This ensures the system remains:
	•	fast
	•	safe
	•	modular
	•	transparent
	•	aligned with the writer’s authority
```
