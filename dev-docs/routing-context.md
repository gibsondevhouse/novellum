# Routing Context

## File-Based Routing Concept

Novellum uses SvelteKit's file-based routing. The directory structure inside \`src/routes/\` defines the URLs that users can access.

## Directories and Logic Flow

- \`src/routes/+layout.svelte\` and \`+layout.ts\`: These define the high-level, persistent UI application shell and user state loading.

- \`src/routes/+page.svelte\`: The root application page. This might serve as the initial dashboard or redirect router based on the user's project state.

- \`src/routes/projects/\`: The core workspace routing namespace handling user interaction with their specific novel projects. Dynamic routes like \`src/routes/projects/[id]/\` govern the context for individual novels, parsing the \`id\` parameter into a global project context provider to load the specific databases.

## API Architecture

- \`src/routes/api/\`: These function as standard REST-like or specialized internal RPC endpoints to interact with the LLMs or perform server-side rendering logic.

- API usage handles tasks requiring environment variables or hiding keys for external AI APIs.

The data flow normally begins with client requests interacting with local Dexie stores. Only logic requiring synchronization or heavy model inference uses the SvelteKit API routes.
