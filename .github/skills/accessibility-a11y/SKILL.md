# Skill: Accessibility (A11y) & Core Web Vitals

**Description:** Ensures that frontend components meet the project's strict UX performance thresholds (LCP, INP, CLS) and WCAG 2.2 accessibility standards, with a specific focus on ARIA Authoring Practices Guide (APG) patterns.

**Capabilities:**

- Implementing correct ARIA roles, states, and properties for complex widgets (Modal Dialogs, Tabs, Treeviews, Toolbars).
- Guaranteeing complete keyboard navigation and logical tab order preservation across routing.
- Validating the presence of accessible labels and meaningful empty states.
- Respecting `prefers-reduced-motion` for layout and transition animations.
- Ensuring component structure favors fast rendering to meet the LCP <= 2.5s and INP <= 200ms thresholds.

**Usage:** Agents must utilize this skill when crafting or modifying user interfaces, especially for the `frontend` agent orchestrating highly interactive structural components (like Workspace Outliners, Hubs, and Editing frames).