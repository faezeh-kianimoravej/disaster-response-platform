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
		// localStorage (e.g. after a hard refresh or when offline), parse it and restore user data
		try {
			const storedToken = localStorage.getItem('auth_token');
			const storedUser = localStorage.getItem('auth_user');
			
			if (storedToken && storedUser) {
				const parsedToken = parseJwt(storedToken);
				const parsedUser = JSON.parse(storedUser);
				
				if (parsedToken && tokenHasValidExpiry(parsedToken) && parsedUser) {
					// Use the stored complete user data instead of just token data
					setAuth({ isLoggedIn: true, user: parsedUser as User, token: storedToken });
					return;
				}
			} else if (storedToken) {
				// Fallback to token parsing if user data is not available
				const parsed = parseJwt(storedToken);
				if (parsed && tokenHasValidExpiry(parsed)) {
					const partialUser = mapTokenToPartialUser(parsed);
					setAuth({ isLoggedIn: true, user: partialUser as unknown as User, token: storedToken });
					return;
				}
			}
		} catch (error) {
			console.warn('Failed to restore auth data from localStorage:', error);
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
			const newAuthState = { isLoggedIn: true, user: backendUserByEmail as User, token: keycloak?.token };
			setAuth(newAuthState);
			
			// Store the complete user data in localStorage for offline access
			try {
				localStorage.setItem('auth_user', JSON.stringify(backendUserByEmail));
			} catch (error) {
				console.warn('Failed to store user data in localStorage:', error);
			}
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
