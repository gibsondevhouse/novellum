# Novellum User Manual

Welcome to the Novellum User Manual. Novellum is a local-first, AI-assisted novel production system that integrates with the Gemini CLI via specialized AI agents to streamline your novel writing process.

## 1. System Philosophy

Novellum believes in AI as an **assistant**, not an author. The system acts as a continuity engine and intelligent editor, helping you organize thoughts visually and structurally without compromising your creative voice.

## 2. Core Modules

### 2.1 Project Hub

The entry point for all your books. Here you can create cross-book series or single standalone novels. All data is persisted locally via Dexie.js for privacy and speed.

### 2.2 Story Bible

A living encyclopedia of your universe. It stores Characters, Locations, Items, and Lore. The Story Bible heavily feeds into the context engine, ensuring the AI deeply understands the nuances, relationships, and history present within your story.

### 2.3 Outliner

A structured beat-sheet and drafting view. Powered by Tiptap, this module lets you arrange Acts, Chapters, and Scenes. It helps you pace the story before drafting the prose.

### 2.4 Draft Editor

The core writing experience, powered by an integrated ONLYOFFICE backend, allowing for rich-text editing, commenting, and track-changes while you convert your beats into full scenes.

### 2.5 Consistency Engine & AI Integration

By utilizing specialized AI agents—such as the `ai.agent` for direct interaction, and workflows triggered through the UI or Gemini CLI—Novellum actively reads ahead and behind, alerting you to continuity errors, tone shifts, or missing details based directly on the facts in your Story Bible.

### 2.6 Export

Once the manuscript passes your quality standards, the assembler module compiles the chapters into publication-ready formats.

## 3. Workflow Example

1. **Initialize a Project**: Start in the Project Hub.
2. **Populate the Story Bible**: Add your main protagonist and primary setting.
3. **Outline**: Create your first act's beat sheet in the Outliner.
4. **Draft**: Open the Draft Editor for Scene 1. Use the AI to expand on beats.
5. **Review**: The Consistency Engine will automatically cross-reference newly written prose against the Story Bible.
