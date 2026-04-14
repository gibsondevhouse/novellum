export function encodeJson(val: unknown): string {
	if (val == null) return '[]';
	return JSON.stringify(val);
}

export function decodeJson<T>(raw: string | number | null | undefined): T {
	/* JSON.parse returns unknown; single cast to T is intentional — callers must ensure T matches stored schema */
	if (!raw) return JSON.parse('[]') as T;
	return JSON.parse(String(raw)) as T;
}
