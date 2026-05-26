# App Problems Desktop Run 001

This document is a dump of problems encountered during the first run of the desktop app. It is a serial document of issues and notes, not a checklist or plan. Some issues may be resolved by later stages; some may require new stages.

## Problem 001: Nova's awareness of her identity and the apps function.

Nova is not aware of that she is running inside of Novellum as an agentic co-author. She is not aware that her name is nova.

## Problem 002: Reader Interface

- The reader should have a 'no story or novel selected' empty state. 
- The pages do not have margins
- text is being displayed in a single page-wide column and failing to page break onto the next page.

## Problem 003: Editor Interface

The editor interface is only meant to look like medium's editor in terms of appearane

- The editor should closer to word processor
  - single page text editor with a fixed width and margins, not a full bleed canvas
  - the editor should not have a title field
- ai commands should be delivered through natural language and not in a main content header
  - we must implement a nova copilot component that will be a right panel that can be used for chatting, ai commands, and in the future agentic world building.
- refactor the main content header to be an imported pill nav refactored to house the editor toolbar.
  - editor toolbar should have buttons for text formatting, inserting media, spell check, tables, view in reader, and other word processor features.
  - view in reader should open the entire piece in the reader interface, not just the current page, but the reader should still be aware of the current page and scroll to it.

## Problem 004: Settings

The settings page is currently only ai integration and data portability. We need to add more settings and make it more discoverable.

### Problem 004a: AI Integration Settings

Openrouter API key is failing to save the key.

### Problem 004b: General Settings

- Import a header pill nav componenent and use it to create top level navs for settings categories. For example, we could have 'AI', 'Data', 'Appearance', 'Shortcuts', etc.
  - Appearance settings should include theme (light/dark/auto), font size, and line spacing, and defaults for:
    - default reader view (book vs scroll)
    - default project type (book, world, character, etc.)
    - default ai model (openrouter, ollama local, ollama cloud, etc.)
    - default home page (library, last read, or last project)
  - Shortcuts should allow users to customize keyboard shortcuts for common actions like creating a new project, opening settings, toggling the sidebar, etc.
  - AI will be used for openrouter key management for now, later ollama (cloud and local), lm studio.
    - sub-nav for providers should include links to documentation for how to get API keys, and a field to paste the key. We should also include a link to the openrouter dashboard for users to manage their keys and usage.

#### Openrouter Integration Curiosity
 
is it possible to have the useres balance displayed in the app? This would be a nice QoL feature so users don't have to go to the openrouter dashboard to check their balance. We could use the openrouter API to fetch the balance and display it in the settings page.

## Problem 005: Project Hub

Word count is not being properly calculated and displayed in the project hub.
