# World Building

> Last verified: 2026-06-12

The **World Building** surface gathers everything that isn't manuscript prose: who's in your story, where it happens, what they know, what's brewing, and when it all unfolds.

Five sections, one shell:

| Section | What it holds |
| --- | --- |
| **Personae** | Characters and their relationships. |
| **Atlas** | Locations and places. |
| **Archive** | Lore, world rules, organizations, magic systems — anything to *know*. |
| **Threads** | Plot threads spanning multiple scenes/chapters. |
| **Chronicles** | Timeline events and milestones. |

Open it from the project sidebar at `/projects/<id>/world-building`.

## Personae

Each character has:

- A name, role, summary.
- Free-form traits and notes.
- **Relationships** to other characters (typed edges: ally, rival, family, etc.).
- A **scratchpad** — a private notes area for in-progress thoughts that won't show up in exports.

## Atlas

Locations capture place-of-action data: name, description, attached lore, related characters.

## Archive

Lore entries are the catch-all for worldbuilding facts that don't fit elsewhere — magic systems, organizations, technologies, mythologies.

## Threads

A plot thread is a recurring narrative line — a mystery, a romance, a feud — that touches multiple scenes. Threads help you see arcs across the manuscript without leaving the outline.

## Chronicles

Timeline events and milestones. Useful when your story spans long periods or has branching causality. Chronicles can be linked to scenes and characters.

## How AI uses world building

When you trigger AI features (continuity checks, edits, rewrites), the **Context Engine** pulls in relevant world-building entries — only the ones referenced by the active scope, never everything. This is why filling in your characters and lore matters: it makes AI suggestions meaningfully grounded in your story.

## AI Proposals And Canon

Worldbuilding scan results are proposals first. They do not become canon until you explicitly accept them.

Proposal cards can now show the intended canon action before you decide:

- **Create** proposes a new character, location, lore entry, plot thread, or timeline event.
- **Update** fills safe empty fields on an existing canon record.
- **Merge** adds compatible details to an existing record when duplicate evidence is present.
- **Link** connects supported records, such as a character and faction.
- **No-op** records that existing canon already covers the proposal.

Duplicate matches are advisory evidence. They help you compare a proposal with existing canon, but they do not automatically merge records or block your decision.

Accepted and rejected proposals keep compact audit metadata: the decision, projection mode, target ID when one exists, changed field names, duplicate evidence count, and rejection reason when rejected. Audit records intentionally avoid storing full before/after entity snapshots or raw model output.

For details, see the dev-docs: [../../dev-docs/03-ai/context-engine.md](../../dev-docs/03-ai/context-engine.md).

## Legacy redirect

If you have bookmarks pointing at `/projects/<id>/story-bible`, they will redirect to the world-building surface automatically.
