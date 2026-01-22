import React, { useEffect, useRef, useState } from 'react';
import { AuthContext, type AuthState } from './AuthContext';
import { useKeycloak } from './KeycloakProvider';
import { mapTokenToPartialUser, tokenHasValidExpiry, parseJwt } from '@/utils/auth';
import { useUserByEmail } from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types/user';

/**
 * AuthProvider
 * - Uses Keycloak auth when available
 * - Restores from localStorage when offline/refresh (guarded to avoid cross-user leakage)
 * - Fetches authoritative backend user by email when online
 * - Resets React Query cache ONLY on real user switch or logout (fixes blank/no-data issue)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { keycloak, initialized, isAuthenticated } = useKeycloak();
	const queryClient = useQueryClient();

	const [auth, setAuth] = useState<AuthState>({
		isLoggedIn: false,
		user: null,
		token: undefined,
	});

	// Track last "known" userId to detect real user switches
	const previousUserIdRef = useRef<number | null>(null);

	type TokenWithEmail = { email?: string; sub?: string };

	const tokenParsed = keycloak?.tokenParsed as TokenWithEmail | undefined;
	const emailFromToken = tokenParsed?.email;

	const clearPersistedAuth = () => {
		try {
			localStorage.removeItem('auth_user');
			localStorage.removeItem('auth_token');
			localStorage.removeItem('auth_user_email'); // helper for restore guard
		} catch {
			// Failed to clear persisted auth
		}
	};

	const persistAuth = (token: string | undefined, user: unknown, email?: string) => {
		try {
			if (token) localStorage.setItem('auth_token', token);
			if (email) localStorage.setItem('auth_user_email', email);
			if (user) localStorage.setItem('auth_user', JSON.stringify(user));
		} catch {
			// Failed to persist auth
		}
	};

	/**
	 * 1) Base auth state:
	 * - If Keycloak authenticated & token valid -> set partial user and persist.
	 * - Else attempt restore from localStorage (useful offline/hard refresh).
	 */
	useEffect(() => {
		if (!initialized) return;

		// ONLINE / normal case: Keycloak session is valid
		if (isAuthenticated && keycloak?.tokenParsed && tokenHasValidExpiry(keycloak.tokenParsed)) {
			const partialUser = mapTokenToPartialUser(keycloak.tokenParsed);

			setAuth({
				isLoggedIn: true,
				user: partialUser as unknown as User,
				token: keycloak.token,
			});

			persistAuth(keycloak.token, partialUser, emailFromToken);
			return;
		}

		// OFFLINE / refresh fallback: restore from localStorage
		try {
			const storedToken = localStorage.getItem('auth_token');
			const storedUserJson = localStorage.getItem('auth_user');
			const storedEmail = localStorage.getItem('auth_user_email');

			if (storedToken) {
				const parsed = parseJwt(storedToken);
				// For offline scenarios, be more lenient with token expiry
				const tokenOk = parsed && (navigator.onLine ? tokenHasValidExpiry(parsed) : true);

				if (!tokenOk && navigator.onLine) {
					// Only clear if we're online and token is definitely invalid
					clearPersistedAuth();
				} else if (storedUserJson) {
					const storedUser = JSON.parse(storedUserJson) as Partial<User> | null;

					// Prevent cross-user leakage using email guard when possible
					const restoredEmail = storedEmail ?? (storedUser as { email?: string })?.email;
					if (restoredEmail && emailFromToken && restoredEmail !== emailFromToken) {
						clearPersistedAuth();
					} else {
						setAuth({
							isLoggedIn: true,
							user: storedUser as User,
							token: storedToken,
						});

						// Dispatch auth-ready event for offline scenarios too
						const userId =
							(storedUser as { userId?: number; id?: number })?.userId ||
							(storedUser as { userId?: number; id?: number })?.id;
						if (userId) {
							window.dispatchEvent(new CustomEvent('app-auth-ready'));
						}
						return;
					}
				} else {
					// No stored full user -> fallback to token-derived partial user
					const partialUser = mapTokenToPartialUser(parsed as Record<string, unknown>);
					setAuth({
						isLoggedIn: true,
						user: partialUser as unknown as User,
						token: storedToken,
					});
					persistAuth(storedToken, partialUser, (parsed as { email?: string })?.email);

					// Dispatch auth-ready event for token-only restoration
					window.dispatchEvent(new CustomEvent('app-auth-ready'));
					return;
				}
			}
		} catch {
			// Failed to restore auth data from localStorage
		}

		// Default: not logged in
		setAuth({ isLoggedIn: false, user: null, token: undefined });
	}, [initialized, isAuthenticated, keycloak, emailFromToken]);

	/**
	 * 2) Fetch authoritative backend user by email once authenticated online.
	 */
	const { user: backendUserByEmail } = useUserByEmail(emailFromToken ?? undefined, {
		enabled: Boolean(isAuthenticated && emailFromToken),
	});

	/**
	 * 3) When backend user arrives, replace partial user and persist full user.
	 */
	useEffect(() => {
		if (!backendUserByEmail) return;

		setAuth(prev => ({
			...prev,
			isLoggedIn: true,
			user: backendUserByEmail as User,
			token: keycloak?.token ?? prev.token,
		}));

		persistAuth(
			keycloak?.token,
			backendUserByEmail,
			(backendUserByEmail as { email?: string })?.email ?? emailFromToken
		);

		// Dispatch app-auth-ready event when backend user is loaded and app is stable
		window.dispatchEvent(new CustomEvent('app-auth-ready'));
	}, [backendUserByEmail, keycloak?.token, emailFromToken]);

	/**
	 * 4) IMPORTANT FIX: React Query cache reset policy
	 * - Do NOT clear on every auth.user change (partial -> full user is a change)
	 * - Only clear when:
	 *   a) logout
	 *   b) real user switch: previousUserId !== currentUserId
	 */
	const currentUserId: number | null = (auth.user as { userId?: number })?.userId ?? null;

	useEffect(() => {
		const prevUserId = previousUserIdRef.current;

		// LOGOUT
		if (!auth.isLoggedIn) {
			if (prevUserId !== null) {
				queryClient.cancelQueries();
				queryClient.clear();
				// Dispatch app-logout event
				window.dispatchEvent(new CustomEvent('app-logout'));
			}
			previousUserIdRef.current = null;
			clearPersistedAuth();
			return;
		}

		// Logged in but we still don't have a stable userId yet -> do nothing
		if (!currentUserId) return;

		// First time we have a stable userId after login
		if (prevUserId === null) {
			previousUserIdRef.current = currentUserId;
			// Force data refresh under the new user context
			queryClient.invalidateQueries();
			return;
		}

		// USER SWITCH
		if (prevUserId !== currentUserId) {
			queryClient.cancelQueries();
			queryClient.clear();
			previousUserIdRef.current = currentUserId;
			queryClient.invalidateQueries();
		}
	}, [auth.isLoggedIn, currentUserId, queryClient]);

	/**
	 * Expose setAuth/updateUser for consumers
	 */
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
