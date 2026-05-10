# Skill: SvelteKit Routing & Loaders

**Description:** Provides expertise in SvelteKit's file-based routing architecture, navigation lifecycle, and data-loading mechanisms. This skill is vital for layout restructuring, API design, and managing routing logic in an `adapter-node` environment.

**Capabilities:**

- Implementing robust `load` functions in `+page.ts` and `+layout.ts` files that fetch data via API boundaries.
- Creating server routes (`+server.ts` in `/api/db/`) for direct `better-sqlite3` interactions.
- Executing server-side and client-side redirects (e.g., `redirect(307, '...')`).
- Consuming SvelteKit specific stores like `page` (`page.url`, `page.params`) reactively with Svelte 5 Runes.
- Implementing shallow routing and tracking navigation lifecycle via `$app/navigation`.

**Usage:** Agents must activate this skill when building backend API endpoints, working on URL restructuring plans, implementing redirects, building layout shells, or writing logic that depends on the current active route and parameters.
---

### Implementation Standard: Server-Side State Safety

Because this project uses `@sveltejs/adapter-node`, the SvelteKit server runs continuously in a Node.js process.
- **Rule:** NEVER define mutable global variables (e.g., `let currentUser = null;`) in server files (`+server.ts`, `+page.server.ts`, `+layout.server.ts`).
- **Reason:** Global variables are shared across ALL concurrent user connections, leading to severe data leakage and race conditions.
- **Solution:** Always pass state via the `event.locals` object, or load it freshly within the specific request lifecycle (e.g., inside the `load` function scope).
