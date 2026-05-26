# Module: `settings`

> Last verified: 2026-05-25
> Source: [src/modules/settings/](../../src/modules/settings/)

## Purpose

Settings shell for appearance, defaults, shortcuts, AI provider setup, and data/backup controls.

## v2 Surface Contract

- Section groups use brass eyebrow headings + serif section titles.
- Selection chips and toggles use warm candle-tinted active states.
- Surfaces remain in the shared warm umber shell hierarchy.

## Structure

```text
src/modules/settings/
├── components/
├── services/
└── index.ts
```

## Server Support

- `/api/settings/about`
- `/api/settings/ai-key`
- `/api/settings/ai-status`
- `/api/settings/storage-location`
- `/api/db/preferences/[key]`
- `/api/db/system_prompts`, `/api/db/writing_styles`, `/api/db/templates`

## Key Tests

- `tests/settings/*`
- settings visual coverage in `tests/visual/*`
