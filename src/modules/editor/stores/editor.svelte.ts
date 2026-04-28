import type { Scene } from '$lib/db/domain-types';

class EditorStore {
	activeProjectId: string | null = $state(null);
	activeChapterId: string | null = $state(null);
	activeSceneId: string | null = $state(null);
	activeBeatId: string | null = $state(null);
	isLoading: boolean = $state(false);

	activeScene: Scene | null = $state(null);
	pendingText: string = $state('');

	get hasActiveScene() {
		return this.activeSceneId !== null;
	}

	setActiveSceneId(sceneId: string | null): void {
		this.activeSceneId = sceneId;
	}

	setActiveScene(scene: Scene | null): void {
		if (scene) {
			this.activeScene = scene;
			this.activeSceneId = scene.id;
			this.pendingText = scene.content ?? '';
		} else {
			this.activeScene = null;
			this.activeSceneId = null;
			this.pendingText = '';
		}
	}
}

export const editorState = new EditorStore();
