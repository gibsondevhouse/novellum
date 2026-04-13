# Novellum — Agents Map

## Overview

Novellum uses a system of specialized AI agents instead of a single general-purpose model.

Each agent is:

- Role-specific
- Context-scoped
- Task-bound
- Output-constrained

Agents do not act autonomously.
They are invoked by the system in response to user actions.

---

## Design Principles

### 1. Single Responsibility

Each agent does one thing well.

- No agent should perform multiple unrelated tasks
- No “do everything” agent

---

### 2. Predictable Behavior

Each agent must:

- Receive structured input
- Produce structured output
- Follow strict constraints

---

### 3. Composability

Agents can be chained together:

Example:

- ContinuityAgent → identifies issues
- DraftAgent → rewrites scene with fixes
- EditAgent → polishes output

---

### 4. Author Control

Agents:

- Suggest only
- Never auto-apply changes
- Always expose outputs to the user

---

## Core Agents

---

### BrainstormAgent

#### Purpose

Generate creative ideas based on minimal input.

#### Inputs

- logline
- genre
- themes (optional)
- constraints (optional)

#### Outputs

- list of ideas
- hooks
- variations

#### Use Cases

- story concepts
- plot twists
- scene ideas
- character concepts

#### Constraints

- do not produce full prose
- focus on breadth over depth
- avoid repetition

---

### OutlineAgent

#### Purpose

Generate or refine structured outlines.

#### Inputs

- project premise
- characters
- act structure (optional)
- existing outline (optional)

#### Outputs

- acts
- chapters
- scene beats

#### Use Cases

- initial outline creation
- expanding chapters
- improving pacing

#### Constraints

- must follow hierarchical structure
- must not contradict known story elements

---

### DraftAgent

#### Purpose

Generate narrative prose for scenes or chapters.

#### Inputs

- scene summary
- chapter context
- POV character
- style constraints
- adjacent scenes (optional)

#### Outputs

- draft text

#### Use Cases

- writing new scenes
- continuing existing drafts
- filling narrative gaps

#### Constraints

- must respect character voice
- must not contradict known facts
- must remain within scene scope

---

### ContinuityAgent

#### Purpose

Detect inconsistencies in the story.

#### Inputs

- scene or chapter text
- relevant characters
- timeline events
- lore rules
- plot threads

#### Outputs

- structured issue list

#### Issue Types

- timeline conflicts
- character inconsistencies
- lore violations
- unresolved plot threads

#### Constraints

- do not rewrite text
- do not speculate beyond provided context
- flag only verifiable issues

---

### EditAgent

#### Purpose

Improve clarity, flow, and prose quality.

#### Inputs

- scene or chapter text
- style guidelines (optional)

#### Outputs

- line edit suggestions
- rewrite options

#### Use Cases

- sentence refinement
- clarity improvements
- tone consistency

#### Constraints

- preserve meaning
- avoid stylistic overreach
- suggest, do not overwrite

---

### StyleAgent

#### Purpose

Ensure stylistic consistency across the manuscript.

#### Inputs

- text sample
- target style rules
- prior writing samples (optional)

#### Outputs

- style deviations
- rewrite suggestions

#### Use Cases

- tone alignment
- voice consistency
- narrative cohesion

#### Constraints

- do not alter plot
- focus only on style

---

### SummaryAgent

#### Purpose

Condense content into structured summaries.

#### Inputs

- scene or chapter text

#### Outputs

- summaries
- key events
- character actions

#### Use Cases

- chapter summaries
- recap generation
- outline backfilling

#### Constraints

- must be faithful to source text
- no added interpretation beyond summarization

---

### ExpansionAgent

#### Purpose

Expand high-level ideas into detailed content.

#### Inputs

- outline nodes
- summaries
- partial drafts

#### Outputs

- expanded scenes
- detailed beats

#### Use Cases

- turning bullet points into scenes
- deepening narrative detail

#### Constraints

- must follow existing structure
- must not introduce contradictions

---

### RewriteAgent

#### Purpose

Provide alternative versions of existing text.

#### Inputs

- original text
- rewrite goal (tone, pacing, clarity)

#### Outputs

- multiple rewrite options

#### Use Cases

- tone shifts
- pacing adjustments
- stylistic experimentation

#### Constraints

- must preserve core meaning
- must not introduce new facts

---

## Agent Trigger Map

| User Action       | Agent           |
| ----------------- | --------------- |
| Brainstorm ideas  | BrainstormAgent |
| Create outline    | OutlineAgent    |
| Expand outline    | ExpansionAgent  |
| Draft scene       | DraftAgent      |
| Continue writing  | DraftAgent      |
| Check continuity  | ContinuityAgent |
| Improve writing   | EditAgent       |
| Adjust tone/style | StyleAgent      |
| Summarize chapter | SummaryAgent    |
| Rewrite passage   | RewriteAgent    |

---

## Agent Chaining Examples

### Example 1: Fix a Scene

1. ContinuityAgent → identify issues
2. RewriteAgent → generate corrected version
3. EditAgent → polish language

---

### Example 2: Build a Chapter

1. OutlineAgent → generate structure
2. ExpansionAgent → expand scenes
3. DraftAgent → write prose

---

### Example 3: Polish Final Draft

1. EditAgent → line edits
2. StyleAgent → tone consistency
3. SummaryAgent → generate recap

---

## Agent Configuration (Internal)

Each agent should define:

```ts
AgentConfig {
  name: string
  role: string
  contextPolicy: string
  outputFormat: string
  modelPreference: string
}


⸻

Model Selection Strategy

Agents may prefer different models:
	•	BrainstormAgent → fast, creative model
	•	DraftAgent → balanced quality model
	•	ContinuityAgent → reasoning-focused model
	•	EditAgent → high language quality model

Model selection should be handled by the AI pipeline.

⸻

Guardrails

All agents must follow:
	•	No silent edits
	•	No hallucinated facts outside context
	•	No destructive overwrites
	•	No breaking output schema

⸻

Future Agents

Planned expansions:
	•	PlotArchitectAgent
	•	DialogueAgent
	•	WorldbuildingAgent
	•	SeriesContinuityAgent
	•	PublishingFormatterAgent

⸻

Summary

The Novellum agent system transforms AI from:

a single unpredictable tool

into:

a coordinated system of specialized assistants

Each agent is:
	•	focused
	•	predictable
	•	composable
	•	controllable

This ensures high-quality outputs and a consistent user experience.
```
