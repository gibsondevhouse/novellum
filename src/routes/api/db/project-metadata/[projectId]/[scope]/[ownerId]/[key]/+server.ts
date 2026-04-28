import { json } from '@sveltejs/kit';
import {
	deleteProjectMetadata,
	getProjectMetadata,
	setProjectMetadata,
	type MetadataScope,
} from '$lib/server/project-metadata/project-metadata-service.js';
import type { RequestHandler } from './$types';

const ALLOWED: ReadonlySet<MetadataScope> = new Set(['scene', 'chapter', 'project']);

type ValidateOk = {
	ok: true;
	projectId: string;
	scope: MetadataScope;
	ownerId: string;
	key: string;
};
type ValidateErr = { ok: false; response: Response };

function validate(params: Partial<Record<string, string>>): ValidateOk | ValidateErr {
	const { projectId, scope, ownerId, key } = params;
	if (!projectId || !scope || !ownerId || !key) {
		return { ok: false, response: json({ error: 'missing param' }, { status: 400 }) };
	}
	if (!ALLOWED.has(scope as MetadataScope)) {
		return { ok: false, response: json({ error: 'invalid scope' }, { status: 400 }) };
	}
	return { ok: true, projectId, scope: scope as MetadataScope, ownerId, key };
}

export const GET: RequestHandler = async ({ params }) => {
	const v = validate(params);
	if (!v.ok) return v.response;
	const value = getProjectMetadata<unknown>(v.projectId, v.scope, v.ownerId, v.key);
	if (value === undefined) return json({ value: null });
	return json({ value });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const v = validate(params);
	if (!v.ok) return v.response;
	let body: { value: unknown };
	try {
		body = (await request.json()) as { value: unknown };
	} catch {
		return json({ error: 'invalid json' }, { status: 400 });
	}
	setProjectMetadata(v.projectId, v.scope, v.ownerId, v.key, body.value);
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const v = validate(params);
	if (!v.ok) return v.response;
	deleteProjectMetadata(v.projectId, v.scope, v.ownerId, v.key);
	return json({ ok: true });
};
