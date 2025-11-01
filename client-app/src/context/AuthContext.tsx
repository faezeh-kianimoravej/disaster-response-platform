/* eslint-disable no-restricted-syntax */
import { createContext, useContext } from 'react';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';
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

export function isUserLoggedIn(auth: AuthState | null | undefined): boolean {
	return !!auth && !!auth.user;
}

export function userHasAnyRole(auth: AuthState | null | undefined, roles: Role[]): boolean {
	if (!auth?.user?.roles) return false;
	return auth.user.roles.some(r => roles.includes(r));
}

export function userHasAllRoles(auth: AuthState | null | undefined, roles: Role[]): boolean {
	if (!auth?.user?.roles) return false;
	return roles.every(role => auth.user?.roles && auth.user.roles.includes(role));
}

export function userHasRegionId(
	auth: AuthState | null | undefined,
	regionId: number | null | undefined
): boolean {
	if (!auth?.user) return false;
	if (auth.user.regionId === undefined) return false;
	return auth.user.regionId === regionId;
}

export function userHasMunicipalityId(
	auth: AuthState | null | undefined,
	municipalityId: number | null | undefined
): boolean {
	if (!auth?.user) return false;
	if (auth.user.municipalityId === undefined) return false;
	return auth.user.municipalityId === municipalityId;
}

export function userHasDepartmentId(
	auth: AuthState | null | undefined,
	departmentId: number | null | undefined
): boolean {
	if (!auth?.user) return false;
	if (auth.user.departmentId === undefined) return false;
	return auth.user.departmentId === departmentId;
}

export function userHasAccessToRegion(
	auth: AuthState | null | undefined,
	regionId: number | null | undefined
): boolean {
	if (!auth?.user) return false;
	if (auth.user.regionId === undefined) return false;
	return auth.user.regionId === regionId;
}

export function userHasAccessToMunicipality(
	auth: AuthState | null | undefined,
	municipalityId: number | null | undefined,
	municipality?: Municipality | null
): boolean {
	if (!auth?.user) return false;
	if (
		auth.user.municipalityId !== undefined &&
		municipalityId !== null &&
		auth.user.municipalityId === municipalityId
	) {
		return true;
	}
	if (auth.user.regionId !== undefined && municipality) {
		if (municipality.regionId === auth.user.regionId) return true;
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
	if (
		auth.user.departmentId !== undefined &&
		departmentId !== null &&
		auth.user.departmentId === departmentId
	)
		return true;
	if (auth.user.municipalityId !== undefined && department) {
		if (department.municipalityId === auth.user.municipalityId) return true;
	}
	if (auth.user.regionId !== undefined && municipality) {
		if (municipality.regionId === auth.user.regionId) return true;
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
	if (auth.user.departmentId !== undefined && resource) {
		if (resource.departmentId === auth.user.departmentId) return true;
	}
	if (auth.user.municipalityId !== undefined && department) {
		if (department.municipalityId === auth.user.municipalityId) return true;
	}
	if (auth.user.regionId !== undefined && municipality) {
		if (municipality.regionId === auth.user.regionId) return true;
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
export function useUserHasAnyRole(roles: Role[]): boolean {
	const auth = useAuth();
	return userHasAnyRole(auth ?? null, roles);
}

/**
 * Hook: useUserHasAllRoles
 * - Returns true if the currently authenticated user has all of the given roles.
 * - Use inside React components/pages.
 */
export function useUserHasAllRoles(roles: Role[]): boolean {
	const auth = useAuth();
	return userHasAllRoles(auth ?? null, roles);
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
 * Hook: useUserHasRegionId
 * - Returns true if the currently authenticated user's regionId matches the given regionId.
 * - Use inside React components/pages.
 */
export function useUserHasRegionId(regionId: number | null | undefined): boolean {
	const auth = useAuth();
	return userHasRegionId(auth ?? null, regionId);
}

/**
 * Hook: useUserHasMunicipalityId
 * - Returns true if the currently authenticated user's municipalityId matches the given municipalityId.
 * - Use inside React components/pages.
 */
export function useUserHasMunicipalityId(municipalityId: number | null | undefined): boolean {
	const auth = useAuth();
	return userHasMunicipalityId(auth ?? null, municipalityId);
}

/**
 * Hook: useUserHasDepartmentId
 * - Returns true if the currently authenticated user's departmentId matches the given departmentId.
 * - Use inside React components/pages.
 */
export function useUserHasDepartmentId(departmentId: number | null | undefined): boolean {
	const auth = useAuth();
	return userHasDepartmentId(auth ?? null, departmentId);
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
