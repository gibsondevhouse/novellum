## 2026-05-30

Extended `WorldbuildingDomainConfig` with `targetEntities`, `generationReadiness`, and `entryPath` fields. Filled in all five domains. Audited `worldbuilding-navigation.ts` — it already uses route-based IDs (`characters`, `locations`, etc.) rather than domain sequence IDs (`personae`, `atlas`, etc.), so no duplication exists. `pnpm check` passes.
