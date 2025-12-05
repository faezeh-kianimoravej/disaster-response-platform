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
	login: () => Promise<void>;
	logout: () => Promise<void>;
}

export const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export const KeycloakProvider = ({ children }: { children: React.ReactNode }) => {
	const [initialized, setInitialized] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
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
	}, []);

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
		await keycloak.logout();
	};

	return (
		<KeycloakContext.Provider value={{ keycloak, initialized, isAuthenticated, login, logout }}>
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
