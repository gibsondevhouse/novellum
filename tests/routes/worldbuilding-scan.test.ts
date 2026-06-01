import { describe, expect, it } from 'vitest';
import { POST } from '../../src/routes/api/worldbuilding/scan/+server.js';
import type { ScanErrorResponse } from '../../src/routes/api/worldbuilding/scan/+server.js';

function makeRequest(body: unknown): Request {
	return new Request('http://localhost/api/worldbuilding/scan', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});
}

const VALID_CONTEXT = {
	project: {
		projectId: 'proj-1',
		title: 'Signal Fire',
		genre: 'fantasy',
		logline: 'A courier must outrun a civil war.',
		synopsis: 'Elara Voss discovers the empire is burning.',
	},
	canon: {
		characterNames: [],
		factionNames: [],
		locationNames: [],
		loreEntryTitles: [],
		plotThreadTitles: [],
		timelineEventTitles: [],
	},
};

describe('POST /api/worldbuilding/scan', () => {
	describe('invalid_request (400)', () => {
		it('returns 400 when body is not valid JSON', async () => {
			const request = new Request('http://localhost/api/worldbuilding/scan', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: 'not-json{',
			});
			const response = await POST({ request } as never);
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when projectId is missing', async () => {
			const response = await POST({
				request: makeRequest({
					domainScope: 'personae',
					context: VALID_CONTEXT,
				}),
			} as never);
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when domainScope is missing', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					context: VALID_CONTEXT,
				}),
			} as never);
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when domainScope is not a recognized domain', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'inventory', // not a valid domain
					context: VALID_CONTEXT,
				}),
			} as never);
			expect(response.status).toBe(400);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('invalid_request');
		});

		it('returns 400 when context is absent', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'personae',
				}),
			} as never);
			expect(response.status).toBe(400);
		});
	});

	describe('context_insufficient (422)', () => {
		it('returns 422 when project title is empty', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'personae',
					context: {
						...VALID_CONTEXT,
						project: { ...VALID_CONTEXT.project, title: '' },
					},
				}),
			} as never);
			expect(response.status).toBe(422);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('context_insufficient');
			expect(body.error.details?.missing).toContain('title');
		});

		it('returns 422 when logline is empty', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'personae',
					context: {
						...VALID_CONTEXT,
						project: { ...VALID_CONTEXT.project, logline: '' },
					},
				}),
			} as never);
			expect(response.status).toBe(422);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('context_insufficient');
		});

		it('returns 422 when synopsis is empty', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'personae',
					context: {
						...VALID_CONTEXT,
						project: { ...VALID_CONTEXT.project, synopsis: '' },
					},
				}),
			} as never);
			expect(response.status).toBe(422);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('context_insufficient');
		});
	});

	describe('scan_not_implemented (501)', () => {
		it('returns 501 for a fully valid request (execution not yet wired)', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'personae',
					context: VALID_CONTEXT,
				}),
			} as never);
			expect(response.status).toBe(501);
			const body = (await response.json()) as ScanErrorResponse;
			expect(body.error.code).toBe('scan_not_implemented');
		});

		it('accepts all valid domain scopes without 400', async () => {
			const domains = ['personae', 'atlas', 'archive', 'threads', 'chronicles'];
			for (const domainScope of domains) {
				const response = await POST({
					request: makeRequest({ projectId: 'proj-1', domainScope, context: VALID_CONTEXT }),
				} as never);
				// Should reach 501, not 400 — domain is recognized
				expect(response.status).toBe(501);
			}
		});
	});

	describe('error response shape', () => {
		it('includes code and message in the error body', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'personae',
					context: VALID_CONTEXT,
				}),
			} as never);
			const body = (await response.json()) as ScanErrorResponse;
			expect(typeof body.error.code).toBe('string');
			expect(typeof body.error.message).toBe('string');
			expect(body.error.message.length).toBeGreaterThan(0);
		});

		it('never exposes raw credentials or system prompts in the error body', async () => {
			const response = await POST({
				request: makeRequest({
					projectId: 'proj-1',
					domainScope: 'personae',
					context: VALID_CONTEXT,
				}),
			} as never);
			const raw = await response.text();
			expect(raw).not.toMatch(/sk-/);
			expect(raw).not.toMatch(/systemPrompt/);
		});
	});
});
