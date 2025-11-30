import { RESOURCE_TYPES, ResourceType } from '@/types/resource';
import {
	RESOURCE_TYPE_IMAGES,
	getImageForResourceType,
	getDisplayImageSrc,
} from '@/utils/resourceUtils';

describe('resourceUtils', () => {
	it('RESOURCE_TYPES should include all defined types', () => {
		// Check a few known types
		expect(RESOURCE_TYPES).toContain('FIRE_TRUCK');
		expect(RESOURCE_TYPES).toContain('AMBULANCE');
		expect(RESOURCE_TYPES).toContain('GENERATOR');
		expect(RESOURCE_TYPES).toContain('WATER_BOTTLE');
	});

	it('RESOURCE_TYPE_IMAGES should map all types to images', () => {
		for (const type of RESOURCE_TYPES) {
			const typed = type as ResourceType;
			expect(typeof RESOURCE_TYPE_IMAGES[typed]).toBe('string');
			expect(RESOURCE_TYPE_IMAGES[typed]).toMatch(/^\/images\//);
		}
	});

	describe('getImageForResourceType', () => {
		it('returns correct image for valid resource type', () => {
			expect(getImageForResourceType('FIRE_TRUCK')).toBe(RESOURCE_TYPE_IMAGES.FIRE_TRUCK);
			expect(getImageForResourceType('AMBULANCE')).toBe(RESOURCE_TYPE_IMAGES.AMBULANCE);
		});
		it('returns default image for invalid resource type', () => {
			expect(getImageForResourceType('INVALID_TYPE')).toBe('/images/default.png');
			expect(getImageForResourceType('')).toBe('/images/default.png');
		});
	});

	describe('resourceUtils', () => {
		it('returns image for known type', () => {
			expect(getImageForResourceType('AMBULANCE')).toBe(RESOURCE_TYPE_IMAGES.AMBULANCE);
		});

		it('falls back to default image for unknown type', () => {
			expect(getImageForResourceType('WHATEVER')).toBe('/images/default.png');
		});
	});

	describe('getDisplayImageSrc', () => {
		it('returns undefined for empty or null image', () => {
			expect(getDisplayImageSrc(null)).toBeUndefined();
			expect(getDisplayImageSrc(undefined)).toBeUndefined();
			expect(getDisplayImageSrc('')).toBeUndefined();
			expect(getDisplayImageSrc('   ')).toBeUndefined();
		});
		it('returns data URL as-is', () => {
			const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
			expect(getDisplayImageSrc(dataUrl)).toBe(dataUrl);
		});
		it('returns http/https URL as-is', () => {
			const httpUrl = 'http://example.com/image.png';
			const httpsUrl = 'https://example.com/image.png';
			const protocolRelative = '//example.com/image.png';
			expect(getDisplayImageSrc(httpUrl)).toBe(httpUrl);
			expect(getDisplayImageSrc(httpsUrl)).toBe(httpsUrl);
			expect(getDisplayImageSrc(protocolRelative)).toBe(protocolRelative);
		});
		it('treats base64 JPEG starting with / as a path (URL)', () => {
			const jpegBase64 = '/9j/4AAQSkZJRgABAQAAAQABAAD';
			const result = getDisplayImageSrc(jpegBase64);
			expect(result).toBe(jpegBase64);
		});
		it('converts base64 string to data URL with correct MIME type for JPEG (without leading slash)', () => {
			const jpegBase64 = '9j4AAQSkZJRgABAQAAAQABAAD';
			const result = getDisplayImageSrc(jpegBase64);
			expect(result).toBe(`data:image/png;base64,${jpegBase64}`);
		});
		it('converts base64 string to data URL with correct MIME type for GIF', () => {
			const gifBase64 = 'R0lGODlhAQABAIAAAAAAAP';
			const result = getDisplayImageSrc(gifBase64);
			expect(result).toBe(`data:image/gif;base64,${gifBase64}`);
		});
		it('converts base64 string to data URL with correct MIME type for WebP', () => {
			const webpBase64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAw';
			const result = getDisplayImageSrc(webpBase64);
			expect(result).toBe(`data:image/webp;base64,${webpBase64}`);
		});
		it('defaults to PNG MIME type for unknown base64 format', () => {
			const unknownBase64 = 'SGVsbG8gV29ybGQ=';
			const result = getDisplayImageSrc(unknownBase64);
			expect(result).toBe(`data:image/png;base64,${unknownBase64}`);
		});
	});
});
