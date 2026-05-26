# Gate Cleanup — 2026-05-10

> **Phase:** stage-001 / phase-001 (static inventory & gate baseline)
> **Follow-up to:** `gate-baseline-2026-05-10.md` (the pre-cleanup baseline)
>
> Captures the post-cleanup gate run after addressing the
> `.claude/worktrees/`-induced eslint/vitest failures and the two
> SceneCompassPanel hue-degree stylelint nits called out in the
> earlier baseline.

## Changes applied

### 1. ESLint — ignore `.claude/**`

`eslint.config.js`: extended the existing ignore block.

```diff
-	{ ignores: ['.svelte-kit/', 'dist/', 'build/', 'coverage/', 'src-tauri/target/', '*.cjs'] },
+	{
+		ignores: [
+			'.svelte-kit/',
+			'dist/',
+			'build/',
+			'coverage/',
+			'src-tauri/target/',
+			'*.cjs',
+			'.claude/**',
+		],
+	},
```

**Effect:** ESLint no longer descends into `.claude/worktrees/` and
no longer trips on the "multiple candidate TSConfigRootDirs" parser
error. The 2440-error wall from the pre-cleanup baseline is gone.

### 2. Vitest — exclude `.claude/**`

`vitest.config.ts`:

```diff
 		exclude: [
 			'tests/visual/**',
 			'tests/e2e/**',
 			'node_modules/**',
 			'build/**',
 			'src-tauri/target/**',
 			'.svelte-kit/**',
+			'.claude/**',
 		],
```

**Effect:** Vitest no longer discovers tests inside sibling
worktrees. The 185 "failed test files" from the pre-cleanup
baseline (all from `.claude/worktrees/quirky-hamilton-2c1bc6/`) are
gone. This is the exclusion plan-024's risk register explicitly
calls for: *"Tighten exclusion only in `vitest.config.ts`; do not
delete the directory."*

### 3. Stylelint — auto-fixed 2 SceneCompassPanel hue-degree nits

`pnpm lint:css:fix` rewrote two CSS hue values in
`src/modules/editor/components/SceneCompassPanel.svelte`:

```diff
-		background: hsl(38 90% 55%);
+		background: hsl(38deg 90% 55%);
```

(line 334 and line 478 — both same fix.)

> Note: those `hsl(...)` calls are still hardcoded color values, not
> design tokens. The token discipline question is out of scope for
> this cleanup; the existing `pnpm check:tokens` pass implies the
> token enforcer doesn't catch literal HSL.

## Post-cleanup gate run

All five gates run from the worktree
(`<repo>/.claude/worktrees/distracted-blackburn-61b228/`),
which is the canonical environment the rest of stage-001 will use.

| Gate | Exit | Result |
| --- | --- | --- |
| `pnpm check` | 0 | ✅ 1599 files, 0 errors, 0 warnings |
| `pnpm lint` | 0 | ✅ clean (was 2440 errors pre-cleanup) |
| `pnpm lint:css` | 0 | ✅ clean (was 2 errors pre-cleanup) |
| `pnpm check:tokens` | 0 | ✅ 312 files, 0 violations |
| `pnpm test` | 0 | ✅ **Test Files: 157 passed (157)** / **Tests: 1033 passed (1033)** in 30.5s. No failures. (Was 185 file-failures + 7 test-failures before the `.claude/**` exclusion; was 1 test-failure after the exclusion until the related-but-separate `tests/settings/settings-layout.test.ts` was updated to expect the eleventh PillNav entry that phase-002 added.) |

## Stage-001 entry criterion #2 — final state

> "`master` is green for `pnpm check`, `pnpm lint`, and the
> source-tree subset of `pnpm test`."

After the cleanup: every gate is **fully green** from a clean run, no
mental filtering required. The downstream phases (002–010) can
treat any gate failure they see as a real regression they
introduced, not pre-existing noise.
