## What you are trying to articulate

You are not asking for “more worldbuilding pages.”

You are trying to articulate a **worldbuilding workflow refactor**:

> Convert World Building from a mostly informational/navigation surface into a guided Nova-powered generation system where users understand the correct build order, can generate each domain intentionally, and can review/accept generated canon safely.

More specifically:

1. **Separate education from execution**

   * The current World Building page mixes orientation/help text, domain explanations, guide toggles, navigation, and Nova entry points in one route file.
   * That help material should become its own module or reusable help surface instead of living directly inside the operational page. The current route hardcodes guide content, pitfalls, glossary terms, and sequence text in `+page.svelte`.  

2. **Turn World Building into an ordered workflow**

   * Users should not just see Personae, Atlas, Archive, Threads, and Chronicles as equal tiles.
   * They should see an intentional **order of operations**: what Nova should generate first, what depends on what, and what should not be generated until prior context exists.
   * The current page already hints at this with the reading sequence: Personae → Atlas → Archive → Threads → Chronicles. 

3. **Add section-level generation actions**

   * Each worldbuilding sub-category needs a clear **Generate** action.
   * Example: Generate Personae, Generate Atlas, Generate Archive, Generate Threads, Generate Chronicles.
   * The user-facing promise should be: “Nova can build this section from the project’s current outline, premise, existing canon, and prior generated worldbuilding.”

4. **Preserve review-gated canon safety**

   * Be careful with the phrase “one click completely builds out that section.”
   * Production-safe wording should be: **one click generates a complete proposed section**, then the user reviews/accepts it into canon.
   * Novellum’s current AI pipeline already has a review-gated model: generated worldbuild artifacts are staged, and only accepted `populated-world-bible` checkpoints write into canonical tables. 
   * This matters because silent DB writes from Nova would conflict with the existing author-in-the-loop and no-auto-mutation constraints. 

## What needs to be in the next plan

### 1. Scope statement

The next plan should say something like:

> Refactor World Building into a guided Nova generation workspace by extracting informational/help content into a dedicated help module, adding an explicit worldbuilding generation sequence, and adding per-domain generate actions that produce reviewable Nova/worldbuild artifacts without silently mutating canon.

That is the clean articulation.

### 2. Module boundaries

The plan needs to define at least three boundaries:

| Boundary                                      | Purpose                                                                           |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| `world-building`                              | Operational surface: navigation, status, generated section actions, canon records |
| `world-building/help` or `worldbuilding-help` | Informational content, glossary, orientation, failure modes, completion criteria  |
| `nova/worldbuild generation`                  | AI execution layer: prompts, task keys, staged artifacts, review/accept flow      |

Right now, `src/modules/world-building/worldbuilding-navigation.ts` already centralizes a lot of domain navigation/config data. It defines Personae, Atlas, Archive, Threads, and Chronicles plus their sub-items.  
That file is a good anchor, but help content and generation metadata should not keep growing inside page components.

### 3. Generation taxonomy

The plan should define exactly what “generate this section” means for each domain.

Suggested taxonomy:

| Domain         | Generated output should include                                  |
| -------------- | ---------------------------------------------------------------- |
| **Personae**   | Individuals, factions, lineages, relationships, social pressures |
| **Atlas**      | Realms, landmarks, travel constraints, resource/scarcity logic   |
| **Archive**    | Myths, traditions, technology/systems, cultural legitimacy       |
| **Threads**    | Major arcs, subplots, motivations, causal chains                 |
| **Chronicles** | Eras, key events, personal histories, continuity anchors         |

This maps cleanly to existing canonical tables: `characters`, `character_relationships`, `locations`, `lore_entries`, `plot_threads`, `timeline_events`, `factions`, `themes`, and `glossary_terms`. 

### 4. Order-of-operations model

The plan needs a static, testable sequence object, not prose scattered across UI.

Something like:

```ts
Personae -> Atlas -> Archive -> Threads -> Chronicles
```

But with dependency language:

| Step          | Why it comes here                                                  |
| ------------- | ------------------------------------------------------------------ |
| 1. Personae   | Defines agency, desire, power, identity, factions                  |
| 2. Atlas      | Gives those actors physical constraints and resource pressure      |
| 3. Archive    | Gives the world belief systems, legitimacy, traditions, technology |
| 4. Threads    | Turns actors + constraints + beliefs into causal motion            |
| 5. Chronicles | Locks time, history, public record, and private timelines          |

This should become a reusable config object, not hardcoded in the page.

### 5. Generate button behavior

The plan must be precise here.

There are three possible behaviors:

| Option                                      |                                                              Meaning |                  Scope risk |
| ------------------------------------------- | -------------------------------------------------------------------: | --------------------------: |
| **Open Nova with prefilled prompt**         | Button opens Nova in write/agent mode with a section-specific prompt |                         Low |
| **Run section pipeline and stage artifact** |  Button starts a generation task and creates a reviewable checkpoint |                      Medium |
| **Generate and write directly to tables**   |                             Button creates canon records immediately | High / should avoid for now |

For this plan, I would recommend:

> Button starts generation and creates a **reviewable proposal/checkpoint**, not direct canon writes.

That fits the shipped pipeline model. Existing docs say the worldbuild pipeline stages draft checkpoints first, then canon projection only happens on accept. 

### 6. Acceptance/review surface

The plan needs to specify where generated output lands:

* In Nova message card?
* In the World Building page section?
* In the Outline checkpoint review panel?
* In a new Worldbuilding Review drawer?

Do not leave this vague. The weakest version is “Generate button opens Nova.” The stronger version is “Generate button creates a domain-scoped artifact card with accept/reject controls.”

### 7. Error and state model

Each Generate button needs basic production states:

