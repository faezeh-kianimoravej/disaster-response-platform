/* eslint-disable no-restricted-syntax */
import { createContext, useContext } from 'react';
import type { User } from '@/types/user';
import type { Role } from '@/types/role';

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

export type AuthState = {
	isLoggedIn: boolean;
	user: User | null;
	token: string | undefined;
};

export type AuthContextValue = AuthState & {
	// optional setters for dev/testing UI. Keep optional so existing code can ignore them.
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
