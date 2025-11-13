import { describe, it, expect } from 'vitest';
import { getImageForResourceType, RESOURCE_TYPE_IMAGES } from '@/utils/resourceUtils';

describe('resourceUtils', () => {
	it('returns image for known type', () => {
		expect(getImageForResourceType('AMBULANCE')).toBe(RESOURCE_TYPE_IMAGES.AMBULANCE);
	});

	it('falls back to default image for unknown type', () => {
		expect(getImageForResourceType('WHATEVER')).toBe('/images/default.png');
	});
});
