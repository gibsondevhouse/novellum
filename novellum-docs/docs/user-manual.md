# Novellum User Manual

Welcome to the Novellum User Manual. Novellum is a local-first, AI-assisted novel production system that integrates with the Gemini CLI via specialized AI agents to streamline your novel writing process.

## 1. System Philosophy

Novellum believes in AI as an **assistant**, not an author. The system acts as a continuity engine and intelligent editor, helping you organize thoughts visually and structurally without compromising your creative voice.

## 2. Core Modules

### 2.1 Project Hub

The entry point for all your books. Here you can create cross-book series or single standalone novels. All data is persisted locally via SQLite for privacy and speed.

### 2.2 World Building

A living encyclopedia of your universe, organized into five sub-sections: Personae (people, factions, lineages), Atlas (realms, landmarks, maps), Archive (myths, technology, traditions), Threads (arcs, sub-plots), and Chronicles (eras, key events, personal histories). The World Building module heavily feeds into the context engine, ensuring the AI deeply understands the nuances, relationships, and history present within your story.

### 2.3 Workspace

A structured beat-sheet and drafting view. This module lets you arrange Acts, Chapters, and Scenes. It helps you pace the story before drafting the prose.

### 2.4 Draft Editor

The core writing experience, powered by an integrated TipTap backend, allowing for rich-text editing, commenting, and track-changes while you convert your beats into full scenes.

### 2.5 Consistency & AI Integration

By utilizing specialized AI agents—such as the `ai.agent` for direct interaction, and workflows triggered through the UI or Gemini CLI—Novellum actively reads ahead and behind, alerting you to continuity errors, tone shifts, or missing details based directly on the facts in your World Building data.

### 2.6 Export

Once the manuscript passes your quality standards, the assembler module compiles the chapters into publication-ready formats.

## 3. Workflow Example

1. **Initialize a Project**: Start in the Project Hub.
2. **Populate World Building**: Add your main protagonist and primary setting.
3. **Workspace**: Create your first act's beat sheet in the Workspace.
4. **Draft**: Open the Draft Editor for Scene 1. Use the AI to expand on beats.
5. **Review**: The Consistency module will automatically cross-reference newly written prose against the World Building data.

## 4. Backup and Restore

Novellum supports manual portability backups so you can move a project between browsers or create safety copies.

### 4.1 Exporting a Backup

1. Open your project and click **Export** in the toolbar.
2. In the Export dialog, select the **Backup ZIP** format tab.
3. Click **Export Backup ZIP** — a `.novellum.zip` file will download containing all project data, world building entries, workspace planning notes, and drafts.

The backup contains a complete snapshot of your project. It does not include data from other projects.

### 4.2 Importing a Backup

1. Go to the **Projects** page (home screen).
2. Click **Import Backup** in the header.
3. Select your `.novellum.zip` file.
4. Review the archive preview (entity counts, export date, version info).
5. Click **Replace & Restore** to confirm.

**Important:** Importing a backup will **replace** any existing data for that project in your current browser. This cannot be undone. If you want to keep existing data, export a backup first.

### 4.3 When to Use Backups

- **Moving to a new computer or browser** — export from the old browser, import in the new one.
- **Safety copies** — periodically export a backup to protect against accidental data loss.
- **Sharing a project snapshot** — send the `.novellum.zip` file to a collaborator.

### 4.4 Troubleshooting

- **"This backup was created with a newer version"** — Update Novellum to the latest version before importing.
- **"Archive payload integrity check failed"** — The file may be corrupted. Try re-exporting from the original browser.
- **Import seems stuck** — Large projects may take a few seconds to restore. Wait for the success confirmation.
