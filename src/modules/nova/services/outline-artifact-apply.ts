import type { AuthorOutline } from '$lib/ai/pipeline/author-schemas.js';

export interface ApplyOutlineResult {
	ok: true;
	counts: {
		arcs: number;
		acts: number;
		milestones: number;
		chapters: number;
		scenes: number;
		beats: number;
	};
}

export async function applyAuthorOutlineArtifact(
	projectId: string,
	payload: AuthorOutline,
): Promise<ApplyOutlineResult> {
	const response = await fetch('/api/nova/outline/apply', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projectId, payload }),
	});

	const data = (await response.json().catch(() => null)) as
		| ApplyOutlineResult
		| { error?: string }
		| null;

	if (!response.ok) {
		const errorValue =
			data && typeof data === 'object' && 'error' in data
				? (data as { error?: unknown }).error
				: null;
		const message =
			typeof errorValue === 'string' ? errorValue : 'Failed to apply outline draft.';
		throw new Error(message);
	}

	if (!data || typeof data !== 'object' || !('ok' in data) || data.ok !== true) {
		throw new Error('Outline apply response was malformed.');
	}

	return data as ApplyOutlineResult;
}
