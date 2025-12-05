import React, { useEffect, useState } from 'react';
import { AuthContext, type AuthState } from './AuthContext';
import { useKeycloak } from './KeycloakProvider';
import { mapTokenToPartialUser, tokenHasValidExpiry } from '@/utils/auth';
import { parseJwt } from '@/utils/auth';
import { useUserByEmail } from '@/hooks/useUser';
import type { User } from '@/types/user';

/**
 * AuthProvider
 * - Reads Keycloak state and populates AuthContext with a partial user immediately
 * - Attempts to fetch the authoritative backend user (by keycloakId) and replace it
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { keycloak, initialized, isAuthenticated } = useKeycloak();
	const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, user: null, token: undefined });

	useEffect(() => {
		if (!initialized) return;

		if (isAuthenticated && keycloak?.tokenParsed && tokenHasValidExpiry(keycloak.tokenParsed)) {
			const partialUser = mapTokenToPartialUser(keycloak.tokenParsed);
			setAuth({ isLoggedIn: true, user: partialUser as unknown as User, token: keycloak.token });
			return;
		}

		// Fallback: if Keycloak isn't authenticated but there's a valid token in
		// localStorage (e.g. after a hard refresh), parse it and set a partial user
		// so guarded pages don't immediately trigger a login redirect.
		try {
			const stored = localStorage.getItem('auth_token');
			if (stored) {
				const parsed = parseJwt(stored);
				if (parsed && tokenHasValidExpiry(parsed)) {
					const partialUser = mapTokenToPartialUser(parsed);
					setAuth({ isLoggedIn: true, user: partialUser as unknown as User, token: stored });
					return;
				}
			}
		} catch {
			// ignore storage/parse errors and fall through to logged-out state
		}

		setAuth({ isLoggedIn: false, user: null, token: undefined });
	}, [initialized, isAuthenticated, keycloak]);

	type TokenWithEmail = { email?: string };
	const email = (keycloak?.tokenParsed as TokenWithEmail | undefined)?.email;
	const { user: backendUserByEmail } = useUserByEmail(email ?? undefined, {
		enabled: Boolean(isAuthenticated && email),
	});

	// When the backend user (looked up by email) arrives, replace the partial user.
	useEffect(() => {
		if (backendUserByEmail) {
			setAuth({ isLoggedIn: true, user: backendUserByEmail as User, token: keycloak?.token });
		}
	}, [backendUserByEmail, keycloak?.token]);

	// Provide setAuth and updateUser hooks for consumers
	const value = {
		...auth,
		setAuth: (a: AuthState) => setAuth(a),
		updateUser: (patch: Partial<User> | null) => {
			if (patch === null) {
				setAuth(s => ({ ...s, user: null }));
			} else {
				setAuth(s => ({
					...s,
					user: { ...(s.user as unknown as User), ...(patch as unknown as User) },
				}));
			}
		},
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
