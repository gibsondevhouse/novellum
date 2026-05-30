# Worldbuild contract samples

> Evidence file for plan-027-v1.1-scoping → stage-002-vibe-worldbuild →
> phase-003-worldbuild-verification-and-docs → part-001.
>
> Captures the concrete payload shapes the `vibe-worldbuild` family
> emits, plus traces showing how the checkpoint contract handles them.

## 1. Schema-coverage matrix

| Pipeline task key | Output format | Schema location | Persistence targets |
| --- | --- | --- | --- |
| `vibe-worldbuild.premise` | `json_worldbuild_premise` | `WorldbuildPremiseSchema` in [worldbuild-schemas.ts](../../../../../../src/lib/ai/pipeline/worldbuild-schemas.ts) | None (artifact-only) |
| `vibe-worldbuild.worldspec` | `json_worldbuild_worldspec` | `WorldbuildWorldspecSchema` | None (artifact-only) |
| `vibe-worldbuild.research` | `json_worldbuild_research_briefs` | `WorldbuildResearchSchema` | None (artifact-only; deferred to `lore_entries` per ADR-0027) |
| `vibe-worldbuild.populated-world-bible` | `json_worldbuild_populated_bible` | `WorldbuildPopulatedBibleSchema` | `characters`, `locations`, `factions`, `themes`, `glossary_terms`, `lore_entries`, `plot_threads`, `timeline_events` |

All schemas use `.passthrough()` so future fields land in the artifact
envelope without invalidating today's pipeline. Only the populated
world-bible payload projects into canon tables; the earlier three stages
stay as JSON in `project_metadata` (scope `'pipeline'`).

## 2. Sample payloads

### 2.1 Premise (artifact-only)

```json
{
  "hook": "A storm-courier inherits a vault key she was supposed to bury.",
  "genreBlend": "speculative noir",
  "readerPromise": "A heist story where memory itself is currency.",
  "coreConflict": "Protect her family vs expose the cartel that owns the rain.",
  "worldPressure": "A regional drought cartel rations storm withdrawals.",
  "tone": "Bleak but defiant",
  "scope": "One city, one uprising",
  "nonNegotiables": ["No hidden prophecy", "No off-page reveals"],
  "openQuestions": ["Who leaked the vault map to the cartel?"]
}
```

### 2.2 Worldspec (artifact-only)

```json
{
  "physicalLaws": ["Memory tokens decay if not anchored to a voltcrest within 90 days."],
  "culturalAxes": ["Stewardship is sacred; debt is shameful."],
  "factionsOverview": ["Bellwether Guild controls the vault routes; Lanternbearers preserve the archives."],
  "magicOrTech": "Storm vaults pressurize plasma to lock weather into ledger entries.",
  "constraints": ["No teleportation. No prophecy. No deus ex machina."]
}
```

### 2.3 Research briefs (artifact-only)

```json
{
  "researchBriefs": [
    {
      "question": "What fuels the storm vaults?",
      "whyItMatters": "Caps siege durations and informs cartel leverage.",
      "candidateAnswers": ["Pressurized helium grid", "Captured stratospheric methane"],
      "selectedRecommendation": "Pressurized helium grid with 22h capacity.",
      "confidence": 0.65,
      "sourceNote": "Cross-referenced with engineer testimony.",
      "canonImpact": "Caps mission windows; constrains heist geometry."
    }
  ]
}
```

Parser normalization: when `candidateAnswers` arrives as a string,
`WorldbuildResearchSchema` coerces it into a single-element array. This
keeps downstream UI lists honest. Regression covered in
[`tests/ai/pipeline/worldbuild-regression.test.ts`](../../../../../../tests/ai/pipeline/worldbuild-regression.test.ts).

### 2.4 Populated world-bible (canon-projecting)

```json
{
  "canonical": {
    "characters": [{ "name": "Wren Halcyon" }],
    "locations": [{ "name": "Stormgate" }],
    "factions": [{ "name": "Bellwether Guild" }],
    "loreEntries": [{ "title": "Sky-Debt Codex" }],
    "timelineEvents": [{ "title": "First Blackout" }],
    "themes": [{ "title": "Sacrifice and Belonging" }],
    "glossary": [{ "term": "Voltcrest" }],
    "relationships": [{ "title": "Wren vs Magister Cael" }]
  },
  "tableWrites": {
    "characters": [
      {
        "name": "Wren Halcyon",
        "role": "protagonist",
        "bio": "A storm courier turned reluctant rebel.",
        "faction": "Bellwether Guild",
        "traits": ["perceptive"],
        "goals": ["expose the debt ledger"],
        "flaws": ["stubborn"],
        "tags": ["lead"],
        "notes": "Knows the hidden vault routes."
      }
    ],
    "locations": [
      { "name": "Stormgate", "description": "The walled threshold city above the floodline.", "tags": ["city"] }
    ],
    "factions": [
      {
        "name": "Bellwether Guild",
        "type": "trade cartel",
        "description": "Controls the storm vault keys.",
        "mission": "Preserve the vaults.",
        "ideology": "Stewardship through scarcity."
      }
    ],
    "themes": [
      {
        "title": "Sacrifice and Belonging",
        "description": "Personal cost of communal survival.",
        "tensionPair": "self vs collective",
        "imagery": "frayed signal wires"
      }
    ],
    "glossary_terms": [
      {
        "term": "Voltcrest",
        "definition": "Hardened plasma node used to anchor a storm vault.",
        "pronunciation": "volt-crest",
        "category": "infrastructure"
      }
    ],
    "lore_entries": [
      {
        "title": "Sky-Debt Codex",
        "category": "doctrine",
        "content": "Every storm withdrawal incurs a ledger entry.",
        "tags": ["canon"]
      }
    ],
    "plot_threads": [
      {
        "title": "Wren vs Magister Cael",
        "description": "Competing claims over the Sky-Debt ledger.",
        "status": "planned",
        "relatedSceneIds": [],
        "relatedCharacterIds": []
      }
    ],
    "timeline_events": [
      {
        "title": "First Blackout",
        "description": "The first regional storm-grid failure.",
        "date": "Year 11",
        "relatedCharacterIds": [],
        "relatedSceneIds": []
      }
    ]
  }
}
```

