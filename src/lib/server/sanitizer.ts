// Standalone sanitizer used by server code and tests
let sanitizeHtml: ((dirty: string, opts?: Record<string, unknown>) => string) | null = null;
try {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const sh = require('sanitize-html');
	if (sh && typeof sh === 'function') sanitizeHtml = sh;
} catch {
	sanitizeHtml = null;
}

export function sanitizeHtmlContent(input: string): string {
	if (!input) return '';

	if (sanitizeHtml) {
		try {
			return sanitizeHtml(input, {
				allowedTags: [
					'a',
					'b',
					'i',
					'em',
					'strong',
					'u',
					'p',
					'br',
					'ul',
					'ol',
					'li',
					'blockquote',
					'h1',
					'h2',
					'h3',
					'h4',
					'h5',
					'h6',
					'img',
					'pre',
					'code',
					'hr',
					'table',
					'thead',
					'tbody',
					'tr',
					'th',
					'td'
				],
				allowedAttributes: {
					a: ['href', 'name', 'target', 'rel'],
					img: ['src', 'alt', 'title', 'width', 'height']
				},
				allowedSchemes: ['http', 'https', 'mailto', 'data'],
				allowedSchemesByTag: {
					img: ['http', 'https', 'data']
				}
			});
		} catch {
			// fall through to fallback
		}
	}

	let out = input;
	out = out.replace(
		/<\s*(script|style|iframe|object|embed|form|input|link|meta)[\s\S]*?>[\s\S]*?<\s*\/\s*\1\s*>/gi,
		''
	);
	out = out.replace(/<\s*(script|style|iframe|object|embed|form|input|link|meta)[^>]*\/\s*>/gi, '');
	out = out.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
	out = out.replace(/(href|src)\s*=\s*("|')?\s*javascript:[^"'\s>]+(\2)?/gi, '$1="#"');
	out = out.replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
	out = out.replace(/<\/?(meta|link)[^>]*>/gi, '');
	return out;
}
