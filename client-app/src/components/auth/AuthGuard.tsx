import type { ReactNode } from 'react';
import {
	useIsUserLoggedIn,
	useUserHasAnyRole,
	useUserHasAllRoles,
	useUserHasAccessToRegion,
	useUserHasAccessToMunicipality,
	useUserHasAccessToDepartment,
	useUserHasAccessToResource,
} from '@/context/AuthContext';
import NotAuthorizedPage from '@/pages/NotAuthorizedPage';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { Role, RoleType } from '@/types/role';
import { useKeycloak } from '@/context/KeycloakProvider';

type Props = AuthGuardOptions & {
	children: ReactNode;
};

export type AuthGuardOptions = {
	/** Roles required to access the page. */
	requireRoles?: Role[] | RoleType[];
	/** If 'all', user must have all roles; if 'any' (default) user must have at least one. */
	roleMode?: 'any' | 'all';
	/** Require user to have access to a specific region. */
	requireAccessToRegion?: number | null | undefined;
	/** Require user to have access to a specific municipality. */
	requireAccessToMunicipality?: number | null | undefined;
	/** Require user to have access to a specific department. */
	requireAccessToDepartment?: number | null | undefined;
	/** Require user to have access to a specific resource. */
	requireAccessToResource?: number | null | undefined;
};

/**
 * AuthGuard: a small wrapper that centralizes authorization checks at the page level.
 * - Public pages should not use this.
 * - Protected pages should wrap their content in this component, specifying required roles as needed.
 * - All protect pages require the user to be logged in.
 * @param children The content to render if authorized.
 * @param opts Authorization options.
 */
export default function AuthGuard({ children, ...opts }: Props) {
	const isLoggedIn = useIsUserLoggedIn();
	const {
		initialized: keycloakInitialized,
		isAuthenticated: keycloakAuthenticated,
		isOffline,
	} = useKeycloak();

	const required = opts.requireRoles ?? [];
	const hasAnyRole = useUserHasAnyRole(required);
	const hasAllRoles = useUserHasAllRoles(required);
	const hasRegionAccess = useUserHasAccessToRegion(opts.requireAccessToRegion);
	const municipalityCheck = useUserHasAccessToMunicipality(opts.requireAccessToMunicipality);
	const departmentCheck = useUserHasAccessToDepartment(opts.requireAccessToDepartment);
	const resourceCheck = useUserHasAccessToResource(opts.requireAccessToResource);

	// When offline, check if we have cached auth data and allow access
	if (isOffline) {
		// Check if we have cached auth token and/or user data
		const cachedToken = localStorage.getItem('auth_token');
		const cachedUser = localStorage.getItem('auth_user');
		
		// If we have cached token or user data, allow access (AuthProvider will handle restoring the state)
		if ((cachedToken || cachedUser) && (isLoggedIn || !keycloakInitialized)) {
			// User has cached auth data, allow access
			return children as JSX.Element;
		}
		
		// No cached auth data, show offline message
		return (
			<LoadingPanel text="You are currently offline. Please check your internet connection to sign in." />
		) as JSX.Element;
	}

	if (!keycloakInitialized) {
		return (<LoadingPanel text="Authenticating" />) as JSX.Element;
	}

	if (!isLoggedIn) {
		if (keycloakAuthenticated) {
			return (<LoadingPanel text="Authenticating" />) as JSX.Element;
		}

		try {
			const params = new URLSearchParams(window.location.search);
			const isKcCallback =
				params.has('code') ||
				params.has('error') ||
				params.has('state') ||
				params.has('session_state');
			if (isKcCallback) {
				return (<LoadingPanel text="Authenticating" />) as JSX.Element;
			}
		} catch {
			return (<NotAuthorizedPage />) as JSX.Element;
		}
	}

	const isLoading = municipalityCheck.loading || departmentCheck.loading || resourceCheck.loading;

	if (isLoading) {
		return (<LoadingPanel text="Authenticating" />) as JSX.Element;
	}

	if (required.length > 0) {
		const mode = opts.roleMode ?? 'any';
		if (mode === 'all' && !hasAllRoles) {
			return (<NotAuthorizedPage />) as JSX.Element;
		}
		if (mode === 'any' && !hasAnyRole) {
			return (<NotAuthorizedPage />) as JSX.Element;
		}
	}

	if (opts.requireAccessToRegion !== undefined && !hasRegionAccess) {
		return (<NotAuthorizedPage />) as JSX.Element;
	}

	if (opts.requireAccessToMunicipality !== undefined && !municipalityCheck.hasAccess) {
		return (<NotAuthorizedPage />) as JSX.Element;
	}

	if (opts.requireAccessToDepartment !== undefined && !departmentCheck.hasAccess) {
		return (<NotAuthorizedPage />) as JSX.Element;
	}

	if (opts.requireAccessToResource !== undefined && !resourceCheck.hasAccess) {
		return (<NotAuthorizedPage />) as JSX.Element;
	}

	return children as JSX.Element;
}
