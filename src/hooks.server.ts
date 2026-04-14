import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

// ── UUID validation ──────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Matches /api/db/<resource>/<id> and /api/db/<resource>/<id>/<sub>  */
const API_ID_RE = /^\/api\/db\/[a-z_]+\/([^/]+)/;

// ── AI endpoint rate limiter ─────────────────────────────────────────────────
interface RateEntry {
	count: number;
	resetAt: number;
}
const rateLimitMap = new Map<string, RateEntry>();
const AI_RATE_LIMIT = 20; // requests per window
const AI_RATE_WINDOW_MS = 60_000; // 1 minute

function getClientIp(request: Request): string {
	return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

// ── Max body size ────────────────────────────────────────────────────────────
const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Security headers ─────────────────────────────────────────────────────────
const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data: blob:",
	"connect-src 'self'",
	"object-src 'none'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
].join('; ');

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname, method } = { pathname: event.url.pathname, method: event.request.method };

	// ── 1. Payload size guard ─────────────────────────────────────────────────
	const contentLength = event.request.headers.get('content-length');
	if (contentLength !== null && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
		error(413, 'Request payload too large');
	}

	// ── 2. UUID validation for /api/db/<resource>/<id> routes ────────────────
	const idMatch = API_ID_RE.exec(pathname);
	if (idMatch) {
		const id = idMatch[1];
		if (!UUID_RE.test(id)) {
			error(400, 'Invalid resource ID format');
		}
	}

	// ── 3. Rate limiting for POST /api/ai ────────────────────────────────────
	if (pathname === '/api/ai' && method === 'POST') {
		const clientIp = getClientIp(event.request);
		const now = Date.now();
		const entry = rateLimitMap.get(clientIp);

		if (entry && now < entry.resetAt) {
			if (entry.count >= AI_RATE_LIMIT) {
				error(429, 'Too many AI requests. Please wait before trying again.');
			}
			entry.count++;
		} else {
			rateLimitMap.set(clientIp, { count: 1, resetAt: now + AI_RATE_WINDOW_MS });
		}

		// Probabilistic cleanup (~1% of requests) to bound memory growth
		if (Math.random() < 0.01) {
			const pruneAt = Date.now();
			for (const [ip, data] of rateLimitMap) {
				if (pruneAt >= data.resetAt) rateLimitMap.delete(ip);
			}
		}
	}

	const response = await resolve(event);

	// ── 4. Security headers ───────────────────────────────────────────────────
	response.headers.set('Content-Security-Policy', CSP);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	return response;
};
