/* eslint-disable */
import { describe, it, expect } from 'vitest';
import {
	isUserLoggedIn,
	userHasAnyRole,
	userHasAllRoles,
	userHasRegionId,
	userHasMunicipalityId,
	userHasDepartmentId,
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

const auth = (
	roles: Role[] = [],
	ids?: Partial<{ regionId: number; municipalityId: number; departmentId: number }>
): AuthState => ({
	isLoggedIn: true,
	user: {
		userId: 1,
		firstName: 'T',
		lastName: 'User',
		email: 't@example.com',
		mobile: '000',
		roles,
		regionId: ids?.regionId,
		municipalityId: ids?.municipalityId,
		departmentId: ids?.departmentId,
	},
	token: 'x',
});

describe('AuthContext pure predicates', () => {
	it('basic login and roles', () => {
		expect(isUserLoggedIn(auth())).toBe(true);
		expect(isUserLoggedIn(null)).toBe(false);
		expect(userHasAnyRole(auth(['Region Admin']), ['Region Admin'])).toBe(true);
		expect(userHasAnyRole(auth(['Region Admin']), ['Municipality Admin'])).toBe(false);
		expect(
			userHasAllRoles(auth(['Region Admin', 'Municipality Admin']), [
				'Region Admin',
				'Municipality Admin',
			])
		).toBe(true);
		expect(userHasAllRoles(auth(['Region Admin']), ['Region Admin', 'Municipality Admin'])).toBe(
			false
		);
	});

	it('id matchers', () => {
		const a = auth([], { regionId: 1, municipalityId: 10, departmentId: 100 });
		expect(userHasRegionId(a, 1)).toBe(true);
		expect(userHasMunicipalityId(a, 10)).toBe(true);
		expect(userHasDepartmentId(a, 100)).toBe(true);
		expect(userHasRegionId(a, 2)).toBe(false);
	});

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

		// Direct region access
		expect(userHasAccessToRegion(auth([], { regionId: 1 }), 1)).toBe(true);

		// Municipality: via direct municipality id or via region
		expect(userHasAccessToMunicipality(auth([], { municipalityId: 10 }), 10, municipality)).toBe(
			true
		);
		expect(userHasAccessToMunicipality(auth([], { regionId: 1 }), 10, municipality)).toBe(true);
		expect(userHasAccessToMunicipality(auth([], { regionId: 2 }), 10, municipality)).toBe(false);

		// Department: via dept id, via municipality, or via region
		expect(
			userHasAccessToDepartment(auth([], { departmentId: 100 }), 100, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToDepartment(auth([], { municipalityId: 10 }), 100, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToDepartment(auth([], { regionId: 1 }), 100, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToDepartment(auth([], { regionId: 2 }), 100, department, municipality)
		).toBe(false);

		// Resource: via dept ownership, municipality ownership, or region ownership
		expect(
			userHasAccessToResource(auth([], { departmentId: 100 }), resource, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToResource(auth([], { municipalityId: 10 }), resource, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToResource(auth([], { regionId: 1 }), resource, department, municipality)
		).toBe(true);
		expect(
			userHasAccessToResource(auth([], { regionId: 2 }), resource, department, municipality)
		).toBe(false);
	});
});
