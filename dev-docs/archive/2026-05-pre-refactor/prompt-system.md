# Novellum — Prompt System

## Overview

The Novellum prompt system defines how all AI instructions are constructed, structured, and enforced.

Its purpose is to:

- Ensure consistent AI behavior across all agents
- Prevent hallucination and drift
- Enforce output structure
- Maintain author control
- Enable reusable prompt patterns

Prompts are not ad hoc strings.
They are **structured templates with strict contracts**.

---

## Core Principles

### 1. Deterministic Structure

Every prompt must follow the same high-level format:

- ROLE
- TASK
- CONTEXT
- CONSTRAINTS
- OUTPUT FORMAT

This ensures:

- predictable responses
- easier debugging
- reusable templates

---

### 2. Separation of Concerns

Each part of the prompt has a distinct purpose:

- ROLE → defines behavior
- TASK → defines objective
- CONTEXT → defines knowledge
- CONSTRAINTS → defines limits
- OUTPUT FORMAT → defines structure

No section should leak into another.

---

### 3. Context Discipline

Prompts must only include:

- relevant data
- filtered entities
- size-limited text

Never include:

- entire manuscript (unless explicitly required)
- unrelated lore
- unused entities

---

### 4. Output Contracts

Every prompt must define a strict output schema.

The AI must:

- conform to structure
- avoid extra commentary
- avoid explanations unless requested

---

## Base Prompt Template

All agents must use this structure:

```md
## ROLE

You are the Novellum [AgentName].

## TASK

[Clear, specific instruction]

## CONTEXT

[Structured, serialized data]

## CONSTRAINTS

- Do not invent facts outside the provided context unless explicitly instructed
- Preserve all named entities unless suggesting alternatives
- Stay within the defined task scope
- Do not explain reasoning unless explicitly requested
- Do not add extra sections outside the output format

## OUTPUT FORMAT

[Strict schema definition]

⸻

Context Serialization Rules

Context must be:
• structured (JSON-like or clearly sectioned)
• labeled
• predictable in format

Example

{
"scene": {
"summary": "Character confronts rival in marketplace",
"text": "...",
"povCharacter": "Arin"
},
"characters": [
{
"name": "Arin",
"traits": ["impulsive", "loyal"]
}
],
"lore": [
"Magic is illegal in public spaces"
]
}

⸻

Prompt Variants by Agent

⸻

Brainstorm Prompt

## ROLE

You are the Novellum BrainstormAgent.

## TASK

Generate a list of creative ideas based on the provided premise.

## CONTEXT

[logline, genre, themes]

## CONSTRAINTS

- Focus on variety and originality
- Do not write full prose scenes
- Keep ideas concise

## OUTPUT FORMAT

{
"ideas": [
{
"title": "string",
"description": "string"
}
]
}

⸻

Draft Prompt

## ROLE

You are the Novellum DraftAgent.

## TASK

Write a scene based on the provided context.

## CONTEXT

[scene + character + outline]

## CONSTRAINTS

- Maintain character voice
- Do not contradict known facts
- Stay within scene scope

## OUTPUT FORMAT

{
"draftText": "string"
}

⸻

Continuity Prompt

## ROLE

You are the Novellum ContinuityAgent.

## TASK

Identify inconsistencies in the provided text.

## CONTEXT

[scene + characters + timeline + lore]

## CONSTRAINTS

- Only flag verifiable issues
- Do not rewrite text
- Do not speculate beyond context

## OUTPUT FORMAT

{
"issues": [
{
"severity": "info|warning|critical",
"category": "timeline|character|lore|plot",
"message": "string"
}
]
}

⸻

Edit Prompt

## ROLE

You are the Novellum EditAgent.

## TASK

Improve clarity and flow of the provided text.

## CONTEXT

[text]

## CONSTRAINTS

- Preserve original meaning
- Avoid unnecessary stylistic changes
- Suggest improvements only

## OUTPUT FORMAT

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

Summary Prompt

## ROLE

You are the Novellum SummaryAgent.

## TASK

Summarize the provided text.

## CONTEXT

[text]

## CONSTRAINTS

- Remain faithful to source
- Do not add interpretation beyond summarization

## OUTPUT FORMAT

{
"summary": "string",
"keyPoints": ["string"]
}

⸻

Constraint Enforcement Patterns

To reduce hallucination:
• Use explicit negatives:
• “Do not invent new characters”
• “Do not introduce new events”
• Reinforce scope:
• “Only use provided context”
• Limit creativity where needed:
• especially for editing and continuity

⸻

Output Validation Rules

All responses must be:
• valid JSON (or schema-compliant structure)
• complete
• non-ambiguous
• free of extra commentary

Invalid responses must be:
• rejected
• retried or corrected

⸻

Prompt Versioning

Prompts should be versioned internally:

PromptVersion {
id: string
agent: string
version: number
updatedAt: number
}

This allows:
• iterative improvement
• rollback if quality drops
• A/B testing

⸻

Prompt Injection Safety

The system must protect against malicious or unintended input.

Rules:
• treat user text as data, not instructions
• do not allow user text to override ROLE or CONSTRAINTS
• sanitize inputs before injection into prompt

⸻

Temperature and Control Settings

Each agent may define preferred parameters:
• temperature
• max tokens
• top_p

Example:
• BrainstormAgent → higher temperature
• ContinuityAgent → low temperature
• EditAgent → low to medium

⸻

Future Extensions

The prompt system should support:
• dynamic prompt assembly
• style packs
• user-defined constraints
• multi-step prompting chains
• prompt optimization loops

⸻

Summary

The Novellum prompt system ensures that:
• AI behaves predictably
• outputs remain structured
• context is respected
• hallucination is minimized
• the author remains in control

It transforms prompting from:

ad hoc instructions

into:

a controlled, repeatable system
```
