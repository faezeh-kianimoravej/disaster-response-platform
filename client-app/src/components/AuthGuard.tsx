import type { ReactNode } from 'react';
import { useIsUserLoggedIn, useUserHasAnyRole, useUserHasAllRoles } from '@/context/AuthContext';
import NotAuthorizedPage from '@/pages/NotAuthorizedPage';
import { Role } from '@/types/role';

type Props = AuthGuardOptions & {
	children: ReactNode;
};

export type AuthGuardOptions = {
	/** Roles required to access the page. */
	requireRoles?: Role[];
	/** If 'all', user must have all roles; if 'any' (default) user must have at least one. */
	roleMode?: 'any' | 'all';
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
	const isSuper = useUserHasAnyRole(['Super Admin']);

	if (!isLoggedIn) return (<NotAuthorizedPage />) as JSX.Element;

	if (isSuper) return children as JSX.Element;

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

	return children as JSX.Element;
}
