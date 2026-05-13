/**
 * Agentic tool stub slots.
 *
 * Originally these slots populated the Nova tool registry with four
 * `not-yet-supported` placeholders (worldbuilding.create-character,
 * worldbuilding.update-location, continuity.scan-scene,
 * outline.suggest-beat) so the agentic surface area could be exercised
 * end-to-end before the real handlers landed.
 *
 * 2026-05-13: the four runtime agents that backed these tools
 * (BrainstormAgent / OutlineAgent / DraftAgent / SummaryAgent) were
 * cut from the V1 surface — see plan-025 + agents-map.md. The stub
 * tools were cut with them.
 *
 * The exports are retained as a no-op + empty list so the module
 * barrel in `src/modules/nova/index.ts` and any consumer that imports
 * these symbols continues to compile. Re-introduce real tool stubs
 * here if/when a future plan ships agentic handlers.
 */

import type { ToolDefinition } from '../types.js';

export const STUB_TOOLS: ToolDefinition[] = [];

export function registerStubTools(): void {
	// Intentionally empty — see file header.
}
