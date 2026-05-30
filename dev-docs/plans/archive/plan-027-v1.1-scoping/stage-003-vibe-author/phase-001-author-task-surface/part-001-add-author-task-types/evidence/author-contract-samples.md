# Author Pipeline Contract Samples

> Part: `part-001-add-author-task-types`
> Captured: 2026-05-26T22:10:00Z

These payloads are the canonical reference contracts that
`src/lib/ai/pipeline/author-schemas.ts` and
`src/lib/ai/pipeline/author-agent.ts` parse and validate. They are also
the shape the writer-facing UI will eventually render as proposals
(never auto-applied).

## 1. `vibe-author.premise` — `json_author_premise`

```json
{
  "bookHook": "A storm thief must heist the sky.",
  "protagonist": {
    "name": "Iri Vale",
    "role": "Lead thief",
    "want": "Reclaim her sister from the storm vaults.",
    "need": "Trust the crew enough to be saved.",
    "problem": "The vault key only responds to the regent who owns her debt."
  },
  "antagonistForce": "Regent Voss and the Barometer Guild",
  "coreConflict": "Personal redemption versus civic uprising.",
  "stakes": "A drowning city; her sister; her own debt-bond.",
  "pivotPromise": "Storm key is keyed to her blood.",
  "targetLength": "95k",
  "comps": ["Mistborn for heists", "The City We Became for civic stakes"],
  "whyThisBook": "It is the single conflict the world has been building toward."
}
```

## 2. `vibe-author.outline` — `json_author_outline`

Outline buckets reuse the seven-layer hierarchy
(`arcs → acts → milestones → chapters → scenes → beats → stages`),
but only the upper five layers are produced at this stage. Beats and
stages are seeded by downstream phases.

```json
{
  "arcs": [{ "id": "arc-1", "title": "Rise of the storm thief" }],
  "acts": [{ "id": "act-1", "arcId": "arc-1", "title": "Act I" }],
  "milestones": [
    { "id": "m-1", "actId": "act-1", "title": "Heist accepted" }
  ],
  "chapters": [
    { "id": "ch-1", "milestoneId": "m-1", "title": "Skymarket" }
  ],
  "scenes": [
    {
      "id": "sc-1",
      "chapterId": "ch-1",
      "title": "Approach",
      "povCharacterId": "iri"
    }
  ]
}
```

## 3. `vibe-author.scene-draft` — `prose_plus_scene_sidecar`

Convention: scene prose first, then a single fenced ```json``` sidecar
at the **end** of the output. No content allowed after the closing
fence. The parser uses the **last** fenced block as the sidecar so a
prose passage may quote a JSON snippet without confusing the parser.

````markdown
Iri descended into the Skymarket as the storm clocks rolled past midnight.
She felt the vault key pulse against her ribs.

```json
{
  "sceneId": "sc-1",
  "chapterId": "ch-1",
  "povCharacterId": "iri",
  "wordCount": 412,
  "usedCanonRefs": {
    "characterIds": ["iri", "voss"],
    "locationIds": ["skymarket"],
    "factionIds": [],
    "loreEntryIds": ["storm-debt"]
  },
  "uncertainties": ["Whether Voss knows about the sister."],
  "continuityRisks": []
}
```
````

Required sidecar fields: `sceneId`, `chapterId`, `povCharacterId`. Any
of these missing or blank emits `missing_required_fields`. Missing
fence → `missing_scene_sidecar`. Fence present but prose empty →
`missing_scene_prose`.

## 4. `vibe-author.revision-pack` — `json_author_revision_pack`

Issues are re-sorted by severity (`critical → high → medium → low`)
before being handed downstream so reviewer UI can present worst-first.

```json
{
  "summary": "Two issues found.",
  "issues": [
    {
      "id": "iss-2",
      "severity": "critical",
      "kind": "continuity",
      "location": "sc-1 paragraph 4",
      "description": "Iri is in two places at once.",
      "recommendation": "Pick one location."
    },
    {
      "id": "iss-3",
      "severity": "medium",
      "kind": "pacing",
      "location": "sc-1 end",
      "description": "Climax lands too soft.",
      "recommendation": "Lift the turning beat."
    },
    {
      "id": "iss-1",
      "severity": "low",
      "kind": "style",
      "location": "sc-1 line 14",
      "description": "Repeats word \"storm\" three times.",
      "recommendation": "Use synonyms."
    }
  ]
}
```

## Parse Error Codes

| Code | Meaning |
| :--- | :--- |
| `unsupported_author_task` | Task key is not in `AUTHOR_PIPELINE_KEYS`. |
| `missing_json_object` | Output had no JSON candidate (or whitespace only). |
| `invalid_json_object` | JSON candidate failed to parse. |
| `schema_validation_failed` | Zod validation reported field errors. |
| `missing_scene_sidecar` | Scene-draft output lacked a fenced sidecar. |
| `missing_scene_prose` | Scene-draft fence present but prose was empty. |
| `missing_required_fields` | Sidecar missing `sceneId`, `chapterId`, or `povCharacterId`. |
