import { describe, expect, it } from 'vitest';
import {
	createControllerWorkflowRegistry,
	evaluateControllerPolicy,
	resolveControllerIntent,
	type AiControllerRequest,
} from '../../src/lib/server/ai/controller/index.js';

function request(
	actionId: string,
	payload: AiControllerRequest['action']['payload'] = undefined,
): AiControllerRequest {
	return {
		requestId: 'request-1',
		projectId: 'project-1',
		requestedBy: 'user',
		action: { source: 'api', id: actionId, payload },
		target: { kind: 'pipeline', id: 'artifact-1', projectId: 'project-1' },
		createdAt: '2026-06-15T00:00:00.000Z',
	};
}

describe('controller policy guard', () => {
	it('allows proposal workflows but marks review as required', () => {
		const registry = createControllerWorkflowRegistry();
		const req = request('worldbuilding.generate');
		const intent = resolveControllerIntent(req);
		const workflow = intent.workflowId ? registry.get(intent.workflowId) : null;

		expect(evaluateControllerPolicy({ request: req, intent, workflow })).toMatchObject({
			ok: true,
			decision: 'allow_with_review',
			reviewRequired: true,
		});
	});

	it('blocks review decisions without explicit human approval', () => {
		const registry = createControllerWorkflowRegistry();
		const req = request('artifact.accept', { artifactId: 'artifact-1' });
		const intent = resolveControllerIntent(req);
		const workflow = intent.workflowId ? registry.get(intent.workflowId) : null;

		expect(evaluateControllerPolicy({ request: req, intent, workflow })).toMatchObject({
			ok: false,
			decision: 'block',
			code: 'policy_denied',
		});
	});

	it('allows review decisions when human approval is explicit', () => {
		const registry = createControllerWorkflowRegistry();
		const req = {
			...request('artifact.reject', { artifactId: 'artifact-1', humanApproved: true }),
			metadata: { humanApproved: true },
		} satisfies AiControllerRequest;
		const intent = resolveControllerIntent(req);
		const workflow = intent.workflowId ? registry.get(intent.workflowId) : null;

		expect(evaluateControllerPolicy({ request: req, intent, workflow })).toMatchObject({
			ok: true,
			decision: 'allow',
			reviewRequired: false,
		});
	});
});
