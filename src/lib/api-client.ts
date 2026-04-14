import type { z } from 'zod';

export class ApiError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

async function handleResponse<T>(res: Response, schema?: z.ZodType<T>): Promise<T> {
	if (!res.ok) {
		let message = res.statusText;
		try {
			const body = await res.json();
			if (body.error) message = body.error;
		} catch {
			// use statusText
		}
		throw new ApiError(message, res.status);
	}
	
	const data = await res.json();
	if (schema) {
		try {
			return schema.parse(data);
		} catch (error) {
			console.error('API Schema Validation Error:', error);
			throw error; // Will propagate a typed ZodError
		}
	}
	return data;
}

export async function apiGet<T>(path: string, params?: Record<string, string>, schema?: z.ZodType<T>): Promise<T> {
	let url = path;
	if (params) {
		const qs = new URLSearchParams(params).toString();
		if (qs) url += `?${qs}`;
	}
	const res = await fetch(url);
	return handleResponse<T>(res, schema);
}

export async function apiPost<T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
	const res = await fetch(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	return handleResponse<T>(res, schema);
}

export async function apiPut<T>(path: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
	const res = await fetch(path, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	return handleResponse<T>(res, schema);
}

export async function apiDel(path: string): Promise<void> {
	const res = await fetch(path, { method: 'DELETE' });
	if (res.status === 204) return;
	if (!res.ok) {
		let message = res.statusText;
		try {
			const body = await res.json();
			if (body.error) message = body.error;
		} catch {
			// use statusText
		}
		throw new ApiError(message, res.status);
	}
}
