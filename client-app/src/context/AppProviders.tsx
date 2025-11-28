import { NotificationProvider } from './NotificationContext';
import { AuthContext } from './AuthContext';
import type { AuthState } from './AuthContext';
import type { User } from '@/types/user';
import { ToastProvider } from '../components/toast/ToastProvider';
import React from 'react';
import keycloak from '@/config/keycloak';
import { useUser } from '@/hooks/useUser';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = React.useState<AuthState>({
        isLoggedIn: false,
        user: null,
        token: undefined,
    });
    const [isRestoring, setIsRestoring] = React.useState(true);
    const [authenticatedUserId, setAuthenticatedUserId] = React.useState<string | undefined>();

    const { user: fetchedUser } = useUser(authenticatedUserId, { enabled: !!authenticatedUserId });

    const setAuth = (a: AuthState) => setAuthState(a);

    const updateUser = (patch: Partial<User> | null) => {
        setAuthState(
            prev =>
                ({
                    ...prev,
                    user: patch === null ? null : { ...(prev.user ?? ({} as User)), ...patch },
                }) as AuthState
        );
    };

    // Initialize Keycloak once
    React.useEffect(() => {
        let refreshTimer: number | undefined;
        let isInitialized = false;

        const initKeycloak = async () => {
            try {
                const authenticated = await keycloak.init({
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                });

                isInitialized = true;

                if (authenticated) {
                    const token = keycloak.token;
                    const parsed = keycloak.tokenParsed as Record<string, any> | undefined;
                    const userId = parsed?.sub;

                    setAuthenticatedUserId(userId);
                    setAuthState(prev => ({
                        ...prev,
                        isLoggedIn: true,
                        token,
                    }));

                    localStorage.setItem('auth_token', token ?? '');

                    // regularly try to refresh token
                    refreshTimer = window.setInterval(() => {
                        keycloak.updateToken(70).then((refreshed) => {
                            if (refreshed) {
                                const newToken = keycloak.token;
                                setAuthState(prev => ({ ...prev, token: newToken }));
                                localStorage.setItem('auth_token', newToken ?? '');
                            }
                        }).catch(() => {
                            // token refresh failed
                        });
                    }, 60_000);
                } else {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    setAuthState({ isLoggedIn: false, user: null, token: undefined });
                }

                setIsRestoring(false);
            } catch (err) {
                console.error('Keycloak init failed:', err);
                setIsRestoring(false);
            }
        };

        if (!isInitialized) {
            initKeycloak();
        }

        return () => {
            if (refreshTimer) {
                clearInterval(refreshTimer);
            }
        };
    }, []);

    // Fetch user info once authenticated
    React.useEffect(() => {
        if (!isRestoring && fetchedUser) {
            setAuthState(prev => ({
                ...prev,
                user: fetchedUser,
            }));
            localStorage.setItem('user_data', JSON.stringify(fetchedUser));
        }
    }, [isRestoring, fetchedUser]);

    const contextValue = {
        ...authState,
        setAuth,
        updateUser,
    };

    if (isRestoring) {
        return null;
    }

    return (
        <ToastProvider>
            <NotificationProvider>
                <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
            </NotificationProvider>
        </ToastProvider>
    );
}
