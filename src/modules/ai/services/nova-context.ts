import type {
	NovaContextPlan,
	NovaContextRequestPayload,
	NovaContextResponsePayload,
	NovaSessionContextItem,
} from '$modules/ai/types.js';

export function toNovaContextRequestPayload(
	attachments: NovaSessionContextItem[],
	prompt?: string,
	plan?: NovaContextPlan,
): NovaContextRequestPayload {
	const mode = plan?.mode ?? 'full';
	const includeFiles = plan ? plan.includeFiles : true;

	const allowedProjectIds = plan
		? new Set(plan.projectIds)
		: null;

	const projectIds = attachments
		.filter((item): item is Extract<NovaSessionContextItem, { kind: 'project' }> => item.kind === 'project')
		.map((item) => item.projectId)
		.filter((id) => (allowedProjectIds ? allowedProjectIds.has(id) : true));

	const files = includeFiles
		? attachments
				.filter((item): item is Extract<NovaSessionContextItem, { kind: 'file' }> => item.kind === 'file')
				.map((item) => ({
					id: item.id,
					name: item.name,
					mimeType: item.mimeType,
					sizeBytes: item.sizeBytes,
					text: item.text,
				}))
		: [];

	return {
		projectIds: mode === 'off' ? [] : projectIds,
		files,
		prompt,
		mode,
		requestedScopes: plan?.requestedScopes ?? [],
		entityHints: plan?.entityHints ?? [],
	};
}

export async function requestNovaContext(
	payload: NovaContextRequestPayload,
): Promise<NovaContextResponsePayload> {
	const response = await fetch('/api/nova/context', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		let message = `Context request failed with ${response.status}`;
		try {
			const body = (await response.json()) as { error?: string };
			if (body?.error) message = body.error;
		} catch {
			// Keep fallback message.
		}
		throw new Error(message);
	}

	return (await response.json()) as NovaContextResponsePayload;
}
