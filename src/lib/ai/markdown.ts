import DOMPurify from 'isomorphic-dompurify';

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

export function safeHtml(raw: string): string {
	return DOMPurify.sanitize(parseMarkdown(raw));
}