# Backend Context

## Local-First Architecture

Novellum utilizes a local-first architecture prioritizing performance, availability, and user privacy. The data layer is heavily reliant on indexedDB to store all user and creative assets locally without remote dependencies.

## Dexie.js Setup

We use Dexie.js as a wrapper around IndexedDB for a strongly typed, promise-based local repository setup located in \`src/lib/db/\`.

- Repositories: Modules contain models that abstract interacting with Dexie directly, located in \`src/repositories/\` or their respective module.
- Tables are defined for major entities like projects, scenes, beats, and story bible subjects.

## Data Model

Entity relationships are maintained locally. We synchronize or bundle these entities during specific operations like AI context ingestion or document assembly.

- Each core domain (Beats, Editor Snapshot, Project, Scenario) uses robust typing for validation.

## API Routes (\`src/routes/api/\`)

Although the primary mode is local database usage, server API (using SvelteKit \`+server.ts\` routes in \`src/routes/api/\`) acts to process specific backend tasks that shouldn't be executed entirely in the client's browser (like fetching external configuration, heavy processing, or API calls directly to external LLMs if not using the WebLLM interface).

These points bridge the frontend and the local state storage.
