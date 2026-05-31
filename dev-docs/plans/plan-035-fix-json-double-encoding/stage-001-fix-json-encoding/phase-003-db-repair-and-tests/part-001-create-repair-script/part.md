---
title: Create DB Repair Script for Double-Encoded Rows
slug: part-001-create-repair-script
part_number: 1
status: review
owner: Planner Agent
phase: phase-003-db-repair-and-tests
target_file: scripts/repair-json-fields.mjs
---

## Task

Create a one-time Node.js script (`scripts/repair-json-fields.mjs`) that detects and repairs double-encoded JSON values in the SQLite database. The script must:

1. Open the project's SQLite DB via `better-sqlite3`
2. For each affected table and column, scan all rows
3. Detect double-encoded values: `typeof JSON.parse(stored) === 'string'`
4. Double-decode: `JSON.parse(JSON.parse(stored))`
5. UPDATE the row with the corrected value
6. Log a summary of repaired rows per table

## Tables & Columns to Repair

| Table | Columns |
| --- | --- |
| `locations` | `tags`, `notableFeatures`, `landmarkIds`, `factionIds`, `characterIds`, `threadIds` |
| `characters` | `aliases`, `anomalies`, `traits`, `goals`, `flaws`, `arcs`, `tags` |
| `lore_entries` | `tags` |
| `plot_threads` | `relatedSceneIds`, `relatedCharacterIds` |
| `timeline_events` | `relatedCharacterIds`, `relatedSceneIds` |

## Script Logic (Pseudocode)

```js
const db = new Database('path/to/project.db');
const tables = { /* above list */ };

Object.entries(tables).forEach(([table, columns]) => {
    let repaired = 0;
    const rows = db.prepare(`SELECT id, ${columns.join(', ')} FROM ${table}`).all();
    
    rows.forEach((row) => {
        columns.forEach((col) => {
            const stored = row[col];
            if (typeof stored === 'string') {
                const inner = JSON.parse(stored);
                if (typeof inner === 'string') {
                    const actual = JSON.parse(inner);
                    db.prepare(`UPDATE ${table} SET ${col} = ? WHERE id = ?`)
                      .run(JSON.stringify(actual), row.id);
                    repaired++;
                }
            }
        });
    });
    
    console.log(`${table}: repaired ${repaired} rows`);
});
```

## Acceptance Criteria

- [ ] Script created at `scripts/repair-json-fields.mjs`
- [ ] Script can be run via `node scripts/repair-json-fields.mjs [--db-path <path>]`
- [ ] Detects all double-encoded values correctly
- [ ] Logs clear summary of repairs per table
- [ ] Script runs without errors on test data
- [ ] Updates are correct (verify via SELECT after UPDATE)
- [ ] No syntax or runtime errors
- [ ] Part marked `complete`

## Notes

- Script is non-destructive; can be run multiple times safely
- Should include logging for transparency and verification
- Optional: add `--dry-run` flag to preview repairs without committing
- Optional: add progress bars for large tables
- Run this before deployment to clean up corrupt data
