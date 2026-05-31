## 2026-05-30

Created worldbuilding-readiness.ts with WorldbuildingReadinessResult type and checkDomainReadiness(domainId, domainCounts). Checks each dependency domain has at least one record in domainCounts. Returns missingDeps as human-readable labels. canGenerateDomain() calls checkDomainReadiness and propagates the reason. Personae always enabled; Atlas disabled until Personae has records; etc.
