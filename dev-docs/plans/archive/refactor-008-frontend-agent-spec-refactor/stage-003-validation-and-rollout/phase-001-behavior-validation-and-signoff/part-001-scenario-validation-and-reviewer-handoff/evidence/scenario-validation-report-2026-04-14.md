# Scenario Validation Report

**Date:** 2026-04-14
**Agent:** Planner (validating Frontend Agent spec)
**File Under Test:** `.github/agents/frontend.agent.md` (361 lines, 17 numbered sections)

---

## Quality Gate Results

| Gate | Command | Result |
| --- | --- | --- |
| Lint | `pnpm run lint` | ✅ Pass (0 errors, 0 warnings) |
| Typecheck | `pnpm run check` | ✅ Pass (0 errors, 0 warnings) |
| Tests | `pnpm run test` | ✅ Pass (33 files, 215 tests) |

---

## Scenario 1: "Add a new Story Bible entry form"

**Task:** Implement a form for creating a new Story Bible entry inside the World Building module.

**Expected behavior from spec:**
- §4 Route-Family Doctrine → World Building character: "dense reference", "tabbed panels"
- §5 Shared Shell Contract → masthead + mode switcher + full-width content frame
- §7 Architecture & Boundaries → stays within `src/modules/story-bible/`
- §8 Svelte 5 Runes → `$state`, `$props()`, no `export let`
- §9 Design Tokens → all spacing/color from tokens
- §10 Accessibility → form inputs have labels, keyboard nav works
- §11 State & Forms → SvelteKit form actions, non-blocking validation
- §14 Quality Gates → `pnpm run lint/check/test` must pass

**Observed:** All sections provide clear, non-conflicting directives. The agent would know to:
1. Use the World Building route character (dense reference, tabbed panels)
2. Keep within modular boundaries
3. Apply Svelte 5 runes with form actions
4. Use design tokens for all visual properties
5. Run quality gates before completion

**Outcome:** ✅ PASS — directives are unambiguous and complete

---

## Scenario 2: "Create a shared modal dialog primitive"

**Task:** Build a reusable Modal component for use across all routes.

**Expected behavior from spec:**
- §6 Composition & Primitives → "Primitive-First Rule: before building any UI, check shared primitives"
- §6 Decomposition limits → 150-line warning, 250-line hard limit for components
- §7 Architecture & Boundaries → shared primitives go in `src/lib/components/`
- §9 Design Tokens → surface layer tokens, border rgba tokens
- §10 Accessibility → ARIA roles for dialogs, focus management on open/close
- §14 Quality Gates → 100% test coverage for new UI primitives
- §16 Self-Check → "Did I reuse an existing shell or primitive instead of rebuilding structure?"

**Observed:** The spec correctly directs:
1. Check if modal already exists before building
2. Place in shared lib, not a module
3. ARIA dialog role + focus trap required
4. 100% test coverage mandatory for new primitives
5. Dark theme contrast check

**Outcome:** ✅ PASS — primitive creation flow is well-governed

---

## Scenario 3: "Restyle the Hub route to match new design tokens"

**Task:** Update the Project Hub route to use the latest design token system.

**Expected behavior from spec:**
- §4 Route-Family Doctrine → Hub character: "landing/dashboard", "card grid", "warm editorial tone"
- §5 Shared Shell → masthead (44px) + mode switcher + variable-width content frame
- §9 Design Tokens → surface layers (base→ground→raised→overlay→elevated), typography (Inter UI, DM Serif editorial), motion tokens
- §13 UX Design Standards → hierarchy, layout authority, dark theme quality
- §15 Failure Conditions → #4 "one route is centered and composed while another is left-heavy and flat"
- §16 Self-Check → #3 "Does spacing, width, and alignment match the app-wide surface contract?"

