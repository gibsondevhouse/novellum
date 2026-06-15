# Pipeline / Nova / Editor — Pre-Release Polish Issues

### P1 — Functional gaps (user action has no observable effect)

**1. `NovaSceneDraftCard` Accept/Reject buttons are no-ops in the chat view**

In NovaMessageLog.svelte, the card is rendered as:
```svelte
<NovaSceneDraftCard envelope={message.artifact.envelope} />
```
— no `onAccept` or `onReject` props. The card's comment explicitly says *"editor accept-pipeline will consume in a later plan."* A user clicks **Accept**, the button disables, reads "Marked as accepted", and nothing writes to the manuscript. The checkpoint path (`NovaAuthorDraftCheckpointCard`) is the wired accept path, but this surface — which surfaces when Nova runs in Write mode and streams a scene draft — is silent.

**2. `NovaRevisionPackCard` Acknowledge is ephemeral**

In NovaMessageLog.svelte, `NovaRevisionPackCard` is rendered without `onAcknowledge`. Acknowledge marks issues in local `$state` only; closing/re-opening Nova resets everything. The comment again defers to *"a later plan."*

---

### P2 — Internal engineering labels and raw data exposed to users

**3. Raw ISO timestamp in `NovaOutlineDraftCheckpointCard`**

NovaOutlineDraftCheckpointCard.svelte:
```svelte
<dd><time datetime={activeCheckpoint.createdAt}>{activeCheckpoint.createdAt}</time></dd>
```
Renders `2026-06-15T10:22:18.193Z` directly in the "Generated" row of the review card. Should be `toLocaleString()`.

**4. Internal debug fields displayed in the outline checkpoint card**

Lines 231, 235, 243 — the "Context" row shows a raw SHA-like hash, "Prompt" shows a raw prompt version string (e.g. `outline-v1.2.0`), and "Version" shows `Schema 1.0` or `Unknown schema X`. These are debugging metadata surfaced in the reviewer-facing card.

**5. Raw UUIDs in `NovaAuthorDraftCheckpointCard` metadata**

NovaAuthorDraftCheckpointCard.svelte:
```svelte
<span>Scene <code>{scene.id}</code></span>
```
Authors see `Scene 01918f3a-...` in the draft card. Should be the scene title, or at minimum the UUID should be truncated/omitted.

**6. "Sidecar" section label in `NovaAuthorDraftCheckpointCard`**

The callouts collapsible uses `<summary>Sidecar</summary>` — an internal pipeline term. Should be "Author notes" or "Draft callouts".

**7. "Legacy artifact" eyebrow in `NovaOutlineCard`**

NovaOutlineCard.svelte: the `<p>` eyebrow reads **"Legacy artifact"** when an older `vibe-author.outline` response surfaces in the message log. Users navigating back in conversation history will see this. Should be "Older outline format" or removed.

**8. `/nova` route shows internal engineering notice**

/routes/nova/+page.svelte: a prominently rendered banner says *"Legacy fullscreen route — retained for exploratory chat and may not match sidepanel capabilities."* This is reachable from navigation and is a dev-facing note, not a user-facing label.

---

### P3 — Minor dead chrome

**9. Slash commands `</>` button is permanently disabled**

NovaComposer.svelte:
```svelte
<button type="button" class="nova-action-slot" title="Slash commands (coming soon)" disabled>
```
Visibly disabled on every Nova session. Either remove it or accept it as a forward-looking affordance.

**10. LM Studio tab is a permanently disabled dead end**

+page.svelte: the LM Studio tab is `disabled` and shows a "Coming soon" badge. Intentional for V1 but user-visible.

**11. Auto-updater returns "scheduled for the next release cycle"**

updater.ts: the stub returns `unsupported` with the reason string exposed directly in Settings → About.

---

### Summary table

| # | Location | Severity | Type |
|---|---|---|---|
| 1 | `NovaSceneDraftCard` Accept/Reject | **P1** | Functional no-op |
| 2 | `NovaRevisionPackCard` Acknowledge | **P1** | Ephemeral state, not persisted |
| 3 | Outline checkpoint raw ISO timestamp | P2 | Data formatting |
| 4 | Outline checkpoint debug fields (hash, prompt version) | P2 | Internal data exposed |
| 5 | Author draft checkpoint raw UUID | P2 | Internal data exposed |
| 6 | "Sidecar" label | P2 | Internal term |
| 7 | "Legacy artifact" eyebrow | P2 | Internal term |
| 8 | `/nova` legacy route banner | P2 | Internal notice |
| 9 | Slash commands dead button | P3 | Dead chrome |
| 10 | LM Studio "Coming soon" tab | P3 | Dead chrome |
| 11 | Auto-updater stub message | P3 | Stub copy |

Items 1 and 2 are the only true functional blockers — users can trigger AI-generated scene drafts and revision packs and believe they've acted on them when they haven't. Everything else is polish.