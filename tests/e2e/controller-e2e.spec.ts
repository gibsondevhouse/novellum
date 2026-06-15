import { test, expect } from '@playwright/test';

test('AI controller rejects unsupported actions through API boundary', async ({ request }) => {
	const response = await request.post('/api/ai-controller', {
		data: {
			projectId: 'project-1',
			action: { source: 'api', id: 'delete_everything' },
			target: { kind: 'project', id: 'project-1' },
		},
	});

	expect(response.status()).toBe(403);
	const body = await response.json();
	expect(body.ok).toBe(false);
	expect(body.error.code).toBe('unsupported_intent');
});
