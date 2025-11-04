import { describe, it, expect } from 'vitest';
import { resourceRequestSchema } from '@/validation/resourceValidation';

const base = {
	name: 'Medical Supplies',
	description: 'First aid kits',
	quantity: 10,
	available: 5,
	resourceType: 'FIELD_OPERATOR',
	departmentId: 1,
	image: '/images/medical.png',
};

describe('resourceValidation', () => {
	it('valid payload passes', () => {
		const parsed = resourceRequestSchema.safeParse(base);
		expect(parsed.success).toBe(true);
	});

	it('invalid when available > quantity', () => {
		const parsed = resourceRequestSchema.safeParse({ ...base, available: 11 });
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
});
