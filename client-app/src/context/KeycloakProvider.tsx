import React, { createContext, useContext, useEffect, useState } from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

const keycloakConfig = {
	url: 'http://localhost:9090/',
	realm: 'DRCCS',
	clientId: 'react-frontend',
} as const;

const KeycloakConstructor = Keycloak as unknown as new (config: unknown) => KeycloakInstance;
const keycloak = new KeycloakConstructor(keycloakConfig);

export interface KeycloakContextType {
	keycloak: KeycloakInstance;
	initialized: boolean;
	isAuthenticated: boolean;
	isOffline: boolean;
	login: () => Promise<void>;
	logout: () => Promise<void>;
}

export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export const KeycloakProvider = ({ children }: { children: React.ReactNode }) => {
	const [initialized, setInitialized] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isOffline, setIsOffline] = useState(!navigator.onLine);

	// Monitor online/offline status
	useEffect(() => {
		const handleOnline = () => setIsOffline(false);
		const handleOffline = () => {
			setIsOffline(true);
			// When going offline, preserve current authentication state
			// Don't reset isAuthenticated if we're already authenticated
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	// Keycloak initialization - only when online
	useEffect(() => {
		// If we're going offline but already initialized and authenticated, don't reset
		if (isOffline && initialized && isAuthenticated) {
			return;
		}

		if (isOffline) {
			// When offline, check if we have cached auth state
			try {
				const storedToken = localStorage.getItem('auth_token');
				if (storedToken) {
					// We have cached auth, so mark as initialized but maintain auth state
					setInitialized(true);
					// Don't change isAuthenticated if we have cached credentials
					return;
				}
			} catch (_e) {
				// Failed to check cached auth when offline
			}
			// No cached auth, mark as not authenticated
			setInitialized(true);
			setIsAuthenticated(false);
			return;
		}
		const initOptions: Record<string, unknown> = { onLoad: 'check-sso' };
		try {
			initOptions.silentCheckSsoRedirectUri = `${window.location.origin}/silent-check-sso.html`;
		} catch {}

		(async () => {
			try {
				const auth = await (keycloak.init(initOptions) as unknown as Promise<boolean>);
				try {
					sessionStorage.removeItem('kc_login_in_progress');
				} catch {}
				setInitialized(true);
				setIsAuthenticated(Boolean(auth));
			} catch {
				try {
					sessionStorage.removeItem('kc_login_in_progress');
				} catch {}
				setInitialized(true);
				setIsAuthenticated(false);
			}
		})();
	}, [isOffline]);

	useEffect(() => {
		let refreshHandle: number | undefined;

		const syncToken = () => {
			try {
				const tokenToStore = keycloak?.token ?? null;
				if (tokenToStore) {
					try {
						localStorage.setItem('auth_token', tokenToStore);
					} catch {}
				} else {
				}
			} catch {}
		};

		if (initialized && isAuthenticated) {
			syncToken();
		}

		if (initialized) {
			refreshHandle = window.setInterval(async () => {
				if (!keycloak) return;
				try {
					const refreshed = await keycloak.updateToken(30);
					if (refreshed) {
						syncToken();
					} else {
						if (keycloak.authenticated) syncToken();
					}
				} catch {}
			}, 20 * 1000);
		}

		return () => {
			if (refreshHandle) window.clearInterval(refreshHandle);
		};
	}, [initialized, isAuthenticated]);

	const login = async () => {
		if (isOffline) {
			return; // Don't attempt login when offline
		}
		try {
			sessionStorage.setItem('kc_login_in_progress', '1');
		} catch {}
		await keycloak.login();
	};

	const logout = async () => {
		try {
			localStorage.removeItem('auth_token');
		} catch {
			// ignore
		}
		// Dispatch logout event for service worker cleanup
		window.dispatchEvent(new CustomEvent('app-logout'));
		await keycloak.logout();
	};

	return (
		<KeycloakContext.Provider
			value={{ keycloak, initialized, isAuthenticated, isOffline, login, logout }}
		>
			{children}
		</KeycloakContext.Provider>
	);
};

export const useKeycloak = () => {
	const context = useContext(KeycloakContext);
	if (!context) {
		throw new Error('useKeycloak must be used within a KeycloakProvider');
	}
	return context;
};
