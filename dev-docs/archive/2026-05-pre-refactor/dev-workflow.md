# Novellum — Development Workflow

## Overview

The Novellum development workflow defines how features are designed, built, tested, and refined using a combination of:

- structured documentation
- AI coding agents
- iterative refinement

This workflow is optimized for:

- solo development
- agent-assisted coding (Copilot, GPT, etc.)
- rapid iteration without loss of structure
- maintaining long-term code quality

---

## Core Philosophy

### 1. Spec First, Code Second

No feature should be implemented without a defined specification.

Every feature must begin as:

- a clearly defined problem
- a structured solution
- a scoped implementation plan

---

### 2. Small, Controlled Iterations

Avoid large, uncontrolled builds.

Each feature should be:

- broken into small tasks
- implemented incrementally
- validated at each step

---

### 3. AI as an Implementation Engine

AI is used to:

- generate boilerplate
- implement features from specs
- refactor code
- debug issues

AI is NOT used to:

- define architecture (without guidance)
- make product decisions
- bypass specifications

---

### 4. Human as System Architect

The developer (you) is responsible for:

- defining structure
- validating outputs
- enforcing consistency
- making final decisions

---

## Development Loop

```text
Feature Idea
  ↓
Feature Spec
  ↓
Task Breakdown
  ↓
Agent Execution
  ↓
Review & Refine
  ↓
Commit


⸻

Step 1 — Define Feature

Start with a clear feature definition.

Example:
	•	“Add character management UI”
	•	“Implement continuity checker”
	•	“Build outline editor”

⸻

Step 2 — Create Feature Spec

Every feature must have a spec file.

Use:
feature-spec-template.md

The spec should define:
	•	purpose
	•	user interactions
	•	data requirements
	•	UI behavior
	•	edge cases

⸻

Step 3 — Break Into Tasks

Convert the spec into discrete tasks.

Example:

- Create character schema
- Build Dexie table
- Create UI list view
- Add create/edit form
- Link to story bible

Each task should be:
	•	small
	•	testable
	•	independent where possible

⸻

Step 4 — Agent Execution

Use AI agents to implement tasks.

Prompt Pattern

You are a senior frontend engineer.

Implement the following task:

[task description]

Constraints:
- Follow existing architecture
- Use SvelteKit patterns
- Keep code modular
- Do not introduce unnecessary dependencies


⸻

Execution Strategy
	•	Generate initial implementation
	•	Review output
	•	Refine with follow-up prompts
	•	Repeat until correct

⸻

Step 5 — Review & Refine

Before committing:
	•	test functionality
	•	verify UI behavior
	•	ensure code readability
	•	check alignment with architecture

⸻

Step 6 — Commit

Use structured commits:

feat: add character creation UI
fix: resolve timeline sorting bug
refactor: simplify context builder logic


⸻

Module-Based Development

Each feature should map to a module:
	•	story-bible/
	•	outliner/
	•	drafting/
	•	ai/
	•	consistency/

Each module should contain:
	•	UI components
	•	logic/services
	•	types
	•	state management

⸻

AI Usage Guidelines

When to Use AI
	•	generating components
	•	writing API calls
	•	refactoring logic
	•	debugging errors

⸻

When NOT to Use AI
	•	defining system architecture
	•	making UX decisions without context
	•	merging large unreviewed code blocks

⸻

Prompting Best Practices
	•	be explicit about constraints
	•	reference existing patterns
	•	request incremental changes
	•	avoid vague instructions

⸻

Debugging Workflow

When something breaks:
	1.	isolate the issue
	2.	gather error output
	3.	provide minimal reproducible context to AI
	4.	request targeted fix

⸻

Refactoring Strategy

Refactor when:
	•	code becomes duplicated
	•	logic becomes unclear
	•	performance degrades

Refactor in small steps:
	•	never rewrite entire modules at once

⸻

Version Control Strategy
	•	commit frequently
	•	keep commits focused
	•	avoid large “dump” commits

Branches (optional):
	•	feature/...
	•	refactor/...
	•	fix/...

⸻

Definition of Done

A feature is complete when:
	•	it meets spec requirements
	•	UI behaves correctly
	•	no major bugs exist
	•	code is readable
	•	integrated with existing system

⸻

Common Pitfalls

Avoid:
	•	skipping specs
	•	over-relying on AI without review
	•	building too many features at once
	•	ignoring data model consistency
	•	mixing responsibilities across modules

⸻

Future Workflow Enhancements
	•	automated agent pipelines
	•	test generation via AI
	•	CI/CD integration
	•	code quality checks

⸻

Summary

The Novellum development workflow ensures:
	•	structured progress
	•	controlled use of AI
	•	high-quality implementation
	•	scalability over time

It transforms development from:

reactive coding

into:

intentional system building
```
