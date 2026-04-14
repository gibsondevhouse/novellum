export function encodeJson(val: unknown): string {
	if (val == null) return '[]';
	return JSON.stringify(val);
}

export function decodeJson<T>(raw: string | number | null | undefined): T {
	if (!raw) return [] as unknown as T;
	return JSON.parse(String(raw)) as T;
}
