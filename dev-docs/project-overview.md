# Novellum — Project Overview

## Overview

Novellum is a local-first, AI-assisted novel writing system designed to take a writer from idea to fully polished, publication-ready manuscript within a single structured environment.

It is not just a writing tool.  
It is a **novel production system**.

---

## Problem

Long-form fiction writing is fragmented across tools:

- Notes live in scattered apps
- Outlines are loosely structured or inconsistent
- Drafts exist in isolation from planning
- Character and lore tracking is manual
- Continuity errors compound over time
- Editing requires multiple disconnected passes

This fragmentation leads to:

- Lost ideas
- Broken continuity
- Slower drafting
- Heavy post-writing cleanup

---

## Solution

Novellum consolidates the entire writing lifecycle into a single system:

- Idea capture
- Structured story planning
- Chapter drafting
- Continuity validation
- Multi-pass editing
- Export to publishing formats

Every part of the novel exists in a **connected, queryable system** rather than isolated documents.

---

## System Philosophy

### 1. Structured Creativity

Creativity is supported by structure, not replaced.

- Ideas are captured in organized systems
- Story elements are interconnected
- The system reduces cognitive load on the writer

---

### 2. Author-in-the-Loop AI

AI assists, but never replaces the author.

- AI suggests, never overwrites
- All changes are reviewable
- The writer approves every modification

---

### 3. Continuity as a Core Constraint

Continuity is treated as a system-level requirement.

The system actively tracks:

- Character consistency
- Timeline accuracy
- World rules
- Plot thread resolution

---

## Core Modules

### Project Hub

Each novel is its own workspace.

Contains:

- Title
- Genre
- Logline
- Synopsis
- Target word count
- Progress tracking
- Notes

---

### Story Bible

Structured memory layer for the entire story.

Includes:

- Characters
- Relationships
- Locations
- Timeline
- Lore
- World rules
- Active plot threads

---

### Outliner

Structured planning system.

Supports:

- Act structure
- Chapter breakdowns
- Scene beats
- Character arcs
- Pacing control

---

### Drafting Editor

Primary writing interface.

Features:

- Chapter-based writing
- Autosave
- Version history
- Inline access to outline and bible
- Distraction-free environment

---

### Consistency Engine

Automated validation system.

Detects:

- Character inconsistencies
- Timeline conflicts
- Repeated or conflicting details
- Violations of world rules
- Unresolved plot threads

---

### Editing Layer

Structured editing workflow.

Passes include:

- Developmental editing
- Line editing
- Style refinement
- Continuity cleanup
- Final proofreading

---

### Export System

Outputs finished manuscripts.

Supported formats:

- Markdown
- DOCX
- EPUB
- Plain text

---

## AI System Overview

AI is implemented as a set of specialized assistants:

- Brainstorming assistant
- Outline generator
- Drafting assistant
- Continuity checker
- Line editor
- Final polish assistant

Each assistant operates on **scoped context**, not the entire manuscript.

---

## AI Interaction Model

| Role               | Input                        | Output             |
| ------------------ | ---------------------------- | ------------------ |
| Brainstormer       | Logline + genre              | Idea sets          |
| Outliner           | Story structure + characters | Structured outline |
| Drafter            | Scene + previous chapter     | Draft text         |
| Continuity Checker | Bible + draft                | Issue list         |
| Editor             | Draft text                   | Suggestions        |

---

## Architecture Overview

- Local-first storage for all project data
- Cloud-based AI for heavy processing
- Modular system design
- Strict project isolation

---

## MVP Scope

The first version of Novellum includes:

- Project creation
- Story bible
- Outline editor
- Chapter drafting editor
- AI drafting assistance
- Basic consistency checks
- Export functionality

---

## Target Users

Novellum is designed for:

- Indie fiction writers
- Self-publishing authors
- Solo creators
- Writers who want structured AI assistance without losing control

---

## Success Criteria

Novellum succeeds if it enables a writer to:

- Plan a complete novel
- Maintain continuity across the story
- Draft efficiently
- Edit systematically
- Export a publication-ready manuscript
