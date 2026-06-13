import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

describe('POST /api/nova/outline/apply', () => {
	it('returns an explicit retired-route response', async () => {
		vi.resetModules();
		const { POST } = await import('../../src/routes/api/nova/outline/apply/+server.js');
		const request = new Request('http://localhost/api/nova/outline/apply', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: 'proj-1',
				payload: {
					arcs: [{ id: 'arc-a', title: 'Arc A' }],
					acts: [],
					milestones: [],
					chapters: [],
					scenes: [],
					beats: [],
				},
			}),
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(410);
		const payload = (await response.json()) as {
			ok: boolean;
			code: string;
			error: string;
		};
		expect(payload).toMatchObject({
			ok: false,
			code: 'outline_apply_retired',
		});
		expect(payload.error).toContain('checkpoint');
		expect(payload.error).not.toContain('arcs');
	});

	it('does not parse malformed legacy payloads before returning retired-route behavior', async () => {
		vi.resetModules();
		const { POST } = await import('../../src/routes/api/nova/outline/apply/+server.js');
		const request = new Request('http://localhost/api/nova/outline/apply', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: '{not-json',
		});

		const response = await POST({ request } as never);
		expect(response.status).toBe(410);
		const payload = (await response.json()) as { code: string; error: string };
		expect(payload.code).toBe('outline_apply_retired');
		expect(payload.error).toContain('checkpoint');
	});
});

describe('legacy outline apply route source contract', () => {
	const routeSource = readFileSync(
		resolve(process.cwd(), 'src/routes/api/nova/outline/apply/+server.ts'),
		'utf-8',
	);

	it('does not import database mutation helpers or contain hierarchy replacement SQL', () => {
		expect(routeSource).not.toContain('$lib/server/db');
		expect(routeSource).not.toContain('db.prepare');
		expect(routeSource).not.toContain('DELETE FROM');
		expect(routeSource).not.toContain('INSERT INTO');
		expect(routeSource).not.toContain('randomUUID');
	});
});
