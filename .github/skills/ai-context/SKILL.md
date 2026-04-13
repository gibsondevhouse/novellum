# Skill: AI Context Management

**Description:** Manages the context for AI interactions, including conversation history, user preferences, and specific session data. Essential for maintaining coherent and context-aware AI responses.

**Capabilities:**

- Store and retrieve conversation history.
- Maintain session-specific parameters (e.g., AI model, tone).
- Inject relevant project context (from `GEMINI.md`, `dev-docs`) into prompts.
- Manage prompt templating and injection.

**Usage:** Agents use functions like `aiContext.addMessage(role, content)`, `aiContext.getContext()`, `aiContext.injectProjectContext()`.
