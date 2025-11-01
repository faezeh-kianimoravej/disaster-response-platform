import { describe, it, expect } from 'vitest';
import { userCreateRequestSchema, userEditRequestSchema } from '@/validation/userValidation';

const base = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com',
	mobile: '+31612345678',
	password: 'password123',
	roles: ['Citizen'] as const,
	departmentId: 0,
	municipalityId: 0,
	regionId: 0,
};

describe('userValidation', () => {
	it('accepts valid citizen without entity links', () => {
		const res = userCreateRequestSchema.safeParse(base);
		expect(res.success).toBe(true);
	});

	it('rejects when more than one of department/municipality/region is chosen', () => {
		const res = userCreateRequestSchema.safeParse({ ...base, departmentId: 1, regionId: 2 });
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(
				res.error.issues.some(i =>
					i.message.includes('Only one of Department, Municipality, or Region')
				)
			).toBe(true);
		}
	});

	it('requires department for Responder role', () => {
		const res = userCreateRequestSchema.safeParse({ ...base, roles: ['Responder'] });
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.some(i => i.path.includes('departmentId'))).toBe(true);
			// Message should mention requires a Department
			expect(res.error.issues.some(i => i.message.includes('requires a Department'))).toBe(true);
		}
	});

	it('disallows entity links for Citizen role', () => {
		const res = userCreateRequestSchema.safeParse({
			...base,
			roles: ['Citizen'],
			municipalityId: 5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.some(i => i.path.includes('roles'))).toBe(true);
			expect(res.error.issues.some(i => i.message.includes('should not be linked'))).toBe(true);
		}
	});

	it('edit schema requires valid userId and applies same rules', () => {
		const editValid = userEditRequestSchema.safeParse({ ...base, userId: 10 });
		expect(editValid.success).toBe(true);

		const editInvalid = userEditRequestSchema.safeParse({ ...base, userId: 0 });
		expect(editInvalid.success).toBe(false);
		if (!editInvalid.success) {
			expect(editInvalid.error.issues.some(i => i.path.includes('userId'))).toBe(true);
		}
	});
});
