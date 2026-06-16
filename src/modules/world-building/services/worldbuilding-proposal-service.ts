import type { WorldbuildProposalRecord } from '$lib/ai/pipeline/worldbuild-proposal-schema.js';

export interface ProposalAcceptResult {
	ok: boolean;
	error?: string;
	status?: number;
	code?: string;
	proposal?: WorldbuildProposalRecord;
	lifecycle?: string;
}

export interface ProposalRejectResult {
	ok: boolean;
	error?: string;
	status?: number;
	code?: string;
	proposal?: WorldbuildProposalRecord;
	lifecycle?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

async function readResponseBody(res: Response): Promise<Record<string, unknown>> {
	const body = await res.json().catch(() => ({}));
	return isRecord(body) ? body : {};
}

function getResponseText(body: Record<string, unknown>, fallback: string): string {
	if (typeof body.error === 'string' && body.error.trim()) return body.error;
	if (typeof body.message === 'string' && body.message.trim()) return body.message;
	return fallback;
}

function getResponseCode(body: Record<string, unknown>): string | undefined {
	return typeof body.code === 'string' && body.code.trim() ? body.code : undefined;
}

function getResponseProposal(body: Record<string, unknown>): WorldbuildProposalRecord | undefined {
	return isRecord(body.proposal) ? (body.proposal as unknown as WorldbuildProposalRecord) : undefined;
}

function getResponseLifecycle(body: Record<string, unknown>): string | undefined {
	return typeof body.lifecycle === 'string' ? body.lifecycle : undefined;
}

export async function acceptProposal(
	projectId: string,
	proposalId: string,
): Promise<ProposalAcceptResult> {
	const res = await fetch(`/api/worldbuilding/proposals/${proposalId}/accept`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projectId }),
	});

	const body = await readResponseBody(res);
	if (!res.ok) {
		return {
			ok: false,
			error: getResponseText(body, res.statusText),
			status: res.status,
			code: getResponseCode(body),
		};
	}

	const result: ProposalAcceptResult = { ok: true };
	const proposal = getResponseProposal(body);
	const lifecycle = getResponseLifecycle(body);
	if (proposal) result.proposal = proposal;
	if (lifecycle) result.lifecycle = lifecycle;
	return result;
}

export async function rejectProposal(
	projectId: string,
	proposalId: string,
	reason: string,
): Promise<ProposalRejectResult> {
	const res = await fetch(`/api/worldbuilding/proposals/${proposalId}/reject`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ projectId, reason }),
	});

	const body = await readResponseBody(res);
	if (!res.ok) {
		return {
			ok: false,
			error: getResponseText(body, res.statusText),
			status: res.status,
			code: getResponseCode(body),
		};
	}

	const result: ProposalRejectResult = { ok: true };
	const proposal = getResponseProposal(body);
	const lifecycle = getResponseLifecycle(body);
	if (proposal) result.proposal = proposal;
	if (lifecycle) result.lifecycle = lifecycle;
	return result;
}
