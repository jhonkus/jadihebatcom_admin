<script lang="ts">
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	// Import both light and dark themes
	import 'highlight.js/styles/github.css';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	
	let DOMPurify: { sanitize?: (html: string) => string } | null = null;
	try {
		const req = typeof require === 'function' ? require : undefined;
		if (req) {
			DOMPurify = req('dompurify');
		}
	} catch {
		DOMPurify = null;
	}

	export let content: string;

	// Dynamic theme switching for code highlighting
	let codeThemeLink: HTMLLinkElement | null = null;
	
	onMount(() => {
		// Create dynamic link for code theme
		codeThemeLink = document.createElement('link');
		codeThemeLink.rel = 'stylesheet';
		document.head.appendChild(codeThemeLink);
		
		// Set initial theme
		updateCodeTheme($theme);
		
		// Subscribe to theme changes
		const unsubscribe = theme.subscribe((currentTheme) => {
			updateCodeTheme(currentTheme);
		});
		
		return () => {
			unsubscribe();
			if (codeThemeLink) {
				document.head.removeChild(codeThemeLink);
			}
		};
	});
	
	function updateCodeTheme(currentTheme: string) {
		if (!codeThemeLink) return;
		
		// Choose theme based on current theme
		const isDark = currentTheme === 'dark' || 
			(currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
		
		codeThemeLink.href = isDark 
			? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
			: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
	}

	// Configure marked dengan custom renderer yang benar
	const renderer = new marked.Renderer();

	// Correct signature untuk code renderer
	renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
		const language = lang || 'plaintext';
		let highlightedCode = text;

		if (hljs.getLanguage(language)) {
			try {
				highlightedCode = hljs.highlight(text, { language }).value;
			} catch (err) {
				console.warn(`Error highlighting ${language}:`, err);
				highlightedCode = hljs.highlightAuto(text).value;
			}
		} else {
			highlightedCode = hljs.highlightAuto(text).value;
		}

		return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
	};

	marked.setOptions({
		renderer,
		breaks: true,
		gfm: true
	});

	$: htmlContent = content ? marked.parse(content) : '';
	$: sanitizedContent = sanitizeHtml(htmlContent);

	function sanitizeHtml(html: string | Promise<string>): string {
		if (typeof html === 'string' && DOMPurify) {
			try {
				// In server environments, DOMPurify may require a window; if so, skip here
				// and rely on server-side sanitization when possible
				return DOMPurify.sanitize ? DOMPurify.sanitize(html) : html;
			} catch {
				// ignore and keep unsanitized if DOMPurify fails here
				return html;
			}
		}
		return typeof html === 'string' ? html : '';
	}
</script>

<div class="markdown-content">
	{@html sanitizedContent}
</div>

<style>
	.markdown-content {
		color: var(--text-primary, #1e293b);
		line-height: 1.75;
	}

	/* Headings - Harmonious sizing */
	.markdown-content :global(h1) {
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.3;
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: var(--text-primary, #0f172a);
		letter-spacing: -0.02em;
	}

	.markdown-content :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.4;
		margin-top: 2rem;
		margin-bottom: 0.875rem;
		color: var(--text-primary, #1e293b);
		border-bottom: 2px solid var(--border-color, #e2e8f0);
		padding-bottom: 0.5rem;
	}

	/* h3 - Changed to h4/h5 size for better harmony */
	.markdown-content :global(h3) {
		font-size: 1.125rem; /* h5 size - more harmonious */
		font-weight: 600;
		line-height: 1.5;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: var(--text-secondary, #334155);
	}

	.markdown-content :global(h4) {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.5;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		color: var(--text-secondary, #475569);
	}

	.markdown-content :global(h5) {
		font-size: 0.938rem;
		font-weight: 600;
		line-height: 1.5;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: var(--text-muted, #64748b);
	}

	.markdown-content :global(h6) {
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.5;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: var(--text-muted, #64748b);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Paragraphs */
	.markdown-content :global(p) {
		margin-bottom: 1.25rem;
		font-size: 1rem;
		line-height: 1.75;
	}

	/* Lists */
	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin-bottom: 1.25rem;
		padding-left: 1.75rem;
	}

	.markdown-content :global(li) {
		margin-bottom: 0.5rem;
		line-height: 1.75;
	}

	.markdown-content :global(li > p) {
		margin-bottom: 0.5rem;
	}

	/* Links */
	.markdown-content :global(a) {
		color: var(--primary-color, #3b82f6);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s ease;
	}

	.markdown-content :global(a:hover) {
		border-bottom-color: var(--primary-color, #3b82f6);
	}

	/* Blockquotes */
	.markdown-content :global(blockquote) {
		border-left: 4px solid var(--primary-color, #3b82f6);
		padding-left: 1.25rem;
		margin: 1.5rem 0;
		color: var(--text-muted, #64748b);
		font-style: italic;
		background: var(--bg-secondary, #f8fafc);
		padding: 1rem 1.25rem;
		border-radius: 0 8px 8px 0;
	}

	/* Code blocks */
	.markdown-content :global(pre) {
		background: var(--code-bg, #1e293b);
		border-radius: 12px;
		padding: 1.25rem;
		overflow-x: auto;
		margin: 1.5rem 0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.markdown-content :global(code) {
		font-family: 'Fira Code', 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	/* Inline code */
	.markdown-content :global(p code),
	.markdown-content :global(li code) {
		background: var(--code-inline-bg, #f1f5f9);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		color: var(--code-inline-text, #dc2626);
		font-size: 0.875em;
	}

	/* Tables */
	.markdown-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
		font-size: 0.938rem;
	}

	.markdown-content :global(th),
	.markdown-content :global(td) {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid var(--border-color, #e2e8f0);
	}

	.markdown-content :global(th) {
		background: var(--bg-secondary, #f8fafc);
		font-weight: 600;
		color: var(--text-primary, #1e293b);
	}

	.markdown-content :global(tr:hover) {
		background: var(--bg-secondary, #f8fafc);
	}

	/* Horizontal rule */
	.markdown-content :global(hr) {
		border: none;
		border-top: 2px solid var(--border-color, #e2e8f0);
		margin: 2.5rem 0;
	}

	/* Images */
	.markdown-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 12px;
		margin: 1.5rem 0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	/* Strong and emphasis */
	.markdown-content :global(strong) {
		font-weight: 600;
		color: var(--text-primary, #0f172a);
	}

	.markdown-content :global(em) {
		font-style: italic;
	}

	/* First paragraph special styling */
	.markdown-content :global(> p:first-child) {
		font-size: 1.0625rem;
		color: var(--text-secondary, #475569);
	}
</style>
