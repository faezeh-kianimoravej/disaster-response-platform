/* eslint-disable */
import { describe, it, expect } from 'vitest';
import {
	isUserLoggedIn,
	userHasAnyRole,
	userHasAllRoles,
	userHasAccessToRegion,
	userHasAccessToMunicipality,
	userHasAccessToDepartment,
	userHasAccessToResource,
	AuthState,
} from '@/context/AuthContext';
import type { Municipality } from '@/types/municipality';
import type { Department } from '@/types/department';
import type { Resource } from '@/types/resource';
import type { Role } from '@/types/role';
import { createRole, createRoles } from '@/types/role';

const auth = (roles: Role[] = []): AuthState => ({
	isLoggedIn: true,
	user: {
		userId: 1,
		firstName: 'T',
		lastName: 'User',
		email: 't@example.com',
		mobile: '000',
		roles,
		deleted: false,
	},
	token: 'x',
});

describe('AuthContext pure predicates', () => {
	it('basic login and roles', () => {
		expect(isUserLoggedIn(auth())).toBe(true);
		expect(isUserLoggedIn(null)).toBe(false);
		expect(userHasAnyRole(auth(createRoles(['Region Admin'])), ['Region Admin'])).toBe(true);
		expect(userHasAnyRole(auth(createRoles(['Region Admin'])), ['Municipality Admin'])).toBe(false);
		expect(
			userHasAllRoles(
				auth(createRoles(['Region Admin', 'Municipality Admin'])),
				['Region Admin', 'Municipality Admin']
			)
		).toBe(true);
		expect(
			userHasAllRoles(auth(createRoles(['Region Admin'])), ['Region Admin', 'Municipality Admin'])
		).toBe(false);
	});

	// Removed legacy id matcher tests; use access checks below instead

	it('access checks across hierarchy', () => {
		const municipality: Municipality = {
			municipalityId: 10,
			name: 'M',
			regionId: 1,
			image: '/m.png',
		};
		const department: Department = {
			departmentId: 100,
			name: 'D',
			municipalityId: 10,
			image: '/d.png',
		};
		const resource: Resource = {
			resourceId: 1000,
			name: 'R',
			departmentId: 100,
			description: '',
			quantity: 1,
			available: 1,
			image: '/x.png',
			resourceType: 'Field Operator',
		};

		// Direct region access via role with regionId
		expect(userHasAccessToRegion(auth([createRole('Region Admin', { regionId: 1 })]), 1)).toBe(
			true
		);

		// Municipality: via direct municipality id or via region
		expect(
			userHasAccessToMunicipality(
				auth([createRole('Municipality Admin', { municipalityId: 10 })]),
				10,
				municipality
			)
		).toBe(true);
		expect(
			userHasAccessToMunicipality(auth([createRole('Region Admin', { regionId: 1 })]), 10, municipality)
		).toBe(true);
		expect(
			userHasAccessToMunicipality(auth([createRole('Region Admin', { regionId: 2 })]), 10, municipality)
		).toBe(false);

		// Department: via dept id, via municipality, or via region
		expect(
			userHasAccessToDepartment(
				auth([createRole('Department Admin', { departmentId: 100 })]),
				100,
				department,
				municipality
			)
		).toBe(true);
		expect(
			userHasAccessToDepartment(
				auth([createRole('Municipality Admin', { municipalityId: 10 })]),
				100,
				department,
				municipality
			)
		).toBe(true);
		expect(
			userHasAccessToDepartment(auth([createRole('Region Admin', { regionId: 1 })]), 100, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToDepartment(auth([createRole('Region Admin', { regionId: 2 })]), 100, department, municipality)
		).toBe(false);

		// Resource: via dept ownership, municipality ownership, or region ownership
		expect(
			userHasAccessToResource(
				auth([createRole('Department Admin', { departmentId: 100 })]),
				resource,
				department,
				municipality
			)
		).toBe(true);
		expect(
			userHasAccessToResource(
				auth([createRole('Municipality Admin', { municipalityId: 10 })]),
				resource,
				department,
				municipality
			)
		).toBe(true);
		expect(
			userHasAccessToResource(auth([createRole('Region Admin', { regionId: 1 })]), resource, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToResource(auth([createRole('Region Admin', { regionId: 2 })]), resource, department, municipality)
		).toBe(false);
	});
});
