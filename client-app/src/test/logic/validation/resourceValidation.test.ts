import { describe, it, expect } from 'vitest';
import { resourceRequestSchema } from '@/validation/resourceValidation';

const base = {
	name: 'Medical Supplies',
	description: 'First aid kits',
	category: 'CONSUMABLE',
	resourceType: 'MEDICAL_KIT',
	resourceKind: 'CONSUMABLE',
	departmentId: 1,
	totalQuantity: 10,
	availableQuantity: 5,
	unit: 'PIECES',
	isTrackable: false,
	image: '/images/medicalkit.png',
	latitude: null,
	longitude: null,
};

describe('resourceValidation', () => {
	it('valid payload passes', () => {
		const parsed = resourceRequestSchema.safeParse(base);
		expect(parsed.success).toBe(true);
	});

	it('invalid when availableQuantity > totalQuantity', () => {
		const parsed = resourceRequestSchema.safeParse({ ...base, availableQuantity: 11 });
		expect(parsed.success).toBe(false);
	});

	it('invalid when resourceType unknown', () => {
		const parsed = resourceRequestSchema.safeParse({ ...base, resourceType: 'UNKNOWN' });
		expect(parsed.success).toBe(false);
	});

	it('invalid when departmentId < 1', () => {
		const parsed = resourceRequestSchema.safeParse({ ...base, departmentId: 0 });
		expect(parsed.success).toBe(false);
	});

	it('invalid when image empty', () => {
		const parsed = resourceRequestSchema.safeParse({ ...base, image: '' });
		expect(parsed.success).toBe(false);
	});

	it('UNIQUE kind: totalQuantity, availableQuantity, unit must be null', () => {
		const unique = {
			...base,
			resourceKind: 'UNIQUE',
			totalQuantity: null,
			availableQuantity: null,
			unit: null,
		};
		const parsed = resourceRequestSchema.safeParse(unique);
		expect(parsed.success).toBe(true);
		// Should fail if any are set
		expect(resourceRequestSchema.safeParse({ ...unique, totalQuantity: 1 }).success).toBe(false);
		expect(resourceRequestSchema.safeParse({ ...unique, availableQuantity: 1 }).success).toBe(
			false
		);
		expect(resourceRequestSchema.safeParse({ ...unique, unit: 'PIECES' }).success).toBe(false);
	});

	it('STACKABLE/CONSUMABLE: totalQuantity, availableQuantity, unit required', () => {
		const stackable = {
			...base,
			resourceKind: 'STACKABLE',
			totalQuantity: 5,
			availableQuantity: 2,
			unit: 'PIECES',
		};
		expect(resourceRequestSchema.safeParse(stackable).success).toBe(true);
		expect(resourceRequestSchema.safeParse({ ...stackable, totalQuantity: null }).success).toBe(
			false
		);
		expect(resourceRequestSchema.safeParse({ ...stackable, availableQuantity: null }).success).toBe(
			false
		);
		expect(resourceRequestSchema.safeParse({ ...stackable, unit: null }).success).toBe(false);
	});

	it('isTrackable: latitude/longitude required', () => {
		const trackable = {
			...base,
			isTrackable: true,
			latitude: 10,
			longitude: 20,
		};
		expect(resourceRequestSchema.safeParse(trackable).success).toBe(true);
		expect(resourceRequestSchema.safeParse({ ...trackable, latitude: null }).success).toBe(false);
		expect(resourceRequestSchema.safeParse({ ...trackable, longitude: null }).success).toBe(false);
	});

	it('not trackable: latitude/longitude must be null', () => {
		const notTrackable = {
			...base,
			isTrackable: false,
			latitude: null,
			longitude: null,
		};
		expect(resourceRequestSchema.safeParse(notTrackable).success).toBe(true);
		expect(resourceRequestSchema.safeParse({ ...notTrackable, latitude: 10 }).success).toBe(false);
		expect(resourceRequestSchema.safeParse({ ...notTrackable, longitude: 20 }).success).toBe(false);
	});
});
