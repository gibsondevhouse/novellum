export type EditorDirtyStatus = 'idle' | 'saving' | 'saved' | 'failed';

export interface EditorDirtySnapshot {
	sceneId: string | null;
	status: EditorDirtyStatus;
	pendingDraft: string | null;
	updatedAt: string;
}

class EditorDirtyStore {
	sceneId: string | null = $state(null);
	status: EditorDirtyStatus = $state('idle');
	pendingDraft: string | null = $state(null);
	updatedAt: string = $state(new Date().toISOString());

	get isDirty(): boolean {
		return this.status === 'saving' || this.status === 'failed';
	}

	setSnapshot(snapshot: EditorDirtySnapshot): void {
		this.sceneId = snapshot.sceneId;
		this.status = snapshot.status;
		this.pendingDraft = snapshot.pendingDraft;
		this.updatedAt = snapshot.updatedAt;
	}

	clear(): void {
		this.sceneId = null;
		this.status = 'idle';
		this.pendingDraft = null;
		this.updatedAt = new Date().toISOString();
	}
}

export const editorDirty = new EditorDirtyStore();

