import { describe, it, expect } from 'vitest';
import { userCreateFormSchema, userEditFormSchema } from '@/validation/userValidation';
import type { Role } from '@/types/role';

const strongPassword = 'Abcdef1!'; // satisfies the schema requirements

const base = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com',
	mobile: '+31612345678',
	password: strongPassword,
	roles: [] as Role[],
};

describe('userValidation (userCreateFormSchema)', () => {
	it('accepts valid citizen without entity links', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(res.success).toBe(true);
	});

	it('rejects when more than one of department/municipality/region is chosen for a department-scoped role', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [
				{
					roleType: 'Responder',
					departmentId: 1,
					municipalityId: null,
					regionId: 2, // invalid: region not applicable and multiple IDs set
				},
			],
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			// Should flag regionId as not applicable OR report multiple IDs
			expect(
				res.error.issues.some(
					i =>
						i.message.includes('Region ID is not applicable') ||
						i.message.includes('at most one related entity ID')
				)
			).toBe(true);
		}
	});

	it('requires departmentId for Responder role', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [{ roleType: 'Responder', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.some(i => (i.path ?? []).includes('departmentId'))).toBe(true);
			expect(res.error.issues.some(i => i.message.includes('Department ID is required'))).toBe(
				true
			);
		}
	});

	it('disallows entity links for Citizen role', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: 5, regionId: null }],
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(
				res.error.issues.some(i => i.message.includes('should not have a related entity ID'))
			).toBe(true);
		}
	});
});

describe('userValidation (userEditFormSchema)', () => {
	it('accepts valid data with password', () => {
		const res = userEditFormSchema.safeParse({
			...base,
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(res.success).toBe(true);
	});

	it('accepts valid data with empty password (no change)', () => {
		const res = userEditFormSchema.safeParse({
			...base,
			password: '',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(res.success).toBe(true);
	});

	it('rejects weak password when provided', () => {
		const res = userEditFormSchema.safeParse({
			...base,
			password: 'weak',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.some(i => (i.path ?? []).includes('password'))).toBe(true);
		}
	});
});
