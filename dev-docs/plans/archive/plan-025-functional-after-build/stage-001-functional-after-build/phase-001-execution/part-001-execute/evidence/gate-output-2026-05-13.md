# Gate output — plan-025 — 2026-05-13

## pnpm check

```
svelte-check found 0 errors and 0 warnings
```

## pnpm lint

```
> eslint .

(no output — zero violations)
```

## pnpm lint:css

```
> stylelint "src/**/*.{css,svelte}"

(no output — zero violations)
```

## pnpm test

```
 Test Files  155 passed (155)
      Tests  1029 passed (1029)
```

## pnpm check:tokens

```
✓ Token enforcement: 313 files scanned, 0 violations.
```

## pnpm smoke:built (after `node scripts/prepare-sidecar-deps.mjs`)

```
smoke: booting build/index.js on http://127.0.0.1:4421
smoke: server ready, running probes
  ✓ GET /api/settings/about → 200 + appName
  ✓ GET /api/settings/ai-status → 200 + configured field
  ✓ POST /api/settings/ai-key action=test, no creds → 400 no_credentials_to_test
  ✓ POST /api/ai (mock proxy) → 200 + mock text
  ✓ POST /api/local-files/normalize → 200 + normalized path
  ✓ GET /api/ai/models (no creds) → 401 no_credentials
  ✓ GET /api/settings/storage-location → 200 + appDataDirectory in tmp
smoke: all probes passed
```