## 3. Acceptance trace (draft → review → accepted)

Driver: [`tests/e2e/vibe-worldbuild-checkpoints.spec.ts`](../../../../../../tests/e2e/vibe-worldbuild-checkpoints.spec.ts)
and [`tests/ai/pipeline/checkpoint-flow.test.ts`](../../../../../../tests/ai/pipeline/checkpoint-flow.test.ts).

1. `PUT /api/db/project-metadata/{projectId}/pipeline/vibe-worldbuild/{id}`
   with `{ operation: 'upsert', value: { artifact, version: '1.0.0' } }`
   → `200 { checkpoint.lifecycle: 'draft' }`. Stored as JSON in
   `project_metadata` (scope `'pipeline'`). No canon writes.
2. `PUT …/{id}` with `{ operation: 'review', reviewer, note }` →
   `200 { checkpoint.lifecycle: 'review' }`. Idempotent; canon tables
   still empty.
3. `PUT …/{id}` with `{ operation: 'accept', acceptedBy }` →
   `200 { checkpoint.lifecycle: 'accepted' }`. Inside a single
   `database.transaction(...)` the service inserts 1 row each into
   `factions`, `characters`, `locations`, `themes`, `glossary_terms`,
   `lore_entries`, `plot_threads`, `timeline_events`, and resolves
   `characters.faction` ("Bellwether Guild") to the newly-minted
   `factions.id` so `characters.factionId` is populated atomically.
4. A second `operation: 'accept'` returns the stored accepted record
   without re-running the projection — `countRows(characters)` stays at
   `1`.

Tracing data (excerpted from regression run, 2026-05-26):

```text
characters.factionId === factions.id        ✓
factions.name === 'Bellwether Guild'        ✓
themes.tensionPair === 'self vs collective' ✓
glossary_terms.category === 'infrastructure' ✓
plot_threads.status === 'planned'           ✓
```

## 4. Rejection trace (draft → rejected)

1. `PUT …/{id}` with `{ operation: 'upsert', value }` → `draft`.
2. `PUT …/{id}` with
   `{ operation: 'reject', rejectedBy, reason: 'Conflicting faction hierarchy.' }`
   → `200 { checkpoint.lifecycle: 'rejected', rejection.reason: 'Conflicting faction hierarchy.' }`.
3. Canon tables remain empty (`characters`, `factions`,
   `glossary_terms`, … all `count = 0`).
4. Subsequent `operation: 'accept'` → `409 { code: 'invalid_transition' }`.
   The rejection rationale is preserved.
5. Subsequent `operation: 'upsert'` *with the same id* resets the record
   to `draft`, clearing `review`, `acceptance`, and `rejection`. Use this
   when the model re-emits a corrected payload after revision.

## 5. Failure modes the parser catches

| Trigger | Result code | Behavior |
| --- | --- | --- |
| Empty / whitespace output | `missing_json_object` | Parser returns `ok: false` with fallback message; no checkpoint persisted. |
| Missing `name` / `title` / `term` in any `tableWrites[*]` row | `missing_required_fields` | Listed in `result.error.details`; checkpoint stays in `draft`. |
| `version !== '1.0.0'` at accept-time | `WorldbuildCheckpointError` (`invalid_version`) | Transaction aborts; checkpoint stays in `draft`; no canon writes. |
| Faction name in `characters[*].faction` with no matching `factions[*].name` | Allowed; `characters.factionId` stays `null` and `characters.faction` retains the literal name | Verified by [`checkpoint-flow.test.ts`](../../../../../../tests/ai/pipeline/checkpoint-flow.test.ts). |
| `operation: 'reject'` with empty `reason` | `WorldbuildCheckpointError` (`invalid_payload`) | Route returns `400`. |

## 6. Deferred extensions (per ADR-0027)

- `research` payloads remain artifact-only for V1.1. A future plan
  will project `researchBriefs[*]` into `lore_entries` with a
  `provenance` tag.
- No new tables were introduced beyond `factions`, `themes`,
  `glossary_terms`, and the `characters.factionId` FK shipped in
  migration `0004_pipeline_entities`.
- The Vibe-Author family (`vibe-author.*`) is scaffolded in the
  catalog but not yet parser-wired; that work lands in stage-003.
