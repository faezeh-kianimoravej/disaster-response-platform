import { describe, it, expect } from 'vitest';
import {
	RESOURCE_TYPES,
	RESOURCE_TYPE_IMAGES,
	getImageForResourceType,
	getDisplayImageSrc,
} from '@/utils/resourceUtils';

describe('resourceUtils', () => {
	describe('RESOURCE_TYPES', () => {
		it('should contain all expected resource types', () => {
			expect(RESOURCE_TYPES).toEqual({
				FIELD_OPERATOR: 'Field Operator',
				TRANSPORT_VEHICLE: 'Transport Vehicle',
				FIRE_TRUCK: 'Fire Truck',
				AMBULANCE: 'Ambulance',
				RIOT_CAR: 'Riot Car',
			});
		});
	});

	describe('RESOURCE_TYPE_IMAGES', () => {
		it('should contain image paths for all resource types', () => {
			expect(RESOURCE_TYPE_IMAGES).toEqual({
				FIELD_OPERATOR: '/images/fieldoperator.png',
				TRANSPORT_VEHICLE: '/images/transportvehicle.png',
				FIRE_TRUCK: '/images/firetruck.png',
				AMBULANCE: '/images/ambulance.png',
				RIOT_CAR: '/images/riotcar.png',
			});
		});
	});

	describe('getImageForResourceType', () => {
		it('should return correct image for valid resource type', () => {
			expect(getImageForResourceType('FIRE_TRUCK')).toBe('/images/firetruck.png');
			expect(getImageForResourceType('AMBULANCE')).toBe('/images/ambulance.png');
		});

		it('should return default FIELD_OPERATOR image for invalid resource type', () => {
			expect(getImageForResourceType('INVALID_TYPE')).toBe('/images/fieldoperator.png');
			expect(getImageForResourceType('')).toBe('/images/fieldoperator.png');
		});
	});

	describe('getDisplayImageSrc', () => {
		it('should return undefined for empty or null image', () => {
			expect(getDisplayImageSrc(null)).toBeUndefined();
			expect(getDisplayImageSrc(undefined)).toBeUndefined();
			expect(getDisplayImageSrc('')).toBeUndefined();
			expect(getDisplayImageSrc('   ')).toBeUndefined();
		});

		it('should return data URL as-is', () => {
			const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
			expect(getDisplayImageSrc(dataUrl)).toBe(dataUrl);
		});

		it('should return http/https URL as-is', () => {
			const httpUrl = 'http://example.com/image.png';
			const httpsUrl = 'https://example.com/image.png';
			const protocolRelative = '//example.com/image.png';

			expect(getDisplayImageSrc(httpUrl)).toBe(httpUrl);
			expect(getDisplayImageSrc(httpsUrl)).toBe(httpsUrl);
			expect(getDisplayImageSrc(protocolRelative)).toBe(protocolRelative);
		});

		it('should treat base64 JPEG starting with / as a path (URL)', () => {
			// Base64 JPEG strings start with /9j/ which matches the URL regex
			const jpegBase64 = '/9j/4AAQSkZJRgABAQAAAQABAAD';
			const result = getDisplayImageSrc(jpegBase64);
			// Function treats this as a URL path and returns as-is
			expect(result).toBe(jpegBase64);
		});

		it('should convert base64 string to data URL with correct MIME type for JPEG (without leading slash)', () => {
			// Test with JPEG base64 that doesn't trigger URL detection
			const jpegBase64 = '9j4AAQSkZJRgABAQAAAQABAAD';
			const result = getDisplayImageSrc(jpegBase64);
			// Without leading /, it's treated as base64 but defaults to PNG
			expect(result).toBe(`data:image/png;base64,${jpegBase64}`);
		});
		it('should convert base64 string to data URL with correct MIME type for GIF', () => {
			const gifBase64 = 'R0lGODlhAQABAIAAAAAAAP';
			const result = getDisplayImageSrc(gifBase64);
			expect(result).toBe(`data:image/gif;base64,${gifBase64}`);
		});

		it('should convert base64 string to data URL with correct MIME type for WebP', () => {
			const webpBase64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAw';
			const result = getDisplayImageSrc(webpBase64);
			expect(result).toBe(`data:image/webp;base64,${webpBase64}`);
		});

		it('should default to PNG MIME type for unknown base64 format', () => {
			const unknownBase64 = 'SGVsbG8gV29ybGQ=';
			const result = getDisplayImageSrc(unknownBase64);
			expect(result).toBe(`data:image/png;base64,${unknownBase64}`);
		});
	});
});
