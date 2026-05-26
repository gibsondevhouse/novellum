# Performance Indexes — V1 Baseline

## Targets

| Metric | Target | Measurement Method |
| --- | --- | --- |
| Cold start (app launch) | < 2s | Manual timing, Tauri shell |
| Editor keystroke latency | < 16ms | Chrome DevTools profiler |
| Scene load time | < 200ms | Vitest benchmark (future) |
| Export (10k words) | < 3s | Manual timing |
| Test suite (unit) | < 30s | `pnpm vitest run` timing |
| Build time | < 60s | `pnpm build` timing |

## Current Baseline (V1.0.0-beta.1)

| Metric | Measured | Notes |
| --- | --- | --- |
| Test suite | ~8s | 1019 unit tests |
| Build time | ~25s | SvelteKit SSG |
| Editor keystroke | TBD | Deferred to beta feedback |
| Cold start | TBD | Deferred to beta feedback |

## DB Indexes

Both required indexes are present in `src/lib/server/db/schema.ts`:

```sql
CREATE INDEX IF NOT EXISTS idx_scenes_projectId ON scenes(projectId);
CREATE INDEX IF NOT EXISTS idx_scenes_chapterId ON scenes(chapterId);
```

## Lazy Loading

`ExportModal` is dynamically imported in `src/routes/projects/[id]/+layout.svelte` via `onMount`
so it is excluded from the initial bundle.

## Worldbuilding Analysis Triggers

Audited on 2026-Q2. No `analyzeWorldbuilding`, `worldbuildingAnalysis`, or `runAnalysis` call sites
found in `src/`. No debounce changes required.

## Notes

- Performance benchmarking for Tauri cold start deferred to hardware testing during beta.
- Editor keystroke latency constrained by TipTap 3.x render cycle — no custom optimization needed at V1.
- Export performance scales with manuscript size; target is 3s for 10k-word manuscript.
