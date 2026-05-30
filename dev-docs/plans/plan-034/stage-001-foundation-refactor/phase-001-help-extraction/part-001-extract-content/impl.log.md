## 2026-05-30

Extracted the full `sections` `$derived` array from `+page.svelte` into `src/modules/world-building/help/worldbuilding-help-content.ts`. Defined `WorldbuildingHelpGlossaryEntry` and `WorldbuildingHelpSection` interfaces. Exported `WORLDBUILDING_HELP_SECTIONS` as a typed `readonly` array of all five domain objects. `pnpm check` passes with 0 errors.
