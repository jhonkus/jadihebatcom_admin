const CDN_BASE = 'https://assets.jadihebat.com';
const CLOUDFLARE_RESIZER_PATH = '/cdn-cgi/image';

const DEFAULT_WIDTHS = [240, 360, 480, 640, 960];

export interface BuildOptions {
	widths?: number[];
	quality?: number;
	format?: 'auto' | 'webp' | 'avif' | 'jpeg';
	useCdn?: boolean;
}

export interface ImageSources {
	src: string;
	srcset: string;
}

const hasExtension = (id: string): boolean => /\.[a-z0-9]{2,4}$/i.test(id);

const isExternal = (url: string): boolean => /^https?:\/\//i.test(url) && !url.startsWith(CDN_BASE);

function normalizeAssetPath(idOrUrl: string): string {
	if (!idOrUrl) return '';

	if (/^https?:\/\//i.test(idOrUrl)) {
		return idOrUrl;
	}

	const path = hasExtension(idOrUrl) ? idOrUrl : `${idOrUrl}.jpg`;
	return `${CDN_BASE}/${path}`;
}

function buildResizeParams(width: number, quality: number, format: string): string {
	const params = [`width=${width}`, `quality=${quality}`];
	if (format) {
		params.push(`format=${format}`);
	}
	return params.join(',');
}

function buildCdnUrl(pathname: string, params: string): string {
	const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
	return `${CDN_BASE}${CLOUDFLARE_RESIZER_PATH}/${params}/${normalizedPath}`;
}

export function buildImageSources(
	idOrUrl: string | null | undefined,
	options: BuildOptions = {}
): ImageSources {
	if (!idOrUrl) {
		return { src: '', srcset: '' };
	}

	const baseUrl = normalizeAssetPath(idOrUrl);
	if (!baseUrl) {
		return { src: '', srcset: '' };
	}

	if (isExternal(baseUrl)) {
		return { src: baseUrl, srcset: '' };
	}

	const url = new URL(baseUrl);
	const widths = options.widths && options.widths.length > 0 ? options.widths : DEFAULT_WIDTHS;
	const quality = options.quality ?? 75;
	const format = options.format ?? 'auto';
	const useCdn = options.useCdn ?? true;

	if (!useCdn) {
		return { src: baseUrl, srcset: '' };
	}

	const srcset = widths
		.map((width) => {
			const params = buildResizeParams(width, quality, format);
			return `${buildCdnUrl(url.pathname, params)} ${width}w`;
		})
		.join(', ');

	const defaultWidth = widths[Math.floor(widths.length / 2)];
	const defaultParams = buildResizeParams(defaultWidth, quality, format);
	const src = buildCdnUrl(url.pathname, defaultParams);

	return { src, srcset };
}

/**
 * Generates a simple image URL from the CDN with basic transformations.
 * This is useful for simple images like avatars where a full srcset is not needed.
 * @param imageId - The ID of the image in Directus/assets, or full R2 avatar URL.
 * @param options - Transformation options.
 * @returns The full image URL.
 */
export function getImageUrl(
	imageId: string | null | undefined,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	options: { quality?: number; width?: number; format?: 'webp' | 'auto' } = {}
): string {
	if (!imageId) return '';

	// If it's already a full URL (HTTP/HTTPS), return it as-is
	if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
		return imageId;
	}

	// For Directus assets, return the direct CDN URL with UUID + extension
	return `${CDN_BASE}/${imageId}`;
}
