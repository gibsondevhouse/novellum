# Quality Gates — part-002

Run at 2026-05-27 10:58Z, host `gibdevlite`.

| Gate | Command | Result |
| --- | --- | --- |
| Type-check | `pnpm check` | 0 errors / 0 warnings |
| ESLint (boundaries) | `pnpm lint` | clean |
| Stylelint | `pnpm lint:css` | clean |
| Token enforcement | `pnpm check:tokens` | 324 files / 0 violations |
| Vitest suite | `pnpm test` | 177 files / 1156 tests pass |

Delta vs part-001 close (175 / 1144): **+2 files / +12 tests** —
new files are `scene-draft-sidecar.test.ts` (6 tests) and
`revision-pack.test.ts` (6 tests).
