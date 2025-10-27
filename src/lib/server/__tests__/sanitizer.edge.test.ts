import { describe, it, expect } from 'vitest';
import { sanitizeHtmlContent } from '../sanitizer';

describe('sanitizer edge cases', () => {
	it('removes inline event handlers and style attributes', () => {
		const input = `<div style="color:red" onclick="steal()">Test</div>`;
		const out = sanitizeHtmlContent(input);
		expect(out).not.toContain('onclick');
		expect(out).not.toContain('style=');
		// The sanitizer may strip <div> (not allowed) but must preserve inner text
		expect(out).toContain('Test');
	});

	it('neutralizes javascript: URIs in href/src', () => {
		const input = `<a href="javascript:evil()">click</a><img src="javascript:evil()"/>`;
		const out = sanitizeHtmlContent(input);
		expect(out).not.toContain('javascript:');
		// sanitize-html may remove the attribute entirely; ensure anchor and img tags still present
		expect(out).toContain('<a');
		expect(out).toContain('<img');
	});

	it('allows data URLs for images if configured fallback', () => {
		const input = `<img src="data:image/png;base64,iVBORw0KGgo..." alt="x"/>`;
		const out = sanitizeHtmlContent(input);
		// The sanitizer allows data for img in sanitize-html config; fallback will keep data URLs.
		expect(out).toContain('data:image/png');
	});

	it('strips script and iframe tags', () => {
		const input = `<p>Safe</p><script>alert(1)</script><iframe src="http://malicious"></iframe>`;
		const out = sanitizeHtmlContent(input);
		expect(out).not.toContain('<script');
		expect(out).not.toContain('<iframe');
		expect(out).toContain('<p>Safe</p>');
	});

	it('handles empty or null input gracefully', () => {
		expect(sanitizeHtmlContent('')).toBe('');
		// @ts-expect-error - testing null input
		expect(sanitizeHtmlContent(null)).toBe('');
	});
});