**Observed:** The agent receives explicit:
1. Token vocabulary (surface layers, rgba borders, font stacks)
2. Hub-specific character guidance (card grid, editorial tone)
3. Cross-route consistency enforcement via failure condition #4
4. Self-check question #3 forces alignment verification

**Outcome:** ✅ PASS — token migration path is clearly directed

---

## Scenario 4: "Fix accessibility issues in the Outline view"

**Task:** Audit and fix keyboard navigation and ARIA issues in the Outliner module.

**Expected behavior from spec:**
- §10 Accessibility (NON-NEGOTIABLE) → 9 explicit requirements including focus indicators, keyboard nav, ARIA roles for collapsible sections, focus management on route transitions
- §4 Route-Family Doctrine → Outliner character: "tree/hierarchy", "indented node tree", "keyboard-heavy interaction"
- §7 Architecture → stays within `src/modules/outliner/`
- §13 UX Design Standards → interaction quality subsection (hover, focus, active states)
- §15 Failure Conditions → #10 "Accessibility is ignored (focus, keyboard, ARIA)"
- §14 Quality Gates → all three gates must pass

**Observed:** The spec:
1. Labels accessibility as "NON-NEGOTIABLE" (not just "REQUIRED" as before)
2. Route-family table notes "keyboard-heavy interaction" for Outliner
3. 9 specific a11y requirements (up from 5 in old spec)
4. Failure condition #10 explicitly blocks shipping without a11y

**Outcome:** ✅ PASS — a11y is unambiguously enforced with route-specific context

---

## Scenario 5: "Add inline AI suggestion accept/reject buttons in the Draft Editor"

**Task:** Implement accept/reject UI for AI-generated suggestions in the TipTap editor view.

**Expected behavior from spec:**
- §4 Route-Family Doctrine → Editor character: "focused writing", "single-document canvas", "minimal chrome"
- §6 Composition & Primitives → check for existing button primitives (`PrimaryButton`, `GhostButton`)
- §7 Architecture → editor module + AI module boundary — must use public API only
- §8 Svelte 5 Runes → `$state` for suggestion visibility, `$derived` for button states
- §9 Design Tokens → buttons must use established primitives, no raw `<button>`
- §12 Performance → no unnecessary re-renders, lazy-load non-critical features
- §15 Failure Conditions → #1 "A route uses one-off markup instead of shared primitives"

**Observed:** The spec correctly handles this cross-module scenario:
1. Enforces module boundary discipline (editor + AI)
2. Requires reuse of button primitives
3. Editor route character ("minimal chrome") constrains visual weight
4. Performance section prevents reactive chain issues from AI state
5. Failure condition #1 blocks one-off button markup

**Potential concern:** The spec doesn't explicitly mention AI module interaction patterns (which agent handle what). However, §7 covers this via "No cross-module internal imports; only public index.ts API" which is sufficient for boundary enforcement. Detailed AI interaction patterns belong in the AI agent spec, not the frontend agent spec.

**Outcome:** ✅ PASS — cross-module UI governed correctly, boundary enforcement clear

---

## Summary

| Scenario | Domain | Outcome |
| --- | --- | --- |
| 1. Story Bible entry form | Module form, validation, a11y | ✅ PASS |
| 2. Shared modal primitive | Cross-route primitive, ARIA | ✅ PASS |
| 3. Hub restyle with tokens | Design tokens, route character | ✅ PASS |
| 4. Outline a11y fix | Accessibility, keyboard nav | ✅ PASS |
| 5. AI suggestion buttons | Cross-module, editor UI | ✅ PASS |

**All 5 scenarios pass.** The rewritten spec provides clear, non-conflicting, and enforceable directives for all tested frontend task types.

### Observations

- The numbered section structure makes it easy to cite specific rules
- Route-family table (§4) is a significant improvement for route-specific behavior
- Failure conditions expanded from 11→14 catches more edge cases
- No inter-section conflicts detected across any scenario
- The spec is 38% shorter (361 vs ~580 lines) while being more enforceable
