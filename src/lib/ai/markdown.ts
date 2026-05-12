import { browser } from '$app/environment';

// `isomorphic-dompurify` transitively loads `jsdom` on Node, which now
// requires() ESM-only deps (`@exodus/bytes`). Inside the packaged Tauri
// sidecar (Node 22.11 without `require(esm)`) that throws ERR_REQUIRE_ESM
// at module-load time, taking down any server route that touches this
// file via SSR. The browser is the only context where output is ever
// injected as raw HTML, so we lazy-load DOMPurify there and skip it on
// the server (parseMarkdown already HTML-escapes the input).
type DomPurifyLike = { sanitize(input: string): string };
let domPurify: DomPurifyLike | null = null;
let domPurifyLoading: Promise<DomPurifyLike | null> | null = null;

async function loadDomPurify(): Promise<DomPurifyLike | null> {
	if (!browser) return null;
	if (domPurify) return domPurify;
	if (!domPurifyLoading) {
		domPurifyLoading = import('isomorphic-dompurify')
			.then((mod) => {
				domPurify = mod.default as DomPurifyLike;
				return domPurify;
			})
			.catch(() => null);
	}
	return domPurifyLoading;
}

export function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

export function parseMarkdown(md: string): string {
	let html = escapeHtml(md);
	
	// Code blocks
	html = html.replace(/```([\w-]*)\n([\s\S]*?)\n?```/g, (match, lang, code) => {
		return `<pre><code class="language-${lang}">${code}</code></pre>`;
	});

	// Inline code
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

	// Bold
	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	
	// Italic
	html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

	// Paragraphs and breaks
	// Split by double newlines for paragraphs
	const paragraphs = html.split(/\n\s*\n/);
	html = paragraphs.map(p => {
		// If it's a pre/code block, don't wrap it in a paragraph
		if (p.startsWith('<pre>')) return p;
		// Otherwise, convert single newlines to <br /> and wrap in <p>
		return `<p>${p.replace(/\n/g, '<br />')}</p>`;
	}).join('');

	return html;
}

// Kick off DOMPurify loading eagerly in the browser so the first
// sanitized render usually catches it; parseMarkdown's output is
// already entity-escaped with a controlled tag whitelist, so the
// pre-load window is safe.
if (browser) void loadDomPurify();

export function safeHtml(raw: string): string {
	const html = parseMarkdown(raw);
	return domPurify ? domPurify.sanitize(html) : html;
}