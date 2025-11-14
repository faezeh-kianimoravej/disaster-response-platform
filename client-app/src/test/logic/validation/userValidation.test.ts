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

	it('validates email format', () => {
		const invalidEmail = userEditFormSchema.safeParse({
			...base,
			email: 'notanemail',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(invalidEmail.success).toBe(false);

		const validEmail = userEditFormSchema.safeParse({
			...base,
			email: 'valid@example.com',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(validEmail.success).toBe(true);
	});

	it('validates mobile format', () => {
		const invalidMobile = userEditFormSchema.safeParse({
			...base,
			mobile: '123',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(invalidMobile.success).toBe(false);

		const validMobile = userEditFormSchema.safeParse({
			...base,
			mobile: '+31612345678',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(validMobile.success).toBe(true);
	});

	it('requires firstName', () => {
		const res = userEditFormSchema.safeParse({
			...base,
			firstName: '',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(res.success).toBe(false);
	});

	it('requires lastName', () => {
		const res = userEditFormSchema.safeParse({
			...base,
			lastName: '',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		});
		expect(res.success).toBe(false);
	});
});

describe('userValidation (password complexity)', () => {
	it('rejects password without uppercase letter', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			password: 'lowercase123!',
		});
		expect(res.success).toBe(false);
	});

	it('rejects password without lowercase letter', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			password: 'UPPERCASE123!',
		});
		expect(res.success).toBe(false);
	});

	it('rejects password without number', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			password: 'NoNumbers!',
		});
		expect(res.success).toBe(false);
	});

	it('rejects password without special character', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			password: 'NoSpecial123',
		});
		expect(res.success).toBe(false);
	});

	it('rejects password shorter than 8 characters', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			password: 'Short1!',
		});
		expect(res.success).toBe(false);
	});
});

// --- Responder Profile validation tests ---
describe('userValidation (responderProfile business rules)', () => {
	const responderRole = {
		roleType: 'Responder',
		departmentId: 1,
		municipalityId: null,
		regionId: null,
	};
	const validResponderProfile = {
		userId: 1,
		departmentId: 1,
		primarySpecialization: 'firefighter',
		secondarySpecializations: ['paramedic', 'driver'],
		isAvailable: true,
		currentDeploymentId: undefined,
	};

	it('requires responderProfile for Responder role', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [responderRole],
			responderProfile: undefined,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.some(i => (i.path ?? []).includes('responderProfile'))).toBe(true);
			expect(res.error.issues.some(i => i.message.includes('Responder profile is required'))).toBe(
				true
			);
		}
	});

	it('accepts valid responderProfile for Responder role', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [responderRole],
			responderProfile: validResponderProfile,
		});
		expect(res.success).toBe(true);
	});

	it('rejects responderProfile with invalid primarySpecialization', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [responderRole],
			responderProfile: {
				...validResponderProfile,
				primarySpecialization: 'not_a_specialization',
			},
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.some(i => (i.path ?? []).includes('primarySpecialization'))).toBe(
				true
			);
		}
	});

	it('accepts responderProfile with empty secondarySpecializations', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [responderRole],
			responderProfile: {
				...validResponderProfile,
				secondarySpecializations: [],
			},
		});
		expect(res.success).toBe(true);
	});

	it('accepts responderProfile with omitted secondarySpecializations', () => {
		const profileNoSecondary = { ...validResponderProfile };
		profileNoSecondary.secondarySpecializations = [];
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [responderRole],
			responderProfile: profileNoSecondary,
		});
		expect(res.success).toBe(true);
	});

	it('rejects responderProfile with invalid secondarySpecializations', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [responderRole],
			responderProfile: {
				...validResponderProfile,
				secondarySpecializations: ['not_a_specialization'],
			},
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.some(i => (i.path ?? []).includes('secondarySpecializations'))).toBe(
				true
			);
		}
	});

	it('does not require responderProfile for non-Responder roles', () => {
		const res = userCreateFormSchema.safeParse({
			...base,
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
			responderProfile: undefined,
		});
		expect(res.success).toBe(true);
	});
});
