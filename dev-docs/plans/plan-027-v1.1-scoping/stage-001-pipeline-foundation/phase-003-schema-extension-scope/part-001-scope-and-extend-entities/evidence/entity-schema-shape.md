# Pipeline Entity Schema Extension Shape

## New Tables

The following tables have been added to the schema (Migration 0004):

### `factions`
- `id`: TEXT PRIMARY KEY
- `projectId`: TEXT NOT NULL
- `name`: TEXT NOT NULL
- `type`: TEXT NOT NULL DEFAULT ''
- `description`: TEXT NOT NULL DEFAULT ''
- `mission`: TEXT NOT NULL DEFAULT ''
- `ideology`: TEXT NOT NULL DEFAULT ''
- `createdAt`: TEXT NOT NULL
- `updatedAt`: TEXT NOT NULL

### `themes`
- `id`: TEXT PRIMARY KEY
- `projectId`: TEXT NOT NULL
- `title`: TEXT NOT NULL
- `description`: TEXT NOT NULL DEFAULT ''
- `tensionPair`: TEXT NOT NULL DEFAULT ''
- `imagery`: TEXT NOT NULL DEFAULT ''
- `createdAt`: TEXT NOT NULL
- `updatedAt`: TEXT NOT NULL

### `glossary_terms`
- `id`: TEXT PRIMARY KEY
- `projectId`: TEXT NOT NULL
- `term`: TEXT NOT NULL
- `definition`: TEXT NOT NULL DEFAULT ''
- `pronunciation`: TEXT NOT NULL DEFAULT ''
- `category`: TEXT NOT NULL DEFAULT ''
- `createdAt`: TEXT NOT NULL
- `updatedAt`: TEXT NOT NULL

## Existing Table Updates

### `characters`
- Added `factionId`: TEXT (Relational link to `factions` table).

## API Endpoints

CRUD routes scaffolded for all new entities:
- `/api/db/factions` (GET, POST)
- `/api/db/factions/[id]` (GET, PUT, DELETE)
- `/api/db/themes` (GET, POST)
- `/api/db/themes/[id]` (GET, PUT, DELETE)
- `/api/db/glossary_terms` (GET, POST)
- `/api/db/glossary_terms/[id]` (GET, PUT, DELETE)

## Decisions (ADR 0027)

- **Factions**: Accepted.
- **Themes**: Accepted.
- **Glossary**: Accepted.
- **Research Provenance**: Deferred to `lore_entries` (category='research').
