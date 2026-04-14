import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../../src/lib/ai/markdown';

describe('Markdown parser', () => {
    it('escapes malicious HTML', () => {
        const input = '<script>alert("hack")</script>';
        const expected = '<p>&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;</p>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    it('parses basic bold and italic', () => {
        const input = 'This is **bold** and *italic*.';
        const expected = '<p>This is <strong>bold</strong> and <em>italic</em>.</p>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    it('parses inline code blocks', () => {
        const input = 'Use `const x = 5` here.';
        const expected = '<p>Use <code>const x = 5</code> here.</p>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    it('parses full code blocks properly, even with newlines', () => {
        const input = 'Here is code:\n\n```js\nfunction foo() {\n  return 1;\n}\n```\n\nDone.';
        // The parser splits into paragraphs on \n\n, so we get:
        // [ 'Here is code:', '```js\nfunction foo() {\n  return 1;\n}\n```', 'Done.' ]
        const expected = '<p>Here is code:</p><pre><code class="language-js">function foo() {\n  return 1;\n}</code></pre><p>Done.</p>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    it('handles line breaks within paragraphs', () => {
        const input = 'Line 1\nLine 2';
        const expected = '<p>Line 1<br />Line 2</p>';
        expect(parseMarkdown(input)).toBe(expected);
    });

    it('handles empty input gracefully', () => {
        expect(parseMarkdown('')).toBe('<p></p>');
    });
});