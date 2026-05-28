# Worldbuild Stage I/O Contract Evidence (2026-05-26)

## Source Anchors (fiction-pipeline-foundations)

Primary source: `dev-docs/research/fiction-pipeline-foundations-2026-05-26.md`, Section 8:

- §8.1 `Vibe-Worldbuild — Premise`
- §8.2 `Vibe-Worldbuild — Worldspec`
- §8.3 `Vibe-Worldbuild — Research`
- §8.4 `Vibe-Worldbuild — Populated World Bible`

## Canonical Output Contract Alignment

This part implementation validates the four worldbuild stage outputs against the already-defined canonical format keys in `src/lib/ai/constants.ts` (`OUTPUT_FORMAT_DESCRIPTIONS`):

- `json_worldbuild_premise`
- `json_worldbuild_worldspec`
- `json_worldbuild_research_briefs`
- `json_worldbuild_populated_bible`

Parser validation is implemented in:

- `src/lib/ai/pipeline/worldbuild-schemas.ts`
- `src/lib/ai/pipeline/worldbuild-agent.ts`

No new output-format keys were introduced.

## Stage-by-Stage Mapping

1. Premise (§8.1)

- Input contract: premise card fields (`hook`, `genreBlend`, `readerPromise`, `coreConflict`, `worldPressure`, `tone`, `scope`, `nonNegotiables`, `openQuestions`).
- Parser behavior: strict object schema validation; string-list normalization for list fields.

2. Worldspec (§8.2)

- Input contract: world constraint fields (`realityMode`, `environment`, `powerOrder`, `socialOrder`, `scarcity`, `magicOrTechRules`, `taboos`, `ordinaryLifeBaseline`, `conflictEngines`, `aestheticAnchors`, `questionsForResearch`).
- Parser behavior: strict field presence; string-list normalization for list-like fields.

3. Research (§8.3)

- Input contract: `researchBriefs[]` entries with decision-oriented fields.
- Parser behavior: schema validation per brief; normalization of candidate-answer cardinality; deterministic confidence coercion.

4. Populated World Bible (§8.4)

- Input contract: arrays for `characters`, `locations`, `factions`, `loreEntries`, `timelineEvents`, `themes`, `glossary`, `relationships`.
- Parser behavior: validates array presence, then normalizes into explicit persistence table buckets.
- Persistence targets produced by parser:
  - existing: `characters`, `locations`, `lore_entries`, `plot_threads`
  - newly added in stage-001: `factions`, `themes`, `glossary_terms`
  - additional normalized support bucket: `timeline_events`
- Guardrail: missing required identity fields (e.g., character name, faction name, glossary term) fail parsing with structured errors and block persistence.

## Lifecycle / Safety Confirmation

All worldbuild artifact creation flows use `PipelineArtifactEnvelope` defaults, keeping lifecycle state as `draft` unless explicitly overridden.

No auto-apply path to canon tables is introduced in this part.
