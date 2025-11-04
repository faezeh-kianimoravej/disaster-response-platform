export const ALL_ROLES = [
	'Citizen',
	'Responder',
	'Officer on Duty',
	'Leader CoPI',
	'Calamity Coordinator',
	'Operational Leader',
	'Mayor',
	'Chair Safety Region',
	'Department Admin',
	'Municipality Admin',
	'Region Admin',
] as const;
export type RoleType = (typeof ALL_ROLES)[number];

// Backend RoleDto structure
export interface Role {
	roleType: RoleType;
	departmentId: number | null;
	municipalityId: number | null;
	regionId: number | null;
}

export const ADMIN_ROLES = [
	'Region Admin',
	'Municipality Admin',
	'Department Admin',
] as readonly RoleType[];

export const REGION_ROLES = [
	'Region Admin',
	'Chair Safety Region',
	'Calamity Coordinator',
] as readonly RoleType[];

export const MUNICIPALITY_ROLES = [
	'Municipality Admin',
	'Mayor',
	'Operational Leader',
] as readonly RoleType[];

export const DEPARTMENT_ROLES = [
	'Department Admin',
	'Leader CoPI',
	'Officer on Duty',
	'Responder',
] as readonly RoleType[];

/**
 * Helper function to create a Role object from a RoleType string
 * Useful for creating role objects for permission checks
 */
export function createRole(
	roleType: RoleType,
	options?: {
		departmentId?: number | null;
		municipalityId?: number | null;
		regionId?: number | null;
	}
): Role {
	return {
		roleType,
		departmentId: options?.departmentId ?? null,
		municipalityId: options?.municipalityId ?? null,
		regionId: options?.regionId ?? null,
	};
}

/**
 * Helper to convert array of RoleType strings to Role objects
 */
export function createRoles(roleTypes: RoleType[]): Role[] {
	return roleTypes.map(roleType => createRole(roleType));
}
