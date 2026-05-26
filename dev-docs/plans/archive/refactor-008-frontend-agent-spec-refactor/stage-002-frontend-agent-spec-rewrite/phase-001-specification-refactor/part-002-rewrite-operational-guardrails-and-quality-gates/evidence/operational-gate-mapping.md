# Operational Gate Mapping

## Changes Made

Rewrote sections 7-17 of `.github/agents/frontend.agent.md`, replacing 12 old sections with 11 new numbered sections.

## Section Mapping (Old → New)

| Old Section | New Section | Action |
| --- | --- | --- |
| *(placeholder)* | 7. ARCHITECTURE & BOUNDARIES | New, consolidated from old ARCHITECTURAL RULES + modular-boundaries.md |
| PRODUCTION BEST PRACTICES & SVELTE 5 | 8. SVELTE 5 RUNES PROTOCOL | Extracted from catch-all into dedicated section |
| *(scattered across VISUAL CONSISTENCY, PRODUCTION BEST PRACTICES)* | 9. DESIGN TOKENS & STYLING | New consolidated section from design-system.md + 3 source plans |
| ACCESSIBILITY (REQUIRED) | 10. ACCESSIBILITY (NON-NEGOTIABLE) | Expanded from 5 bullets to 9, renamed to signal enforcement level |
| STATE MANAGEMENT + FORM HANDLING | 11. STATE & FORMS | Merged two sections into one |
| PERFORMANCE STANDARDS | 12. PERFORMANCE | Streamlined, added Web Vitals targets |
| UI/UX DESIGN STANDARDS (8 subsections) | 13. UX DESIGN STANDARDS (6 subsections) | Condensed prose, merged REDUCE COGNITIVE LOAD into Progressive Disclosure/Input Design |
| TESTING RESPONSIBILITIES | 14. MANDATORY QUALITY GATES | Replaced vague guidelines with explicit `pnpm run` commands |
| FAILURE CONDITIONS (DO NOT SHIP) | 15. FAILURE CONDITIONS | Expanded from 11 to 14 items, added token/lint/console.log conditions |
| REQUIRED SELF-CHECK BEFORE COMPLETION | 16. SELF-CHECK PROTOCOL | Expanded from 5 to 8 checks, added quality gate verification |
| LEVERAGED RESOURCES | 17. RESOURCES | Simplified, removed prompt file references (moved to plan references) |
| EXECUTION MINDSET | *(removed)* | Aspirational prose eliminated — philosophy embedded in concrete rules |

## Key Improvements

1. **File-length governance table** — explicit line limits for routes, components, services, stores
2. **Dedicated Svelte 5 section** — separated from catch-all "best practices"
3. **Token system specification** — surface layers, border rules, typography fonts, motion tokens
4. **Explicit quality gate commands** — `pnpm run lint`, `pnpm run check`, `pnpm run test`
5. **14 failure conditions** — expanded from 11 with token/lint/console.log violations
6. **8-point self-check** — up from 5, includes quality gate and lint verification

## Metrics

- Old operational sections: ~222 lines across 12 sections
- New operational sections: ~179 lines across 11 sections
- Net reduction: ~43 lines while increasing specificity
- Total file: 361 lines (down from ~580 → 38% reduction)
