import { describe, it, expect } from 'vitest';
import { parseMarkdown, safeHtml } from '../../src/lib/ai/markdown';

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

describe('safeHtml XSS mitigation', () => {
    it('strips <script> tags from output', () => {
        const result = safeHtml('<script>alert(1)</script>');
        expect(result).not.toContain('<script>');
    });

    it('strips onerror attributes from output', () => {
        const result = safeHtml('<img src=x onerror=alert(1)>');
        // parseMarkdown escapes < and > so the tag is rendered as text, not as an executable element
        expect(result).not.toContain('<img');
    });

    it('strips javascript: href from output', () => {
        const result = safeHtml('<a href="javascript:void(0)">click</a>');
        // parseMarkdown escapes the tag so no executable <a> element is present
        expect(result).not.toContain('<a ');
        expect(result).not.toContain('<a>');
    });

    it('preserves safe markdown output', () => {
        const result = safeHtml('**bold** text');
        expect(result).toContain('<strong>bold</strong>');
    });

    it('does not double-escape ampersands in normal text', () => {
        const result = safeHtml('fish & chips');
        expect(result).not.toContain('&amp;amp;');
    });
});