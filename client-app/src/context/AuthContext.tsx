/* eslint-disable no-restricted-syntax */
import { createContext, useContext } from 'react';
import type { User } from '@/types/user';
import type { Role, RoleType } from '@/types/role';
import type { Municipality } from '@/types/municipality';
import type { Department } from '@/types/department';
import type { Resource } from '@/types/resource';
import { useMunicipality } from '@/hooks/useMunicipality';
import { useDepartment } from '@/hooks/useDepartment';
import { useResource } from '@/hooks/useResource';

/**
 * NOTE (usage guidance):
 *
 * We provide two layers of APIs for authorization checks:
 *
 * 1) Pure predicate functions that accept an AuthState. Use these from
 *    non-React code, unit tests, or anywhere you already have an AuthState
 *    value available. They are deterministic and easy to test.
 *
 *    Example: userHasAnyRoleState(auth, ['Region Admin'])
 *
 * 2) Hook wrappers that call `useAuth()` internally and delegate to the
 *    pure functions. Use these inside React components/pages so you do not
 *    need to manually pass the auth object around.
 *
 *    Example: const canEdit = useUserHasAnyRole(['Region Admin'])
 *
 * This keeps ergonomics good for React while preserving testability and
 * reusability for non-React contexts.
 */

/**
 * Helper: Get all region IDs from user's roles
 */
function getUserRegionIds(user: User | null | undefined): number[] {
	if (!user?.roles) return [];
	return user.roles
		.map(r => r.regionId)
		.filter((id): id is number => id !== null && id !== undefined);
}

/**
 * Helper: Get all municipality IDs from user's roles
 */
function getUserMunicipalityIds(user: User | null | undefined): number[] {
	if (!user?.roles) return [];
	return user.roles
		.map(r => r.municipalityId)
		.filter((id): id is number => id !== null && id !== undefined);
}

/**
 * Helper: Get all department IDs from user's roles
 */
function getUserDepartmentIds(user: User | null | undefined): number[] {
	if (!user?.roles) return [];
	return user.roles
		.map(r => r.departmentId)
		.filter((id): id is number => id !== null && id !== undefined);
}

export function isUserLoggedIn(auth: AuthState | null | undefined): boolean {
	return !!auth && !!auth.user;
}

// Overloads to support both RoleType[] and Role[]
export function userHasAnyRole(auth: AuthState | null | undefined, roles: Role[]): boolean;
export function userHasAnyRole(auth: AuthState | null | undefined, roles: RoleType[]): boolean;
export function userHasAnyRole(
	auth: AuthState | null | undefined,
	roles: (Role | RoleType)[]
): boolean {
	if (!auth?.user?.roles) return false;
	const userRoleTypes = auth.user.roles.map(r => r.roleType);
	const checkRoleTypes: RoleType[] = roles.map(
		r => (typeof r === 'string' ? r : r.roleType) as RoleType
	);
	return userRoleTypes.some(r => checkRoleTypes.includes(r));
}

export function userHasAllRoles(auth: AuthState | null | undefined, roles: Role[]): boolean;
export function userHasAllRoles(auth: AuthState | null | undefined, roles: RoleType[]): boolean;
export function userHasAllRoles(
	auth: AuthState | null | undefined,
	roles: (Role | RoleType)[]
): boolean {
	if (!auth?.user?.roles) return false;
	const userRoleTypes = auth.user.roles.map(r => r.roleType);
	const checkRoleTypes: RoleType[] = roles.map(
		r => (typeof r === 'string' ? r : r.roleType) as RoleType
	);
	return checkRoleTypes.every(role => userRoleTypes.includes(role));
}

export function userHasAccessToRegion(
	auth: AuthState | null | undefined,
	regionId: number | null | undefined
): boolean {
	if (!auth?.user || regionId === null || regionId === undefined) return false;
	const userRegionIds = getUserRegionIds(auth.user);
	return userRegionIds.includes(regionId);
}

export function userHasAccessToMunicipality(
	auth: AuthState | null | undefined,
	municipalityId: number | null | undefined,
	municipality?: Municipality | null
): boolean {
	if (!auth?.user) return false;

	// Direct municipality access
	const userMunicipalityIds = getUserMunicipalityIds(auth.user);
	if (
		municipalityId !== null &&
		municipalityId !== undefined &&
		userMunicipalityIds.includes(municipalityId)
	) {
		return true;
	}

	// Access via region
	const userRegionIds = getUserRegionIds(auth.user);
	if (municipality && userRegionIds.length > 0) {
		if (userRegionIds.includes(municipality.regionId)) return true;
	}

	return false;
}

export function userHasAccessToDepartment(
	auth: AuthState | null | undefined,
	departmentId: number | null | undefined,
	department?: Department | null,
	municipality?: Municipality | null
): boolean {
	if (!auth?.user) return false;

	// Direct department access
	const userDepartmentIds = getUserDepartmentIds(auth.user);
	if (
		departmentId !== null &&
		departmentId !== undefined &&
		userDepartmentIds.includes(departmentId)
	) {
		return true;
	}

	// Access via municipality
	const userMunicipalityIds = getUserMunicipalityIds(auth.user);
	if (department && userMunicipalityIds.length > 0) {
		if (userMunicipalityIds.includes(department.municipalityId)) return true;
	}

	// Access via region
	const userRegionIds = getUserRegionIds(auth.user);
	if (municipality && userRegionIds.length > 0) {
		if (userRegionIds.includes(municipality.regionId)) return true;
	}

	return false;
}

