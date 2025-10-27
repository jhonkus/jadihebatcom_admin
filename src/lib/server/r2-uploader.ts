// R2 uploader helper for Cloudflare
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
	STORAGE_R2_ACCESS_KEY_ID,
	STORAGE_R2_SECRET_ACCESS_KEY,
	STORAGE_R2_ENDPOINT,
	STORAGE_R2_BUCKET_NAME,
	STORAGE_R2_PUBLIC_URL
} from '$env/static/private';

export interface UploadAvatarResult {
	success: boolean;
	url?: string;
	error?: string;
}

class R2AvatarUploader {
	private s3Client: S3Client | null = null;
	private isConfigured: boolean;

	constructor() {
		this.isConfigured = !!(
			STORAGE_R2_ACCESS_KEY_ID &&
			STORAGE_R2_SECRET_ACCESS_KEY &&
			STORAGE_R2_BUCKET_NAME &&
			STORAGE_R2_ENDPOINT &&
			STORAGE_R2_PUBLIC_URL
		);

		console.log('🔧 R2AvatarUploader initialized:', {
			isConfigured: this.isConfigured,
			endpoint: STORAGE_R2_ENDPOINT ? '***set***' : 'MISSING',
			bucket: STORAGE_R2_BUCKET_NAME ? '***set***' : 'MISSING'
		});

		if (this.isConfigured) {
			this.s3Client = new S3Client({
				region: 'auto',
				endpoint: STORAGE_R2_ENDPOINT,
				credentials: {
					accessKeyId: STORAGE_R2_ACCESS_KEY_ID,
					secretAccessKey: STORAGE_R2_SECRET_ACCESS_KEY
				}
			});
			console.log('✅ S3Client created for R2');
		} else {
			console.warn('⚠️ R2 not configured - missing environment variables');
		}
	}

	/**
	 * Generate UUID v4 using Web Crypto API (works in Cloudflare Workers)
	 */
	private generateUUID(): string {
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;

		const hex = Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	}

	getContentType(contentType: string): string {
		const contentTypes: Record<string, string> = {
			'image/jpeg': 'image/jpeg',
			'image/png': 'image/png',
			'image/webp': 'image/webp'
		};
		return contentTypes[contentType] || 'image/jpeg';
	}

	getExtensionFromContentType(contentType: string): string {
		const extensions: Record<string, string> = {
			'image/jpeg': 'jpg',
			'image/png': 'png',
			'image/webp': 'webp'
		};
		return extensions[contentType] || 'jpg';
	}

	async uploadToR2(buffer: Buffer, filename: string, contentType: string): Promise<string> {
		if (!this.isConfigured || !this.s3Client) {
			console.error('❌ R2 not configured');
			throw new Error('R2 not configured');
		}

		try {
			console.log('📤 Uploading to R2:', { filename, contentType, size: buffer.length });

			const command = new PutObjectCommand({
				Bucket: STORAGE_R2_BUCKET_NAME,
				Key: filename,
				Body: buffer,
				ContentType: this.getContentType(contentType),
				CacheControl: 'public, max-age=31536000' // Cache for 1 year
			});

			await this.s3Client.send(command);

			// Return public URL
			const publicUrl = `${STORAGE_R2_PUBLIC_URL}/${filename}`;
			console.log('✅ Uploaded to R2:', publicUrl);
			return publicUrl;
		} catch (error: any) {
			console.error('❌ R2 upload error:', error);
			throw new Error(`Failed to upload to R2: ${error.message}`);
		}
	}
}

const uploader = new R2AvatarUploader();

export async function uploadAvatarToR2(
	file: Buffer,
	fileName: string,
	contentType: string
): Promise<UploadAvatarResult> {
	try {
		console.log('🚀 uploadAvatarToR2 called');

		// Generate UUID for file using Web Crypto API
		const fileUuid = crypto.randomUUID ? crypto.randomUUID() : uploader['generateUUID']();
		const ext = uploader.getExtensionFromContentType(contentType);
		const key = `avatars/${fileUuid}.${ext}`;

		console.log('📋 Generated key:', key, 'UUID:', fileUuid);

		// Upload to R2
		const publicUrl = await uploader.uploadToR2(file, key, contentType);

		console.log('🎉 uploadAvatarToR2 complete, UUID:', fileUuid);

		return {
			success: true,
			url: publicUrl // Return full public URL
		};
	} catch (error: any) {
		console.error('❌ uploadAvatarToR2 error:', error);
		return {
			success: false,
			error: error.message || 'Failed to upload to R2'
		};
	}
}