| State             | Meaning                                      |
| ----------------- | -------------------------------------------- |
| `idle`            | ready to generate                            |
| `missing-context` | project lacks enough premise/outline/context |
| `queued`          | request prepared                             |
| `running`         | Nova/pipeline is generating                  |
| `review-ready`    | proposal exists and needs user decision      |
| `accepted`        | projected into canon                         |
| `rejected`        | proposal rejected with reason                |
| `failed`          | transport/parse/schema error                 |

This is not polish; it prevents the feature from feeling like a toy.

### 8. Guardrails

The plan needs explicit non-negotiables:

* No direct client-side OpenRouter key access.
* No silent canon writes.
* Schema-validated generated output.
* Section-specific prompts must use scoped context.
* Buttons must be disabled or warn when required upstream context is absent.
* Generated output must show provenance: section, model, created time, source context.

The AI pipeline docs already define server-side OpenRouter access and schema-validated output as core constraints. 

## Low-hanging fruit that belongs in the plan

These are safe to include without scope creep.

### Low: extract hardcoded help content

Move the orientation copy, questions, pitfalls, completion signals, and glossary content out of `src/routes/projects/[id]/world-building/+page.svelte`.

Good target:

```text
src/modules/world-building/help/
  worldbuilding-help-content.ts
  WorldbuildingHelpPanel.svelte
  WorldbuildingHelpDrawer.svelte
```

Why this is low-risk:

* Mostly file movement and component extraction.
* No data model changes.
* No AI behavior changes.

### Low: create a reusable order-of-operations config

Create a static config:

```text
src/modules/world-building/worldbuilding-workflow.ts
```

It should define:

* domain id
* label
* sequence number
* dependency ids
* generation readiness criteria
* suggested Nova prompt seed
* target routes/entities

This prevents the workflow from being baked into UI text.

### Low: add “Generate with Nova” buttons that only open Nova with scoped prompts

Initial Generate buttons can be non-mutating.

Example behavior:

* Click **Generate Personae**
* Nova panel opens
* Mode set to `write` or `agent`
* Prompt is prefilled with a strong section-specific instruction
* No automatic DB writes yet

This is safe because the current page already has a `startWritingWithNova()` function that opens Nova with a prefilled prompt. 

### Low: rename “Start Writing with Nova” on World Building

That CTA is semantically wrong on this page.

Better labels:

* **Start Worldbuild with Nova**
* **Generate Worldbuilding Plan**
* **Build World Bible with Nova**
* **Open Nova Worldbuild Flow**

This is small but important. “Writing” implies manuscript drafting; this page is canon/world generation.

### Low: add section readiness copy

Each section tile can show:

* “Recommended first”
* “Requires Personae”
* “Works best after Atlas”
* “Ready to generate”
* “Needs outline/premise first”

This can be static at first. No DB analysis required.

### Low: add per-section prompt seeds

Create prompt seed constants for:

* `worldbuilding.generate.personae`
* `worldbuilding.generate.atlas`
* `worldbuilding.generate.archive`
* `worldbuilding.generate.threads`
* `worldbuilding.generate.chronicles`

These do not need full pipeline integration yet. They just need to be consistent and reusable.

### Low-to-medium: add generation cards to the hub UI

Each domain tile can have three actions:

| Action   | Purpose             |
| -------- | ------------------- |
| Open     | browse/edit records |
| Help     | read guidance       |
| Generate | invoke Nova         |

This is not scope creep if Generate only opens Nova/prefills the task.

### Medium: create domain-scoped artifact envelopes

This is where it starts becoming real production work.

Instead of only one broad `populated-world-bible`, add domain-specific generated proposal kinds:

* `worldbuild.personae`
* `worldbuild.atlas`
* `worldbuild.archive`
* `worldbuild.threads`
* `worldbuild.chronicles`

This is valuable, but it touches schemas, parsers, UI rendering, checkpoint storage, and accept behavior. Include it only if the plan is meant to go beyond UI/refactor.

### Medium: section-level completion status

Useful but not first-pass required.

Examples:

* Personae: `4 characters`, `2 factions`, `1 lineage`
* Atlas: `3 locations`, `1 map note`
* Archive: `5 lore entries`
* Threads: `3 active plot threads`
* Chronicles: `8 timeline events`

This is good product polish, but it means loading/counting real records across worldbuilding tables.

## What not to include yet

These are likely scope creep for the next plan unless you intentionally make it an AI pipeline plan.

| Avoid for now                                  | Why                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Full new database schema                       | Existing canon tables already cover the target domains.                                       |
| Direct auto-write generation                   | Violates the safer review-gated model.                                                        |
| Full editor-side worldbuilding panel           | Already listed as a gap, but it is a separate drafting-context feature.                       |
| Exporting worldbuilding into EPUB/DOCX         | Also a known gap, but unrelated to generation workflow.                                       |
| Rebuilding the entire Story Bible/Bible module | Existing audit shows many worldbuilding surfaces already exist.                               |
| Factions detail-route completion               | Worth doing, but separate unless Personae generation needs faction detail pages immediately.  |

## Blunt critique

**Critical:** “One click completely builds out that section” is dangerous if it means direct canon mutation. Phrase it as **one click generates a complete reviewable proposal**.

**High:** The current World Building page is doing too much: product education, routing, help content, sequencing, and Nova launch behavior are co-located. That will become brittle fast.

**Medium:** The optimal generation order should be data/config, not copy. Agents need a source of truth they can modify safely.

**Medium:** The next plan should distinguish between **UI affordance** and **AI execution**. A Generate button is easy. A trustworthy generate-and-accept workflow is a pipeline feature.

**Low:** Renaming CTAs, extracting content, and adding prompt seeds are safe wins that make the feature feel more intentional without expanding technical risk.