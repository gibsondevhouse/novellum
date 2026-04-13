# Frontend Context

## Overview

Novellum uses SvelteKit for its frontend framework. The project is structured with a modular, domain-driven design philosophy.

## SvelteKit Usage

- **Framework**: SvelteKit provides the server-rendered or pre-rendered shells, supplemented by highly reactive Svelte components.
- **Components**: UI components are composed to build the application shell and specific domain modules.
- **State Management**: Reactive stores (\`svelte/store\`) are utilized extensively to manage state across the modular frontend. See \`src/stores/\` and the module-specific stores.

## Modular Structure (\`src/modules/\`)

The frontend logic and components are organized by vertical domain slice, rather than horizontal technical layers. Each module encapsulates its own UI components, stores, and services.

- \`ai/\`: Handles AI interactions and generative capabilities.
- \`bible/\`: Manages the Story Bible, entities, and lore.
- \`consistency/\`: Provides consistency checking logic and UI.
- \`editor/\`: The core writing and editing interface.
- \`export/\`: Document assembly and export capabilities.
- \`outliner/\`: Plot outlining and beat management.
- \`project/\`: High-level project state and metadata.

Import boundaries between these modules are strictly enforced to prevent tight coupling. Modules should communicate via defined interfaces or global state rather than direct internal file imports.

## Styles and UI Strategy

- **CSS Architecture**: Global variables and resets are located in \`src/styles/\` (e.g., \`reset.css\`, \`tokens.css\`). Module-specific styles like \`bible.css\` and \`bible-entities.css\` reside there or alongside their components.
- **Design System**: A coherent design system dictates the UI components, ensuring the app is accessible and consistent. Forms, buttons, and layout grids heavily utilize the CSS tokens.
