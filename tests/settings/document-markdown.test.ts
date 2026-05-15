import { describe, expect, it } from 'vitest';
import { renderSettingsDocument } from '../../src/lib/settings/document-markdown';

describe('renderSettingsDocument', () => {
	it('strips LEGAL_REVIEW_REQUIRED template comments', () => {
		const html = renderSettingsDocument(
			'# Policy\n\n<!-- LEGAL_REVIEW_REQUIRED: remove before publish -->\n\nText',
		);
		expect(html).not.toContain('LEGAL_REVIEW_REQUIRED');
		expect(html).toContain('<h1>Policy</h1>');
		expect(html).toContain('<p>Text</p>');
	});

	it('renders headings, lists, links, and code blocks', () => {
		const markdown = [
			'## Title',
			'',
			'- First item',
			'- Second item',
			'',
			'1. Ordered item',
			'',
			'Visit [OpenRouter](https://openrouter.ai/privacy).',
			'',
			'```txt',
			'example content',
			'```',
		].join('\n');

		const html = renderSettingsDocument(markdown);
		expect(html).toContain('<h2>Title</h2>');
		expect(html).toContain('<ul><li>First item</li><li>Second item</li></ul>');
		expect(html).toContain('<ol><li>Ordered item</li></ol>');
		expect(html).toContain('href="https://openrouter.ai/privacy"');
		expect(html).toContain('<pre><code class="language-txt">example content</code></pre>');
	});
});
