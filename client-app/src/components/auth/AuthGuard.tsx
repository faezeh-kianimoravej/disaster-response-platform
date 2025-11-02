import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
import { Role, RoleType } from '@/types/role';
import { routes } from '@/routes';

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
	const location = useLocation();

	if (!isLoggedIn) {
		return (<Navigate to={routes.login()} replace state={{ from: location }} />) as JSX.Element;
	}

	const required = opts.requireRoles ?? [];
	if (required.length > 0) {
		const mode = opts.roleMode ?? 'any';
		const hasAny = useUserHasAnyRole(required);
		const hasAll = useUserHasAllRoles(required);
		if (mode === 'all') {
			if (!hasAll) {
				return (<NotAuthorizedPage />) as JSX.Element;
			}
		} else {
			if (!hasAny) {
				return (<NotAuthorizedPage />) as JSX.Element;
			}
		}
	}

	if (opts.requireAccessToRegion !== undefined) {
		const hasRegionAccess = useUserHasAccessToRegion(opts.requireAccessToRegion);
		if (!hasRegionAccess) {
			return (<NotAuthorizedPage />) as JSX.Element;
		}
	}

	if (opts.requireAccessToMunicipality !== undefined) {
		const hasMunicipalityAccess = useUserHasAccessToMunicipality(opts.requireAccessToMunicipality);
		if (!hasMunicipalityAccess) {
			return (<NotAuthorizedPage />) as JSX.Element;
		}
	}

	if (opts.requireAccessToDepartment !== undefined) {
		const hasDepartmentAccess = useUserHasAccessToDepartment(opts.requireAccessToDepartment);
		if (!hasDepartmentAccess) {
			return (<NotAuthorizedPage />) as JSX.Element;
		}
	}

	if (opts.requireAccessToResource !== undefined) {
		const hasResourceAccess = useUserHasAccessToResource(opts.requireAccessToResource);
		if (!hasResourceAccess) {
			return (<NotAuthorizedPage />) as JSX.Element;
		}
	}

	return children as JSX.Element;
}
