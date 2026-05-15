import { browser } from '$app/environment';

type DomPurifyLike = { sanitize(input: string): string };
let domPurify: DomPurifyLike | null = null;
let domPurifyLoading: Promise<DomPurifyLike | null> | null = null;

function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

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

function renderInline(text: string): string {
	let html = escapeHtml(text);
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
		const safeLabel = escapeHtml(label);
		const safeHref = escapeHtml(href);
		return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
	});
	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	return html;
}

function stripTemplateComments(markdown: string): string {
	return markdown.replace(/<!--\s*LEGAL_REVIEW_REQUIRED:[\s\S]*?-->/g, '').trim();
}

function extractCodeBlocks(markdown: string): { content: string; codeBlocks: string[] } {
	const codeBlocks: string[] = [];
	const content = markdown.replace(/```([\w-]*)\n([\s\S]*?)\n?```/g, (_match, lang, code) => {
		const index = codeBlocks.length;
		const safeLang = escapeHtml(lang || 'plain');
		const safeCode = escapeHtml(code);
		codeBlocks.push(`<pre><code class="language-${safeLang}">${safeCode}</code></pre>`);
		return `@@CODEBLOCK_${index}@@`;
	});
	return { content, codeBlocks };
}

function renderBlockMarkdown(markdown: string): string {
	const sanitized = stripTemplateComments(markdown).replace(/\r\n?/g, '\n');
	const { content, codeBlocks } = extractCodeBlocks(sanitized);
	const lines = content.split('\n');
	const htmlParts: string[] = [];

	let paragraphLines: string[] = [];
	let listType: 'ul' | 'ol' | null = null;
	let listItems: string[] = [];

	function flushParagraph(): void {
		if (paragraphLines.length === 0) return;
		htmlParts.push(`<p>${paragraphLines.map((line) => renderInline(line)).join('<br />')}</p>`);
		paragraphLines = [];
	}

	function flushList(): void {
		if (!listType) return;
		const tag = listType;
		htmlParts.push(`<${tag}>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`);
		listType = null;
		listItems = [];
	}

	for (const rawLine of lines) {
		const line = rawLine.trimEnd();
		const trimmed = line.trim();

		if (trimmed.length === 0) {
			flushParagraph();
			flushList();
			continue;
		}

		const codeBlockMatch = trimmed.match(/^@@CODEBLOCK_(\d+)@@$/);
		if (codeBlockMatch) {
			flushParagraph();
			flushList();
			const index = Number.parseInt(codeBlockMatch[1], 10);
			htmlParts.push(codeBlocks[index] ?? '');
			continue;
		}

		const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			flushParagraph();
			flushList();
			const level = headingMatch[1].length;
			const text = headingMatch[2];
			htmlParts.push(`<h${level}>${renderInline(text)}</h${level}>`);
			continue;
		}

		const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
		if (unorderedMatch) {
			flushParagraph();
			if (listType && listType !== 'ul') flushList();
			listType = 'ul';
			listItems.push(unorderedMatch[1]);
			continue;
		}

		const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
		if (orderedMatch) {
			flushParagraph();
			if (listType && listType !== 'ol') flushList();
			listType = 'ol';
			listItems.push(orderedMatch[1]);
			continue;
		}

		if (listType) flushList();
		paragraphLines.push(line);
	}

	flushParagraph();
	flushList();

	return htmlParts.join('');
}

if (browser) void loadDomPurify();

export function renderSettingsDocument(markdown: string): string {
	const rawHtml = renderBlockMarkdown(markdown);
	return domPurify ? domPurify.sanitize(rawHtml) : rawHtml;
}
