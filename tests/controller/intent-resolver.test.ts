import { describe, expect, it } from 'vitest';
import {
	resolveControllerIntent,
	type AiControllerRequest,
} from '../../src/lib/server/ai/controller/index.js';

function request(actionId: string, source: AiControllerRequest['action']['source'] = 'nova'): AiControllerRequest {
	return {
		requestId: 'request-1',
		projectId: 'project-1',
		requestedBy: 'user',
		action: { source, id: actionId },
		target: { kind: 'project', id: 'project-1', projectId: 'project-1' },
		createdAt: '2026-06-15T00:00:00.000Z',
	};
}

describe('controller intent resolver', () => {
	it('resolves shipped author actions to deterministic controller intents', () => {
		expect(resolveControllerIntent(request('authorDraft.generate_scene_draft_checkpoint'))).toMatchObject({
			intent: 'author_draft.generate',
			workflowId: 'author_draft.generate',
			confidence: 'exact',
		});
		expect(resolveControllerIntent(request('pipeline:outline.generate', 'outline'))).toMatchObject({
			intent: 'outline.generate',
			workflowId: 'outline.generate',
		});
		expect(resolveControllerIntent(request('worldbuilding.scan', 'worldbuilding'))).toMatchObject({
			intent: 'worldbuilding.scan',
			workflowId: 'worldbuilding.scan',
		});
	});

	it('falls back for unsupported actions and disallowed sources', () => {
		expect(resolveControllerIntent(request('delete_everything'))).toMatchObject({
			intent: 'unsupported',
			workflowId: null,
		});
		expect(resolveControllerIntent(request('outline.generate', 'editor'))).toMatchObject({
			intent: 'unsupported',
			workflowId: null,
		});
	});
});
