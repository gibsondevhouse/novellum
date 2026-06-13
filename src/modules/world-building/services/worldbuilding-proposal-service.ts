export interface ProposalAcceptResult {
	ok: boolean;
	error?: string;
}

export interface ProposalRejectResult {
	ok: boolean;
	error?: string;
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

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: res.statusText }));
		return { ok: false, error: (body as { error?: string }).error ?? res.statusText };
	}

	return { ok: true };
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

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: res.statusText }));
		return { ok: false, error: (body as { error?: string }).error ?? res.statusText };
	}

	return { ok: true };
}
