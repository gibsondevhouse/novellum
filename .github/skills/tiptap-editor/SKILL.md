# Skill: TipTap Editor

**Description:** Provides the expertise required to manage, extend, and interface with the TipTap headless rich text editor framework used for drafting and editing manuscripts.

**Capabilities:**

- Integrating TipTap into Svelte 5 components.
- Managing core extensions (`StarterKit`, `Document`, `History`, `Text`, `Paragraph`).
- Interfacing with the editor's state and rendering logic (e.g., extracting HTML, setting content).
- Implementing debounced autosave mechanisms mapped to the editor's transaction lifecycle.
- Building custom formatting extensions or floating menus for editor augmentation.

**Usage:** Agents should activate this skill when modifying the `Editor` surface (`src/modules/editor/`), expanding manuscript drafting capabilities, or handling rich-text transformations to/from the AI layer.