export function userHasAccessToResource(
	auth: AuthState | null | undefined,
	resource?: Resource | null,
	department?: Department | null,
	municipality?: Municipality | null
): boolean {
	if (!auth?.user) return false;

	// Direct department access
	const userDepartmentIds = getUserDepartmentIds(auth.user);
	if (resource && userDepartmentIds.length > 0) {
		if (userDepartmentIds.includes(resource.departmentId)) return true;
	}

	// Access via municipality
	const userMunicipalityIds = getUserMunicipalityIds(auth.user);
	if (department && userMunicipalityIds.length > 0) {
		if (userMunicipalityIds.includes(department.municipalityId)) return true;
	}

	// Access via region
	const userRegionIds = getUserRegionIds(auth.user);
	if (municipality && userRegionIds.length > 0) {
		if (userRegionIds.includes(municipality.regionId)) return true;
	}

	return false;
}

export type AuthState = {
	isLoggedIn: boolean;
	user: User | null;
	token: string | undefined;
};

export type AuthContextValue = AuthState & {
	setAuth?: (a: AuthState) => void;
	updateUser?: (patch: Partial<User> | null) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
	return useContext(AuthContext);
}

// ---------------------- Hook wrappers (component-friendly) ----------------------

/**
 * Hook: useIsUserLoggedIn
 * - Use inside React components to check login state.
 * - Prefer this over calling `isUserLoggedIn(auth)` directly from components.
 */
export function useIsUserLoggedIn(): boolean {
	const auth = useAuth();
	return isUserLoggedIn(auth ?? null);
}

/**
 * Hook: useUserHasAnyRole
 * - Returns true if the currently authenticated user has any of the given roles.
 * - Use inside React components/pages.
 */
// Accept RoleType[] or Role[] so callers don't need to construct Role objects
export function useUserHasAnyRole(roles: Role[] | RoleType[]): boolean {
	const auth = useAuth();
	const normalized: RoleType[] = (roles as (Role | RoleType)[]).map(
		r => (typeof r === 'string' ? r : r.roleType) as RoleType
	);
	return userHasAnyRole(auth ?? null, normalized);
}

/**
 * Hook: useUserHasAllRoles
 * - Returns true if the currently authenticated user has all of the given roles.
 * - Use inside React components/pages.
 */
// Accept RoleType[] or Role[] so callers don't need to construct Role objects
export function useUserHasAllRoles(roles: Role[] | RoleType[]): boolean {
	const auth = useAuth();
	const normalized: RoleType[] = (roles as (Role | RoleType)[]).map(
		r => (typeof r === 'string' ? r : r.roleType) as RoleType
	);
	return userHasAllRoles(auth ?? null, normalized);
}

/**
 * Hook: useCurrentUserRoles
 * - Returns the current user's role array (or empty array).
 * - Useful in UI code that needs to render role lists or toggles. Prefer
 *   `useUserHasAnyRole` / `useUserHasAllRole` when making permission decisions.
 */
export function useCurrentUserRoles(): Role[] {
	const auth = useAuth();
	return auth?.user?.roles ?? [];
}

/**
 * Hook: useUserHasAccessToRegion
 * - Returns true if the current user has access to the given region (via regionId).
 */
export function useUserHasAccessToRegion(regionId: number | null | undefined): boolean {
	const auth = useAuth();
	return userHasAccessToRegion(auth ?? null, regionId);
}

/**
 * Hook: useUserHasAccessToMunicipality
 * - Returns true if the current user has access to the given municipality either directly
 *   or via their region.
 */
export function useUserHasAccessToMunicipality(municipalityId: number | null | undefined): boolean {
	const auth = useAuth();
	const { municipality } = useMunicipality(municipalityId ?? undefined);
	return userHasAccessToMunicipality(auth ?? null, municipalityId, municipality);
}

/**
 * Hook: useUserHasAccessToDepartment
 * - Returns true if the current user has access to the given department directly,
 *   via municipality ownership, or via region ownership.
 */
export function useUserHasAccessToDepartment(departmentId: number | null | undefined): boolean {
	const auth = useAuth();
	const { department } = useDepartment(departmentId ?? undefined);
	const { municipality } = useMunicipality(department?.municipalityId ?? undefined);
	return userHasAccessToDepartment(auth ?? null, departmentId, department, municipality);
}

/**
 * Hook: useUserHasAccessToResource
 * - Returns true if the current user has access to the given resource
 *   via department ownership, municipality ownership, or via region ownership.
 */
export function useUserHasAccessToResource(resourceId: number | null | undefined): boolean {
	const auth = useAuth();
	const { resource } = useResource(resourceId ?? undefined);
	const { department } = useDepartment(resource?.departmentId ?? undefined);
	const { municipality } = useMunicipality(department?.municipalityId ?? undefined);
	return userHasAccessToResource(auth ?? null, resource, department ?? null, municipality ?? null);
}
