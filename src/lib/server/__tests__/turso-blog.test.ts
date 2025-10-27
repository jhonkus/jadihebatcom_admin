import { describe, it, expect } from 'vitest';
import { sanitizeHtmlContent } from '../sanitizer';
import { formatArticle } from '../turso-blog';

describe('turso-blog sanitization', () => {
	it('removes script tags and on* attributes', () => {
		const dirty = `<p>Hello <strong>world</strong><script>alert('xss')</script><a href="javascript:alert(1)" onclick="doBad()">click</a></p>`;
		const clean = sanitizeHtmlContent(dirty);
		expect(clean).not.toContain('<script>');
		expect(clean).not.toContain('onclick');
		expect(clean).not.toContain('javascript:alert');
		// basic content preserved
		expect(clean).toContain('<p>');
		expect(clean).toContain('<strong>world</strong>');
	});

	it('formatArticle includes safeContent', () => {
		const article: any = {
			id: 1,
			title: 'Test',
			content: `<p>Hi<script>evil()</script></p>`,
			cover_image: null,
			published_at: new Date().toISOString()
		};

		const out = formatArticle(article);
		expect(out).not.toBeNull();
		// @ts-expect-error - test-time simple assertion
		expect(out.safeContent).not.toContain('script');
		// @ts-expect-error - test-time simple assertion
		expect(out.safeContent).toContain('<p>Hi');
	});
});
