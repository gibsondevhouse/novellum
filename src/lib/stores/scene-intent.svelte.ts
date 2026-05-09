// Shared bus for the active scene's writer-defined intent and live signals.
//
// Published by the editor (EditorShell) whenever the active scene's compass,
// quick intent, or live signal computations change. Consumed by Nova
// (chat-service) when assembling the AiContext, so the copilot is aware of
// what the writer is trying to do — not just the prose itself.
//
// This is the first piece of the unified "authoring session" state called
// for in the V1 critique: a single source of truth for scene intent that
// both the writing surface and the AI surface read from.

export interface SceneIntentSnapshot {
	sceneId: string;
	// Quick Intent — writer's fast-fill aid
	quickGoal: string;
	quickObstacle: string;
	quickOutcome: string;
	// Scene Compass — structured definition
	sceneGoal: string;
	immediateObstacle: string;
	tensionSource: string;
	turningPoint: string;
	outcome: string;
	startState: string;
	endState: string;
	// Live signals computed from the in-progress draft
	liveSignals: string[];
	progressFlags: string[];
	pacingHint: string;
	wordCount: number;
	targetWords: number;
}

class SceneIntentStore {
	current: SceneIntentSnapshot | null = $state(null);

	set(next: SceneIntentSnapshot | null): void {
		this.current = next;
	}

	clear(): void {
		this.current = null;
	}
}

export const sceneIntent = new SceneIntentStore();
