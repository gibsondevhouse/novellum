# Module: `continuity`

> Last verified: 2026-06-16
> Source: [src/modules/continuity/](../../src/modules/continuity/)

## Purpose

Continuity triage UI for structured issue outputs from the ContinuityAgent.

## v2 Surface Contract

- Board/list cards use brass eyebrow micro-headings.
- Severity surfacing uses warm semantic backgrounds with readable contrast.
- Issue selection and filters inherit candle focus and border treatment.

## Structure

```text
src/modules/continuity/
├── components/
├── services/
├── stores/
├── constants.ts
└── index.ts
```

## Persistence

- `consistency_issues` table via `/api/db/consistency_issues*`.

## Key Tests

- `tests/continuity/*`
