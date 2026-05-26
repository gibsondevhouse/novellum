user@host novellum % node --version
v25.2.1
user@host novellum % pnpm --version
10.25.0
user@host novellum % cargo --version
cargo 1.92.0 (344c4567c 2025-10-21)
user@host novellum % rustc --version
rustc 1.92.0 (ded5c06cf 2025-12-08)
user@host novellum % pnpm install
Lockfile is up to date, resolution step is skipped
Already up to date

> novellum@0.0.1 prepare <repo>
> svelte-kit sync || echo ''

Done in 1.2s using pnpm v10.25.0
user@host novellum % pnpm tauri --version

> novellum@0.0.1 tauri <repo>
> tauri --version

tauri-cli 2.10.1
user@host novellum % cd src-tauri && cargo check
   Compiling novellum v0.0.1 (<repo>/src-tauri)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.84s
user@host src-tauri % pnpm run check

> novellum@0.0.1 check <repo>
> svelte-kit sync && svelte-check --tsconfig ./tsconfig.json

Loading svelte-check in workspace: <repo>
Getting Svelte diagnostics...

svelte-check found 0 errors and 0 warnings
user@host src-tauri % pnpm run lint

> novellum@0.0.1 lint <repo>
> eslint .

user@host src-tauri % pnpm run test

> novellum@0.0.1 test <repo>
> vitest run

