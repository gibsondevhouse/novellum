## 2026-05-30

Added `getReadinessLabel(domainId)` helper in `+page.svelte` that looks up `generationReadiness` from `WORLDBUILDING_DOMAIN_SEQUENCE`. Rendered readiness label as `.domain-tile__readiness` on each domain tile. Labels: Personae → "Recommended first", Atlas → "Requires Personae", Archive → "Works best after Atlas", Threads → "Requires Personae + Atlas", Chronicles → "Works best after all domains". `pnpm check`, `pnpm lint`, `pnpm lint:css` all pass.
