import type { RuntimeJsonRedactionResult, RuntimeRedaction } from './types.js';

const REDACTION_REPLACEMENT = '[redacted]';

const CREDENTIAL_KEY_PATTERNS = [
	'apikey',
	'api_key',
	'authorization',
	'credential',
	'password',
	'secret',
	'token',
];

const MANUSCRIPT_KEYS = new Set([
	'content',
	'fulltext',
	'manuscript',
	'manuscripttext',
	'messages',
	'prompt',
	'rawoutput',
	'scenecontent',
]);

function normalizeKey(key: string): string {
	return key.replace(/[^a-z0-9_]/gi, '').toLowerCase();
}

function classifyKey(key: string): RuntimeRedaction['redactionType'] | null {
	const normalized = normalizeKey(key);
	if (CREDENTIAL_KEY_PATTERNS.some((pattern) => normalized.includes(pattern))) {
		return 'credential';
	}
	if (MANUSCRIPT_KEYS.has(normalized)) {
		return normalized === 'rawoutput' ? 'raw_model_output' : 'manuscript_text';
	}
	return null;
}

function reasonFor(type: RuntimeRedaction['redactionType']): string {
	switch (type) {
		case 'credential':
			return 'credential-like field';
		case 'raw_model_output':
			return 'raw model output is not exported by default';
		case 'manuscript_text':
			return 'prompt or manuscript text is not exported by default';
		case 'custom':
			return 'custom redaction';
	}
}

function redactValue(
	value: unknown,
	path: string,
	redactions: RuntimeRedaction[],
	seen: WeakSet<object>,
): unknown {
	if (Array.isArray(value)) {
		return value.map((item, index) => redactValue(item, `${path}[${index}]`, redactions, seen));
	}

	if (!value || typeof value !== 'object') {
		return value;
	}

	if (seen.has(value)) {
		redactions.push({
			fieldPath: path,
			redactionType: 'custom',
			replacement: REDACTION_REPLACEMENT,
			reason: 'circular reference',
		});
		return REDACTION_REPLACEMENT;
	}

	seen.add(value);
	const out: Record<string, unknown> = {};
	for (const [key, child] of Object.entries(value)) {
		const childPath = `${path}.${key}`;
		const redactionType = classifyKey(key);
		if (redactionType) {
			out[key] = REDACTION_REPLACEMENT;
			redactions.push({
				fieldPath: childPath,
				redactionType,
				replacement: REDACTION_REPLACEMENT,
				reason: reasonFor(redactionType),
			});
			continue;
		}
		out[key] = redactValue(child, childPath, redactions, seen);
	}
	return out;
}

export function redactRuntimePayload(value: unknown): RuntimeJsonRedactionResult {
	const redactions: RuntimeRedaction[] = [];
	return {
		redacted: redactValue(value, '$', redactions, new WeakSet<object>()),
		redactions,
	};
}

export function toRedactedJson(value: unknown): { json: string; redactions: RuntimeRedaction[] } {
	const result = redactRuntimePayload(value);
	return {
		json: JSON.stringify(result.redacted ?? {}),
		redactions: result.redactions,
	};
}
