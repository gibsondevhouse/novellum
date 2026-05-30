## 2026-05-30

Added canGenerateDomain(domainId, context) to worldbuilding-generate-actions.ts. Checks: project ID present, domain readiness via checkDomainReadiness. Returns { allowed, reason }. Bound disabled and title attributes on Generate buttons in +page.svelte. pnpm check and pnpm lint pass.
