/**
 * plan-038 stage-005 phase-001 part-001 — NovaAuthorDraftCheckpointCard source contracts.
 *
 * Locks four behavioral guarantees of the checkpoint card by inspecting
 * its source text and verifying structural invariants. Strategy: read
 * the component source with readFileSync and assert on patterns — simpler
 * and more reliable than DOM rendering for structural safety properties.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CARD_PATH = resolve(
	process.cwd(),
	'src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte',
);

const src = readFileSync(CARD_PATH, 'utf-8');

describe('NovaAuthorDraftCheckpointCard source contracts', () => {
	it('contract 1: accept flow shows confirmation before proceeding when scene has existing content', () => {
		// The handleBeginAccept function must gate on hasExistingContent or editorConflict
		// and set acceptState to 'confirming' before calling applyAccept.
		expect(src).toContain('hasExistingContent || editorConflict');
		expect(src).toContain("acceptState = 'confirming'");
		// applyAccept must only be called after confirmation, not directly from handleBeginAccept
		// when hasExistingContent is true.
		const handleBeginAccept = src.match(/function handleBeginAccept\(\)[^}]+\}/s)?.[0] ?? '';
		expect(handleBeginAccept).toContain('hasExistingContent');
		expect(handleBeginAccept).not.toMatch(/void applyAccept\(false\).*hasExistingContent/s);
	});

	it('contract 2: component does not import editorStore or editor mutation surfaces', () => {
		// The card must not import direct editor mutation paths.
		// It may import editorDirty (read-only) but not editorStore or manuscript writers.
		expect(src).not.toMatch(/from ['"].*editor-store/);
		expect(src).not.toMatch(/from ['"].*stores\/editor['"]/);
		expect(src).not.toMatch(/from ['"].*modules\/editor['"]/);
		// Verify editorDirty (read-only) IS permitted — this import should be present.
		expect(src).toContain('editorDirty');
	});

	it('contract 3: dispatchSceneContentApplied is called after a successful accept', () => {
		// The import must exist.
		expect(src).toMatch(/import.*dispatchSceneContentApplied/);
		// The call must appear inside the accept flow (applyAccept function).
		expect(src).toContain('dispatchSceneContentApplied(');
		// The call must only appear AFTER a successful acceptSceneDraftCheckpoint response —
		// assert that dispatchSceneContentApplied follows acceptSceneDraftCheckpoint in the source.
		const acceptIdx = src.indexOf('acceptSceneDraftCheckpoint(');
		const dispatchIdx = src.indexOf('dispatchSceneContentApplied(');
		expect(acceptIdx).toBeGreaterThan(-1);
		expect(dispatchIdx).toBeGreaterThan(acceptIdx);
	});

	it('contract 4: stale-target API error causes force-overwrite confirmation, not silent success or failure', () => {
		// When accept API returns stale_target (status 409 + code stale_target),
		// the card must set acceptState to 'stale' and show a force-overwrite flow.
		expect(src).toContain("code === 'stale_target'");
		expect(src).toContain("acceptState = 'stale'");
		// pendingForceOverwrite must be toggled to track that force is needed.
		expect(src).toContain('pendingForceOverwrite = true');
		// The stale state must be visible in the confirmation UI.
		expect(src).toContain("acceptState === 'stale'");
	});
});
