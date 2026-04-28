import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db, encodeJson } from '$lib/server/db/index.js';

interface FieldDef {
	default?: unknown;
	required?: boolean;
	json?: boolean;
}

export interface EntityRouteConfig {
	table: string;
	fields?: Record<string, FieldDef>;
	orderBy?: string;
	queryParams?: string[];
	decodeRow?: (row: Record<string, unknown>) => unknown;
	customValidation?: (body: Record<string, unknown>) => string | null;
}

const RESERVED_WORDS = new Set(['order', 'group', 'select', 'table', 'index']);

function quoteColumn(name: string): string {
	return RESERVED_WORDS.has(name) ? `"${name}"` : name;
}

function formatFieldList(fields: string[]): string {
	if (fields.length === 1) return fields[0];
	if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
	return `${fields.slice(0, -1).join(', ')}, and ${fields[fields.length - 1]}`;
}

export function createGetHandler(config: EntityRouteConfig): RequestHandler {
	const { table, orderBy, queryParams, decodeRow } = config;
	const orderClause = orderBy ? ` ORDER BY ${orderBy}` : '';

	return async ({ url }) => {
		const conditions: string[] = [];
		const params: unknown[] = [];

		if (queryParams) {
			for (const param of queryParams) {
				const value = url.searchParams.get(param);
				if (value) {
					conditions.push(`${quoteColumn(param)} = ?`);
					params.push(value);
				}
			}
		}

		const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
		const rows = db
			.prepare(`SELECT * FROM ${table} ${where}${orderClause}`)
			.all(...params) as Record<string, unknown>[];

		return json(decodeRow ? rows.map(decodeRow) : rows);
	};
}

export function createPostHandler(config: EntityRouteConfig): RequestHandler {
	const { table, fields, decodeRow: decode, customValidation } = config;
	if (!fields) {
		throw new Error(`createPostHandler requires 'fields' on config for table ${table}`);
	}

	const allFieldNames = ['id', ...Object.keys(fields), 'createdAt', 'updatedAt'];
	const columns = allFieldNames.map(quoteColumn).join(', ');
	const placeholders = allFieldNames.map((n) => `@${n}`).join(', ');
	const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

	const requiredFields = Object.entries(fields)
		.filter(([, def]) => def.required)
		.map(([name]) => name);

	const errorMessage =
		requiredFields.length > 0
			? `${formatFieldList(requiredFields)} ${requiredFields.length > 1 ? 'are' : 'is'} required`
			: '';

	return async ({ request }) => {
		const body = await request.json();

		for (const field of requiredFields) {
			if (!body[field]) {
				return json({ error: errorMessage }, { status: 400 });
			}
		}

		if (customValidation) {
			const error = customValidation(body as Record<string, unknown>);
			if (error) {
				return json({ error }, { status: 400 });
			}
		}

		const now = new Date().toISOString();
		const entity: Record<string, unknown> = {
			id: crypto.randomUUID(),
			createdAt: now,
			updatedAt: now,
		};

		for (const [name, def] of Object.entries(fields)) {
			if (def.json) {
				entity[name] = encodeJson(body[name] ?? def.default ?? []);
			} else {
				entity[name] = body[name] ?? def.default;
			}
		}

		db.prepare(sql).run(entity);

		return json(decode ? decode({ ...entity }) : entity, { status: 201 });
	};
}