8:18:55 AM [vite-plugin-svelte] invalid plugin options "hot" in inline config
{ hot: false }

 RUN  v4.1.4 <repo>

 ✓ tests/ai/credential-redaction-exit-gate.test.ts (4 tests) 110ms
 ✓ tests/routes/api-backup.test.ts (2 tests) 121ms
 ✓ tests/portability/backup-failure-modes.test.ts (6 tests) 81ms
 ✓ src/modules/export/services/__tests__/zip-import-parse.test.ts (6 tests) 107ms
 ✓ tests/backup/project-restore.test.ts (5 tests) 80ms
 ✓ tests/lib/legacy-dexie-boundaries.test.ts (2 tests) 239ms
 ✓ tests/portability/backup-roundtrip.test.ts (4 tests) 152ms
 ✓ tests/lib/credential-localstorage-boundary.test.ts (2 tests) 463ms
 ✓ tests/lib/model-selection-store.test.ts (4 tests) 815ms
     ✓ initialises to the default model when no preference is stored  789ms
 ✓ tests/editor/snapshot-restore.test.ts (6 tests) 71ms
 ✓ src/modules/export/services/__tests__/snapshot-service.test.ts (8 tests) 100ms
 ✓ tests/sqlite/character-relationships-route-guardrails.test.ts (4 tests) 33ms
 ✓ tests/routes/api-restore-project.test.ts (4 tests) 99ms
 ✓ tests/lib/dexie-to-sqlite-migration.test.ts (3 tests) 50ms
 ✓ tests/routes/api-restore-preview.test.ts (3 tests) 51ms
 ✓ tests/backup/corrupt-backup.test.ts (8 tests) 137ms
 ✓ src/modules/export/services/__tests__/zip-export.test.ts (6 tests) 80ms
 ✓ tests/routes/api-ai-key.test.ts (12 tests) 41ms
 ✓ tests/backup/project-backup.test.ts (4 tests) 73ms
 ✓ tests/routes/api-ai-models.test.ts (6 tests) 49ms
 ✓ tests/sqlite/migrations/snapshot.test.ts (5 tests) 41ms
 ✓ tests/sqlite/nova-context-route.test.ts (10 tests) 32ms
 ✓ tests/editor/recovery-prompt.svelte.test.ts (4 tests) 27ms
 ✓ tests/editor/snapshot-history-panel.svelte.test.ts (3 tests) 46ms
 ✓ tests/editor/save-status-component.svelte.test.ts (5 tests) 29ms
 ✓ tests/server/credential-service.test.ts (16 tests) 86ms
 ✓ tests/backup/parse-backup.test.ts (6 tests) 68ms
 ✓ tests/sqlite/individuals-migrations.test.ts (2 tests) 38ms
 ✓ tests/sqlite/projects-route.test.ts (8 tests) 18ms
 ✓ tests/sqlite/characters-route.test.ts (5 tests) 20ms
 ✓ tests/reader/reader-pages.test.ts (12 tests) 24ms
 ✓ tests/sqlite/migrations/0003-snapshot-metadata.test.ts (3 tests) 5ms
 ✓ tests/routes/api-storage-location.test.ts (4 tests) 33ms
 ✓ tests/backup/credential-exclusion.test.ts (1 test) 38ms
 ✓ tests/ai/nova-context.test.ts (4 tests) 19ms
 ✓ tests/sqlite/migrations/runner.test.ts (9 tests) 14ms
 ✓ tests/assets/assets.test.ts (2 tests) 24ms
 ✓ tests/ai/markdown.test.ts (11 tests) 17ms
 ✓ tests/sqlite/locations-route.test.ts (2 tests) 15ms
 ✓ tests/settings/themeService.test.ts (5 tests) 6ms
 ✓ tests/ai/utils.test.ts (12 tests) 22ms
 ✓ tests/ai/openrouter.test.ts (7 tests) 18ms
 ✓ tests/editor/autosave-failure.test.ts (5 tests) 22ms
 ✓ tests/db/app-data-path.test.ts (12 tests) 18ms
 ✓ tests/sqlite/scenes-route.test.ts (4 tests) 9ms
 ✓ tests/ai/openrouter-provider.test.ts (13 tests) 23ms
 ✓ tests/ai/credential-service.test.ts (10 tests) 5ms
 ✓ tests/settings/ai-prompts-repositories.test.ts (22 tests) 10ms
 ✓ tests/ai/nova-context-planner.test.ts (13 tests) 4ms
 ✓ tests/ai/credential-redaction.test.ts (3 tests) 14ms
 ✓ tests/sqlite/migrations/from-empty.test.ts (1 test) 4ms
 ✓ tests/editor/recovery-service.test.ts (13 tests) 8ms
 ✓ tests/lib/platform.test.ts (4 tests) 4ms
 ✓ tests/sqlite/chapters-route.test.ts (3 tests) 12ms
 ✓ tests/lib/keyring-store.test.ts (6 tests) 7ms
 ✓ tests/repositories/act-repository.test.ts (10 tests) 7ms
 ✓ tests/repositories/arc-repository.test.ts (10 tests) 7ms
 ✓ tests/editor/snapshot-prune.test.ts (1 test) 5ms
 ✓ tests/repositories/beat-repository.test.ts (7 tests) 3ms
 ✓ tests/export/project-backup-client.test.ts (5 tests) 8ms
 ✓ tests/sqlite/migrations/idempotent.test.ts (2 tests) 9ms
 ✓ tests/editor/autosave.test.ts (5 tests) 8ms
 ✓ tests/repositories/project-repository.test.ts (6 tests) 6ms
 ✓ tests/backup/manifest.test.ts (9 tests) 3ms
 ✓ tests/sqlite/individuals-production-persistence.test.ts (2 tests) 10ms
 ✓ tests/editor/autosave-result.test.ts (3 tests) 14ms
 ✓ tests/lib/preferences-service.test.ts (6 tests) 17ms
 ✓ tests/backup/checksums.test.ts (7 tests) 8ms
 ✓ tests/repositories/character-repository.test.ts (3 tests) 5ms
 ✓ tests/lib/i18n.test.ts (4 tests) 5ms
 ✓ tests/sqlite/serialize.test.ts (11 tests) 2ms
 ✓ tests/sqlite/migrations/from-v1.test.ts (1 test) 13ms
 ✓ tests/ai/style-agent.test.ts (9 tests) 6ms
 ✓ tests/repositories/hierarchy-store.test.ts (12 tests) 7ms
 ✓ tests/ai/provider-types.test.ts (8 tests) 2ms
 ✓ tests/ai/edit-agent.test.ts (15 tests) 8ms
 ✓ tests/lib/project-metadata-service.test.ts (6 tests) 6ms
 ✓ tests/ai/prompt-builder.test.ts (9 tests) 5ms
 ✓ tests/export/assembler.test.ts (6 tests) 2ms
 ✓ tests/lib/select-secure-store.test.ts (4 tests) 4ms
 ✓ tests/outliner/story-planning-workspace.migration.test.ts (3 tests) 6ms
 ✓ tests/routes/worldbuilding-navigation.test.ts (4 tests) 4ms
 ✓ tests/ai/summary-agent.test.ts (4 tests) 3ms
 ✓ tests/db/db-path.test.ts (12 tests) 5ms
 ✓ tests/repositories/scene-repository.test.ts (7 tests) 7ms
 ✓ tests/routes/redirects.test.ts (3 tests) 4ms
 ✓ tests/ai/continuity-agent.test.ts (7 tests) 6ms
 ✓ tests/routes/individuals-relationship-flow.test.ts (4 tests) 6ms
 ✓ tests/backup/table-registry.test.ts (6 tests) 8ms
 ✓ src/modules/export/services/__tests__/manifest-policy.test.ts (11 tests) 11ms
 ✓ tests/routes/settings-migrate.test.ts (5 tests) 7ms
 ✓ tests/ai/rewrite-agent.test.ts (6 tests) 5ms
 ✓ tests/lib/desktop.test.ts (2 tests) 2ms
 ✓ tests/lib/version-and-updater.test.ts (4 tests) 2ms
 ✓ tests/settings/api-settings.test.ts (5 tests) 2ms
 ✓ tests/ai/task-resolver.test.ts (5 tests) 2ms
 ✓ tests/outliner/outline-page-structure.test.ts (5 tests) 2ms

 Test Files  97 passed (97)
      Tests  598 passed (598)
   Start at  08:18:56
   Duration  9.19s (transform 2.96s, setup 2.66s, import 5.03s, tests 3.98s, environment 52.62s)

user@host src-tauri % 