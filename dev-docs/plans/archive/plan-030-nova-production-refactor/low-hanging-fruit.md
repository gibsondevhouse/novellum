# Low-Hanging Fruit Register

These are small, high-return changes that should be picked up during the main work. They are not separate scope expansion.

## P0 — Must pluck

### 1. Attachment truthfulness

**Problem:** The sidepanel composer stages attachments, but the chat request path does not obviously pass them into `sendNovaChat()`.

**Decision:** Either wire staged attachments into context or disable/remove the upload affordance for this plan.

**Preferred plan-030 choice:** Disable the affordance with clear “Attachments coming soon” or “Attach context in full Nova workspace” copy unless Stage 001 chooses to unify with server-side Nova context request payloads.

**Acceptance:** No visible upload control suggests model-visible context unless it actually changes the request.

### 2. No-scene project grounding

**Problem:** Project Hub is a valid story context before any scene exists. Nova must not require `activeSceneId` to know the project.

**Decision:** If `projectId` exists and `activeSceneId` is null, build project summary baseline.

**Acceptance:** Project with logline/synopsis and zero scenes grounds Nova responses.

### 3. Context disclosure honesty

**Problem:** Context disclosure can under-report project/story-frame/outline grounding.

**Decision:** Include project baseline, story frame, outline, compression, and no-context states.

**Acceptance:** User can tell whether Nova is grounded before trusting output.

## P1 — Should pluck

### 4. Normalize Settings links

Use one canonical settings route for no-key/missing-key states. Prefer the existing AI settings route if it exists and is stable.

### 5. Replace user-facing “Copilot” labels with “Nova”

Update aria labels, button labels, and titles. Do not rename internal symbols unless already in scope.

### 6. Empty state copy

Current copy should not say “Ask me anything about your project” unless the panel actually has project context. Use state-aware copy.

### 7. Add no-project state

If Nova is opened without a project, make this clear. General chat can still work, but project-generation actions should be guarded.

## P2 — Opportunistic

### 8. Canonical Nova surface documentation

Update docs to say sidepanel is canonical for plan-030. Defer `/nova` migration unless the team explicitly chooses to unify it now.

### 9. Exact bug regression test

Add a single test named around the observed bug: `nova grounds project hub summary without active scene`.
